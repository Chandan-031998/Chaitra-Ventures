export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  listing_type: 'sale' | 'rent';
  property_type: 'apartment' | 'villa' | 'plot' | 'commercial';
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  amenities: string[];
  featured: boolean;
  status: 'available' | 'sold' | 'rented';
  created_at: string;
}

export interface Project {
  id: number;
  name: string;
  location: string;
  image: string;
  status: string;
  completion_year: string;
  units: number;
  type: string;
  description: string;
  created_at: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  image?: string | null;
  created_at: string;
}

export interface Enquiry {
  id?: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  property_id?: number | null;
  created_at?: string;
}

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5001" : "");

function joinUrl(base: string, path: string) {
  if (!base) return path;
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export function buildApiUrl(path: string) {
  return joinUrl(API_BASE_URL, path);
}

export function buildUploadUrl(path: string) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  return joinUrl(API_BASE_URL, path);
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(buildApiUrl(path), {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

async function apiUpload(path: string, token: string, form: FormData) {
  const res = await fetch(buildApiUrl(path), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Upload failed: ${res.status}`);
  }
  return (await res.json()) as { urls: string[] };
}

export const api = {
  // Public
  getFeaturedProperties: (limit = 6) =>
    apiFetch<Property[]>(`/api/properties/featured?limit=${limit}`),

  getProperties: (params: {
    listing_type: 'sale' | 'rent';
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    search?: string;
  }) => {
    const sp = new URLSearchParams();
    sp.set("listing_type", params.listing_type);
    if (params.type && params.type !== "all") sp.set("type", params.type);
    if (typeof params.minPrice === "number") sp.set("minPrice", String(params.minPrice));
    if (typeof params.maxPrice === "number") sp.set("maxPrice", String(params.maxPrice));
    if (typeof params.bedrooms === "number") sp.set("bedrooms", String(params.bedrooms));
    if (params.search) sp.set("search", params.search);
    return apiFetch<Property[]>(`/api/properties?${sp.toString()}`);
  },

  getProperty: (id: number) => apiFetch<Property>(`/api/properties/${id}`),

  getProjects: () => apiFetch<Project[]>(`/api/projects`),

  getTestimonials: (limit = 3) => apiFetch<Testimonial[]>(`/api/testimonials?limit=${limit}`),

  createEnquiry: (enquiry: Enquiry) =>
    apiFetch<{ ok: true; id: number }>(`/api/enquiries`, {
      method: "POST",
      body: JSON.stringify(enquiry),
    }),

  // Admin auth
  adminLogin: (username: string, password: string) =>
    apiFetch<{ token: string }>(`/api/admin/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  // Admin CRUD
  adminListProperties: (token: string, listing_type?: string) => {
    const sp = new URLSearchParams();
    if (listing_type) sp.set("listing_type", listing_type);
    return apiFetch<Property[]>(`/api/admin/properties?${sp.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  adminUpsertProperty: (token: string, payload: Partial<Property>) =>
    apiFetch<{ ok: true; id: number }>(`/api/admin/properties`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),

  adminDeleteProperty: (token: string, id: number) =>
    apiFetch<{ ok: true }>(`/api/admin/properties/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),

  adminListProjects: (token: string) =>
    apiFetch<Project[]>(`/api/admin/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  adminUpsertProject: (token: string, payload: Partial<Project>) =>
    apiFetch<{ ok: true; id: number }>(`/api/admin/projects`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),

  adminDeleteProject: (token: string, id: number) =>
    apiFetch<{ ok: true }>(`/api/admin/projects/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),

  adminUploadImages: (token: string, files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append("images", f));
    return apiUpload(`/api/admin/upload`, token, form);
  },
};
