import React, { useState } from 'react';
import { Bot, Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { sendTelegramNotificationApi } from '../services/apiService';

export const Telegram: React.FC = () => {
  const [botToken, setBotToken] = useState(import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '');
  const [chatId, setChatId] = useState(import.meta.env.VITE_TELEGRAM_CHAT_ID || '');
  const [testMessage, setTestMessage] = useState('🎬 إشعار جديد من منصة Cinema Window: تم إضافة فيلم جديد!');

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botToken || !chatId) {
      setStatusMsg({ type: 'error', text: 'يرجى إدخال توكن البوت (Bot Token) ورقم المعرف (Chat ID)' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    const res = await sendTelegramNotificationApi(testMessage, botToken, chatId);
    setLoading(false);

    if (res.success) {
      setStatusMsg({ type: 'success', text: '✅ تم إرسال الإشعار بنجاح إلى القناة / البوت على تليجرام!' });
    } else {
      setStatusMsg({ type: 'error', text: `❌ فشل الإرسال: ${res.error}` });
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold flex-shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">إعدادات إشعارات بوت تليجرام (Telegram Notifications)</h2>
            <p className="text-xs text-slate-400 mt-1">
              إرسال إشعارات تلقائية فورية للمشتركين عند نشر أية أفلام أو حلقات جديدة على الموقع.
            </p>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold ${
          statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Configuration Form */}
      <form onSubmit={handleSendTest} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-black text-amber-400">إعدادات الاتصال بالبوت</h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">رمز توكن البوت (Telegram Bot Token)</label>
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="مثال: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">يمكنك الحصول على التوكن من BotFather في تليجرام</p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">معرّف القناة أو الدردشة (Chat / Channel ID)</label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="مثال: -1001234567890 أو @CinemaWindowChannel"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">نص الرسالة التجريبية للإرسال</label>
            <textarea
              rows={3}
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>جاري الاتصال وسيرفر تليجرام...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 fill-slate-950" />
                <span>إرسال إشعار تجريبي للتليجرام</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
