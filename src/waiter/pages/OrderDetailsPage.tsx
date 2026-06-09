import { useParams, useNavigate } from 'react-router-dom';
import { useWaiterStore } from '../store/useWaiterStore';
import { 
  ChevronLeft, Clock, ChefHat, CheckSquare, Square, CreditCard, MessageSquare, HelpCircle, FileText
} from 'lucide-react';
import { useState } from 'react';

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useWaiterStore();
  
  const order = orders.find(o => o.id === id);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  if (!order) {
    return (
      <div className="min-h-screen bg-[#fafafc] flex flex-col items-center justify-center p-6 text-center">
        <HelpCircle className="w-12 h-12 text-slate-300 mb-3" />
        <h1 className="text-xl font-bold text-slate-800">Order Not Found</h1>
        <button 
          onClick={() => navigate('/waiter/assigned')}
          className="mt-4 px-6 py-3 bg-[#7c3aed] text-white rounded-full font-bold"
        >
          Back to Assigned
        </button>
      </div>
    );
  }

  const toggleCheck = (idx: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleAction = () => {
    if (order.status === 'Ready') {
      updateOrderStatus(order.id, 'Picked Up');
      navigate('/waiter/assigned');
    } else if (order.status === 'Picked Up') {
      updateOrderStatus(order.id, 'Delivered');
      navigate('/waiter/assigned');
    }
  };

  // Mock instructions based on order
  const specialInstructions = id === 'O101' 
    ? 'Risotto should be served hot. Burrata needs extra virgin olive oil on top.' 
    : id === 'O102' 
      ? 'Burger cooked medium well, no onions. Lava cake served after burger.' 
      : 'Customer requested extra napkins and water.';

  const gst = order.price * 0.05;
  const subtotal = order.price - gst;

  return (
    <div className="min-h-screen bg-[#fafafc] pb-24 font-sans select-none">
      {/* Header */}
      <div className="bg-white border-b border-[#f1f5f9] px-6 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-[0_2px_10px_rgba(0,0,0,0.01)] max-w-md mx-auto w-full">
        <button 
          onClick={() => navigate(-1)}
          className="p-2.5 bg-slate-50 text-slate-700 rounded-full border border-[#f1f5f9] hover:bg-slate-100 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            {order.id}
          </span>
          <h1 className="text-lg font-black text-[#0f172a] mt-0.5 font-poppins">Table {order.tableId} Details</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 flex flex-col gap-5">
        {/* Status Box */}
        <div className="bg-white p-5 rounded-[28px] border border-[#f1f5f9] shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 text-[#7c3aed] rounded-xl flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Status</p>
              <p className="font-extrabold text-[#0f172a] text-[15px] mt-0.5">{order.status}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#64748b] text-[13px] font-semibold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4 text-purple-500" />
            Ordered {order.timeOrdered}
          </div>
        </div>

        {/* Kitchen Items Checklist */}
        <div className="bg-white p-5 rounded-[28px] border border-[#f1f5f9] shadow-sm">
          <h3 className="font-bold text-[#0f172a] text-[15px] font-poppins mb-4 flex items-center gap-2">
            <FileText className="w-4.5 h-4.5 text-[#7c3aed]" />
            Items Checklist
          </h3>
          <p className="text-[12px] text-slate-400 mb-3.5">Verify each item before picking up from kitchen or delivering to table:</p>
          
          <div className="flex flex-col gap-3">
            {order.items.map((item, idx) => {
              const isChecked = !!checkedItems[idx];
              return (
                <div 
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isChecked 
                      ? 'bg-purple-50/10 border-purple-200 text-[#0f172a]' 
                      : 'bg-white border-[#f1f5f9] hover:bg-slate-50 text-[#1e293b]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#7c3aed]">
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 fill-purple-100 text-[#7c3aed]" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )}
                    </span>
                    <span className="font-semibold text-[13.5px]">{item.name}</span>
                  </div>
                  <span className="font-extrabold text-[#64748b] text-[14px]">
                    x{item.quantity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Special Instructions */}
        <div className="bg-[#fffbeb] border border-[#fef3c7] p-5 rounded-[28px] shadow-sm flex gap-3.5">
          <div className="bg-amber-100 text-amber-800 p-2.5 rounded-xl self-start">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-amber-900 text-[14px] font-poppins">Special Instructions</h4>
            <p className="text-amber-800 text-[13px] leading-relaxed mt-1">{specialInstructions}</p>
          </div>
        </div>

        {/* Cost Summary Box */}
        <div className="bg-white p-5 rounded-[28px] border border-[#f1f5f9] shadow-sm">
          <h3 className="font-bold text-[#0f172a] text-[15px] font-poppins mb-4 flex items-center gap-2">
            <CreditCard className="w-4.5 h-4.5 text-[#7c3aed]" />
            Billing Breakdown
          </h3>
          <div className="flex flex-col gap-2.5 text-[13px] text-[#64748b]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%)</span>
              <span className="font-semibold text-slate-800">${gst.toFixed(2)}</span>
            </div>
            <div className="h-[1px] bg-slate-100 w-full my-1.5" />
            <div className="flex justify-between text-[#0f172a] text-[16px] font-extrabold font-poppins">
              <span>Grand Total</span>
              <span>${order.price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        {order.status !== 'Delivered' && order.status !== 'Preparing' && (
          <button 
            onClick={handleAction}
            className="w-full py-4.5 rounded-[22px] font-black text-white text-sm uppercase tracking-wider bg-gradient-to-r from-[#7c3aed] to-[#6366f1] shadow-lg shadow-purple-500/20 active:scale-95 transition-all mt-4 cursor-pointer flex items-center justify-center gap-2"
          >
            {order.status === 'Ready' ? 'Collect from Kitchen' : 'Mark Delivered to Table'}
          </button>
        )}
      </div>
    </div>
  );
}
