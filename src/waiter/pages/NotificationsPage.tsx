import { useWaiterStore } from '../store/useWaiterStore';
import { 
  Bell, CheckCheck, ChefHat, CreditCard, AlertCircle, Trash2, Calendar
} from 'lucide-react';

export function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useWaiterStore();

  const getAlertDetails = (type: string) => {
    switch (type) {
      case 'table_ready':
        return {
          icon: ChefHat,
          color: 'text-purple-600 bg-purple-50 border-purple-100',
          badge: 'bg-purple-100/60'
        };
      case 'billing_request':
        return {
          icon: CreditCard,
          color: 'text-amber-600 bg-amber-50 border-amber-100',
          badge: 'bg-amber-100/60'
        };
      case 'call_waiter':
        default:
        return {
          icon: Bell,
          color: 'text-blue-600 bg-blue-50 border-blue-100',
          badge: 'bg-blue-100/60'
        };
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] font-poppins">Notifications</h1>
          <p className="text-[#64748b] text-[13px] mt-0.5">Review alerts from dining floor and kitchen.</p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 text-[#7c3aed] border border-purple-100 hover:bg-purple-100/50 rounded-full font-bold text-xs uppercase tracking-wide cursor-pointer transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All Read
          </button>
        )}
      </div>

      {/* Notifications Feed */}
      <div className="flex flex-col gap-3">
        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#f1f5f9] rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] text-slate-400 flex flex-col items-center justify-center gap-3">
            <Bell className="w-10 h-10 stroke-[1.2] text-slate-300 animate-pulse" />
            <div>
              <p className="text-sm font-bold text-slate-700">No Alerts Received</p>
              <p className="text-xs text-slate-400 mt-0.5">We will alert you when tables call or food is ready.</p>
            </div>
          </div>
        ) : (
          notifications.map((noti) => {
            const config = getAlertDetails(noti.type);
            const Icon = config.icon;
            
            return (
              <div 
                key={noti.id}
                onClick={() => markNotificationRead(noti.id)}
                className={`bg-white border p-4.5 rounded-[24px] shadow-sm flex items-start gap-3.5 transition-all cursor-pointer relative ${
                  noti.read 
                    ? 'border-[#f1f5f9] opacity-65 hover:bg-slate-50/30' 
                    : 'border-purple-100 bg-purple-50/[0.04] shadow-[0_4px_16px_rgba(124,58,237,0.015)] hover:border-purple-200'
                }`}
              >
                {/* Icon badge */}
                <div className={`p-2.5 rounded-xl border shrink-0 ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <p className={`text-[13.5px] leading-snug font-medium ${noti.read ? 'text-[#64748b]' : 'text-[#0f172a]'}`}>
                    {noti.message}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    {noti.time}
                  </div>
                </div>

                {/* Unread dot indicator */}
                {!noti.read && (
                  <span className="absolute top-4.5 right-4.5 w-2 h-2 rounded-full bg-[#7c3aed]" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
export default NotificationsPage;
