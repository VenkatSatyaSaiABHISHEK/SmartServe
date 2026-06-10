import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWaiterStore } from '../store/useWaiterStore';
import { useAdminStore } from '../../admin/store/useAdminStore';
import { useChefStore } from '../../chef/store/useChefStore';
import { 
  CheckCircle2, DollarSign, Star, ClipboardList, Grid, 
  ChevronRight, Bell, AlertCircle, Sparkles, Plus, 
  Trash2, CreditCard, ShoppingBag, Landmark, Coffee, HelpCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function DashboardPage() {
  const { 
    waiter, orders, tables, notifications, toggleOnlineStatus, 
    markNotificationRead, assignTable, clearTable, addNotification, updateOrderStatus 
  } = useWaiterStore();
  const menuItems = useAdminStore(state => state.menuItems);
  const navigate = useNavigate();

  // POS Order taking states
  const [showPOS, setShowPOS] = useState(false);
  const [posTable, setPosTable] = useState<number | null>(null);
  const [posCategory, setPosCategory] = useState('All');
  const [posCart, setPosCart] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qr' | 'later'>('later');
  const [showSuccessOrder, setShowSuccessOrder] = useState(false);
  const [posStep, setPosStep] = useState<'menu' | 'checkout'>('menu');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

  // Force waiter to be online and active on mount
  useEffect(() => {
    if (waiter && !waiter.onlineStatus) {
      toggleOnlineStatus();
    }
  }, [waiter, toggleOnlineStatus]);

  if (!waiter) return null;

  // Active orders assigned to the waiter
  const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Completed');

  // Filter unread notifications representing table help requests
  const helpRequests = notifications.filter(n => !n.read && (n.type === 'call_waiter' || n.type === 'billing_request'));

  // Waiter assigned tables
  const myTables = tables.filter(t => t.assignedWaiterId === waiter.id);

  // Available tables for self-assignment
  const availableTables = tables.filter(t => !t.assignedWaiterId || t.assignedWaiterId === '');

  // Base salary/earnings calculations
  const baseSalary = waiter.totalDeliveries * 8;
  const totalEarnings = baseSalary + waiter.todayTips;

  // Categories helper
  const categories = ['All', 'Starters', 'Main Course', 'Biryani', 'Desserts'];

  // POS calculations
  const cartItemKeys = Object.keys(posCart);
  const orderItems = cartItemKeys.map(itemId => {
    const item = menuItems.find(m => m.id === itemId);
    return {
      id: itemId,
      name: item?.name || 'Dish',
      quantity: posCart[itemId],
      price: item?.price || 0,
      prepTime: item?.prepTime || 10
    };
  });
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05;
  const grandTotal = subtotal + tax;
  const totalPrepTime = orderItems.reduce((sum, item) => sum + (item.prepTime * item.quantity), 0);

  // Ready orders to display on home page
  const readyOrders = orders.filter(o => o.status === 'Ready' || o.status === 'Picked Up');

  // Handle Cart updates
  const updateCartQuantity = (itemId: string, delta: number) => {
    setPosCart(prev => {
      const current = prev[itemId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const clearPosCart = () => {
    setPosCart({});
    setPosTable(null);
    setPaymentMethod('later');
    setPosStep('menu');
    setCashReceived('');
    setIsSimulatingPayment(false);
  };

  // Submit Waiter POS Order
  const handlePlacePOSOrder = async () => {
    if (!posTable) {
      alert("Please select a table first!");
      return;
    }
    
    if (orderItems.length === 0) {
      alert("Please add items to the order!");
      return;
    }

    // Determine payment status
    const paymentStatus = (paymentMethod === 'cash' || paymentMethod === 'qr') ? 'Paid' : 'Unpaid';

    // Send order to KDS Firestore
    const chefOrderItems = orderItems.map(item => ({ name: item.name, quantity: item.quantity }));
    
    // Trigger KDS creation
    const newOrderId = await useChefStore.getState().addNewOrder(
      chefOrderItems, 
      posTable, 
      totalPrepTime,
      grandTotal,
      paymentMethod,
      paymentStatus
    );

    // Update table assignment in waiter store
    assignTable(posTable.toString(), waiter.id);

    // Clear cart and show success dialog
    clearPosCart();
    setShowPOS(false);
    setShowSuccessOrder(true);

    setTimeout(() => {
      setShowSuccessOrder(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 font-sans pb-16">
      
      {/* Sleek Blue/Indigo Header Area */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 rounded-[28px] text-white shadow-lg shadow-blue-500/10">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-blue-200">Terminal Panel</span>
            <h1 className="text-xl font-black font-poppins mt-0.5">Welcome, {waiter.name.split(' ')[0]}!</h1>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/10 rounded-xl text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>Active Station</span>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid (Blue-indigo Accents) */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-[22px] border border-[#f1f5f9] shadow-sm flex flex-col justify-between h-28">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Deliveries</p>
            <p className="text-lg font-black text-slate-800 font-poppins mt-0.5">{waiter.totalDeliveries}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[22px] border border-[#f1f5f9] shadow-sm flex flex-col justify-between h-28">
          <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <DollarSign className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tips Today</p>
            <p className="text-lg font-black text-slate-800 font-poppins mt-0.5">${waiter.todayTips.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[22px] border border-[#f1f5f9] shadow-sm flex flex-col justify-between h-28">
          <div className="w-8 h-8 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
            <Star className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rating</p>
            <p className="text-lg font-black text-slate-800 font-poppins mt-0.5">{waiter.rating}</p>
          </div>
        </div>
      </div>

      {/* POS Quick Trigger */}
      <button
        onClick={() => setShowPOS(true)}
        className="w-full py-4.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[20px] font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <Plus className="w-4.5 h-4.5" />
        New Table Order (Direct POS)
      </button>

      {/* Active Help Alerts Section */}
      {helpRequests.length > 0 && (
        <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-[28px] p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center border-b border-[#fef3c7] pb-2">
            <h3 className="font-black text-amber-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-500 animate-bounce" />
              Customer Help Calls
            </h3>
            <span className="text-[9.5px] font-black bg-amber-200/50 text-amber-950 px-2 py-0.5 rounded-full">
              {helpRequests.length} Active
            </span>
          </div>

          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {helpRequests.map((req) => (
              <div 
                key={req.id}
                className="bg-white border border-[#fef3c7] rounded-xl p-3 flex justify-between items-center text-xs gap-3 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-800 leading-tight">{req.message}</p>
                  <span className="text-[9.5px] font-bold text-slate-400 mt-1 block">{req.time}</span>
                </div>
                
                <button
                  onClick={() => markNotificationRead(req.id)}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-2.5 py-1.5 rounded-lg font-bold text-[10px] uppercase cursor-pointer transition-colors shrink-0"
                >
                  Resolve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Kitchen Food Ready live deliveries panel */}
      <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-5 shadow-sm space-y-3.5">
        <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-2.5">
          <h3 className="font-black text-slate-800 text-[13px] uppercase tracking-wider flex items-center gap-2">
            <Coffee className="w-4.5 h-4.5 text-blue-500 animate-pulse" />
            Kitchen Food Ready
          </h3>
          <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full">
            {readyOrders.length} Active
          </span>
        </div>

        {readyOrders.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs font-semibold italic flex flex-col items-center justify-center gap-1">
            <span>No orders waiting in kitchen.</span>
            <span className="text-[10px] font-normal text-slate-300">Ready chime will play when food is prepared by chef</span>
          </div>
        ) : (
          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {readyOrders.map((order) => {
              const isReady = order.status === 'Ready';
              return (
                <div 
                  key={order.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-3 shadow-sm ${
                    isReady 
                      ? 'border-blue-100 bg-blue-50/10' 
                      : 'border-emerald-100 bg-emerald-50/5'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-800 font-poppins">Table {order.tableId}</span>
                        <span className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          isReady ? 'bg-blue-100 text-blue-700 animate-pulse' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {isReady ? 'Food Ready' : 'Collected (In Hand)'}
                        </span>
                      </div>
                      <span className="text-[9.5px] font-bold text-slate-400 block mt-1">Order {order.id} • {order.timeOrdered}</span>
                    </div>

                    <button 
                      onClick={() => {
                        if (isReady) {
                          updateOrderStatus(order.id, 'Picked Up');
                        } else {
                          updateOrderStatus(order.id, 'Delivered');
                        }
                      }}
                      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-sm ${
                        isReady 
                          ? 'bg-blue-600 text-white shadow-blue-500/10 hover:bg-blue-700' 
                          : 'bg-emerald-600 text-white shadow-emerald-500/10 hover:bg-emerald-700'
                      }`}
                    >
                      {isReady ? 'Collect Food' : 'Mark Served'}
                    </button>
                  </div>

                  {/* Items */}
                  <div className="bg-white/60 p-2.5 rounded-xl border border-slate-100/40 flex flex-wrap gap-1.5">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="text-[11px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                        {item.name} <strong className="text-slate-800">x{item.quantity}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tables Section (My Tables & Available Tables) */}
      <div className="space-y-4">
        
        {/* My Serviced Tables */}
        <div className="bg-white p-5 rounded-[28px] border border-[#f1f5f9] shadow-sm space-y-3.5">
          <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-2.5">
            <h3 className="font-black text-slate-800 text-[13px] uppercase tracking-wider flex items-center gap-2">
              <Grid className="w-4.5 h-4.5 text-blue-500" />
              My Serviced Tables
            </h3>
            <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full">
              {myTables.length} Active
            </span>
          </div>

          {myTables.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs font-semibold italic">
              No tables assigned to you. Assign below or place a POS order to auto-assign.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {myTables.map((table) => {
                const activeTableOrders = orders.filter(o => o.tableId === table.number.toString() && o.status !== 'Delivered' && o.status !== 'Completed');
                return (
                  <div key={table.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-sm">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-black text-slate-800 font-poppins">T{table.number}</span>
                        <span className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          table.status === 'waiting' ? 'bg-amber-100 text-amber-700' :
                          table.status === 'billing' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {table.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">Capacity: {table.capacity} Pax</p>
                      {activeTableOrders.length > 0 && (
                        <p className="text-[10px] text-blue-600 font-bold mt-1.5">
                          🛎️ {activeTableOrders.length} active order
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => clearTable(table.id)}
                      className="w-full py-1.5 bg-white border border-red-200 text-red-600 rounded-xl text-[9.5px] font-black uppercase tracking-wide cursor-pointer hover:bg-red-50 transition-colors"
                    >
                      Clear & Free
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Tables to Claim */}
        <div className="bg-white p-5 rounded-[28px] border border-[#f1f5f9] shadow-sm space-y-3.5">
          <h3 className="font-black text-slate-800 text-[13px] uppercase tracking-wider border-b border-[#f1f5f9] pb-2.5 flex items-center gap-2">
            <Plus className="w-4.5 h-4.5 text-slate-400" />
            Claim Available Tables
          </h3>

          {availableTables.length === 0 ? (
            <div className="py-4 text-center text-slate-400 text-xs italic font-semibold">
              All tables are currently claimed.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-1">
              {availableTables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => assignTable(table.id, waiter.id)}
                  className="px-3.5 py-2 bg-[#fafafc] border border-slate-200 text-slate-700 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Table {table.number}</span>
                  <span className="text-[9.5px] text-slate-400 font-normal">({table.capacity}p)</span>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* POS Order Dialog Overlay */}
      <AnimatePresence>
        {showPOS && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden"
            >
              {/* POS Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-black text-slate-800 font-poppins">POS Order Terminal</h3>
                </div>
                <button onClick={() => setShowPOS(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* POS Scrollable Content */}
              {/* POS Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {posStep === 'menu' ? (
                  <>
                    {/* 1. Select Table */}
                    <div className="space-y-2.5">
                      <label className="text-[11.5px] font-black uppercase text-slate-400 tracking-wider">Step 1: Choose Table</label>
                      <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: 12 }).map((_, i) => {
                          const num = i + 1;
                          const isSelected = posTable === num;
                          const tableObj = tables.find(t => t.number === num);
                          const isBusy = tableObj && tableObj.assignedWaiterId && tableObj.assignedWaiterId !== waiter.id;

                          return (
                            <button
                              key={num}
                              disabled={!!isBusy}
                              onClick={() => setPosTable(num)}
                              className={`py-3 rounded-2xl text-xs font-black border transition-all cursor-pointer ${
                                isBusy ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed' :
                                isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10' :
                                'bg-[#fafafc] border-[#f1f5f9] text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              T{num}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Select Items */}
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11.5px] font-black uppercase text-slate-400 tracking-wider">Step 2: Add Dishes</label>
                        <span className="text-[10.5px] font-bold text-slate-400">Select categories below</span>
                      </div>

                      {/* Categories Roster */}
                      <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-hide">
                        {categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setPosCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-black shrink-0 cursor-pointer ${
                              posCategory === cat 
                                ? 'bg-slate-800 text-white' 
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Menu Roster */}
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                        {menuItems
                          .filter(item => posCategory === 'All' || item.category === posCategory)
                          .map((item) => {
                            const qty = posCart[item.id] || 0;
                            return (
                              <div 
                                key={item.id}
                                className="p-3 bg-[#fafafc] border border-[#f1f5f9] rounded-2xl flex justify-between items-center gap-3"
                              >
                                <div className="min-w-0">
                                  <h4 className="font-extrabold text-[13px] text-slate-800 truncate">{item.name}</h4>
                                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">${item.price.toFixed(2)} • ⏱️ {item.prepTime}m</p>
                                </div>

                                {/* Cart Counters */}
                                <div className="flex items-center gap-2">
                                  {qty > 0 ? (
                                    <>
                                      <button 
                                        type="button"
                                        onClick={() => updateCartQuantity(item.id, -1)}
                                        className="w-7 h-7 bg-white border border-[#f1f5f9] rounded-lg flex items-center justify-center font-black text-slate-700 hover:bg-slate-50 cursor-pointer active:scale-95"
                                      >
                                        -
                                      </button>
                                      <span className="text-xs font-black text-slate-800 w-4 text-center">{qty}</span>
                                      <button 
                                        type="button"
                                        onClick={() => updateCartQuantity(item.id, 1)}
                                        className="w-7 h-7 bg-white border border-[#f1f5f9] rounded-lg flex items-center justify-center font-black text-slate-700 hover:bg-slate-50 cursor-pointer active:scale-95"
                                      >
                                        +
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => updateCartQuantity(item.id, 1)}
                                      className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-[10.5px] font-black uppercase tracking-wider cursor-pointer"
                                    >
                                      Add
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* 3. Bill Summary & Payment Option */}
                    {Object.keys(posCart).length > 0 && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/60 space-y-4">
                        <div className="flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-200/50 pb-2">
                          <span>POS Bill Checkout</span>
                          <button onClick={clearPosCart} className="text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" /> Clear All
                          </button>
                        </div>

                        {/* Pricing details */}
                        <div className="space-y-1 text-xs font-bold text-slate-500">
                          {Object.keys(posCart).map(itemId => {
                            const item = menuItems.find(m => m.id === itemId);
                            const qty = posCart[itemId];
                            return (
                              <div key={itemId} className="flex justify-between">
                                <span className="truncate max-w-[200px]">{item?.name} x{qty}</span>
                                <span>${((item?.price || 0) * qty).toFixed(2)}</span>
                              </div>
                            );
                          })}
                          <div className="border-t border-slate-200/50 my-2 pt-2 flex justify-between text-[#0f172a] text-sm font-black font-poppins">
                            <span>Grand Total (incl. 5% GST)</span>
                            <span>${grandTotal.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Step 3: Payment Method Option */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Payment Setup</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'later', name: 'Pay Later', icon: Landmark },
                              { id: 'cash', name: 'Cash', icon: DollarSign },
                              { id: 'qr', name: 'Terminal QR', icon: CreditCard }
                            ].map((pay) => {
                              const Icon = pay.icon;
                              const isSelected = paymentMethod === pay.id;
                              return (
                                <button
                                  key={pay.id}
                                  type="button"
                                  onClick={() => setPaymentMethod(pay.id as any)}
                                  className={`py-2 px-2.5 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all text-[9.5px] font-black uppercase tracking-wider ${
                                    isSelected 
                                      ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                  <span>{pay.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Checkout / Payment Verification step */
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                      <span>Payment Verification</span>
                      <span className="text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                        Table {posTable}
                      </span>
                    </div>

                    {paymentMethod === 'cash' ? (
                      <div className="space-y-4 py-2">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 text-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Grand Total Due</span>
                          <span className="text-2xl font-black text-slate-800 font-poppins mt-1 block">${grandTotal.toFixed(2)}</span>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Cash Received ($)</label>
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="e.g. 50.00"
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value)}
                            className="w-full bg-[#fafafc] border border-slate-200 rounded-xl px-4 py-3.5 text-base font-black text-[#0f172a] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 placeholder:font-normal placeholder:text-slate-300"
                          />
                        </div>

                        {parseFloat(cashReceived) > 0 && (
                          <div className="bg-emerald-50 border border-emerald-100/60 p-4.5 rounded-2xl flex justify-between items-center">
                            <div>
                              <span className="text-[10px] font-black text-emerald-800/80 uppercase tracking-wider">Change to Return</span>
                              <span className="text-lg font-black text-emerald-900 font-poppins block mt-0.5">
                                {parseFloat(cashReceived) >= grandTotal 
                                  ? `$${(parseFloat(cashReceived) - grandTotal).toFixed(2)}`
                                  : '$0.00 (Insufficient Cash)'}
                              </span>
                            </div>
                            <div className="text-xs font-bold text-emerald-700 bg-emerald-100/50 px-2.5 py-1 rounded-lg">
                              Cash Tendered
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4 py-2 text-center">
                        <div className="w-44 h-44 mx-auto bg-slate-50 border-2 border-dashed border-indigo-200 rounded-3xl p-3 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                          {/* QR Code SVG */}
                          <svg className="w-32 h-32 text-slate-800" viewBox="0 0 100 100">
                            <path d="M5,5 h30 v30 h-30 z M15,15 h10 v10 h-10 z M65,5 h30 v30 h-30 z M75,15 h10 v10 h-10 z M5,65 h30 v30 h-30 z M15,75 h10 v10 h-10 z" fill="currentColor" />
                            <path d="M45,15 h10 v10 h-10 z M45,35 h15 v10 h-15 z M35,45 h10 v10 h-10 z M15,45 h10 v10 h-10 z M75,45 h10 v10 h-10 z M65,55 h10 v20 h-10 z M45,75 h10 v10 h-10 z M55,65 h10 v15 h-10 z M75,75 h10 v10 h-10 z" fill="currentColor" />
                          </svg>
                          
                          {/* Scan Line Overlay */}
                          <motion.div 
                            animate={{ y: [-10, 150, -10] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                          />
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">Dynamic Payment QR</p>
                          <p className="text-slate-500 text-xs leading-relaxed max-w-[280px] mx-auto mt-1">
                            Have the customer scan this code on your screen to pay <strong className="text-slate-800">${grandTotal.toFixed(2)}</strong> instantly.
                          </p>
                        </div>

                        <button
                          onClick={async () => {
                            setIsSimulatingPayment(true);
                            setTimeout(() => {
                              handlePlacePOSOrder();
                            }, 1500);
                          }}
                          disabled={isSimulatingPayment}
                          className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                            isSimulatingPayment 
                              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-wait' 
                              : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 cursor-pointer'
                          }`}
                        >
                          {isSimulatingPayment ? (
                            <>
                              <span className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
                              Verifying payment...
                            </>
                          ) : (
                            'Simulate Scan & Pay'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* POS Footer Actions */}
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                {posStep === 'menu' ? (
                  <>
                    <button 
                      onClick={() => setShowPOS(false)}
                      className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-95"
                    >
                      Cancel
                    </button>
                    {paymentMethod === 'later' ? (
                      <button
                        disabled={!posTable || Object.keys(posCart).length === 0}
                        onClick={handlePlacePOSOrder}
                        className={`flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer ${
                          (!posTable || Object.keys(posCart).length === 0)
                            ? 'bg-slate-300 text-slate-400 shadow-none cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 shadow-blue-500/10'
                        }`}
                      >
                        Send to Kitchen
                      </button>
                    ) : (
                      <button
                        disabled={!posTable || Object.keys(posCart).length === 0}
                        onClick={() => setPosStep('checkout')}
                        className={`flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer ${
                          (!posTable || Object.keys(posCart).length === 0)
                            ? 'bg-slate-300 text-slate-400 shadow-none cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 shadow-blue-500/10'
                        }`}
                      >
                        Continue to Pay
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        setPosStep('menu');
                        setCashReceived('');
                        setIsSimulatingPayment(false);
                      }}
                      className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-95"
                    >
                      Back to Menu
                    </button>
                    {paymentMethod === 'cash' ? (
                      <button
                        disabled={!cashReceived || parseFloat(cashReceived) < grandTotal}
                        onClick={handlePlacePOSOrder}
                        className={`flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer ${
                          (!cashReceived || parseFloat(cashReceived) < grandTotal)
                            ? 'bg-slate-300 text-slate-400 shadow-none cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 shadow-blue-500/10'
                        }`}
                      >
                        Confirm Cash & Send
                      </button>
                    ) : (
                      <button
                        disabled={isSimulatingPayment}
                        onClick={async () => {
                          setIsSimulatingPayment(true);
                          setTimeout(() => {
                            handlePlacePOSOrder();
                          }, 1500);
                        }}
                        className={`flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer ${
                          isSimulatingPayment
                            ? 'bg-slate-300 text-slate-400 shadow-none cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 shadow-blue-500/10'
                        }`}
                      >
                        {isSimulatingPayment ? 'Processing...' : 'Confirm QR & Send'}
                      </button>
                    )}
                  </>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POS Success Alert Box */}
      <AnimatePresence>
        {showSuccessOrder && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-24 left-4 right-4 z-50 max-w-sm mx-auto bg-slate-900 text-white rounded-[22px] p-4.5 border border-slate-700 shadow-2xl flex items-center gap-3 backdrop-blur-md"
          >
            <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black font-poppins text-white">POS Order Sent</p>
              <p className="text-slate-300 text-xs mt-0.5 leading-snug">Order successfully queued to cookline. Table assigned.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
