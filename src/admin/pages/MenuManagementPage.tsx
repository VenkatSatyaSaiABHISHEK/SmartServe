import { useState } from 'react';
import { useAdminStore } from '../store/useAdminStore';
import { Search, Plus, Trash2, CheckCircle2, AlertCircle, RefreshCw, Upload, Link as LinkIcon, FileImage, Clock, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { storage } from '../../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export function MenuManagementPage() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishPrepTime, setDishPrepTime] = useState('12');
  const [dishCategory, setDishCategory] = useState('Main Course');
  const [dishType, setDishType] = useState<'veg' | 'non-veg'>('veg');
  const [dishImage, setDishImage] = useState('');

  // Image Upload State
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadTarget, setUploadTarget] = useState<'cloudinary' | 'firebase'>('cloudinary');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file (png, jpg, jpeg, webp).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    if (uploadTarget === 'firebase') {
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `menu-items/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Firebase Storage Upload Error:", error);
          setUploadError('Upload failed. Please try again.');
          setUploading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setDishImage(downloadURL);
            setUploading(false);
          } catch (err) {
            console.error("Failed to get download URL:", err);
            setUploadError('Failed to retrieve image URL after upload.');
            setUploading(false);
          }
        }
      );
    } else {
      try {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.replace(/"/g, '');
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.replace(/"/g, '');

        if (!cloudName || !uploadPreset) {
          throw new Error("Cloudinary credentials are not configured.");
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, true);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 201) {
            const response = JSON.parse(xhr.responseText);
            if (response.secure_url) {
              setDishImage(response.secure_url);
            } else {
              setUploadError('Failed to parse secure URL from Cloudinary.');
            }
          } else {
            console.error("Cloudinary error response:", xhr.responseText);
            setUploadError(`Cloudinary Upload failed with status ${xhr.status}.`);
          }
          setUploading(false);
        };

        xhr.onerror = () => {
          setUploadError('Network error during Cloudinary upload.');
          setUploading(false);
        };

        xhr.send(formData);
      } catch (err: any) {
        console.error("Cloudinary upload setup error:", err);
        setUploadError(err.message || 'Cloudinary configuration error.');
        setUploading(false);
      }
    }
  };

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
      type: dishType,
      prepTime: parseInt(dishPrepTime) || 12
    });

    // Reset Form
    setDishName('');
    setDishPrice('');
    setDishPrepTime('12');
    setDishCategory('Main Course');
    setDishType('veg');
    setDishImage('');
    setImageMode('upload');
    setUploadTarget('cloudinary');
    setUploadError(null);
    setUploadProgress(0);
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

      {/* Category Counts Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#f1f5f9] rounded-2xl p-4.5 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">V</div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Veg Items</p>
            <p className="text-lg font-black text-slate-800">{menuItems.filter(item => item.type === 'veg').length}</p>
          </div>
        </div>
        <div className="bg-white border border-[#f1f5f9] rounded-2xl p-4.5 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center font-black">NV</div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Non-Veg Items</p>
            <p className="text-lg font-black text-slate-800">{menuItems.filter(item => item.type === 'non-veg').length}</p>
          </div>
        </div>
        <div className="bg-white border border-[#f1f5f9] rounded-2xl p-4.5 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Drinks</p>
            <p className="text-lg font-black text-slate-800">{menuItems.filter(item => item.category === 'Drinks').length}</p>
          </div>
        </div>
        <div className="bg-white border border-[#f1f5f9] rounded-2xl p-4.5 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Desserts</p>
            <p className="text-lg font-black text-slate-800">{menuItems.filter(item => item.category === 'Desserts').length}</p>
          </div>
        </div>
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Prep Time (Mins)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="15"
                    value={dishPrepTime}
                    onChange={(e) => setDishPrepTime(e.target.value)}
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

                <div className="space-y-1.5 md:col-span-2">
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

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">
                    Dish Image Representation
                  </label>
                  
                  {/* Tab Toggle */}
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40 w-full sm:w-72">
                    <button
                      type="button"
                      onClick={() => {
                        setImageMode('upload');
                        setUploadError(null);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        imageMode === 'upload' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageMode('url');
                        setUploadError(null);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        imageMode === 'url' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      Image URL
                    </button>
                  </div>

                  {/* Dual Mode Form Fields */}
                  {imageMode === 'upload' ? (
                    <div className="space-y-2.5">
                      {/* Destination Selector */}
                      <div className="flex items-center gap-2.5 bg-slate-50/50 border border-slate-100/50 p-2.5 rounded-xl">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Upload Destination:</span>
                        <div className="flex bg-slate-200/60 p-0.5 rounded-lg border border-slate-200/30">
                          <button
                            type="button"
                            onClick={() => setUploadTarget('cloudinary')}
                            className={`px-3 py-1 rounded-md text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                              uploadTarget === 'cloudinary' 
                                ? 'bg-white text-[#7c3aed] shadow-sm' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            Cloudinary
                          </button>
                          <button
                            type="button"
                            onClick={() => setUploadTarget('firebase')}
                            className={`px-3 py-1 rounded-md text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                              uploadTarget === 'firebase' 
                                ? 'bg-white text-[#f59e0b] shadow-sm' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            Firebase
                          </button>
                        </div>
                      </div>

                      <div 
                        className={`w-full bg-[#fafafc] border-2 border-dashed rounded-xl p-5 text-center flex flex-col items-center justify-center transition-all min-h-[144px] ${
                          uploading ? 'border-indigo-300 bg-indigo-50/10' : 'border-[#e2e8f0] hover:border-slate-300'
                        }`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={async (e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) await uploadFile(file);
                        }}
                      >
                        <input
                          type="file"
                          id="menu-image-upload"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={uploading}
                        />
                        
                        {uploading ? (
                          <div className="space-y-2 flex flex-col items-center">
                            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                            <p className="text-xs font-bold text-slate-600">Uploading: {uploadProgress}%</p>
                            <div className="w-48 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        ) : dishImage ? (
                          <div className="space-y-3 flex flex-col items-center w-full">
                            <div className="relative group rounded-xl overflow-hidden max-w-[192px] h-28 border border-slate-100 shadow-sm">
                              <img src={dishImage} alt="Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <label 
                                  htmlFor="menu-image-upload" 
                                  className="bg-white/90 text-slate-800 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg cursor-pointer shadow hover:bg-white transition-colors"
                                >
                                  Change
                                </label>
                              </div>
                            </div>
                            <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded successfully!
                            </p>
                          </div>
                        ) : (
                          <label 
                            htmlFor="menu-image-upload" 
                            className="cursor-pointer flex flex-col items-center space-y-2 group w-full"
                          >
                            <div className="p-3 bg-white rounded-full shadow-sm border border-slate-50 group-hover:scale-105 transition-transform">
                              <FileImage className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-bold text-slate-700">
                                Click to upload or drag & drop
                              </p>
                              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                                PNG, JPG, JPEG or WEBP (Max 5MB)
                              </p>
                            </div>
                          </label>
                        )}
                      </div>
                      
                      {uploadError && (
                        <p className="text-[10px] font-bold text-red-500 flex items-center gap-1.5 mt-1 ml-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {uploadError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="url"
                        placeholder="e.g. https://res.cloudinary.com/demo/image/upload/sample.jpg"
                        value={dishImage}
                        onChange={(e) => setDishImage(e.target.value)}
                        className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                      />
                      
                      {dishImage && (
                        <div className="mt-2 flex items-center justify-center">
                          <div className="relative rounded-xl overflow-hidden max-w-[192px] h-28 border border-slate-100 shadow-sm animate-fade-in">
                            <img 
                              src={dishImage} 
                              alt="URL Preview" 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop';
                              }} 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 text-[10px] font-bold text-slate-400">
                  <span className="uppercase tracking-widest">{item.category}</span>
                  <span className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-[#f1f5f9]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.prepTime || 10} mins
                  </span>
                </div>
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
