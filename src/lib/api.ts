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

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

export const API_BASE_URL = (
  configuredApiUrl ||
  (import.meta.env.PROD
    ? "https://chaitra-ventures.vercel.app"
    : "http://localhost:5001")
).replace(/\/+$/, "");

export function createApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function buildUploadUrl(path: string) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  return createApiUrl(path);
}

function isJsonResponse(contentType: string | null) {
  return Boolean(contentType && contentType.toLowerCase().includes("application/json"));
}

async function readErrorMessage(res: Response) {
  const contentType = res.headers.get("content-type");

  if (!isJsonResponse(contentType)) {
    const preview = (await res.text().catch(() => "")).slice(0, 150);
    console.error("Admin/API request returned a non-JSON response", {
      status: res.status,
      url: res.url,
      preview,
    });
    return "The backend returned an invalid response. Check the backend deployment.";
  }

  const payload = await res.json().catch(() => null);
  if (payload && typeof payload.message === "string") return payload.message;
  if (payload && typeof payload.error === "string") return payload.error;
  return `Request failed: ${res.status}`;
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type");

  if (!isJsonResponse(contentType)) {
    const preview = (await res.text().catch(() => "")).slice(0, 150);
    console.error("Admin/API request returned a non-JSON response", {
      status: res.status,
      url: res.url,
      preview,
    });
    throw new Error(
      "The backend returned an invalid response. Check the backend deployment."
    );
  }

  return (await res.json()) as T;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(createApiUrl(path), {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return parseJsonResponse<T>(res);
}

async function apiUpload(path: string, token: string, form: FormData) {
  const res = await fetch(createApiUrl(path), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return parseJsonResponse<{ urls: string[] }>(res);
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
