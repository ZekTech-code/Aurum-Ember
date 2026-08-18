import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Filter, Edit2, Trash2, 
  Image as ImageIcon, ToggleLeft, ToggleRight,
  MoreVertical, Star, Clock, Flame, X, 
  Grid, List, CheckCircle2, AlertCircle, 
  ChevronRight, Loader2, UploadCloud, Eye, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMenu } from '../../context/MenuContext';
import ConfirmModal from '../../components/ConfirmModal';
import Toast from '../../components/Toast';
import MealImage from '../../components/MealImage';

const MenuManager = () => {
  const { menuItems, addMeal, updateMeal, deleteMeal, toggleAvailability, loading: contextLoading, refetchMenu } = useMenu();

  useEffect(() => {
    refetchMenu();
  }, []);
  

  
  const MEAL_CATEGORIES = [
    'Nigerian Meals', 'Soups', 'Swallows', 'Specials', 'Small Chops', 
    'Grills & BBQ', 'Rice Dishes', 'Beans & Moi Moi', 'Salads', 'Desserts'
  ];
  const DRINK_CATEGORIES = [
    'Drinks', 'Cocktails', 'Juices', 'Hot Drinks', 'Smoothies', 'Water'
  ];
  const ALL_CATEGORIES = [...MEAL_CATEGORIES, ...DRINK_CATEGORIES];

  // Dynamic Categories based on current items (for filter bar)
  const CATEGORIES = useMemo(() => {
    const cats = new Set(['All']);
    menuItems.forEach(item => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats).sort((a, b) => {
      if (a === 'All') return -1;
      if (b === 'All') return 1;
      return a.localeCompare(b);
    });
  }, [menuItems]);

  // UI State
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null); // stores ID of item to delete
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Burgers',
    image: '',
    status: 'In Stock'
  });

  // Filter Logic
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchTerm, activeCategory]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData({
        name: item.name,
        price: item.price,
        description: item.description,
        category: item.category,
        image: item.image,
        status: item.availability || 'In Stock'
      });
    } else {
      setEditItem(null);
      setFormData({
        name: '',
        price: '',
        description: '',
        category: 'Nigerian Meals',
        image: '',
        imageFile: null,
        status: 'In Stock'
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast("Please upload a valid image file", "error");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/webp', 0.7);
          canvas.toBlob((blob) => {
            setFormData({ ...formData, image: dataUrl, imageFile: blob });
          }, 'image/webp', 0.7);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('price', formData.price);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('availability', formData.status);
      if (formData.imageFile) {
        submitData.append('image', formData.imageFile, 'image.webp');
      }

      if (editItem) {
        await updateMeal(editItem.id || editItem._id, submitData);
        showToast("Meal updated successfully!");
      } else {
        if (!formData.imageFile) {
          showToast("Please upload an image", "error");
          setIsLoading(false);
          return;
        }
        await addMeal(submitData);
        showToast("New meal added to menu!");
      }
      setIsModalOpen(false);
    } catch (error) {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!isDeleting) return;
    setIsLoading(true);
    try {
      await deleteMeal(isDeleting);
      showToast("Meal removed from menu.", "info");
    } catch (error) {
      showToast("Failed to delete meal.", "error");
    } finally {
      setIsLoading(false);
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 bg-admin-card p-4 sm:p-8 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-admin-text tracking-tight">Menu Studio</h1>
          <p className="text-admin-text-muted mt-1 font-medium text-sm sm:text-base">Craft and manage your culinary masterpiece.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-admin-bg p-1.5 rounded-2xl border border-admin-border">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 sm:p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-admin-text-muted hover:text-admin-text'}`}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 sm:p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-admin-text-muted hover:text-admin-text'}`}
            >
              <List size={18} />
            </button>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 sm:px-8 py-3 sm:py-4 bg-accent text-white rounded-[1.5rem] text-xs sm:text-sm font-black shadow-xl shadow-accent/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Plus size={18} /> <span className="hidden xs:inline">Add New Creation</span><span className="xs:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-4 relative group">
          <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-admin-text-muted group-focus-within:text-accent transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search meals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-3.5 bg-admin-card border border-admin-border rounded-xl outline-none focus:border-accent transition-all text-sm font-medium text-admin-text shadow-sm"
          />
        </div>
        <div className="lg:col-span-8 flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide transition-all whitespace-nowrap cursor-pointer border ${
                activeCategory === cat 
                ? 'bg-admin-text text-admin-bg border-admin-text shadow-md' 
                : 'bg-admin-card text-admin-text-muted border-admin-border hover:border-accent/30 hover:text-accent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {contextLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
           {[1,2,3,4,5,6,7,8].map(i => (
             <div key={i} className="bg-admin-card rounded-xl h-72 animate-pulse" />
           ))}
        </div>
      ) : filteredItems.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredItems.map((item, idx) => (
                <MealCard 
                  key={item._id}
                  item={item}
                  index={idx}
                  onEdit={() => handleOpenModal(item)}
                  onDelete={() => setIsDeleting(item._id)}
                  onToggle={() => toggleAvailability(item._id)}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-admin-card rounded-xl overflow-hidden shadow-sm border border-admin-border/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-admin-border bg-admin-bg/30">
                    <th className="px-4 sm:px-8 py-4 sm:py-6 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Meal</th>
                    <th className="px-4 sm:px-6 py-4 sm:py-6 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-admin-text-muted hidden sm:table-cell">Category</th>
                    <th className="px-4 sm:px-6 py-4 sm:py-6 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Price</th>
                    <th className="px-4 sm:px-6 py-4 sm:py-6 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-admin-text-muted hidden md:table-cell">Status</th>
                    <th className="px-4 sm:px-8 py-4 sm:py-6 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-admin-text-muted text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border/50">
                  {filteredItems.map((item) => (
                    <MealRow 
                      key={item._id}
                      item={item}
                      onEdit={() => handleOpenModal(item)}
                      onDelete={() => setIsDeleting(item._id)}
                      onToggle={() => toggleAvailability(item._id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="bg-admin-card rounded-xl p-10 sm:p-20 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-admin-bg rounded-xl flex items-center justify-center text-admin-text-muted mb-4 sm:mb-6">
            <Search size={32} className="opacity-20 sm:w-10 sm:h-10" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-admin-text mb-2">No culinary gems found</h3>
          <p className="text-admin-text-muted max-w-md mx-auto font-medium text-sm sm:text-base">Try adjusting your filters or search terms to find what you're looking for.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isLoading && setIsModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full sm:max-w-2xl bg-admin-card rounded-t-3xl sm:rounded-[3rem] shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col"
            >
              <div className="p-5 sm:p-10 border-b border-admin-border flex justify-between items-center bg-admin-bg/20">
                <div>
                  <h2 className="text-xl sm:text-3xl font-black text-admin-text">{editItem ? 'Edit Creation' : 'New Creation'}</h2>
                  <p className="text-xs sm:text-sm text-admin-text-muted font-medium mt-1">Refine the details of your menu item.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  disabled={isLoading}
                  className="p-2 sm:p-3 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl sm:rounded-2xl text-admin-text-muted transition-all cursor-pointer"
                >
                   <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 sm:p-10 custom-scrollbar">
                <form id="meal-form" onSubmit={handleSubmit} className="space-y-5 sm:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                    <div className="space-y-2 sm:space-y-3">
                      <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] ml-1">Meal Name</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Truffle Infused Carbonara" 
                        className="w-full bg-admin-bg border border-admin-border rounded-xl sm:rounded-2xl py-3.5 sm:py-4.5 px-4 sm:px-6 text-admin-text font-semibold outline-none focus:border-accent transition-all shadow-sm text-sm" 
                      />
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] ml-1">Price ($)</label>
                      <div className="relative">
                        <span className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-admin-text-muted font-bold text-sm">$</span>
                        <input 
                          type="number" 
                          step="0.01"
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          placeholder="0.00" 
                          className="w-full bg-admin-bg border border-admin-border rounded-xl sm:rounded-2xl py-3.5 sm:py-4.5 pl-8 sm:pl-10 pr-4 sm:pr-6 text-admin-text font-bold outline-none focus:border-accent transition-all shadow-sm text-sm" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                    <div className="space-y-2 sm:space-y-3">
                      <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] ml-1">Category</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-admin-bg border border-admin-border rounded-xl sm:rounded-2xl py-3.5 sm:py-4.5 px-4 sm:px-6 text-admin-text font-semibold outline-none focus:border-accent appearance-none cursor-pointer shadow-sm text-sm"
                      >
                        <optgroup label="Meals">
                          {MEAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </optgroup>
                        <optgroup label="Drinks">
                          {DRINK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </optgroup>
                      </select>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] ml-1">Initial Status</label>
                      <select 
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full bg-admin-bg border border-admin-border rounded-xl sm:rounded-2xl py-3.5 sm:py-4.5 px-4 sm:px-6 text-admin-text font-semibold outline-none focus:border-accent appearance-none cursor-pointer shadow-sm text-sm"
                      >
                        <option value="In Stock">In Stock (Available)</option>
                        <option value="Out of Stock">Out of Stock (Hidden)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] ml-1">Sensory Description</label>
                    <textarea 
                      rows="4"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe the textures, aromas, and visual appeal..." 
                      className="w-full bg-admin-bg border border-admin-border rounded-xl sm:rounded-2xl py-4 sm:py-5 px-4 sm:px-6 text-admin-text font-medium outline-none focus:border-accent resize-none shadow-sm text-sm" 
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] ml-1">Meal Visual (Photo)</label>
                    <div 
                      onClick={() => !isLoading && fileInputRef.current?.click()}
                      className="relative group border-2 border-dashed border-admin-border rounded-xl p-6 sm:p-12 text-center hover:border-accent hover:bg-accent/5 transition-all cursor-pointer overflow-hidden"
                    >
                      {formData.image ? (
                        <div className="absolute inset-0 w-full h-full">
                          <img 
                            src={formData.image} 
                            alt="Preview" 
                            className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-admin-card via-transparent to-transparent" />
                        </div>
                      ) : null}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-admin-bg rounded-xl sm:rounded-2xl flex items-center justify-center text-admin-text-muted mb-3 sm:mb-4 group-hover:text-accent group-hover:scale-110 transition-all shadow-sm">
                          <UploadCloud size={24} className="sm:w-8 sm:h-8" />
                        </div>
                        <p className="text-xs sm:text-sm text-admin-text font-black mb-1">
                          {formData.image ? 'Replace Image' : 'Drop Image or Click to Browse'}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-admin-text-muted font-bold uppercase tracking-widest">Supports JPG, PNG (Max 5MB)</p>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-5 sm:p-10 border-t border-admin-border bg-admin-bg/20 flex gap-3 sm:gap-4">
                <button 
                  type="button"
                  disabled={isLoading}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 sm:py-5 bg-admin-bg text-admin-text rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest hover:bg-admin-border transition-all cursor-pointer disabled:opacity-50"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  form="meal-form"
                  disabled={isLoading}
                  className="flex-[2] py-3.5 sm:py-5 bg-accent text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest shadow-xl shadow-accent/25 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Finalizing...
                    </>
                  ) : (
                    editItem ? 'Save Refinements' : 'Launch New Item'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <ConfirmModal 
        isOpen={!!isDeleting}
        onClose={() => setIsDeleting(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Culinary Item?"
        message="This action will permanently remove this meal from the public menu and order system. This cannot be undone."
        confirmText="Confirm Deletion"
        type="danger"
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const MealCard = ({ item, index, onEdit, onDelete, onToggle }) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className="group relative flex flex-col bg-admin-card rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg border border-admin-border/50 hover:border-accent/30"
    >
      <div className="relative h-36 sm:h-44 overflow-hidden bg-admin-bg">
        <MealImage 
          name={item.name} 
          image={item.image}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        <div className="absolute top-3 left-3 z-10">
          <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wide ${
            (item.availability || 'In Stock') === 'In Stock' ? 'bg-green-500 text-white' : 'bg-rose-500 text-white'
          }`}>
            {item.availability || 'In Stock'}
          </span>
        </div>

        <div className="absolute top-3 right-3 z-10">
          <button 
            onClick={onToggle}
            className={`p-1.5 rounded-lg backdrop-blur-md transition-all ${
              (item.availability || 'In Stock') === 'In Stock' 
              ? 'bg-rose-500/80 text-white hover:bg-rose-500' 
              : 'bg-green-500/80 text-white hover:bg-green-500'
            }`}
          >
            {(item.availability || 'In Stock') === 'In Stock' ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm text-admin-text leading-snug group-hover:text-accent transition-colors line-clamp-1">
            {item.name}
          </h3>
          <span className="font-bold text-accent text-sm shrink-0">${(Number(item.price) || 0).toLocaleString('en-US')}</span>
        </div>
        
        <p className="text-admin-text-muted text-xs leading-relaxed line-clamp-2 mb-3">
          {item.description}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-[10px] font-medium text-admin-text-muted bg-admin-bg px-2 py-1 rounded-md">
            {item.category}
          </span>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={onEdit}
              className="p-1.5 text-admin-text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-all cursor-pointer"
            >
              <Edit2 size={14} />
            </button>
            <button 
              onClick={onDelete}
              className="p-1.5 text-admin-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MealRow = ({ item, onEdit, onDelete, onToggle }) => (
  <tr className="hover:bg-admin-bg/40 transition-colors group">
    <td className="px-4 sm:px-8 py-3 sm:py-5">
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-admin-bg flex-shrink-0">
          <MealImage 
            name={item.name} 
            image={item.image}
            className="w-full h-full object-cover" 
          />
        </div>
        <div>
          <p className="font-black text-admin-text group-hover:text-accent transition-colors text-sm sm:text-base">{item.name}</p>
          <p className="text-[9px] sm:text-[10px] text-admin-text-muted font-bold uppercase tracking-widest mt-0.5">{item.category}</p>
        </div>
      </div>
    </td>
    <td className="px-4 sm:px-6 py-3 sm:py-5 hidden sm:table-cell">
      <span className="px-3 sm:px-4 py-1.5 bg-admin-bg rounded-xl text-[10px] font-black text-admin-text-muted uppercase tracking-widest whitespace-nowrap">
        {item.category}
      </span>
    </td>
    <td className="px-4 sm:px-6 py-3 sm:py-5">
      <p className="font-black text-admin-text text-base sm:text-lg">${(Number(item.price) || 0).toLocaleString('en-US')}</p>
    </td>
    <td className="px-4 sm:px-6 py-3 sm:py-5 hidden md:table-cell">
      <button 
        onClick={onToggle}
        className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
          (item.availability || 'In Stock') === 'In Stock' 
          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-white' 
          : 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500 hover:text-white'
        }`}
      >
        {item.availability || 'In Stock'}
      </button>
    </td>
    <td className="px-4 sm:px-8 py-3 sm:py-5 text-right">
      <div className="flex items-center justify-end gap-1 sm:gap-3">
        <button 
          onClick={onEdit}
          className="p-2 sm:p-3 text-admin-text-muted hover:text-accent hover:bg-accent/10 rounded-lg sm:rounded-xl transition-all cursor-pointer"
        >
          <Edit2 size={16} />
        </button>
        <button 
          onClick={onDelete}
          className="p-2 sm:p-3 text-admin-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg sm:rounded-xl transition-all cursor-pointer"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </td>
  </tr>
);

export default MenuManager;
