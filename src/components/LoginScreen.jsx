import React, { useState } from 'react';
import { Lock, User, Key, ShieldCheck, ArrowLeft, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginScreen({ users, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('يرجى كتابة اسم المستخدم وكلمة السر');
      return;
    }

    const inputLower = username.trim().toLowerCase();
    const foundUser = users.find(u =>
      (u.username && u.username.toLowerCase() === inputLower) ||
      (u.email && u.email.toLowerCase() === inputLower) ||
      (u.name && u.name.toLowerCase().includes(inputLower)) ||
      (u.phone && u.phone === inputLower)
    );

    if (!foundUser) {
      setErrorMessage('اسم المستخدم أو البريد غير موجود في النظام');
      return;
    }

    if (foundUser.password && foundUser.password !== password.trim()) {
      setErrorMessage('كلمة السر غير صحيحة. حاول مجدداً');
      return;
    }

    if (foundUser.active === false) {
      setErrorMessage('هذا الحساب معطل من قِبل الأدمن');
      return;
    }

    onLoginSuccess(foundUser);
  };

  // Quick One-Click Demo Login Helper
  const handleQuickDemoLogin = (userRole) => {
    const demoUser = users.find(u => u.role === userRole) || users[0];
    onLoginSuccess(demoUser);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-indigo-500 selection:text-white dir-rtl" dir="rtl">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative z-10 backdrop-blur-xl">

        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <img
            src="/logo.png"
            alt="MEGATOP"
            className="w-16 h-16 object-contain rounded-2xl bg-white p-1 mx-auto border border-slate-700 shadow-xl"
          />
          <h1 className="text-2xl font-black tracking-wide text-white">megatop.com.eg</h1>
          <p className="text-xs text-slate-400">تسجيل الدخول للموظفين والمديرين للوصول للنظام</p>
        </div>

        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 p-3 rounded-2xl text-xs font-bold text-center animate-shake">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">اسم المستخدم / البريد الإلكتروني / الهاتف</label>
            <div className="relative">
              <User className="w-4 h-4 absolute right-3.5 top-3 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم (مثال: admin أو user1)..."
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">كلمة السر (Password)</label>
            <div className="relative">
              <Key className="w-4 h-4 absolute right-3.5 top-3 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-10 pl-10 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-3 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>تسجيل الدخول للنظام</span>
          </button>
        </form>

        {/* Quick Demo Login Chips */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>تسجيل دخول تجريبي سريع للاختبار بنقرة واحدة:</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickDemoLogin('admin')}
              className="bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/30 text-indigo-300 py-2 rounded-xl font-bold flex items-center justify-center gap-1"
            >
              👑 حساب الأدمن
            </button>

            <button
              onClick={() => handleQuickDemoLogin('sales')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2 rounded-xl font-bold flex items-center justify-center gap-1"
            >
              👤 حساب السيلز
            </button>

            <button
              onClick={() => handleQuickDemoLogin('accountant')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2 rounded-xl font-bold flex items-center justify-center gap-1"
            >
              📊 المحاسب
            </button>

            <button
              onClick={() => handleQuickDemoLogin('collector')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2 rounded-xl font-bold flex items-center justify-center gap-1"
            >
              💵 مسئول التحصيل
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
