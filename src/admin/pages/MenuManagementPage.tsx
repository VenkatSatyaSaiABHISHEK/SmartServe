import { useState } from 'react';
import { useAdminStore } from '../store/useAdminStore';
import { Search, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function MenuManagementPage() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishCategory, setDishCategory] = useState('Main Course');
  const [dishType, setDishType] = useState<'veg' | 'non-veg'>('veg');
  const [dishImage, setDishImage] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName || !dishPrice) return;
    
    // Default image if empty
    const imgUrl = dishImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop';
    
    addMenuItem({
      name: dishName,
      price: parseFloat(dishPrice),
      image: imgUrl,
      category: dishCategory,
      type: dishType
    });

    // Reset Form
    setDishName('');
    setDishPrice('');
    setDishCategory('Main Course');
    setDishType('veg');
    setDishImage('');
    setShowAddForm(false);
  };

  const handleToggleAvailable = (id: string, currentStatus: boolean) => {
    updateMenuItem(id, { available: !currentStatus });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this dish from the menu?')) {
      deleteMenuItem(id);
    }
  };

  // Filter items
  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">MENU INVENTORY MANAGER</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
            Add new recipes, modify restaurant catalog pricing, and toggle stock availability.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer self-start"
        >
          <Plus className="w-4.5 h-4.5" />
          Add Menu Item
        </button>
      </div>

      {/* Add Item Drawer/Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddSubmit} className="bg-white border border-[#f1f5f9] rounded-[24px] p-6.5 shadow-sm space-y-4 max-w-2xl">
              <h3 className="font-extrabold text-[15px] text-[#0f172a] font-poppins">New Dish Specifications</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Dish Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Garlic Butter Lobster"
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Base Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="29.99"
                    value={dishPrice}
                    onChange={(e) => setDishPrice(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Menu Category</label>
                  <select
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3.5 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                  >
                    <option value="Starters">Starters</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Biryani">Biryani</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Dietary Tag</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                    <button
                      type="button"
                      onClick={() => setDishType('veg')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        dishType === 'veg' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setDishType('non-veg')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        dishType === 'non-veg' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Non-Veg
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={dishImage}
                    onChange={(e) => setDishImage(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-slate-100 text-slate-500 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-500/10 cursor-pointer"
                >
                  Save Item
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Product List */}
      <div className="relative">
        <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search items by name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-[#f1f5f9] rounded-[22px] pl-12 pr-6 py-4.5 text-sm font-bold text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-500/5 transition-all shadow-sm"
        />
      </div>

      {/* Products list grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white border border-[#f1f5f9] rounded-[28px] overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div>
              {/* Product Image */}
              <div className="h-44 relative bg-slate-100 overflow-hidden shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" />
                <span className={`absolute top-4 left-4 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-white border border-white/20 shadow-md ${
                  item.type === 'veg' ? 'bg-emerald-500' : 'bg-red-500'
                }`}>
                  {item.type}
                </span>
                <span className="absolute top-4 right-4 bg-slate-950/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                  ID: {item.id}
                </span>
              </div>

              {/* Product Info */}
              <div className="p-5 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-extrabold text-[15px] text-[#0f172a] font-poppins leading-tight">{item.name}</h4>
                  <span className="text-base font-black text-slate-900">${item.price.toFixed(2)}</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</p>
              </div>
            </div>

            {/* Product Actions */}
            <div className="p-5 pt-0 border-t border-slate-50/50 mt-4 flex items-center justify-between gap-3">
              <button
                onClick={() => handleToggleAvailable(item.id, item.available)}
                className={`flex-1 py-2.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                  item.available 
                    ? 'bg-green-50 text-green-600 border border-green-100' 
                    : 'bg-red-50 text-red-500 border border-red-100'
                }`}
              >
                {item.available ? 'In Stock' : 'Out of Stock'}
              </button>

              <button
                onClick={() => handleDelete(item.id)}
                className="p-2.5 border border-red-100 hover:bg-red-50 text-red-500 rounded-xl cursor-pointer transition-colors"
                title="Delete item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
