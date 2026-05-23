import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import LockResetIcon from '@mui/icons-material/LockReset';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { API_URL } from '../lib/catalog';
import { useAuth } from '../context/AuthContext';
import type { AuthUser } from '../context/AuthContext';

interface ProfileData {
  nombre: string;
  email: string;
  telefono: string;
  direccion: {
    calle: string;
    ciudad: string;
    estado: string;
    codigoPostal: string;
  };
}

const emptyProfile: ProfileData = {
  nombre: '',
  email: '',
  telefono: '',
  direccion: { calle: '', ciudad: '', estado: '', codigoPostal: '' },
};

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', password: '', confirm: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!res.ok) throw new Error('No se pudo cargar el perfil');
        const data = await res.json();
        if (cancelled) return;
        setProfile({
          nombre: data.nombre || '',
          email: data.email || '',
          telefono: data.telefono || '',
          direccion: {
            calle: data.direccion?.calle || '',
            ciudad: data.direccion?.ciudad || '',
            estado: data.direccion?.estado || '',
            codigoPostal: data.direccion?.codigoPostal || '',
          },
        });
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Error al cargar perfil');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setProfileMessage(null);

    if (!profile.nombre.trim()) {
      setProfileMessage({ type: 'error', text: 'El nombre es obligatorio' });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(profile.email)) {
      setProfileMessage({ type: 'error', text: 'Email inválido' });
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          nombre: profile.nombre.trim(),
          email: profile.email.trim(),
          telefono: profile.telefono.trim(),
          direccion: profile.direccion,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'No se pudo actualizar');

      const next: AuthUser = {
        _id: data._id,
        nombre: data.nombre,
        email: data.email,
        rol: data.rol,
        token: data.token,
      };
      updateUser(next);
      setProfileMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
    } catch (err) {
      setProfileMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al actualizar' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setPasswordMessage(null);

    if (!passwordForm.currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Ingresa tu contraseña actual' });
      return;
    }
    if (passwordForm.password.length < 6) {
      setPasswordMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' });
      return;
    }
    if (passwordForm.password !== passwordForm.confirm) {
      setPasswordMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          password: passwordForm.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'No se pudo cambiar la contraseña');

      const next: AuthUser = {
        _id: data._id,
        nombre: data.nombre,
        email: data.email,
        rol: data.rol,
        token: data.token,
      };
      updateUser(next);
      setPasswordForm({ currentPassword: '', password: '', confirm: '' });
      setPasswordMessage({ type: 'success', text: 'Contraseña actualizada' });
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al cambiar contraseña' });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-12 pt-28 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi perfil</h1>
          <p className="text-sm text-gray-500">Gestiona tus datos personales y de seguridad.</p>
        </header>

        {loading ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
            Cargando perfil…
          </div>
        ) : loadError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {loadError}
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-8">
              {/* Datos personales */}
              <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:p-8">
                <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <PersonIcon className="text-primary-600" fontSize="small" /> Datos personales
                </h2>
                <p className="mb-5 text-sm text-gray-500">Tu información de contacto.</p>

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Nombre</span>
                      <input
                        type="text"
                        value={profile.nombre}
                        onChange={(e) => setProfile((p) => ({ ...p, nombre: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Email</span>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
                        required
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Teléfono</span>
                      <input
                        type="tel"
                        value={profile.telefono}
                        onChange={(e) => setProfile((p) => ({ ...p, telefono: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
                        placeholder="+52 ..."
                      />
                    </label>
                  </div>

                  <fieldset className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                    <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                      <LocationOnIcon fontSize="inherit" /> Dirección
                    </legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block sm:col-span-2">
                        <span className="mb-1 block text-xs font-semibold text-gray-600">Calle</span>
                        <input
                          type="text"
                          value={profile.direccion.calle}
                          onChange={(e) => setProfile((p) => ({ ...p, direccion: { ...p.direccion, calle: e.target.value } }))}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-semibold text-gray-600">Ciudad</span>
                        <input
                          type="text"
                          value={profile.direccion.ciudad}
                          onChange={(e) => setProfile((p) => ({ ...p, direccion: { ...p.direccion, ciudad: e.target.value } }))}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-semibold text-gray-600">Estado</span>
                        <input
                          type="text"
                          value={profile.direccion.estado}
                          onChange={(e) => setProfile((p) => ({ ...p, direccion: { ...p.direccion, estado: e.target.value } }))}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-semibold text-gray-600">Código postal</span>
                        <input
                          type="text"
                          value={profile.direccion.codigoPostal}
                          onChange={(e) => setProfile((p) => ({ ...p, direccion: { ...p.direccion, codigoPostal: e.target.value } }))}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
                        />
                      </label>
                    </div>
                  </fieldset>

                  {profileMessage ? (
                    <p className={`rounded-lg border px-3 py-2 text-sm ${
                      profileMessage.type === 'success'
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}>
                      {profileMessage.text}
                    </p>
                  ) : null}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
                    >
                      {savingProfile ? 'Guardando…' : 'Guardar cambios'}
                    </button>
                  </div>
                </form>
              </section>

              {/* Cambio de contraseña */}
              <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:p-8">
                <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <LockResetIcon className="text-primary-600" fontSize="small" /> Cambiar contraseña
                </h2>
                <p className="mb-5 text-sm text-gray-500">Necesitarás tu contraseña actual para confirmar.</p>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Contraseña actual</span>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
                      autoComplete="current-password"
                      required
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Nueva contraseña</span>
                      <input
                        type="password"
                        value={passwordForm.password}
                        onChange={(e) => setPasswordForm((p) => ({ ...p, password: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
                        autoComplete="new-password"
                        minLength={6}
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Confirmar contraseña</span>
                      <input
                        type="password"
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
                        autoComplete="new-password"
                        minLength={6}
                        required
                      />
                    </label>
                  </div>

                  {passwordMessage ? (
                    <p className={`rounded-lg border px-3 py-2 text-sm ${
                      passwordMessage.type === 'success'
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}>
                      {passwordMessage.text}
                    </p>
                  ) : null}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingPassword}
                      className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-60"
                    >
                      {savingPassword ? 'Actualizando…' : 'Cambiar contraseña'}
                    </button>
                  </div>
                </form>
              </section>
            </div>

            {/* Tarjeta lateral */}
            <aside className="space-y-4">
              <div className="rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-3xl font-bold uppercase text-primary-700">
                  {(profile.nombre || user?.nombre || '?').charAt(0)}
                </div>
                <h3 className="mt-3 text-lg font-bold text-gray-900">{profile.nombre || user?.nombre}</h3>
                <p className="text-sm text-gray-500">{profile.email || user?.email}</p>
                <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  user?.rol === 'admin'
                    ? 'bg-violet-100 text-violet-700'
                    : 'bg-primary-100 text-primary-700'
                }`}>
                  {user?.rol === 'admin' ? 'Administrador' : 'Cliente'}
                </span>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900">Atajos</h3>
                <div className="mt-3 flex flex-col gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => navigate('/mis-pedidos')}
                    className="rounded-xl border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Ver mis pedidos
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/catalog')}
                    className="rounded-xl border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Ir al catálogo
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
