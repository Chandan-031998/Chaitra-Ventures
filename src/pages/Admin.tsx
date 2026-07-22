// src/pages/Admin.tsx
import React, { useEffect, useMemo, useState } from "react";
import { LogOut, Plus, Trash2, Edit3, Building2, FolderKanban } from "lucide-react";
import { api, resolveImageUrl, type StoredImage } from "../lib/api";
import { PROPERTY_TYPE_OPTIONS } from "../lib/propertyTypes";

const TOKEN_KEY = "chaitra_admin_token";

type Tab = "properties" | "projects";
type Mode = "sale" | "rent";

type Property = {
  id: number;
  title: string;
  location: string;
  description: string;
  price: number;
  beds: number;
  baths: number;
  area_sqft: number;
  listing_type: Mode; // sale | rent
  property_type: string;
  status: "available" | "sold" | "rented";
  featured: boolean;
  images: Array<string | StoredImage>;
  amenities: string[];
};

type Project = {
  id: number;
  name: string;
  location: string;
  image: string | StoredImage;
  status: string;
  completion_year: string;
  units: number;
  type: string;
  description: string;
};

const emptyProperty = (listing_type: Mode): Partial<Property> => ({
  listing_type,
  property_type: "apartment",
  title: "",
  description: "",
  price: 0,
  location: "",
  beds: 0,
  baths: 0,
  area_sqft: 0,
  images: [],
  amenities: [],
  featured: false,
  status: "available",
});

const emptyProject: Partial<Project> = {
  name: "",
  location: "",
  image: "",
  status: "Ongoing",
  completion_year: "",
  units: 0,
  type: "",
  description: "",
};

const isImageFile = (f: File) => /^image\//.test(f.type);

function createPropertyFormData(propForm: Partial<Property>, mode: Mode) {
  const form = new FormData();
  const listingType = mode === "rent" ? "rent" : "sale";
  const amenities =
    typeof (propForm as any).amenities === "string"
      ? String((propForm as any).amenities)
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : Array.isArray(propForm.amenities)
      ? propForm.amenities
      : [];
  const images = Array.isArray(propForm.images) ? propForm.images : [];

  if (propForm.id != null) form.append("id", String(propForm.id));
  form.append("listing_type", listingType);
  form.append("title", String(propForm.title ?? "").trim());
  form.append("location", String(propForm.location ?? "").trim());
  form.append("type", String(propForm.property_type ?? "apartment"));
  form.append("status", String(propForm.status ?? "available"));
  form.append("price", String(Number(propForm.price || 0)));
  form.append("beds", String(Number((propForm as any).beds ?? (propForm as any).bedrooms ?? 0)));
  form.append("baths", String(Number((propForm as any).baths ?? (propForm as any).bathrooms ?? 0)));
  form.append("area", String(Number((propForm as any).area_sqft ?? (propForm as any).area ?? 0)));
  form.append("amenities", JSON.stringify(amenities));
  form.append("description", String(propForm.description ?? ""));
  form.append("featured", propForm.featured ? "1" : "0");
  form.append("images", JSON.stringify(images));

  return form;
}

export default function Admin() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [tab, setTab] = useState<Tab>("properties");
  const [mode, setMode] = useState<Mode>("sale");

  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [propForm, setPropForm] = useState<Partial<Property>>(emptyProperty("sale"));
  const [projForm, setProjForm] = useState<Partial<Project>>({ ...emptyProject });

  const isAuthed = !!token;

  const header = useMemo(
    () => (
      <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Admin Panel</h1>
            <p className="text-blue-100 mt-1">Manage Buy, Rent, and Projects data (MySQL)</p>
          </div>

          {isAuthed && (
            <button
              onClick={() => {
                localStorage.removeItem(TOKEN_KEY);
                setToken(null);
              }}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg"
            >
              <LogOut size={18} />
              Logout
            </button>
          )}
        </div>
      </div>
    ),
    [isAuthed]
  );

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      if (tab === "properties") {
        const data = await api.adminListProperties(token, mode);
        setProperties(data || []);
      } else {
        const data = await api.adminListProjects(token);
        setProjects(data || []);
      }
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthed) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed, tab, mode]);

  useEffect(() => {
    setPropForm(emptyProperty(mode));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoading(true);
    try {
      const res = await api.adminLogin(username, password);
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
    } catch (err: any) {
      setLoginError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const uploadPropertyImages = async (files: FileList | null) => {
    if (!token || !files || !files.length) return;
    const valid = Array.from(files).filter(isImageFile);
    if (!valid.length) {
      alert("Please select image files only");
      return;
    }
    try {
      setLoading(true);
      const res = await api.adminUploadImages(token, valid, "properties");
      setPropForm((prev) => ({
        ...prev,
        images: [...(Array.isArray(prev.images) ? prev.images : []), ...((res.images as StoredImage[] | undefined) || res.urls || [])],
      }));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  const uploadProjectImage = async (file: File | null) => {
    if (!token || !file) return;
    if (!isImageFile(file)) {
      alert("Please select an image file");
      return;
    }
    try {
      setLoading(true);
      const res = await api.adminUploadImages(token, [file], "projects");
      setProjForm((prev) => ({ ...prev, image: res.images?.[0] || res.urls?.[0] || prev.image }));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  const upsertProperty = async () => {
    if (!token) return;
    try {
      setLoading(true);

      if (!propForm.title || !String(propForm.title).trim()) return alert("Missing: title");
      if (!propForm.location || !String(propForm.location).trim()) return alert("Missing: location");
      const form = createPropertyFormData(propForm, mode);
      await api.adminUpsertProperty(token, form);

      setPropForm(emptyProperty(mode));
      await loadData();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to save property");
    } finally {
      setLoading(false);
    }
  };

  const deleteProperty = async (id: number) => {
    if (!token) return;
    if (!confirm("Delete this property?")) return;
    try {
      setLoading(true);
      await api.adminDeleteProperty(token, id);
      await loadData();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to delete property");
    } finally {
      setLoading(false);
    }
  };

  const editProperty = (p: any) => {
    setPropForm({
      ...p,
      listing_type: p.listing_type || mode,
      property_type: p.property_type || "apartment",
      status: p.status || "available",
      images: Array.isArray(p.images) ? p.images : [],
      amenities: Array.isArray(p.amenities) ? p.amenities.join(", ") : (p.amenities || ""),
      beds: Number(p.beds ?? p.bedrooms ?? 0),
      baths: Number(p.baths ?? p.bathrooms ?? 0),
      area_sqft: Number(p.area_sqft ?? p.area ?? 0),
    });
    setTab("properties");
    setMode((p.listing_type as Mode) || "sale");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const upsertProject = async () => {
    if (!token) return;
    try {
      setLoading(true);

      const required = ["name", "location", "image", "status", "completion_year", "type", "description"];
      for (const k of required) {
        const v = (projForm as any)[k];
        if (v == null || String(v).trim() === "") return alert(`Missing: ${k}`);
      }

      const payload: any = {
        ...projForm,
        units: Number(projForm.units || 0),
      };

      await api.adminUpsertProject(token, payload);

      setProjForm({ ...emptyProject });
      await loadData();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: number) => {
    if (!token) return;
    if (!confirm("Delete this project?")) return;
    try {
      setLoading(true);
      await api.adminDeleteProject(token, id);
      await loadData();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to delete project");
    } finally {
      setLoading(false);
    }
  };

  const editProject = (p: Project) => {
    setProjForm({ ...p });
    setTab("projects");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {header}

      {!isAuthed ? (
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Login</h2>
            <p className="text-gray-600 mb-6">Use your admin credentials</p>

            {loginError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#C9A227] focus:outline-none"
                  placeholder="admin"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#C9A227] focus:outline-none"
                  placeholder="chaitraventures"
                />
              </div>

              <button
                disabled={loading}
                className="w-full bg-[#C9A227] text-white px-6 py-3 rounded-lg hover:bg-[#B08A1F] transition-colors font-semibold disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Login"}
              </button>

              <p className="text-xs text-gray-500">
                Tip: Set <b>VITE_API_URL</b> to your backend URL.
              </p>
            </form>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setTab("properties")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                  tab === "properties" ? "bg-[#C9A227] text-white" : "bg-white text-gray-700 border"
                }`}
              >
                <Building2 size={18} /> Properties
              </button>
              <button
                onClick={() => setTab("projects")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                  tab === "projects" ? "bg-[#C9A227] text-white" : "bg-white text-gray-700 border"
                }`}
              >
                <FolderKanban size={18} /> Projects
              </button>
            </div>

            {tab === "properties" && (
              <div className="flex gap-2">
                <button
                  onClick={() => setMode("sale")}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    mode === "sale" ? "bg-[#1E3A8A] text-white" : "bg-white border text-gray-700"
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setMode("rent")}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    mode === "rent" ? "bg-[#1E3A8A] text-white" : "bg-white border text-gray-700"
                  }`}
                >
                  Rent
                </button>
              </div>
            )}
          </div>

          {tab === "properties" ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Add / Edit Property</h3>
                  <button
                    onClick={() => setPropForm(emptyProperty(mode))}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
                  >
                    <Plus size={18} /> New
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Title</label>
                    <input
                      value={(propForm.title as any) || ""}
                      onChange={(e) => setPropForm({ ...propForm, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700">Location</label>
                    <input
                      value={(propForm.location as any) || ""}
                      onChange={(e) => setPropForm({ ...propForm, location: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Type</label>
                      <select
                        value={(propForm.property_type as any) || "apartment"}
                        onChange={(e) => setPropForm({ ...propForm, property_type: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        {PROPERTY_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Status</label>
                      <select
                        value={(propForm.status as any) || "available"}
                        onChange={(e) => setPropForm({ ...propForm, status: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="available">Available</option>
                        <option value="sold">Sold</option>
                        <option value="rented">Rented</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Price</label>
                      <input
                        type="number"
                        value={(propForm.price as any) ?? 0}
                        onChange={(e) => setPropForm({ ...propForm, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Beds</label>
                      <input
                        type="number"
                        value={Number((propForm as any).beds ?? (propForm as any).bedrooms ?? 0)}
                        onChange={(e) => setPropForm({ ...propForm, beds: Number(e.target.value) } as any)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Baths</label>
                      <input
                        type="number"
                        value={Number((propForm as any).baths ?? (propForm as any).bathrooms ?? 0)}
                        onChange={(e) => setPropForm({ ...propForm, baths: Number(e.target.value) } as any)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700">Area (sqft)</label>
                    <input
                      type="number"
                      value={Number((propForm as any).area_sqft ?? (propForm as any).area ?? 0)}
                      onChange={(e) => setPropForm({ ...propForm, area_sqft: Number(e.target.value) } as any)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700">Property Images (upload)</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => uploadPropertyImages(e.target.files)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />

                    {!!(propForm.images as any)?.length && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {(propForm.images as any[]).map((url, idx) => (
                          <div key={`${resolveImageUrl(url as any)}-${idx}`} className="relative rounded-lg border overflow-hidden">
                            <img src={resolveImageUrl(url as any)} alt="Property" className="w-full h-24 object-cover" />
                            <button
                              type="button"
                              onClick={() =>
                                setPropForm({
                                  ...propForm,
                                  images: (propForm.images as any[]).filter((_, i) => i !== idx) as any,
                                })
                              }
                              className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700">Amenities (comma separated)</label>
                    <input
                      value={(propForm as any).amenities ?? ""}
                      onChange={(e) => setPropForm({ ...propForm, amenities: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Parking, Lift, Power Backup..."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700">Description</label>
                    <textarea
                      value={(propForm.description as any) || ""}
                      onChange={(e) => setPropForm({ ...propForm, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={4}
                    />
                  </div>

                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={!!propForm.featured}
                      onChange={(e) => setPropForm({ ...propForm, featured: e.target.checked })}
                    />
                    Featured on Home page
                  </label>

                  <button
                    disabled={loading}
                    onClick={upsertProperty}
                    className="w-full bg-[#C9A227] text-white px-4 py-3 rounded-lg hover:bg-[#B08A1F] font-semibold disabled:opacity-60"
                  >
                    {loading ? "Saving..." : "Save Property"}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Existing ({mode === "sale" ? "Buy" : "Rent"})
                  </h3>

                  {loading ? (
                    <div className="py-10 text-center">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#C9A227]" />
                    </div>
                  ) : properties.length === 0 ? (
                    <p className="text-gray-600">No data yet. Add your first property.</p>
                  ) : (
                    <div className="space-y-3">
                      {properties.map((p) => (
                        <div
                          key={p.id}
                          className="border rounded-xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800 truncate">{p.title}</p>
                            <p className="text-sm text-gray-600 truncate">
                              {p.location} • {p.property_type} • ₹{Number(p.price).toLocaleString("en-IN")}
                            </p>
                            {p.featured && (
                              <span className="inline-block mt-1 text-xs bg-[#C9A227]/10 text-[#8a6f17] px-2 py-1 rounded">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => editProperty(p)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50"
                            >
                              <Edit3 size={16} /> Edit
                            </button>
                            <button
                              onClick={() => deleteProperty(p.id)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Add / Edit Project</h3>
                  <button
                    onClick={() => setProjForm({ ...emptyProject })}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
                  >
                    <Plus size={18} /> New
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Name</label>
                    <input
                      value={(projForm.name as any) || ""}
                      onChange={(e) => setProjForm({ ...projForm, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700">Location</label>
                    <input
                      value={(projForm.location as any) || ""}
                      onChange={(e) => setProjForm({ ...projForm, location: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700">Project Image</label>
                    <div className="mt-1 flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => uploadProjectImage(e.target.files?.[0] || null)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      {projForm.image ? (
                        <div className="relative">
                          <img
                            src={resolveImageUrl((projForm.image as any) || "")}
                            alt="project"
                            className="h-12 w-12 rounded object-cover border"
                          />
                          <button
                            type="button"
                            onClick={() => setProjForm((prev) => ({ ...prev, image: "" }))}
                            className="absolute -top-2 -right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded"
                          >
                            X
                          </button>
                        </div>
                      ) : null}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Upload from your computer (recommended size ~1200×800).
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Status</label>
                      <input
                        value={(projForm.status as any) || ""}
                        onChange={(e) => setProjForm({ ...projForm, status: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Ongoing / Completed"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Completion Year</label>
                      <input
                        value={(projForm.completion_year as any) || ""}
                        onChange={(e) => setProjForm({ ...projForm, completion_year: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="2026"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Units</label>
                      <input
                        type="number"
                        value={(projForm.units as any) ?? 0}
                        onChange={(e) => setProjForm({ ...projForm, units: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Type</label>
                      <input
                        value={(projForm.type as any) || ""}
                        onChange={(e) => setProjForm({ ...projForm, type: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Luxury Apartments"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700">Description</label>
                    <textarea
                      value={(projForm.description as any) || ""}
                      onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={4}
                    />
                  </div>

                  <button
                    disabled={loading}
                    onClick={upsertProject}
                    className="w-full bg-[#C9A227] text-white px-4 py-3 rounded-lg hover:bg-[#B08A1F] font-semibold disabled:opacity-60"
                  >
                    {loading ? "Saving..." : "Save Project"}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Existing Projects</h3>

                  {loading ? (
                    <div className="py-10 text-center">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#C9A227]" />
                    </div>
                  ) : projects.length === 0 ? (
                    <p className="text-gray-600">No projects yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {projects.map((p) => (
                        <div
                          key={p.id}
                          className="border rounded-xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800 truncate">{p.name}</p>
                            <p className="text-sm text-gray-600 truncate">
                              {p.location} • {p.status} • {p.completion_year}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => editProject(p)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50"
                            >
                              <Edit3 size={16} /> Edit
                            </button>
                            <button
                              onClick={() => deleteProject(p.id)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
