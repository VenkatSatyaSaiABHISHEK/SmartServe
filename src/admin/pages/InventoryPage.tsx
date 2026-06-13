import { useEffect, useState } from 'react';
import { useInventoryStore, type Ingredient, type Supplier, type RecipeIngredient, type PurchaseRecord, type InventoryLog, type ReorderRequest } from '../store/useInventoryStore';
import { useAdminStore } from '../store/useAdminStore';
import { 
  Search, Plus, Trash2, Edit3, CheckCircle, AlertTriangle, FileText, ShoppingBag, 
  ArrowUpDown, ChevronRight, X, User, DollarSign, Calendar, BarChart, Sliders, 
  PlusCircle, Check, Filter, RefreshCw, Layers, ClipboardList, BookOpen, AlertCircle, TrendingUp, Sparkles, Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function InventoryPage() {
  const { 
    ingredients, suppliers, recipes, purchases, logs, reorders, loaded, listenToAll,
    seedDemoData, addIngredient, updateIngredient, deleteIngredient, 
    addSupplier, updateSupplier, deleteSupplier, saveRecipe, deleteRecipe, 
    recordPurchase, adjustStock, createReorderRequest, approveReorder, updateReorderStatus
  } = useInventoryStore();

  const { menuItems, listenToMenuItems, currency } = useAdminStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'ingredients' | 'recipes' | 'suppliers' | 'purchases' | 'adjustments' | 'reorders' | 'reports'>('dashboard');

  // Search & Filter state
  const [ingSearch, setIngSearch] = useState('');
  const [ingFilter, setIngFilter] = useState<'all' | 'low' | 'normal'>('all');
  const [supSearch, setSupSearch] = useState('');
  const [purSearch, setPurSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');

  // Modals & Forms visible states
  const [showIngModal, setShowIngModal] = useState(false);
  const [editingIng, setEditingIng] = useState<Ingredient | null>(null);
  const [showSupModal, setShowSupModal] = useState(false);
  const [editingSup, setEditingSup] = useState<Supplier | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedMenuItemForRecipe, setSelectedMenuItemForRecipe] = useState<string>('');
  const [selectedRecipeIngredients, setSelectedRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);

  // Ingredient Form State
  const [ingForm, setIngForm] = useState({
    name: '',
    quantity: 0,
    unit: 'Kg',
    minStock: 10,
    supplierId: ''
  });

  // Supplier Form State
  const [supForm, setSupForm] = useState({
    name: '',
    phone: '',
    address: '',
    area: ''
  });

  // Purchase Form State
  const [purForm, setPurForm] = useState({
    ingredientId: '',
    supplierId: '',
    quantity: 0,
    cost: 0,
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  // Stock Adjustment Form State
  const [adjForm, setAdjForm] = useState({
    ingredientId: '',
    quantity: 0,
    type: 'out' as 'in' | 'out',
    reason: 'manual_adjustment' as InventoryLog['reason']
  });

  // Reorder Form State
  const [reorderForm, setReorderForm] = useState({
    ingredientId: '',
    quantity: 10,
    supplierId: ''
  });

  const [seeding, setSeeding] = useState(false);

  // Load database connections
  useEffect(() => {
    const unsubInv = listenToAll();
    const unsubMenu = listenToMenuItems();
    return () => {
      unsubInv();
      unsubMenu();
    };
  }, [listenToAll, listenToMenuItems]);

  const handleSeedData = async () => {
    setSeeding(true);
    await seedDemoData();
    setSeeding(false);
  };

  // -------------------------
  // INGREDIENTS SUBMISSIONS
  // -------------------------
  const handleIngSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingForm.name || !ingForm.supplierId) return;

    if (editingIng) {
      await updateIngredient(editingIng.id, {
        name: ingForm.name,
        quantity: Number(ingForm.quantity),
        unit: ingForm.unit,
        minStock: Number(ingForm.minStock),
        supplierId: ingForm.supplierId
      });
    } else {
      await addIngredient({
        name: ingForm.name,
        quantity: Number(ingForm.quantity),
        unit: ingForm.unit,
        minStock: Number(ingForm.minStock),
        supplierId: ingForm.supplierId
      });
    }
    
    setShowIngModal(false);
    setEditingIng(null);
    setIngForm({ name: '', quantity: 0, unit: 'Kg', minStock: 10, supplierId: '' });
  };

  const startEditIng = (ing: Ingredient) => {
    setEditingIng(ing);
    setIngForm({
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
      minStock: ing.minStock,
      supplierId: ing.supplierId
    });
    setShowIngModal(true);
  };

  const handleDeleteIng = async (id: string) => {
    if (confirm("Are you sure you want to delete this ingredient?")) {
      await deleteIngredient(id);
    }
  };

  // -------------------------
  // SUPPLIER SUBMISSIONS
  // -------------------------
  const handleSupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supForm.name || !supForm.phone) return;

    if (editingSup) {
      await updateSupplier(editingSup.id, supForm);
    } else {
      await addSupplier(supForm);
    }

    setShowSupModal(false);
    setEditingSup(null);
    setSupForm({ name: '', phone: '', address: '', area: '' });
  };

  const startEditSup = (sup: Supplier) => {
    setEditingSup(sup);
    setSupForm({
      name: sup.name,
      phone: sup.phone,
      address: sup.address,
      area: sup.area
    });
    setShowSupModal(true);
  };

  const handleDeleteSup = async (id: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      await deleteSupplier(id);
    }
  };

  // -------------------------
  // RECIPE MAPPING SUBMISSIONS
  // -------------------------
  const handleOpenRecipeModal = (menuItemId: string) => {
    setSelectedMenuItemForRecipe(menuItemId);
    const existing = recipes.find(r => r.menuItemId === menuItemId);
    if (existing) {
      setSelectedRecipeIngredients([...existing.ingredients]);
    } else {
      setSelectedRecipeIngredients([]);
    }
    setShowRecipeModal(true);
  };

  const handleAddIngredientRow = () => {
    if (ingredients.length === 0) return;
    setSelectedRecipeIngredients([
      ...selectedRecipeIngredients,
      { ingredientId: ingredients[0].id, quantity: 1 }
    ]);
  };

  const handleUpdateRecipeRowIng = (idx: number, ingId: string) => {
    const copy = [...selectedRecipeIngredients];
    copy[idx].ingredientId = ingId;
    setSelectedRecipeIngredients(copy);
  };

  const handleUpdateRecipeRowQty = (idx: number, qty: number) => {
    const copy = [...selectedRecipeIngredients];
    copy[idx].quantity = Number(qty);
    setSelectedRecipeIngredients(copy);
  };

  const handleRemoveRecipeRow = (idx: number) => {
    const copy = [...selectedRecipeIngredients];
    copy.splice(idx, 1);
    setSelectedRecipeIngredients(copy);
  };

  const handleSaveRecipe = async () => {
    if (!selectedMenuItemForRecipe) return;
    const validRows = selectedRecipeIngredients.filter(r => r.ingredientId && r.quantity > 0);
    await saveRecipe(selectedMenuItemForRecipe, validRows);
    setShowRecipeModal(false);
  };

  // -------------------------
  // PURCHASES
  // -------------------------
  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purForm.ingredientId || purForm.quantity <= 0 || purForm.cost <= 0) return;

    const ing = ingredients.find(i => i.id === purForm.ingredientId);
    if (!ing) return;

    await recordPurchase({
      ingredientId: purForm.ingredientId,
      supplierId: ing.supplierId,
      quantity: Number(purForm.quantity),
      cost: Number(purForm.cost),
      purchaseDate: purForm.purchaseDate
    });

    setShowPurchaseModal(false);
    setPurForm({
      ingredientId: '',
      supplierId: '',
      quantity: 0,
      cost: 0,
      purchaseDate: new Date().toISOString().split('T')[0]
    });
  };

  // -------------------------
  // ADJUSTMENTS
  // -------------------------
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjForm.ingredientId || adjForm.quantity <= 0) return;

    await adjustStock(
      adjForm.ingredientId,
      Number(adjForm.quantity),
      adjForm.type,
      adjForm.reason
    );

    setShowAdjustModal(false);
    setAdjForm({
      ingredientId: '',
      quantity: 0,
      type: 'out',
      reason: 'manual_adjustment'
    });
  };

  // -------------------------
  // REORDERS
  // -------------------------
  const handleReorderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reorderForm.ingredientId || reorderForm.quantity <= 0) return;

    const ing = ingredients.find(i => i.id === reorderForm.ingredientId);
    if (!ing) return;

    await createReorderRequest(
      reorderForm.ingredientId,
      Number(reorderForm.quantity),
      ing.supplierId
    );

    setShowReorderModal(false);
    setReorderForm({ ingredientId: '', quantity: 10, supplierId: '' });
  };

  const handleApproveReorderRequest = async (req: ReorderRequest) => {
    const priceGuess = prompt(`Enter total cost (₹) for ${req.quantity} units of this reorder:`, "500");
    if (priceGuess === null) return;
    const costVal = parseFloat(priceGuess) || 0;
    await approveReorder(req.id, req.quantity, costVal);
  };

  const handleRejectReorderRequest = async (reqId: string) => {
    if (confirm("Are you sure you want to reject this request?")) {
      await updateReorderStatus(reqId, 'Rejected');
    }
  };

  const autoGenerateLowStockReorders = async () => {
    const lowStock = ingredients.filter(i => i.quantity < i.minStock);
    if (lowStock.length === 0) return;

    let count = 0;
    for (const ing of lowStock) {
      const hasPending = reorders.some(r => r.ingredientId === ing.id && r.status === 'Pending');
      if (!hasPending) {
        const reorderQty = Math.ceil(ing.minStock * 2 - ing.quantity);
        await createReorderRequest(ing.id, reorderQty, ing.supplierId);
        count++;
      }
    }
    alert(`Successfully generated ${count} pending reorder requests for low stock ingredients!`);
  };

  // -------------------------
  // ANALYTICS & COMPUTATIONS
  // -------------------------
  const lowStockIngredients = ingredients.filter(i => i.quantity < i.minStock);
  const totalSpend = purchases.reduce((sum, p) => sum + p.cost, 0);

  const currentMonthYear = new Date().toISOString().slice(0, 7);
  const monthlySpend = purchases
    .filter(p => p.purchaseDate.startsWith(currentMonthYear))
    .reduce((sum, p) => sum + p.cost, 0);

  const consumptionTotals: Record<string, number> = {};
  logs
    .filter(l => l.type === 'out' && (l.reason === 'order_deduction' || l.reason === 'daily_usage'))
    .forEach(log => {
      if (!consumptionTotals[log.ingredientId]) {
        consumptionTotals[log.ingredientId] = 0;
      }
      consumptionTotals[log.ingredientId] += log.quantity;
    });

  const topConsumed = Object.entries(consumptionTotals)
    .map(([id, qty]) => {
      const ing = ingredients.find(i => i.id === id);
      return {
        id,
        name: ing ? ing.name : 'Unknown',
        unit: ing ? ing.unit : '',
        quantity: qty
      };
    })
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const supplierSpendMap: Record<string, number> = {};
  purchases.forEach(p => {
    if (!supplierSpendMap[p.supplierId]) {
      supplierSpendMap[p.supplierId] = 0;
    }
    supplierSpendMap[p.supplierId] += p.cost;
  });

  const supplierSpendList = Object.entries(supplierSpendMap)
    .map(([id, cost]) => {
      const sup = suppliers.find(s => s.id === id);
      return {
        id,
        name: sup ? sup.name : 'Unknown Supplier',
        cost
      };
    })
    .sort((a, b) => b.cost - a.cost);

  const filteredIngredients = ingredients.filter(ing => {
    const matchesSearch = ing.name.toLowerCase().includes(ingSearch.toLowerCase());
    const matchesFilter = ingFilter === 'all' 
      ? true 
      : ingFilter === 'low' 
        ? ing.quantity < ing.minStock 
        : ing.quantity >= ing.minStock;
    return matchesSearch && matchesFilter;
  });

  const getStockStatusColor = (ing: Ingredient) => {
    if (ing.quantity === 0) return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (ing.quantity < ing.minStock) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  };

  const getStockBarProgress = (ing: Ingredient) => {
    const target = ing.minStock * 2.5;
    const pct = (ing.quantity / target) * 100;
    return Math.min(100, pct);
  };

  return (
    <div className="space-y-8 pb-16 px-1 selection:bg-indigo-500 selection:text-white">
      {/* Cool background glowing accents */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-80 left-0 -z-10 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Premium Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center border border-indigo-600/15 shadow-sm shadow-indigo-600/5">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 font-poppins bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 bg-clip-text text-transparent">
              Inventory & Supply Chain
            </h1>
          </div>
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest pl-12">
            Real-time stock controls, recipe formulations, and supplier ledgers.
          </p>
        </div>
        
        {/* Quick Actions Header Section */}
        <div className="flex items-center gap-3 pl-12 md:pl-0">
          {ingredients.length > 0 && (
            <>
              {activeTab === 'ingredients' && (
                <motion.button
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setEditingIng(null);
                    setIngForm({ name: '', quantity: 0, unit: 'Kg', minStock: 10, supplierId: suppliers[0]?.id || '' });
                    setShowIngModal(true);
                  }}
                  className="bg-indigo-600 text-white hover:bg-indigo-500 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-600/10 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Ingredient
                </motion.button>
              )}
              {activeTab === 'suppliers' && (
                <motion.button
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setEditingSup(null);
                    setSupForm({ name: '', phone: '', address: '', area: '' });
                    setShowSupModal(true);
                  }}
                  className="bg-indigo-600 text-white hover:bg-indigo-500 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-600/10 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Supplier
                </motion.button>
              )}
              {activeTab === 'purchases' && (
                <motion.button
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setPurForm({ ingredientId: ingredients[0]?.id || '', supplierId: '', quantity: 5, cost: 200, purchaseDate: new Date().toISOString().split('T')[0] });
                    setShowPurchaseModal(true);
                  }}
                  className="bg-indigo-600 text-white hover:bg-indigo-500 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-600/10 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" /> Log Purchase
                </motion.button>
              )}
              {activeTab === 'adjustments' && (
                <motion.button
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setAdjForm({ ingredientId: ingredients[0]?.id || '', quantity: 1, type: 'out', reason: 'manual_adjustment' });
                    setShowAdjustModal(true);
                  }}
                  className="bg-indigo-600 text-white hover:bg-indigo-500 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-600/10 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <PlusCircle className="w-4 h-4" /> Stock Out/In
                </motion.button>
              )}
              {activeTab === 'reorders' && (
                <motion.button
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setReorderForm({ ingredientId: ingredients[0]?.id || '', quantity: 10, supplierId: '' });
                    setShowReorderModal(true);
                  }}
                  className="bg-indigo-600 text-white hover:bg-indigo-500 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-600/10 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" /> Request Reorder
                </motion.button>
              )}
            </>
          )}

          {loaded.ingredients && ingredients.length === 0 && (
            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSeedData}
              disabled={seeding}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {seeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {seeding ? 'Seeding...' : 'Load Inventory Demo'}
            </motion.button>
          )}
        </div>
      </div>

      {/* Warning banner for low-stock items */}
      {lowStockIngredients.length > 0 && ingredients.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/[0.04] border border-red-500/15 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm"
        >
          <div className="flex items-start gap-3.5 text-xs font-bold text-slate-700">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 border border-red-500/10">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="font-black text-[14px] text-red-950 block mb-0.5 font-poppins">Critical Stock Deficit</span>
              There are <span className="underline font-black text-red-650">{lowStockIngredients.length} ingredients</span> currently below their minimum threshold levels. This may trigger kitchen production pauses.
            </div>
          </div>
          <div className="flex items-center gap-2 md:self-center">
            <button
              onClick={autoGenerateLowStockReorders}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-md shadow-red-650/10 transition-colors text-center"
            >
              Auto-generate Reorders
            </button>
            <button
              onClick={() => setActiveTab('reorders')}
              className="bg-white hover:bg-slate-50 text-red-600 border border-red-500/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-sm transition-colors text-center"
            >
              Fulfillment Desk
            </button>
          </div>
        </motion.div>
      )}

      {/* Premium Dock-like Navigation Menu */}
      <div className="flex bg-white/80 backdrop-blur-md border border-[#f1f5f9] rounded-2xl p-1.5 overflow-x-auto scrollbar-none shadow-xl shadow-slate-100/50 gap-1 mt-1 justify-start">
        {[
          { id: 'dashboard', label: 'Overview', icon: ClipboardList },
          { id: 'ingredients', label: 'Ingredients', icon: Layers },
          { id: 'recipes', label: 'Recipe Formulas', icon: BookOpen },
          { id: 'suppliers', label: 'Suppliers', icon: User },
          { id: 'purchases', label: 'Ledger', icon: ShoppingBag },
          { id: 'adjustments', label: 'Logs', icon: RefreshCw },
          { id: 'reorders', label: 'Reorder Center', icon: AlertCircle },
          { id: 'reports', label: 'Analytics Reports', icon: BarChart },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4.5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 relative ${
                isSelected 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'reorders' && reorders.filter(r => r.status === 'Pending').length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                  {reorders.filter(r => r.status === 'Pending').length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ------------------------- */}
      {/* EMPTY DATABASE STATE      */}
      {/* ------------------------- */}
      {loaded.ingredients && ingredients.length === 0 && (
        <div className="bg-white/80 backdrop-blur-md border border-[#f1f5f9] rounded-[32px] p-12 text-center shadow-xl shadow-slate-100/50 space-y-6">
          <div className="w-16 h-16 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/10 shadow-sm">
            <Box className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-poppins font-black text-slate-800 text-lg">Initialize Inventory Database</h3>
            <p className="text-xs text-slate-400 font-bold leading-relaxed uppercase tracking-wider">
              No inventory entries found. Run the seed configuration to initialize sample raw ingredients, wholesale suppliers, and recipes mapping.
            </p>
          </div>
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md cursor-pointer transition-all disabled:opacity-50"
          >
            {seeding ? 'Structuring DB...' : 'Populate Demo Collections'}
          </button>
        </div>
      )}

      {/* ------------------------- */}
      {/* TABS CONTENT AREA         */}
      {/* ------------------------- */}
      {ingredients.length > 0 && (
        <div className="space-y-6">
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stat Metric Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { title: 'Total Ingredients', value: ingredients.length, change: 'Raw items in database', icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-500/10 border-indigo-500/10 shadow-indigo-500/5' },
                  { title: 'Low Stock Alert', value: lowStockIngredients.length, change: `${ingredients.filter(i => i.quantity >= i.minStock).length} ingredients normal`, icon: AlertCircle, color: lowStockIngredients.length > 0 ? 'text-red-500' : 'text-slate-500', bg: lowStockIngredients.length > 0 ? 'bg-red-500/10 border-red-500/10 shadow-red-500/5' : 'bg-slate-500/10 border-slate-500/10' },
                  { title: 'Monthly Spent', value: `${currency}${monthlySpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, change: `${purchases.length} recorded purchases`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/10 shadow-emerald-500/5' },
                  { title: 'Pending Reorders', value: reorders.filter(r => r.status === 'Pending').length, change: 'Awaiting supplier confirmation', icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/10 shadow-blue-500/5' }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div 
                      key={idx} 
                      whileHover={{ y: -3 }}
                      className="bg-white border border-[#f1f5f9] rounded-[24px] p-6 shadow-xl shadow-slate-100/30 flex flex-col justify-between min-h-[150px] relative overflow-hidden group"
                    >
                      {/* background decorative light circles */}
                      <div className="absolute -right-4 -top-4 w-16 h-16 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10" />

                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.title}</span>
                        <div className={`${item.bg} ${item.color} p-2.5 rounded-xl border flex items-center justify-center shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <span className="text-2xl font-black text-slate-900 font-poppins">{item.value}</span>
                        <span className="block text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">{item.change}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Main Content Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Top consumed ingredients & Recent purchases */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Top Consumed */}
                  <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-xl shadow-slate-100/30 space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                      <div>
                        <h3 className="font-extrabold text-[15px] text-slate-900 font-poppins tracking-tight">Top Consumed Ingredients</h3>
                        <p className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Real-time daily usage indicators</p>
                      </div>
                      <span className="text-[9.5px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100/40 px-2.5 py-1 rounded-lg uppercase tracking-wider">Kitchen Statistics</span>
                    </div>

                    <div className="space-y-4">
                      {topConsumed.length === 0 ? (
                        <p className="text-center py-6 text-slate-400 text-xs font-bold italic">No ingredient logs tracked yet.</p>
                      ) : (
                        topConsumed.map((item, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                              <span className="text-slate-800 font-extrabold">{item.name}</span>
                              <span className="text-slate-500">{item.quantity.toFixed(2)} {item.unit} consumed</span>
                            </div>
                            <div className="w-full bg-slate-50 h-2.5 rounded-full overflow-hidden border border-[#f1f5f9]/70 relative">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (item.quantity / (topConsumed[0]?.quantity || 1)) * 100)}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Recent Purchases */}
                  <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-xl shadow-slate-100/30 space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                      <div>
                        <h3 className="font-extrabold text-[15px] text-slate-900 font-poppins tracking-tight">Recent Stock Additions</h3>
                        <p className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Wholesale supply receipts history</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('purchases')} 
                        className="text-[10px] font-black text-indigo-600 hover:text-indigo-500 uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                      >
                        Ledger <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-[#fafafc]/50">
                      <table className="w-full text-left border-collapse text-xs font-bold text-slate-500">
                        <thead>
                          <tr className="border-b border-slate-100 uppercase text-[9px] tracking-widest text-slate-400 bg-slate-50/50">
                            <th className="p-3.5">Ingredient</th>
                            <th className="p-3.5">Supplier Partner</th>
                            <th className="p-3.5">Recv Date</th>
                            <th className="p-3.5">Qty</th>
                            <th className="p-3.5 text-right">Total Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {purchases.slice(0, 4).map((pur) => {
                            const ing = ingredients.find(i => i.id === pur.ingredientId);
                            const sup = suppliers.find(s => s.id === pur.supplierId);
                            return (
                              <tr key={pur.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                <td className="p-3.5 font-extrabold text-slate-800">{ing ? ing.name : 'Unknown'}</td>
                                <td className="p-3.5 text-slate-500">{sup ? sup.name : 'Unknown'}</td>
                                <td className="p-3.5 font-mono text-slate-400">{pur.purchaseDate}</td>
                                <td className="p-3.5 font-mono text-slate-800">{pur.quantity} {ing?.unit}</td>
                                <td className="p-3.5 text-right font-extrabold text-slate-900 font-poppins">{currency}{pur.cost}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right Column: Replenishment Alert Feed & Quick approvals */}
                <div className="space-y-6">
                  {/* Replenishment feed warning card */}
                  <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-xl shadow-slate-100/30 flex flex-col justify-between min-h-[320px]">
                    <div className="space-y-5">
                      <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                        <h3 className="font-extrabold text-[15px] text-slate-900 font-poppins tracking-tight">Replenishment Feed</h3>
                        <span className={`font-black px-2.5 py-0.5 rounded-lg text-[9.5px] uppercase tracking-wider ${
                          lowStockIngredients.length > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {lowStockIngredients.length} Alerts
                        </span>
                      </div>

                      <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                        {lowStockIngredients.length === 0 ? (
                          <div className="py-12 text-center text-slate-400 text-xs font-bold leading-relaxed uppercase tracking-wider">
                            All ingredients stocks are sufficient. Excellent kitchen supply!
                          </div>
                        ) : (
                          lowStockIngredients.map((ing) => (
                            <div key={ing.id} className="flex justify-between items-center text-xs font-bold text-slate-600 bg-[#fafafc] p-3 rounded-2xl border border-slate-100/80">
                              <div className="space-y-0.5">
                                <span className="block text-slate-800 font-extrabold">{ing.name}</span>
                                <span className="block text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Min Stock: {ing.minStock} {ing.unit}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-red-500 font-extrabold font-poppins block">{ing.quantity.toFixed(1)} {ing.unit}</span>
                                <span className="text-[8.5px] uppercase font-black text-red-400 tracking-wider">Deficit</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pending Approvals Widget */}
                  <div className="bg-indigo-900/5 backdrop-blur-sm border border-indigo-900/5 rounded-[28px] p-6 shadow-sm space-y-4">
                    <h4 className="font-extrabold text-[10px] uppercase tracking-widest text-slate-400">Fulfillment Queue</h4>
                    
                    <div className="space-y-2.5">
                      {reorders.filter(r => r.status === 'Pending').slice(0, 3).length === 0 ? (
                        <p className="text-[11px] font-bold text-slate-400 italic">No pending purchase approvals.</p>
                      ) : (
                        reorders.filter(r => r.status === 'Pending').slice(0, 3).map((req) => {
                          const ing = ingredients.find(i => i.id === req.ingredientId);
                          return (
                            <div key={req.id} className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center justify-between shadow-sm">
                              <div>
                                <span className="block font-black text-xs text-slate-800">{ing?.name}</span>
                                <span className="block text-[9.5px] font-bold text-slate-400 mt-0.5">Purchase Size: {req.quantity} {ing?.unit}</span>
                              </div>
                              <button
                                onClick={() => handleApproveReorderRequest(req)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white text-[9.5px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-sm"
                              >
                                Approve
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: INGREDIENTS LIST */}
          {activeTab === 'ingredients' && (
            <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-xl shadow-slate-100/30 space-y-6">
              {/* Filters header bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-50 pb-5">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search ingredients..."
                    value={ingSearch}
                    onChange={(e) => setIngSearch(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-350 focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filter Stock:</span>
                  <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/40">
                    {['all', 'low', 'normal'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setIngFilter(filter as any)}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          ingFilter === filter ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ingredients Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left border-collapse text-xs font-bold text-slate-500">
                  <thead>
                    <tr className="border-b border-slate-100 uppercase text-[9.5px] tracking-widest text-slate-400 bg-slate-50/50">
                      <th className="p-4">Code</th>
                      <th className="p-4">Ingredient</th>
                      <th className="p-4">Current Stock</th>
                      <th className="p-4">Stock Scale</th>
                      <th className="p-4">Min Stock Limit</th>
                      <th className="p-4">Wholesale Partner</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIngredients.map((ing) => {
                      const sup = suppliers.find(s => s.id === ing.supplierId);
                      const isLow = ing.quantity < ing.minStock;
                      return (
                        <tr key={ing.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-mono font-extrabold text-slate-400">{ing.id}</td>
                          <td className="p-4">
                            <span className="font-black text-slate-850 text-[13px] block">{ing.name}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-[9.5px] font-black border uppercase tracking-wider font-poppins ${getStockStatusColor(ing)}`}>
                              {ing.quantity.toFixed(1)} {ing.unit}
                            </span>
                          </td>
                          <td className="p-4 min-w-[150px]">
                            <div className="flex items-center gap-2.5">
                              <div className="w-24 bg-slate-100 border border-slate-200/50 rounded-full h-2 overflow-hidden relative">
                                <div 
                                  className={`h-full rounded-full ${isLow ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`}
                                  style={{ width: `${getStockBarProgress(ing)}%` }}
                                />
                              </div>
                              <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                                {isLow ? 'Deficit' : 'Optimal'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-800 font-extrabold font-mono">{ing.minStock} {ing.unit}</td>
                          <td className="p-4 text-slate-600 font-bold">{sup ? sup.name : 'Unassigned'}</td>
                          <td className="p-4 text-right space-x-1 shrink-0">
                            <button
                              onClick={() => startEditIng(ing)}
                              className="p-2 hover:bg-slate-100 rounded-xl text-indigo-600 cursor-pointer inline-block"
                              title="Edit specifications"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteIng(ing.id)}
                              className="p-2 hover:bg-red-50 rounded-xl text-red-500 cursor-pointer inline-block"
                              title="Delete ingredient"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: RECIPE FORMULATION */}
          {activeTab === 'recipes' && (
            <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-xl shadow-slate-100/30 space-y-6">
              <div>
                <h3 className="font-extrabold text-[15px] text-slate-900 font-poppins tracking-tight">Dish Recipe Formulation</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                  Link restaurant menu items with required raw ingredients portion weights
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {menuItems.map((item) => {
                  const mapping = recipes.find(r => r.menuItemId === item.id);
                  return (
                    <motion.div 
                      key={item.id} 
                      whileHover={{ y: -2 }}
                      className="border border-slate-100 rounded-3xl p-5 bg-[#fafafc]/50 flex flex-col justify-between space-y-4 hover:border-slate-200 hover:bg-white transition-all shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-11 h-11 rounded-2xl object-cover shadow-sm border border-slate-100" />
                          <div>
                            <span className="font-black text-xs text-slate-800 block">{item.name}</span>
                            <span className="text-[9px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-black uppercase mt-1 block w-max">{item.category}</span>
                          </div>
                        </div>
                        <span className="text-[8.5px] font-mono font-bold text-slate-400 uppercase tracking-wider">#{item.id}</span>
                      </div>

                      <div className="border-t border-slate-100/60 pt-3.5 space-y-2.5 flex-1">
                        <span className="text-[8.5px] font-black uppercase text-slate-450 tracking-wider">Formula Components:</span>
                        {mapping && mapping.ingredients.length > 0 ? (
                          <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                            {mapping.ingredients.map((rIng) => {
                              const detail = ingredients.find(i => i.id === rIng.ingredientId);
                              return (
                                <div key={rIng.ingredientId} className="flex justify-between items-center text-[10.5px] font-bold text-slate-600 bg-white border border-slate-100 p-2 rounded-xl">
                                  <span>{detail ? detail.name : 'Unknown'}</span>
                                  <span className="text-slate-900 font-extrabold">{rIng.quantity} {detail?.unit}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="py-4 text-center text-[10px] font-bold text-slate-400 border border-dashed border-slate-200/50 rounded-2xl bg-white/50">
                            No raw materials mapped.
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenRecipeModal(item.id)}
                        className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-sm cursor-pointer transition-colors text-center"
                      >
                        {mapping ? 'Configure Formula' : 'Formulate Recipe'}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: SUPPLIERS */}
          {activeTab === 'suppliers' && (
            <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-xl shadow-slate-100/30 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search wholesale partners..."
                    value={supSearch}
                    onChange={(e) => setSupSearch(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-350 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left border-collapse text-xs font-bold text-slate-500">
                  <thead>
                    <tr className="border-b border-slate-100 uppercase text-[9.5px] tracking-widest text-slate-400 bg-slate-50/50">
                      <th className="p-4">Supplier Code</th>
                      <th className="p-4">Partner Name</th>
                      <th className="p-4">Contact Phone</th>
                      <th className="p-4">Headquarters Address</th>
                      <th className="p-4">Service Area</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.filter(s => s.name.toLowerCase().includes(supSearch.toLowerCase())).map((sup) => (
                      <tr key={sup.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-mono font-extrabold text-slate-400">{sup.id}</td>
                        <td className="p-4 font-black text-slate-800 text-[13px]">{sup.name}</td>
                        <td className="p-4 font-mono">{sup.phone}</td>
                        <td className="p-4 text-slate-600">{sup.address}</td>
                        <td className="p-4">
                          <span className="bg-indigo-50 text-indigo-600 border border-indigo-100/30 px-2.5 py-0.5 rounded-md font-black text-[9.5px] uppercase tracking-wider">{sup.area}</span>
                        </td>
                        <td className="p-4 text-right space-x-1 shrink-0">
                          <button
                            onClick={() => startEditSup(sup)}
                            className="p-2 hover:bg-slate-100 rounded-xl text-indigo-600 cursor-pointer inline-block"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSup(sup.id)}
                            className="p-2 hover:bg-red-50 rounded-xl text-red-500 cursor-pointer inline-block"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PURCHASES LEDGER */}
          {activeTab === 'purchases' && (
            <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-xl shadow-slate-100/30 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by receipt code..."
                    value={purSearch}
                    onChange={(e) => setPurSearch(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-350 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left border-collapse text-xs font-bold text-slate-500">
                  <thead>
                    <tr className="border-b border-slate-100 uppercase text-[9.5px] tracking-widest text-slate-400 bg-slate-50/50">
                      <th className="p-4">Receipt Code</th>
                      <th className="p-4">Ingredient</th>
                      <th className="p-4">Supplier Partner</th>
                      <th className="p-4">Purchase Date</th>
                      <th className="p-4">Order Size</th>
                      <th className="p-4 text-right">Ledger Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.filter(p => p.id.toLowerCase().includes(purSearch.toLowerCase())).map((pur) => {
                      const ing = ingredients.find(i => i.id === pur.ingredientId);
                      const sup = suppliers.find(s => s.id === pur.supplierId);
                      return (
                        <tr key={pur.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-mono font-extrabold text-slate-400">{pur.id}</td>
                          <td className="p-4 font-black text-slate-850 text-[13px]">{ing ? ing.name : 'Deleted Ingredient'}</td>
                          <td className="p-4 text-slate-650">{sup ? sup.name : 'Unknown supplier'}</td>
                          <td className="p-4 font-mono text-slate-400">{pur.purchaseDate}</td>
                          <td className="p-4 font-mono">{pur.quantity} {ing?.unit}</td>
                          <td className="p-4 text-right text-slate-900 font-extrabold font-poppins text-[13px]">{currency}{pur.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: LOGS */}
          {activeTab === 'adjustments' && (
            <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-xl shadow-slate-100/30 space-y-5">
              <div>
                <h3 className="font-extrabold text-[15px] text-slate-900 font-poppins tracking-tight">System Logs</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                  Complete tracking history of daily consumption, manual modifications, and receipt fill actions.
                </p>
              </div>

              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by ingredient..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-350 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left border-collapse text-xs font-bold text-slate-500">
                  <thead>
                    <tr className="border-b border-slate-100 uppercase text-[9.5px] tracking-widest text-slate-400 bg-slate-50/50">
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Ingredient</th>
                      <th className="p-4">Movement</th>
                      <th className="p-4">Quantity</th>
                      <th className="p-4">Log Reason</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.filter(l => {
                      const ingName = ingredients.find(i => i.id === l.ingredientId)?.name || '';
                      return ingName.toLowerCase().includes(logSearch.toLowerCase());
                    }).map((log) => {
                      const ing = ingredients.find(i => i.id === log.ingredientId);
                      return (
                        <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="p-4 font-black text-slate-800">{ing ? ing.name : 'Unknown Ingredient'}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-md font-black uppercase text-[9px] tracking-wider ${
                              log.type === 'in' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/20' : 'bg-amber-50 text-amber-600 border border-amber-100/20'
                            }`}>
                              {log.type === 'in' ? 'Inflow' : 'Outflow'}
                            </span>
                          </td>
                          <td className="p-4 font-extrabold font-mono text-slate-800">
                            {log.type === 'in' ? '+' : '-'}{log.quantity.toFixed(1)} {ing?.unit}
                          </td>
                          <td className="p-4">
                            <span className="text-slate-500 uppercase text-[9.5px] font-black tracking-wider">
                              {log.reason.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400 font-mono">{log.date}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: REORDER CENTER */}
          {activeTab === 'reorders' && (
            <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-xl shadow-slate-100/30 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
                <div>
                  <h3 className="font-extrabold text-[15px] text-slate-900 font-poppins tracking-tight">Reorder Dashboard</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                    Generate purchase requests for low-stock ingredients and coordinate with suppliers.
                  </p>
                </div>
                <button
                  onClick={autoGenerateLowStockReorders}
                  className="bg-slate-900 hover:bg-slate-850 text-white px-4 py-2.5 rounded-2xl text-[10.5px] font-black uppercase tracking-wider shadow-md cursor-pointer transition-colors"
                >
                  Generate Stock Requests
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left border-collapse text-xs font-bold text-slate-500">
                  <thead>
                    <tr className="border-b border-slate-100 uppercase text-[9.5px] tracking-widest text-slate-400 bg-slate-50/50">
                      <th className="p-4">Request Code</th>
                      <th className="p-4">Ingredient</th>
                      <th className="p-4">Wholesale Supplier</th>
                      <th className="p-4">Required Qty</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Created Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reorders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 text-xs italic">
                          No pending reorder requests. Click above to scan low stock items.
                        </td>
                      </tr>
                    ) : (
                      reorders.map((req) => {
                        const ing = ingredients.find(i => i.id === req.ingredientId);
                        const sup = suppliers.find(s => s.id === req.supplierId);
                        return (
                          <tr key={req.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-mono font-extrabold text-slate-400">{req.id}</td>
                            <td className="p-4 font-black text-slate-800 text-[13px]">{ing ? ing.name : 'Unknown Ingredient'}</td>
                            <td className="p-4 text-slate-500">{sup ? sup.name : 'Unknown'}</td>
                            <td className="p-4 text-slate-800 font-extrabold font-mono">{req.quantity} {ing?.unit}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-lg font-black text-[9px] uppercase tracking-wider ${
                                req.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/30' :
                                req.status === 'Approved' ? 'bg-blue-50 text-blue-600 border border-blue-100/30' :
                                req.status === 'Rejected' ? 'bg-slate-100 text-slate-400' :
                                'bg-amber-50 text-amber-500 border border-amber-100/30'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="p-4 text-slate-400 font-mono">{new Date(req.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 text-right space-x-1.5 shrink-0">
                              {req.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveReorderRequest(req)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors shadow-sm"
                                  >
                                    Approve & Restock
                                  </button>
                                  <button
                                    onClick={() => handleRejectReorderRequest(req.id)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {req.status === 'Completed' && (
                                <span className="text-emerald-650 flex items-center justify-end gap-1 text-[10px] uppercase font-black tracking-wider">
                                  <Check className="w-3.5 h-3.5" /> Stock Restocked
                                </span>
                              )}
                              {req.status === 'Rejected' && (
                                <span className="text-slate-400 text-[10px] uppercase font-black tracking-wider">Rejected</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: ANALYTICS & REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              {/* Charts grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Spending by Supplier Chart Widget */}
                <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-xl shadow-slate-100/30 space-y-6">
                  <div>
                    <h3 className="font-extrabold text-[15px] text-slate-900 font-poppins tracking-tight">Expenditures by Supplier</h3>
                    <p className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Supplier ranking sorted by total purchase costs.</p>
                  </div>

                  <div className="space-y-4.5">
                    {supplierSpendList.length === 0 ? (
                      <p className="text-center py-8 text-slate-400 text-xs italic">No purchase data available.</p>
                    ) : (
                      supplierSpendList.map((item, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-650">
                            <span className="text-slate-800 font-black">{item.name}</span>
                            <span className="text-slate-900 font-extrabold font-poppins">{currency}{item.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-[#f1f5f9] relative">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                              style={{ width: `${(item.cost / (supplierSpendList[0]?.cost || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Stock Level Analytics Report */}
                <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-xl shadow-slate-100/30 space-y-6">
                  <div>
                    <h3 className="font-extrabold text-[15px] text-slate-900 font-poppins tracking-tight">Stock Shortage Severity Index</h3>
                    <p className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Critical ingredients ranked by stock level below threshold.</p>
                  </div>

                  <div className="space-y-4.5">
                    {lowStockIngredients.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-xs font-bold bg-[#fafafc]/50 rounded-2xl border border-slate-100">
                        No shortage reports. All system ingredient stocks are above danger thresholds.
                      </div>
                    ) : (
                      lowStockIngredients.map((item, idx) => {
                        const shortagePercent = ((item.minStock - item.quantity) / item.minStock) * 100;
                        return (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                              <span className="text-slate-800 font-extrabold">{item.name}</span>
                              <span className="text-red-500 font-extrabold">({shortagePercent.toFixed(0)}% Shortage)</span>
                            </div>
                            <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-[#f1f5f9] relative">
                              <div 
                                className="h-full bg-gradient-to-r from-amber-400 to-red-500 rounded-full"
                                style={{ width: `${Math.min(100, shortagePercent)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* Monthly Cost Analysis ledger card */}
              <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-6.5 shadow-xl shadow-slate-100/30 space-y-5">
                <div>
                  <h3 className="font-extrabold text-[15px] text-slate-900 font-poppins tracking-tight">Operational Expense Reports</h3>
                  <p className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Summary ledger breakdown of expenses.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
                  <div className="bg-[#fafafc] p-4.5 rounded-2xl border border-slate-100 text-center space-y-1.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total Lifetime Expense</span>
                    <h4 className="text-xl font-black text-slate-800 font-poppins">{currency}{totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
                  </div>
                  <div className="bg-[#fafafc] p-4.5 rounded-2xl border border-slate-100 text-center space-y-1.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Current Month Expense</span>
                    <h4 className="text-xl font-black text-slate-800 font-poppins">{currency}{monthlySpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
                  </div>
                  <div className="bg-[#fafafc] p-4.5 rounded-2xl border border-slate-100 text-center space-y-1.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Unique Wholesale Suppliers</span>
                    <h4 className="text-xl font-black text-slate-800 font-poppins">{suppliers.length} Partners</h4>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------- */}
      {/* MODAL 1: ADD/EDIT INGREDIENT */}
      {/* ------------------------- */}
      <AnimatePresence>
        {showIngModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6.5 max-w-md w-full border border-slate-100 shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-poppins font-black text-sm text-slate-900 uppercase tracking-tight">
                  {editingIng ? 'Modify Ingredient Specs' : 'Register New Ingredient'}
                </h3>
                <button onClick={() => setShowIngModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleIngSubmit} className="space-y-4 text-xs font-bold text-slate-650">
                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-black uppercase text-slate-400 block ml-1">Ingredient Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Romaine Lettuce"
                    value={ingForm.name}
                    onChange={(e) => setIngForm({ ...ingForm, name: e.target.value })}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-350 focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-black uppercase text-slate-400 block ml-1">Initial Stock Quantity</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min={0}
                      disabled={!!editingIng}
                      placeholder="10"
                      value={ingForm.quantity}
                      onChange={(e) => setIngForm({ ...ingForm, quantity: Number(e.target.value) })}
                      className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-350 focus:bg-white transition-all shadow-inner disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-black uppercase text-slate-400 block ml-1">Measurement Unit</label>
                    <select
                      value={ingForm.unit}
                      onChange={(e) => setIngForm({ ...ingForm, unit: e.target.value })}
                      className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-350 focus:bg-white transition-all shadow-inner"
                    >
                      <option value="Kg">Kg (Kilograms)</option>
                      <option value="Liters">Liters</option>
                      <option value="Pieces">Pieces</option>
                      <option value="Grams">Grams</option>
                      <option value="Packets">Packets</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-black uppercase text-slate-400 block ml-1">Min Threshold Level</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min={0}
                    placeholder="5"
                    value={ingForm.minStock}
                    onChange={(e) => setIngForm({ ...ingForm, minStock: Number(e.target.value) })}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-350 focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-black uppercase text-slate-400 block ml-1">Assigned Supplier Partner</label>
                  <select
                    value={ingForm.supplierId}
                    onChange={(e) => setIngForm({ ...ingForm, supplierId: e.target.value })}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-350 focus:bg-white transition-all shadow-inner"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.area})</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex gap-2 justify-end border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowIngModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-850 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    {editingIng ? 'Save Changes' : 'Create Ingredient'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------- */}
      {/* MODAL 2: ADD/EDIT SUPPLIER */}
      {/* ------------------------- */}
      <AnimatePresence>
        {showSupModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6.5 max-w-md w-full border border-slate-100 shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-poppins font-black text-sm text-slate-900 uppercase tracking-tight">
                  {editingSup ? 'Modify Supplier Profile' : 'Register Wholesale Supplier'}
                </h3>
                <button onClick={() => setShowSupModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSupSubmit} className="space-y-4 text-xs font-bold text-slate-650">
                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-black uppercase text-slate-400 block ml-1">Supplier Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dairy Farms Co."
                    value={supForm.name}
                    onChange={(e) => setSupForm({ ...supForm, name: e.target.value })}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-350 focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-black uppercase text-slate-400 block ml-1">Wholesale Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 98765 00000"
                    value={supForm.phone}
                    onChange={(e) => setSupForm({ ...supForm, phone: e.target.value })}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-350 focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-black uppercase text-slate-400 block ml-1">Corporate Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 52, Ring Road Office"
                    value={supForm.address}
                    onChange={(e) => setSupForm({ ...supForm, address: e.target.value })}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-350 focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-black uppercase text-slate-400 block ml-1">Supply Region / Area</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. North Cantonment"
                    value={supForm.area}
                    onChange={(e) => setSupForm({ ...supForm, area: e.target.value })}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-350 focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div className="pt-4 flex gap-2 justify-end border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowSupModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-850 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    {editingSup ? 'Save Changes' : 'Create Supplier'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------- */}
      {/* MODAL 3: CONFIGURE RECIPE */}
      {/* ------------------------- */}
      <AnimatePresence>
        {showRecipeModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6.5 max-w-lg w-full border border-slate-100 shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-poppins font-black text-sm text-slate-900 uppercase tracking-tight">
                    Recipe Specifications
                  </h3>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">
                    Dish: {menuItems.find(m => m.id === selectedMenuItemForRecipe)?.name}
                  </span>
                </div>
                <button onClick={() => setShowRecipeModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-bold text-slate-650">
                <div className="flex justify-between items-center">
                  <span className="text-[9.5px] font-black uppercase text-slate-400">Formula Ingredients mapping list</span>
                  <button
                    onClick={handleAddIngredientRow}
                    className="text-indigo-600 hover:text-indigo-500 flex items-center gap-1 cursor-pointer font-black"
                  >
                    <Plus className="w-4 h-4" /> Add Row
                  </button>
                </div>

                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {selectedRecipeIngredients.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs italic border border-dashed border-slate-100 rounded-2xl bg-[#fafafc]">
                      No formula rows created yet. Click "Add Row" to start adding raw components.
                    </div>
                  ) : (
                    selectedRecipeIngredients.map((row, idx) => {
                      const ingDetail = ingredients.find(i => i.id === row.ingredientId);
                      return (
                        <div key={idx} className="flex gap-2.5 items-center bg-[#fafafc] p-2.5 rounded-2xl border border-slate-100">
                          <select
                            value={row.ingredientId}
                            onChange={(e) => handleUpdateRecipeRowIng(idx, e.target.value)}
                            className="flex-1 bg-white border border-[#f1f5f9] rounded-xl px-2.5 py-2 text-[11px] font-bold text-slate-800 focus:outline-none"
                          >
                            {ingredients.map(i => (
                              <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1.5 w-24">
                            <input
                              type="number"
                              step="0.001"
                              min={0.001}
                              value={row.quantity}
                              onChange={(e) => handleUpdateRecipeRowQty(idx, Number(e.target.value))}
                              className="w-full bg-white border border-[#f1f5f9] rounded-xl px-2 py-2 text-[11px] font-bold text-slate-800 focus:outline-none text-center"
                            />
                            <span className="text-[10px] font-mono text-slate-400">{ingDetail?.unit || ''}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveRecipeRow(idx)}
                            className="p-2 hover:bg-red-50 rounded-xl text-red-500 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-4 flex gap-2 justify-end border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowRecipeModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveRecipe}
                    className="bg-slate-900 hover:bg-slate-850 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    Save Formulation
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------- */}
      {/* MODAL 4: RECORD PURCHASE */}
      {/* ------------------------- */}
      <AnimatePresence>
        {showPurchaseModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6.5 max-w-md w-full border border-slate-100 shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-poppins font-black text-sm text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                  <ShoppingBag className="w-5 h-5 text-indigo-500" />
                  Record Stock Purchase
                </h3>
                <button onClick={() => setShowPurchaseModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePurchaseSubmit} className="space-y-4 text-xs font-bold text-slate-650">
                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-black uppercase text-slate-400 block ml-1">Ingredient</label>
                  <select
                    value={purForm.ingredientId}
                    onChange={(e) => setPurForm({ ...purForm, ingredientId: e.target.value })}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    {ingredients.map(i => (
                      <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-black uppercase text-slate-400 block ml-1">Purchase Qty</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min={0.01}
                      placeholder="10"
                      value={purForm.quantity || ''}
                      onChange={(e) => setPurForm({ ...purForm, quantity: Number(e.target.value) })}
                      className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-black uppercase text-slate-400 block ml-1">Total Cost (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min={0.01}
                      placeholder="450.00"
                      value={purForm.cost || ''}
                      onChange={(e) => setPurForm({ ...purForm, cost: Number(e.target.value) })}
                      className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-black uppercase text-slate-400 block ml-1">Purchase Date</label>
                  <input
                    type="date"
                    required
                    value={purForm.purchaseDate}
                    onChange={(e) => setPurForm({ ...purForm, purchaseDate: e.target.value })}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="pt-4 flex gap-2 justify-end border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowPurchaseModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-850 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    Confirm Purchase
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------- */}
      {/* MODAL 5: STOCK ADJUSTMENT */}
      {/* ------------------------- */}
      <AnimatePresence>
        {showAdjustModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6.5 max-w-md w-full border border-slate-100 shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-poppins font-black text-sm text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                  <RefreshCw className="w-5 h-5 text-indigo-500" />
                  Stock Out / Stock In Log
                </h3>
                <button onClick={() => setShowAdjustModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs font-bold text-slate-655">
                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-black uppercase text-slate-400 block ml-1">Select Ingredient</label>
                  <select
                    value={adjForm.ingredientId}
                    onChange={(e) => setAdjForm({ ...adjForm, ingredientId: e.target.value })}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    {ingredients.map(i => (
                      <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-black uppercase text-slate-400 block ml-1">Action Type</label>
                    <select
                      value={adjForm.type}
                      onChange={(e) => setAdjForm({ ...adjForm, type: e.target.value as any })}
                      className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none"
                    >
                      <option value="out">Stock Out (Deduction)</option>
                      <option value="in">Stock In (Addition)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-black uppercase text-slate-400 block ml-1">Quantity</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min={0.01}
                      value={adjForm.quantity || ''}
                      onChange={(e) => setAdjForm({ ...adjForm, quantity: Number(e.target.value) })}
                      className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-black uppercase text-slate-400 block ml-1">Log Reason</label>
                  <select
                    value={adjForm.reason}
                    onChange={(e) => setAdjForm({ ...adjForm, reason: e.target.value as any })}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    {adjForm.type === 'out' ? (
                      <>
                        <option value="daily_usage">Daily Ingredient Consumption</option>
                        <option value="waste">Ingredient Spoilage / Waste</option>
                        <option value="manual_adjustment">Manual Adjustment</option>
                      </>
                    ) : (
                      <>
                        <option value="manual_adjustment">Manual Correction (Addition)</option>
                        <option value="purchase">Log Purchase</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="pt-4 flex gap-2 justify-end border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAdjustModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-850 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    Confirm Action
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------- */}
      {/* MODAL 6: MANUAL REORDER   */}
      {/* ------------------------- */}
      <AnimatePresence>
        {showReorderModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6.5 max-w-md w-full border border-slate-100 shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-poppins font-black text-sm text-slate-900 uppercase tracking-tight">
                  Request Supplier Reorder
                </h3>
                <button onClick={() => setShowReorderModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReorderSubmit} className="space-y-4 text-xs font-bold text-slate-650">
                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-black uppercase text-slate-400 block ml-1">Select Ingredient</label>
                  <select
                    value={reorderForm.ingredientId}
                    onChange={(e) => setReorderForm({ ...reorderForm, ingredientId: e.target.value })}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    {ingredients.map(i => (
                      <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-black uppercase text-slate-400 block ml-1">Reorder Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min={0.01}
                    value={reorderForm.quantity}
                    onChange={(e) => setReorderForm({ ...reorderForm, quantity: Number(e.target.value) })}
                    className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="pt-4 flex gap-2 justify-end border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowReorderModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-850 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    Submit Request
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
