import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Link } from 'react-router-dom';
import { API_URL } from '../lib/catalog';
import { useAuth } from '../context/AuthContext';

interface ReviewUser {
  _id: string;
  nombre: string;
}

interface Review {
  _id: string;
  rating: number;
  comentario?: string;
  createdAt: string;
  usuario: ReviewUser | null;
}

interface ProductReviewsProps {
  productId: string;
  onRatingChange?: (avg: number, count: number) => void;
}

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
};

const Stars: React.FC<{ value: number; size?: 'sm' | 'md'; onChange?: (n: number) => void }> = ({ value, size = 'sm', onChange }) => {
  const cls = size === 'md' ? 'text-2xl' : 'text-base';
  return (
    <span className={`inline-flex items-center ${cls} text-amber-500`}>
      {[1, 2, 3, 4, 5].map((n) =>
        onChange ? (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="transition hover:scale-110"
            aria-label={`${n} estrellas`}
          >
            {n <= value ? <StarIcon fontSize="inherit" /> : <StarBorderIcon fontSize="inherit" />}
          </button>
        ) : (
          <span key={n}>{n <= value ? <StarIcon fontSize="inherit" /> : <StarBorderIcon fontSize="inherit" />}</span>
        )
      )}
    </span>
  );
};

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, onRatingChange }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rating, setRating] = useState(5);
  const [comentario, setComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/reviews/product/${productId}`);
      if (!response.ok) throw new Error('No se pudieron cargar las reseñas');
      const data = (await response.json()) as Review[];
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar reseñas');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void load();
  }, [load]);

  const { average, count, distribution } = useMemo(() => {
    const c = reviews.length;
    if (!c) return { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] };
    const sum = reviews.reduce((s, r) => s + r.rating, 0);
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      const idx = Math.min(5, Math.max(1, Math.round(r.rating))) - 1;
      dist[idx] += 1;
    });
    return { average: sum / c, count: c, distribution: dist };
  }, [reviews]);

  useEffect(() => {
    onRatingChange?.(Number(average.toFixed(1)), count);
  }, [average, count, onRatingChange]);

  const alreadyReviewed = useMemo(() => {
    if (!user) return false;
    return reviews.some((r) => r.usuario?._id === user._id);
  }, [reviews, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setFormError(null);
    setFormSuccess(null);

    const trimmed = comentario.trim();
    if (rating < 1 || rating > 5) {
      setFormError('Selecciona una calificación');
      return;
    }
    if (trimmed.length > 1000) {
      setFormError('El comentario es demasiado largo (máx. 1000 caracteres)');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ producto: productId, rating, comentario: trimmed }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'No se pudo publicar la reseña');
      setFormSuccess('Reseña publicada');
      setComentario('');
      setRating(5);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al publicar reseña');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!user) return;
    if (!window.confirm('¿Eliminar esta reseña?')) return;
    try {
      const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || 'No se pudo eliminar');
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar reseña');
    }
  };

  return (
    <section className="mt-10 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reseñas de clientes</h2>
          <p className="text-sm text-gray-500">{count} {count === 1 ? 'reseña' : 'reseñas'} verificadas</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-gray-900">{average.toFixed(1)}</span>
          <div>
            <Stars value={Math.round(average)} />
            <p className="text-xs text-gray-500">de 5 estrellas</p>
          </div>
        </div>
      </header>

      {count > 0 ? (
        <div className="mt-5 grid gap-1 text-xs text-gray-600 sm:max-w-md">
          {[5, 4, 3, 2, 1].map((star) => {
            const value = distribution[star - 1];
            const pct = count ? (value / count) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="w-6 font-semibold">{star}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right tabular-nums">{value}</span>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
        {isAuthenticated && user ? (
          alreadyReviewed ? (
            <p className="text-sm text-gray-600">Ya dejaste tu reseña para este producto. ¡Gracias!</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p className="mb-1 text-sm font-semibold text-gray-700">Tu calificación</p>
                <Stars value={rating} size="md" onChange={setRating} />
              </div>
              <div>
                <label htmlFor="review-comment" className="mb-1 block text-sm font-semibold text-gray-700">
                  Tu comentario (opcional)
                </label>
                <textarea
                  id="review-comment"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Comparte tu experiencia con este producto..."
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
                />
                <p className="mt-1 text-right text-xs text-gray-400">{comentario.length}/1000</p>
              </div>
              {formError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
              ) : null}
              {formSuccess ? (
                <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{formSuccess}</p>
              ) : null}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
              >
                {submitting ? 'Publicando…' : 'Publicar reseña'}
              </button>
            </form>
          )
        ) : (
          <p className="text-sm text-gray-600">
            <Link to="/login" className="font-semibold text-primary-600 hover:underline">Inicia sesión</Link> para dejar tu reseña.
          </p>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-sm text-gray-500">Cargando reseñas…</p>
        ) : error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no hay reseñas para este producto. ¡Sé el primero!</p>
        ) : (
          reviews.map((r) => {
            const isOwn = user?._id && r.usuario?._id === user._id;
            const canDelete = isOwn || user?.rol === 'admin';
            return (
              <article key={r._id} className="rounded-2xl border border-gray-100 bg-white p-4">
                <header className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-bold uppercase text-primary-700">
                      {(r.usuario?.nombre || '?').charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{r.usuario?.nombre || 'Usuario'}</p>
                      <p className="text-xs text-gray-400">{formatDate(r.createdAt)}</p>
                    </div>
                  </div>
                  <Stars value={r.rating} />
                </header>
                {r.comentario ? <p className="mt-3 whitespace-pre-line text-sm text-gray-700">{r.comentario}</p> : null}
                {canDelete ? (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDelete(r._id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      <DeleteOutlineIcon fontSize="inherit" /> Eliminar
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};

export default ProductReviews;
