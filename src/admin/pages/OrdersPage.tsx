import { useState } from 'react';
import { useChefStore } from '../../chef/store/useChefStore';
import { useAdminStore } from '../store/useAdminStore';
import { Search, Printer, HelpCircle, UtensilsCrossed, Clock, CheckCircle2, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';

export function OrdersPage() {
  const chefStore = useChefStore();
  const chefs = useAdminStore((state) => state.chefs);
  const currency = useAdminStore((state) => state.currency);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'New' | 'Preparing' | 'Ready' | 'Completed'>('All');
  
  // Calculate price dynamically for demo purposes based on items
  // Since items are names + quantity, we mock dish prices
  const DISH_PRICES: Record<string, number> = {
    'Truffle Mushroom Risotto': 24.99,
    'Wagyu Beef Burger': 29.50,
    'Salmon Tartare': 18.00,
    'Hyderabadi Dum Biryani': 22.00,
    'Matcha Lava Cake': 12.99,
    'Artisan Burrata': 16.50
  };

  const getOrderTotal = (items: { name: string; quantity: number }[]) => {
    return items.reduce((acc, curr) => {
      const price = DISH_PRICES[curr.name] || 15.00; // default mock price
      return acc + price * curr.quantity;
    }, 0);
  };

  // Filter orders
  const filteredOrders = chefStore.orders.filter((o) => {
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          `table ${o.tableNumber}`.includes(searchQuery.toLowerCase()) ||
                          o.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handlePrintReceipt = (orderId: string) => {
    alert(`Sending invoice receipt for ${orderId} to thermal printer... 🖨️`);
  };

  const handleDownloadPDF = (orderId: string) => {
    const order = chefStore.orders.find(o => o.id === orderId);
    if (!order) return;

    let finalBill = 0;
    let subtotal = 0;
    let tax = 0;
    
    if (order.price) {
      finalBill = order.price;
      subtotal = finalBill / 1.05;
      tax = finalBill - subtotal;
    } else {
      subtotal = getOrderTotal(order.items);
      tax = subtotal * 0.05;
      finalBill = subtotal + tax;
    }

    // fallback for Indian Rupee symbol which standard PDF Helvetica does not support
    const currencySymbol = currency === '₹' ? 'Rs.' : currency;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 140 + order.items.length * 8]
    });

    // Font settings
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    
    // Header
    doc.text('SMARTSERVE HQ', 40, 12, { align: 'center' });
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('SmartServe Restaurant ERP Portal', 40, 17, { align: 'center' });
    doc.text('Live Billing Invoice', 40, 21, { align: 'center' });
    
    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(5, 25, 75, 25);
    
    // Order info
    doc.setFont('Helvetica', 'bold');
    doc.text(`Order ID: ${order.id}`, 5, 31);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Table: Table ${order.tableNumber}`, 5, 36);
    
    const chefName = chefs.find(c => c.id === order.assignedChefId)?.name || order.assignedChefId;
    doc.text(`Chef node: ${chefName}`, 5, 41);
    
    const timeStr = order.timeReceived || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    doc.text(`Time received: ${timeStr}`, 5, 46);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 5, 51);
    
    // Divider
    doc.line(5, 55, 75, 55);
    
    // Table Headers
    doc.setFont('Helvetica', 'bold');
    doc.text('Item Description', 5, 61);
    doc.text('Qty', 50, 61, { align: 'center' });
    doc.text('Total', 75, 61, { align: 'right' });
    
    doc.setFont('Helvetica', 'normal');
    let currentY = 67;
    
    // Items
    order.items.forEach((item) => {
      const itemPrice = DISH_PRICES[item.name] || 15.00;
      const totalItemPrice = itemPrice * item.quantity;
      
      const itemName = item.name.length > 22 ? item.name.substring(0, 20) + '..' : item.name;
      doc.text(itemName, 5, currentY);
      doc.text(item.quantity.toString(), 50, currentY, { align: 'center' });
      doc.text(`${currencySymbol}${totalItemPrice.toFixed(2)}`, 75, currentY, { align: 'right' });
      currentY += 6;
    });
    
    // Divider
    doc.line(5, currentY, 75, currentY);
    currentY += 6;
    
    // Summary
    doc.text('Subtotal:', 5, currentY);
    doc.text(`${currencySymbol}${subtotal.toFixed(2)}`, 75, currentY, { align: 'right' });
    currentY += 5;
    
    doc.text('GST (5%):', 5, currentY);
    doc.text(`${currencySymbol}${tax.toFixed(2)}`, 75, currentY, { align: 'right' });
    currentY += 6;
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Grand Total:', 5, currentY);
    doc.text(`${currencySymbol}${finalBill.toFixed(2)}`, 75, currentY, { align: 'right' });
    currentY += 8;
    
    // Divider
    doc.line(5, currentY, 75, currentY);
    currentY += 6;
    
    // Payment info
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Payment Status:', 5, currentY);
    doc.setFont('Helvetica', 'bold');
    const paymentText = `${order.paymentStatus || 'UNPAID'} (${(order.paymentMethod || 'LATER').toUpperCase()})`;
    doc.text(paymentText, 75, currentY, { align: 'right' });
    currentY += 8;
    
    // Footer
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Thank you for dining with us!', 40, currentY, { align: 'center' });
    currentY += 4;
    doc.text('SmartServe ERP Receipt System', 40, currentY, { align: 'center' });
    
    // Save the PDF
    doc.save(`Invoice_${order.id}.pdf`);
  };


  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">LIVE ORDERS LOG</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
            Reviewing active chef cooking lines and printing customer billing receipts.
          </p>
        </div>
        
        {/* Status Filters */}
        <div className="flex bg-slate-100 p-1.5 rounded-[16px] border border-slate-200/40 overflow-x-auto scrollbar-none self-start">
          {(['All', 'New', 'Preparing', 'Ready', 'Completed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                statusFilter === filter
                  ? 'bg-white text-[#7c3aed] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by Order ID, table, or dish name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-[#f1f5f9] rounded-[22px] pl-12 pr-6 py-4.5 text-sm font-bold text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-500/5 transition-all shadow-sm"
        />
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-12 text-center max-w-lg mx-auto shadow-sm mt-10">
          <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-2xl mb-4.5">
            <UtensilsCrossed className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h3 className="text-[17px] font-black text-[#0f172a] font-poppins">No Matching Orders</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1.5 leading-relaxed max-w-sm mx-auto">
            No live customer orders match your criteria. Waiter tickets and kitchen preps will appear here as they flow.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#f1f5f9] rounded-[28px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-[#f1f5f9] text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4.5">Order ID</th>
                  <th className="px-6 py-4.5">Table</th>
                  <th className="px-6 py-4.5">Dishes Requested</th>
                  <th className="px-6 py-4.5">KDS Cook Node</th>
                  <th className="px-6 py-4.5">Total Bill</th>
                  <th className="px-6 py-4.5">Status</th>
                  <th className="px-6 py-4.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filteredOrders.map((order) => {
                  let finalBill = 0;
                  let billSum = 0;
                  let tax = 0;
                  
                  if (order.price) {
                    finalBill = order.price;
                    billSum = finalBill / 1.05;
                    tax = finalBill - billSum;
                  } else {
                    billSum = getOrderTotal(order.items);
                    tax = billSum * 0.05;
                    finalBill = billSum + tax;
                  }
                  
                  const statusColors = {
                    'New': 'bg-blue-50 text-blue-600 border border-blue-100',
                    'Preparing': 'bg-amber-50 text-amber-600 border border-amber-100',
                    'Ready': 'bg-green-50 text-green-600 border border-green-100',
                    'Picked Up': 'bg-purple-50 text-purple-600 border border-purple-100',
                    'Completed': 'bg-slate-100 text-slate-600 border border-slate-200',
                    'Delivered': 'bg-slate-50 text-slate-500 border border-slate-100',
                    'Cancelled': 'bg-rose-50 text-rose-600 border border-rose-100'
                  };

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors text-xs font-bold text-slate-600">
                      <td className="px-6 py-5">
                        <span className="font-black text-sm text-[#0f172a]">{order.id}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                          Table {order.tableNumber}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className="text-slate-400">x{item.quantity}</span>
                              <span className="text-[#0f172a]">{item.name}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <span className="h-1.5 w-1.5 bg-purple-500 rounded-full" />
                          <span>{chefs.find(c => c.id === order.assignedChefId)?.name || `Chef (${order.assignedChefId})`}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-[#0f172a] font-black">{currency}{finalBill.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Incl. 5% GST</div>
                        <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md mt-1.5 ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {order.paymentStatus || 'Unpaid'} ({order.paymentMethod || 'later'})
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleDownloadPDF(order.id)}
                            className="inline-flex items-center gap-1.5 bg-[#7c3aed] text-white hover:bg-[#6d28d9] px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm cursor-pointer transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download PDF
                          </button>
                          <button
                            onClick={() => handlePrintReceipt(order.id)}
                            className="inline-flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm cursor-pointer transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Print Invoice
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Table Footer */}
          <div className="px-6 py-4.5 bg-slate-50 border-t border-[#f1f5f9] flex justify-between items-center text-xs font-bold text-slate-400">
            <span>Total Orders Tracked: {filteredOrders.length}</span>
            <span>Thermal print buffer status: Online</span>
          </div>
        </div>
      )}
    </div>
  );
}
