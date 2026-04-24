export const API_BASE_URL = 'http://localhost:5000';
export const API_URL = `${API_BASE_URL}/api`;
export const PRODUCT_PLACEHOLDER = '/product-placeholder.svg';

export interface PublicProduct {
  _id: string;
  nombre: string;
  marca: string;
  modelo: string;
  descripcion: string;
  precio: number;
  imagen: string;
  destacado: boolean;
  activo?: boolean;
}

export const resolveProductImage = (image?: string) => {
  if (!image || !image.trim()) {
    return PRODUCT_PLACEHOLDER;
  }

  const normalized = image.trim().replace(/\\/g, '/');

  if (normalized === '/placeholder.png') {
    return PRODUCT_PLACEHOLDER;
  }

  if (/^(data:|blob:|https?:\/\/|\/\/)/i.test(normalized)) {
    return normalized;
  }

  if (/^[a-zA-Z]:\//.test(normalized)) {
    const segments = normalized.split('/');
    return `/${segments[segments.length - 1]}`;
  }

  if (normalized.startsWith('/uploads/') || normalized.startsWith('/api/')) {
    return `${API_BASE_URL}${normalized}`;
  }

  if (normalized.startsWith('/')) {
    return normalized;
  }

  return `/${normalized.replace(/^\.\//, '')}`;
};

export const fetchPublicProducts = async (query?: Record<string, string>) => {
  const searchParams = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value.trim()) {
      searchParams.set(key, value);
    }
  });

  const suffix = searchParams.toString();
  const response = await fetch(`${API_URL}/products${suffix ? `?${suffix}` : ''}`);

  if (!response.ok) {
    throw new Error('No se pudo cargar el catálogo público');
  }

  return await response.json() as PublicProduct[];
};
