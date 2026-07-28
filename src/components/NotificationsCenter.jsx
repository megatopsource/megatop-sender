import React, { useState, useEffect } from 'react';
import { Bell, MapPin, CheckCircle2, LogOut, X, ExternalLink, Clock } from 'lucide-react';

export default function NotificationsCenter({ notifications, onClearNotifications, onMarkAsRead }) {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Request Web Browser Desktop Notification Permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            onMarkAsRead();
          }
        }}
        className="relative p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
        title="إشعارات المأموريات اللحظية (Check-In & Check-Out Alerts)"
      >
        <Bell className="w-5 h-5 text-amber-400" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse border-2 border-slate-950 shadow-lg shadow-rose-500/50">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden space-y-2 divide-y divide-slate-800">
          <div className="p-4 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white text-xs">إشعارات المأموريات الجغرافية اللحظية</span>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={onClearNotifications}
                className="text-[11px] text-slate-400 hover:text-rose-400"
              >
                مسح الكل
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-2xl transition space-y-1 text-xs ${
                    !notif.read ? 'bg-indigo-950/40 border border-indigo-500/30' : 'bg-slate-950/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      notif.type === 'check-in' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {notif.type === 'check-in' ? '🟢 CHECK IN' : '🔴 CHECK OUT'}
                    </span>

                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {notif.time}
                    </span>
                  </div>

                  <div className="font-bold text-slate-100">
                    👤 {notif.userName} <span className="text-slate-400 font-normal">({notif.userRole})</span>
                  </div>

                  <div className="text-[11px] text-slate-300">
                    📍 المكان/العميل: <strong className="text-amber-300">{notif.clientName}</strong> ({notif.region})
                  </div>

                  {notif.notes && <div className="text-[11px] text-slate-400">💬 {notif.notes}</div>}

                  {notif.googleMapsUrl && (
                    <a
                      href={notif.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-rose-400 hover:underline flex items-center gap-1 text-[11px] font-mono pt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>فتح الموقع على Google Maps</span>
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                لا توجد إشعارات جديدة.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
