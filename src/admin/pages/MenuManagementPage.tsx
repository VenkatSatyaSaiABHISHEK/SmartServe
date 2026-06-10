import { useState } from 'react';
import { useAdminStore, type MenuItem } from '../store/useAdminStore';
import { Search, Plus, Trash2, CheckCircle2, AlertCircle, RefreshCw, Upload, Link as LinkIcon, FileImage, Clock, Utensils, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { storage } from '../../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const KEYWORD_IMAGE_MAP: Record<string, string> = {
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop',
  pasta: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop',
  biryani: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=600&auto=format&fit=crop',
  cake: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600&auto=format&fit=crop',
  dessert: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=600&auto=format&fit=crop',
  icecream: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=600&auto=format&fit=crop',
  ice_cream: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=600&auto=format&fit=crop',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop',
  coffee: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop',
  tea: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop',
  latte: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop',
  sandwich: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=600&auto=format&fit=crop',
  sushi: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&auto=format&fit=crop',
  fries: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop',
  taco: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=600&auto=format&fit=crop',
  tacos: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=600&auto=format&fit=crop',
  coke: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop',
  soda: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop',
  drink: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=600&auto=format&fit=crop',
  drinks: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=600&auto=format&fit=crop',
  smoothie: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=600&auto=format&fit=crop',
  juice: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=600&auto=format&fit=crop',
  soup: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=600&auto=format&fit=crop',
  lobster: 'https://images.unsplash.com/photo-1553618551-fba689030290?q=80&w=600&auto=format&fit=crop',
  chicken: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=600&auto=format&fit=crop',
  steak: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop',
  noodles: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=600&auto=format&fit=crop',
  ramen: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=600&auto=format&fit=crop',
  fried_rice: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=600&auto=format&fit=crop',
  fried_meat: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=600&auto=format&fit=crop',
  appetizer: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=600&auto=format&fit=crop',
  starter: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=600&auto=format&fit=crop',
  generic: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop'
};

const FOOD_PRESETS = [
  { label: '🍕 Pizza', value: 'pizza' },
  { label: '🍔 Burger', value: 'burger' },
  { label: '🍜 Biryani', value: 'biryani' },
  { label: '🍝 Pasta', value: 'pasta' },
  { label: '🥗 Salad', value: 'salad' },
  { label: '🍰 Cake', value: 'cake' },
  { label: '☕ Coffee', value: 'coffee' },
  { label: '🍹 Drink', value: 'drink' }
];

const getFoodImageByKeyword = (text: string): string | null => {
  if (!text) return null;
  const cleanText = text.toLowerCase().trim().replace(/[-\s]+/g, '_');
  
  if (KEYWORD_IMAGE_MAP[cleanText]) {
    return KEYWORD_IMAGE_MAP[cleanText];
  }
  
  for (const key of Object.keys(KEYWORD_IMAGE_MAP)) {
    if (key !== 'generic' && (cleanText.includes(key) || key.includes(cleanText))) {
      return KEYWORD_IMAGE_MAP[key];
    }
  }
  return null;
};

const resolveFoodImage = (imageInput: string, nameInput: string): string => {
  const trimmedImage = imageInput.trim();
  if (trimmedImage && (trimmedImage.startsWith('http://') || trimmedImage.startsWith('https://') || trimmedImage.startsWith('data:image/'))) {
    return trimmedImage;
  }
  
  const imgByKeyword = getFoodImageByKeyword(trimmedImage);
  if (imgByKeyword) return imgByKeyword;
  
  const imgByName = getFoodImageByKeyword(nameInput);
  if (imgByName) return imgByName;
  
  return KEYWORD_IMAGE_MAP.generic;
};

export function MenuManagementPage() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');

  // CSV Import State
  const [csvAlert, setCsvAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      setCsvAlert({ message: 'Invalid file format. Please select a valid CSV file.', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result;
      if (typeof text !== 'string') {
        setCsvAlert({ message: 'Failed to read file.', type: 'error' });
        return;
      }

      try {
        const rows = parseCSV(text);
        if (rows.length === 0) {
          setCsvAlert({ message: 'The CSV file is empty or invalid.', type: 'error' });
          return;
        }

        const itemsToImport: any[] = [];
        
        rows.forEach((row, rowIndex) => {
          const name = getHeaderValue(row, ['name', 'item', 'dish', 'title']) || '';
          const priceStr = getHeaderValue(row, ['price', 'cost', 'rate', 'amount']) || '';
          const typeVal = (getHeaderValue(row, ['type', 'veg', 'non', 'dietary']) || '').toLowerCase();
          const prepStr = getHeaderValue(row, ['time', 'prep', 'duration']) || '';
          const url = getHeaderValue(row, ['url', 'image', 'img', 'photo', 'picture']) || '';
          const category = getHeaderValue(row, ['category', 'menu']) || 'Main Course';
          const slotVal = (getHeaderValue(row, ['slot', 'time', 'meal', 'period']) || '').toLowerCase();

          if (!name) {
            console.warn(`Row ${rowIndex + 1} skipped: Name is missing.`);
            return;
          }

          const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
          const type = typeVal.includes('non') ? 'non-veg' : 'veg';
          const prepTime = parseInt(prepStr.replace(/[^0-9]/g, '')) || 12;
          const image = url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop';
          
          let slot: 'morning' | 'evening' | 'night' | 'all' = 'all';
          if (slotVal.includes('morn')) slot = 'morning';
          else if (slotVal.includes('even')) slot = 'evening';
          else if (slotVal.includes('night')) slot = 'night';

          itemsToImport.push({
            name,
            price,
            type,
            prepTime,
            image,
            category,
            slot
          });
        });

        if (itemsToImport.length === 0) {
          setCsvAlert({ message: 'No valid menu items found in the CSV.', type: 'error' });
          return;
        }

        const { addMenuItems } = useAdminStore.getState();
        await addMenuItems(itemsToImport);
        setCsvAlert({
          message: `Successfully imported ${itemsToImport.length} menu items from CSV!`,
          type: 'success'
        });
        
        setTimeout(() => setCsvAlert(null), 5000);
      } catch (err: any) {
        console.error("Error parsing CSV:", err);
        setCsvAlert({ message: 'An error occurred while parsing the CSV: ' + err.message, type: 'error' });
      }
    };
    reader.onerror = () => {
      setCsvAlert({ message: 'Error reading CSV file.', type: 'error' });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0) return [];
    
    const headers = parseCSVLine(lines[0]);
    if (headers.length === 0) return [];
    
    const result: any[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = parseCSVLine(line);
      if (values.length === 0) continue;
      
      const row: any = {};
      headers.forEach((header, index) => {
        row[header.toLowerCase().trim()] = values[index] ? values[index].trim() : '';
      });
      result.push(row);
    }
    return result;
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result.map(s => s.replace(/^"|"$/g, '').trim());
  };

  const getHeaderValue = (row: any, keys: string[]) => {
    for (const key of keys) {
      const foundKey = Object.keys(row).find(k => k.includes(key));
      if (foundKey) return row[foundKey];
    }
    return '';
  };
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishPrepTime, setDishPrepTime] = useState('12');
  const [dishCategory, setDishCategory] = useState('Main Course');
  const [dishType, setDishType] = useState<'veg' | 'non-veg'>('veg');
  const [dishImage, setDishImage] = useState('');
  const [dishSlot, setDishSlot] = useState<'morning' | 'evening' | 'night' | 'all'>('all');

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
    
    // Resolve keyword/name to Unsplash image
    const imgUrl = resolveFoodImage(dishImage, dishName);
    
    addMenuItem({
      name: dishName,
      price: parseFloat(dishPrice),
      image: imgUrl,
      category: dishCategory,
      type: dishType,
      prepTime: parseInt(dishPrepTime) || 12,
      slot: dishSlot
    });

    // Reset Form
    setDishName('');
    setDishPrice('');
    setDishPrepTime('12');
    setDishCategory('Main Course');
    setDishType('veg');
    setDishImage('');
    setDishSlot('all');
    setImageMode('upload');
    setUploadTarget('cloudinary');
    setUploadError(null);
    setUploadProgress(0);
    setShowAddForm(false);
  };

  // Edit Menu Item States
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editDishName, setEditDishName] = useState('');
  const [editDishPrice, setEditDishPrice] = useState('');
  const [editDishPrepTime, setEditDishPrepTime] = useState('12');
  const [editDishCategory, setEditDishCategory] = useState('Main Course');
  const [editDishType, setEditDishType] = useState<'veg' | 'non-veg'>('veg');
  const [editDishImage, setEditDishImage] = useState('');
  const [editDishSlot, setEditDishSlot] = useState<'morning' | 'evening' | 'night' | 'all'>('all');

  // Edit Image Upload State
  const [editImageMode, setEditImageMode] = useState<'upload' | 'url'>('upload');
  const [editUploading, setEditUploading] = useState(false);
  const [editUploadProgress, setEditUploadProgress] = useState(0);
  const [editUploadError, setEditUploadError] = useState<string | null>(null);
  const [editUploadTarget, setEditUploadTarget] = useState<'cloudinary' | 'firebase'>('cloudinary');

  const handleStartEdit = (item: MenuItem) => {
    setEditingItem(item);
    setEditDishName(item.name);
    setEditDishPrice(item.price.toString());
    setEditDishPrepTime((item.prepTime || 12).toString());
    setEditDishCategory(item.category || 'Main Course');
    setEditDishType(item.type || 'veg');
    setEditDishImage(item.image || '');
    setEditDishSlot(item.slot || 'all');
    
    const isUrl = item.image && (item.image.startsWith('http://') || item.image.startsWith('https://') || item.image.startsWith('data:image/'));
    setEditImageMode(isUrl ? 'url' : 'upload');
    setEditUploadError(null);
    setEditUploadProgress(0);
    setEditUploading(false);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadEditFile(file);
  };

  const uploadEditFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setEditUploadError('Please select an image file (png, jpg, jpeg, webp).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setEditUploadError('Image size should be less than 5MB.');
      return;
    }

    setEditUploading(true);
    setEditUploadProgress(0);
    setEditUploadError(null);

    if (editUploadTarget === 'firebase') {
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `menu-items/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setEditUploadProgress(progress);
        },
        (error) => {
          console.error("Firebase Storage Upload Error:", error);
          setEditUploadError('Upload failed. Please try again.');
          setEditUploading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setEditDishImage(downloadURL);
            setEditUploading(false);
          } catch (err) {
            console.error("Failed to get download URL:", err);
            setEditUploadError('Failed to retrieve image URL after upload.');
            setEditUploading(false);
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
            setEditUploadProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 201) {
            const response = JSON.parse(xhr.responseText);
            if (response.secure_url) {
              setEditDishImage(response.secure_url);
            } else {
              setEditUploadError('Failed to parse secure URL from Cloudinary.');
            }
          } else {
            console.error("Cloudinary error response:", xhr.responseText);
            setEditUploadError(`Cloudinary Upload failed with status ${xhr.status}.`);
          }
          setEditUploading(false);
        };

        xhr.onerror = () => {
          setEditUploadError('Network error during Cloudinary upload.');
          setEditUploading(false);
        };

        xhr.send(formData);
      } catch (err: any) {
        console.error("Cloudinary upload setup error:", err);
        setEditUploadError(err.message || 'Cloudinary configuration error.');
        setEditUploading(false);
      }
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editDishName || !editDishPrice) return;

    const resolvedImage = resolveFoodImage(editDishImage, editDishName);

    updateMenuItem(editingItem.id, {
      name: editDishName,
      price: parseFloat(editDishPrice),
      image: resolvedImage,
      category: editDishCategory,
      type: editDishType,
      prepTime: parseInt(editDishPrepTime) || 12,
      slot: editDishSlot
    });

    setEditingItem(null);
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
        
        <div className="flex items-center gap-3 self-start sm:self-center">
          <input
            type="file"
            id="csv-file-upload"
            accept=".csv"
            className="hidden"
            onChange={handleCSVImport}
          />
          <label
            htmlFor="csv-file-upload"
            className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer transition-colors"
          >
            <Upload className="w-4.5 h-4.5 text-indigo-500" />
            Import CSV
          </label>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer transition-colors"
          >
            <Plus className="w-4.5 h-4.5" />
            Add Menu Item
          </button>
        </div>
      </div>

      {/* CSV Alert banner */}
      {csvAlert && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-bold ${
          csvAlert.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
            : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {csvAlert.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <div className="flex-1">{csvAlert.message}</div>
          <button 
            type="button"
            onClick={() => setCsvAlert(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer text-[10px] uppercase font-black tracking-wider"
          >
            Dismiss
          </button>
        </div>
      )}

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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Base Price (₹)</label>
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

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Time-of-Day Slot</label>
                  <select
                    value={dishSlot}
                    onChange={(e) => setDishSlot(e.target.value as any)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3.5 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                  >
                    <option value="all">All Slots (Standard)</option>
                    <option value="morning">Morning Only</option>
                    <option value="evening">Evening Only</option>
                    <option value="night">Night Only</option>
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
                        placeholder="e.g. pizza, burger, biryani or URL..."
                        value={dishImage}
                        onChange={(e) => setDishImage(e.target.value)}
                        className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                      />
                      
                      {/* Preset keyword tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {FOOD_PRESETS.map((preset) => (
                          <button
                            key={preset.value}
                            type="button"
                            onClick={() => setDishImage(preset.value)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                              dishImage === preset.value
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                      
                      {dishImage && (
                        <div className="mt-2 flex items-center justify-center">
                          <div className="relative rounded-xl overflow-hidden max-w-[192px] h-28 border border-slate-100 shadow-sm animate-fade-in">
                            <img 
                              src={resolveFoodImage(dishImage, dishName)} 
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
                <img src={resolveFoodImage(item.image, item.name)} alt={item.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" />
                <span className={`absolute top-4 left-4 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-white border border-white/20 shadow-md ${
                  item.type === 'veg' ? 'bg-emerald-500' : 'bg-red-500'
                }`}>
                  {item.type}
                </span>
                <span className="absolute top-4 right-4 bg-slate-950/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                  ID: {item.id}
                </span>
                <span className="absolute bottom-4 left-4 bg-slate-950/70 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-white/10">
                  Slot: {item.slot || 'all'}
                </span>
              </div>

              {/* Product Info */}
              <div className="p-5 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-extrabold text-[15px] text-[#0f172a] font-poppins leading-tight">{item.name}</h4>
                  <span className="text-base font-black text-slate-900">₹{item.price.toFixed(2)}</span>
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
                type="button"
                onClick={() => handleStartEdit(item)}
                className="p-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl cursor-pointer transition-colors"
                title="Edit item"
              >
                <Pencil className="w-4 h-4" />
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

      {/* Edit Item Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelEdit}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative bg-white border border-[#f1f5f9] rounded-[28px] shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col z-10"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
                <div>
                  <h3 className="font-extrabold text-[16px] text-[#0f172a] font-poppins">Modify Dish Specifications</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Editing Item ID: {editingItem.id}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-slate-400 hover:text-slate-600 text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Modal Content / Form */}
              <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Dish Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Garlic Butter Lobster"
                      value={editDishName}
                      onChange={(e) => setEditDishName(e.target.value)}
                      className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Base Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="29.99"
                      value={editDishPrice}
                      onChange={(e) => setEditDishPrice(e.target.value)}
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
                      value={editDishPrepTime}
                      onChange={(e) => setEditDishPrepTime(e.target.value)}
                      className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Menu Category</label>
                    <select
                      value={editDishCategory}
                      onChange={(e) => setEditDishCategory(e.target.value)}
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Time-of-Day Slot</label>
                    <select
                      value={editDishSlot}
                      onChange={(e) => setEditDishSlot(e.target.value as any)}
                      className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3.5 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                    >
                      <option value="all">All Slots (Standard)</option>
                      <option value="morning">Morning Only</option>
                      <option value="evening">Evening Only</option>
                      <option value="night">Night Only</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Dietary Tag</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                      <button
                        type="button"
                        onClick={() => setEditDishType('veg')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          editDishType === 'veg' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        Veg
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditDishType('non-veg')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          editDishType === 'non-veg' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'
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
                          setEditImageMode('upload');
                          setEditUploadError(null);
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          editImageMode === 'upload' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditImageMode('url');
                          setEditUploadError(null);
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          editImageMode === 'url' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        Image URL
                      </button>
                    </div>

                    {/* Dual Mode Form Fields */}
                    {editImageMode === 'upload' ? (
                      <div className="space-y-2.5">
                        {/* Destination Selector */}
                        <div className="flex items-center gap-2.5 bg-slate-50/50 border border-slate-100/50 p-2.5 rounded-xl">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Upload Destination:</span>
                          <div className="flex bg-slate-200/60 p-0.5 rounded-lg border border-slate-200/30">
                            <button
                              type="button"
                              onClick={() => setEditUploadTarget('cloudinary')}
                              className={`px-3 py-1 rounded-md text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                editUploadTarget === 'cloudinary' 
                                  ? 'bg-white text-[#7c3aed] shadow-sm' 
                                  : 'text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              Cloudinary
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditUploadTarget('firebase')}
                              className={`px-3 py-1 rounded-md text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                editUploadTarget === 'firebase' 
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
                            editUploading ? 'border-indigo-300 bg-indigo-50/10' : 'border-[#e2e8f0] hover:border-slate-300'
                          }`}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={async (e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files?.[0];
                            if (file) await uploadEditFile(file);
                          }}
                        >
                          <input
                            type="file"
                            id="edit-menu-image-upload"
                            accept="image/*"
                            className="hidden"
                            onChange={handleEditFileChange}
                            disabled={editUploading}
                          />
                          
                          {editUploading ? (
                            <div className="space-y-2 flex flex-col items-center">
                              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                              <p className="text-xs font-bold text-slate-600">Uploading: {editUploadProgress}%</p>
                              <div className="w-48 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 transition-all duration-300"
                                  style={{ width: `${editUploadProgress}%` }}
                                />
                              </div>
                            </div>
                          ) : editDishImage ? (
                            <div className="space-y-3 flex flex-col items-center w-full">
                              <div className="relative group rounded-xl overflow-hidden max-w-[192px] h-28 border border-slate-100 shadow-sm">
                                <img src={editDishImage} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <label 
                                    htmlFor="edit-menu-image-upload" 
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
                              htmlFor="edit-menu-image-upload" 
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
                        
                        {editUploadError && (
                          <p className="text-[10px] font-bold text-red-500 flex items-center gap-1.5 mt-1 ml-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {editUploadError}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="url"
                          placeholder="e.g. pizza, burger, biryani or URL..."
                          value={editDishImage}
                          onChange={(e) => setEditDishImage(e.target.value)}
                          className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400"
                        />
                        
                        {/* Preset keyword tags */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {FOOD_PRESETS.map((preset) => (
                            <button
                              key={preset.value}
                              type="button"
                              onClick={() => setEditDishImage(preset.value)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                                editDishImage === preset.value
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                        
                        {editDishImage && (
                          <div className="mt-2 flex items-center justify-center">
                            <div className="relative rounded-xl overflow-hidden max-w-[192px] h-28 border border-slate-100 shadow-sm animate-fade-in">
                              <img 
                                src={resolveFoodImage(editDishImage, editDishName)} 
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

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-50 shrink-0">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-slate-100 text-slate-500 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-500/10 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
