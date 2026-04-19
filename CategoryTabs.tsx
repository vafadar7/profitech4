import { useState, useRef, useEffect } from 'react';
import { X, Plus, Trash2, Upload, Images, Save, Eye, ChevronDown, LogOut, Tag, FolderPlus } from 'lucide-react';
import { categories as defaultCategories } from '../../data/products';
import type { Product, Category } from '../../data/products';

// ─── Storage ──────────────────────────────────────────────────────────────
const PRODUCTS_KEY = 'profitech_admin_products';
const CATEGORIES_KEY = 'profitech_admin_categories';

export function loadAdminProducts(): Product[] {
  try { return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]'); } catch { return []; }
}
function loadAdminCategories(): Category[] {
  try {
    const saved = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');
    return saved.length ? saved : [];
  } catch { return []; }
}
function saveAdminProducts(p: Product[]) { localStorage.setItem(PRODUCTS_KEY, JSON.stringify(p)); }
function saveAdminCategories(c: Category[]) { localStorage.setItem(CATEGORIES_KEY, JSON.stringify(c)); }

// ─── Auth ─────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = 'admin@profitech.az';
const ADMIN_PASSWORD = 'profitech2025';

// ─── Gallery ─────────────────────────────────────────────────────────────
const GALLERY_IMAGES = [
  { id: 'g1', url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80', label: 'Gaming Laptop' },
  { id: 'g2', url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&q=80', label: 'Laptop Open' },
  { id: 'g3', url: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80', label: 'Printer' },
  { id: 'g4', url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&q=80', label: 'Business Laptop' },
  { id: 'g5', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80', label: 'MacBook' },
  { id: 'g6', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80', label: 'Silver Laptop' },
  { id: 'g7', url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&q=80', label: 'Office Setup' },
  { id: 'g8', url: 'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=400&q=80', label: 'Dark Laptop' },
];

const emptyProduct = (): Omit<Product, 'id'> => ({
  name: '', price: 0, originalPrice: undefined,
  image: '', category: 'gaming', specs: {},
  badge: '', isNew: false, isBestseller: false,
});

type Tab = 'products' | 'categories';

interface AdminPanelProps { onClose: () => void; }

export default function AdminPanel({ onClose }: AdminPanelProps) {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Data state
  const [products, setProducts] = useState<Product[]>(loadAdminProducts);
  const [customCategories, setCustomCategories] = useState<Category[]>(loadAdminCategories);
  const allCategories = [...defaultCategories, ...customCategories];

  // UI state
  const [tab, setTab] = useState<Tab>('products');
  const [form, setForm] = useState(emptyProduct());
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'gallery' | 'url'>('upload');
  const [previewUrl, setPreviewUrl] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [success, setSuccess] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // New category form
  const [newCatName, setNewCatName] = useState('');
  const [newCatId, setNewCatId] = useState('');
  const [catSuccess, setCatSuccess] = useState('');

  useEffect(() => { saveAdminProducts(products); window.dispatchEvent(new CustomEvent('adminProductsUpdated')); }, [products]);
  useEffect(() => { saveAdminCategories(customCategories); window.dispatchEvent(new CustomEvent('adminCategoriesUpdated')); }, [customCategories]);

  const handleLogin = () => {
    if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true); setAuthError('');
    } else {
      setAuthError('E-mail və ya şifrə yanlışdır.');
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url); setForm((f) => ({ ...f, image: url }));
  };

  const handleGalleryPick = (url: string) => { setPreviewUrl(url); setForm((f) => ({ ...f, image: url })); };
  const handleUrlInput = (val: string) => { setUrlInput(val); setPreviewUrl(val); setForm((f) => ({ ...f, image: val })); };

  const addSpec = () => {
    if (!specKey || !specVal) return;
    setForm((f) => ({ ...f, specs: { ...f.specs, [specKey]: specVal } }));
    setSpecKey(''); setSpecVal('');
  };
  const removeSpec = (key: string) => setForm((f) => { const s = { ...f.specs }; delete s[key]; return { ...f, specs: s }; });

  const handleSubmit = () => {
    if (!form.name || !form.price || !form.image) { alert('Ad, qiymət və şəkil mütləqdir.'); return; }
    if (editId) {
      setProducts((ps) => ps.map((p) => p.id === editId ? { ...form, id: editId } : p));
      setSuccess('Məhsul yeniləndi!'); setEditId(null);
    } else {
      setProducts((ps) => [...ps, { ...form, id: `admin-${Date.now()}` }]);
      setSuccess('Məhsul əlavə edildi!');
    }
    setForm(emptyProduct()); setPreviewUrl(''); setUrlInput('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleEdit = (product: Product) => {
    setEditId(product.id); setForm({ ...product });
    setPreviewUrl(product.image); setUrlInput(product.image);
    setTab('products');
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu məhsulu silmək istədiyinizə əminsiniz?'))
      setProducts((ps) => ps.filter((p) => p.id !== id));
  };

  const handleAddCategory = () => {
    if (!newCatName.trim() || !newCatId.trim()) { alert('Kateqoriya adı və ID mütləqdir.'); return; }
    const id = newCatId.trim().toLowerCase().replace(/\s+/g, '-');
    if (allCategories.find(c => c.id === id)) { alert('Bu ID artıq mövcuddur.'); return; }
    const newCat: Category = { id, name: newCatName.trim(), filters: [] };
    setCustomCategories((cs) => [...cs, newCat]);
    setNewCatName(''); setNewCatId('');
    setCatSuccess('Kateqoriya əlavə edildi!');
    setTimeout(() => setCatSuccess(''), 3000);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Bu kateqoriyanı silmək istədiyinizə əminsiniz?'))
      setCustomCategories((cs) => cs.filter((c) => c.id !== id));
  };

  // ── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
          <div className="bg-[#0B1220] px-6 py-5 flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-white text-lg">Admin Giriş</h2>
              <p className="text-white/50 text-xs mt-0.5">ProfiTech idarəetmə paneli</p>
            </div>
            <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            {authError && (
              <div className="px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                {authError}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">E-mail</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="admin@profitech.az"
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-secondary/60 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">Şifrə</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-secondary/60 transition-colors"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary/90 transition-colors text-sm"
            >
              Daxil Ol
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN PANEL ────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#0B1220] flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-heading font-bold text-white text-base">Admin Panel</h2>
            <div className="flex gap-1">
              {([['products', 'Məhsullar'], ['categories', 'Kateqoriyalar']] as [Tab, string][]).map(([t, label]) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === t ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-1.5 px-3 py-1.5 text-white/50 hover:text-white text-xs rounded-lg hover:bg-white/10 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Çıxış
            </button>
            <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── PRODUCTS TAB ── */}
        {tab === 'products' && (
          <div className="flex flex-1 overflow-hidden">
            {/* Form */}
            <div className="w-full lg:w-[420px] flex-shrink-0 border-r border-border overflow-y-auto p-5 space-y-4">
              <h3 className="font-heading font-semibold text-primary text-base">
                {editId ? 'Məhsulu Düzənlə' : 'Yeni Məhsul Əlavə Et'}
              </h3>
              {success && <div className="px-4 py-3 bg-accent/10 text-accent rounded-xl text-sm font-medium">✓ {success}</div>}

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">Məhsul adı *</label>
                <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="məs. Asus ROG Strix G16"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-secondary/60 transition-colors" />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-muted mb-1.5">Qiymət (AZN) *</label>
                  <input type="number" value={form.price || ''} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                    placeholder="1499"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-secondary/60 transition-colors" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-muted mb-1.5">Köhnə qiymət</label>
                  <input type="number" value={form.originalPrice || ''} onChange={(e) => setForm((f) => ({ ...f, originalPrice: Number(e.target.value) || undefined }))}
                    placeholder="1799"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-secondary/60 transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">Kateqoriya</label>
                <div className="relative">
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-secondary/60 transition-colors appearance-none pr-8">
                    {allCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">Badge</label>
                <input type="text" value={form.badge || ''} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                  placeholder="Yeni"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-secondary/60 transition-colors" />
              </div>

              <div className="flex gap-4">
                {[{ label: 'Yeni', key: 'isNew' }, { label: 'Bestseller', key: 'isBestseller' }].map(({ label, key }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!form[key as keyof typeof form]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                      className="w-4 h-4 accent-secondary" />
                    <span className="text-sm text-muted">{label}</span>
                  </label>
                ))}
              </div>

              {/* Image */}
              <div>
                <label className="block text-xs font-semibold text-muted mb-2">Şəkil *</label>
                <div className="flex gap-1 mb-3 bg-background rounded-lg p-1">
                  {[
                    { id: 'upload', icon: <Upload className="w-3.5 h-3.5" />, label: 'Yüklə' },
                    { id: 'gallery', icon: <Images className="w-3.5 h-3.5" />, label: 'Qaleriya' },
                    { id: 'url', icon: null, label: 'URL' },
                  ].map((t) => (
                    <button key={t.id} onClick={() => setImageMode(t.id as typeof imageMode)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${imageMode === t.id ? 'bg-white shadow text-secondary' : 'text-muted hover:text-primary'}`}>
                      {t.icon}{t.label}
                    </button>
                  ))}
                </div>

                {imageMode === 'upload' && (
                  <div onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-secondary/50 hover:bg-secondary/5 transition-all">
                    <Upload className="w-8 h-8 text-muted mx-auto mb-2" />
                    <p className="text-sm text-muted">Şəkil seçmək üçün klikləyin</p>
                    <p className="text-xs text-muted/60 mt-1">PNG, JPG, WEBP</p>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                  </div>
                )}

                {imageMode === 'gallery' && (
                  <div className="grid grid-cols-4 gap-2">
                    {GALLERY_IMAGES.map((img) => (
                      <button key={img.id} onClick={() => handleGalleryPick(img.url)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${form.image === img.url ? 'border-secondary shadow-md' : 'border-transparent hover:border-secondary/40'}`}>
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {imageMode === 'url' && (
                  <input type="url" value={urlInput} onChange={(e) => handleUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-secondary/60 transition-colors" />
                )}

                {previewUrl && (
                  <div className="mt-3 relative">
                    <img src={previewUrl} alt="preview" className="w-full h-32 object-cover rounded-xl border border-border" />
                    <button onClick={() => { setPreviewUrl(''); setForm((f) => ({ ...f, image: '' })); setUrlInput(''); }}
                      className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Specs */}
              <div>
                <label className="block text-xs font-semibold text-muted mb-2">Texniki xüsusiyyətlər</label>
                <div className="flex gap-2 mb-2">
                  <input value={specKey} onChange={(e) => setSpecKey(e.target.value)} placeholder="Açar (məs. ram)"
                    className="flex-1 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-secondary/60 transition-colors" />
                  <input value={specVal} onChange={(e) => setSpecVal(e.target.value)} placeholder="Dəyər (məs. 16GB)"
                    className="flex-1 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-secondary/60 transition-colors" />
                  <button onClick={addSpec} className="p-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {Object.entries(form.specs).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between px-3 py-1.5 bg-background rounded-lg mb-1 text-xs">
                    <span className="font-medium text-primary">{k}:</span>
                    <span className="text-muted">{v}</span>
                    <button onClick={() => removeSpec(k)} className="text-red-400 hover:text-red-600 ml-2"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>

              <button onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-2 py-3 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary/90 transition-colors">
                <Save className="w-4 h-4" />
                {editId ? 'Yenilə' : 'Məhsul Əlavə Et'}
              </button>
              {editId && (
                <button onClick={() => { setEditId(null); setForm(emptyProduct()); setPreviewUrl(''); setUrlInput(''); }}
                  className="w-full py-2.5 text-sm text-muted hover:text-primary transition-colors">
                  Ləğv et
                </button>
              )}
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-5">
              <h3 className="font-heading font-semibold text-primary text-base mb-4">Məhsullar ({products.length})</h3>
              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <p className="text-muted text-sm">Hələ heç bir məhsul əlavə edilməyib.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border hover:border-secondary/40 transition-all">
                      <img src={product.image} alt={product.name} className="w-16 h-12 object-cover rounded-lg flex-shrink-0 bg-white" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-primary text-sm truncate">{product.name}</p>
                        <p className="text-xs text-muted">{product.price} AZN · {allCategories.find(c => c.id === product.category)?.name}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => handleEdit(product)} className="p-1.5 text-secondary hover:bg-secondary/10 rounded-lg transition-colors" title="Düzənlə">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Sil">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CATEGORIES TAB ── */}
        {tab === 'categories' && (
          <div className="flex flex-1 overflow-hidden">
            {/* Add category form */}
            <div className="w-full lg:w-[360px] flex-shrink-0 border-r border-border overflow-y-auto p-5 space-y-4">
              <h3 className="font-heading font-semibold text-primary text-base">Yeni Kateqoriya</h3>
              {catSuccess && <div className="px-4 py-3 bg-accent/10 text-accent rounded-xl text-sm font-medium">✓ {catSuccess}</div>}

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">Kateqoriya adı *</label>
                <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="məs. Klaviaturalar"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-secondary/60 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">Unikal ID *</label>
                <input type="text" value={newCatId} onChange={(e) => setNewCatId(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  placeholder="məs. keyboards"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-secondary/60 transition-colors" />
                <p className="text-xs text-muted mt-1">Yalnız kiçik hərflər və tire (-)</p>
              </div>
              <button onClick={handleAddCategory}
                className="w-full flex items-center justify-center gap-2 py-3 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary/90 transition-colors text-sm">
                <FolderPlus className="w-4 h-4" />
                Kateqoriya Əlavə Et
              </button>
            </div>

            {/* Category list */}
            <div className="flex-1 overflow-y-auto p-5">
              <h3 className="font-heading font-semibold text-primary text-base mb-4">Bütün Kateqoriyalar</h3>
              <div className="space-y-2">
                {/* Default (read-only) */}
                {defaultCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-3 px-4 py-3 bg-background rounded-xl border border-border">
                    <Tag className="w-4 h-4 text-muted flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary">{cat.name}</p>
                      <p className="text-xs text-muted">ID: {cat.id}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-border rounded-full text-muted">Standart</span>
                  </div>
                ))}
                {/* Custom categories */}
                {customCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-3 px-4 py-3 bg-secondary/5 rounded-xl border border-secondary/20">
                    <Tag className="w-4 h-4 text-secondary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary">{cat.name}</p>
                      <p className="text-xs text-muted">ID: {cat.id}</p>
                    </div>
                    <button onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
