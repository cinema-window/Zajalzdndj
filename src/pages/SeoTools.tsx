import React, { useState } from 'react';
import { Globe, FileCode2, Copy, Check, Download, RefreshCw } from 'lucide-react';
import { generateSitemapXmlApi } from '../services/seoService';

export const SeoTools: React.FC = () => {
  const [sitemapXml, setSitemapXml] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const xml = await generateSitemapXmlApi();
    setSitemapXml(xml);
    setLoading(false);
  };

  const handleCopy = () => {
    if (!sitemapXml) return;
    navigator.clipboard.writeText(sitemapXml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!sitemapXml) return;
    const blob = new Blob([sitemapXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold flex-shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">أدوات تحسين محركات البحث SEO وتوليد خريطة الموقع Sitemap</h2>
            <p className="text-xs text-slate-400 mt-1">
              توليد خريطة XML حقيقية ومحدثة تلقائياً لكافة صفحات الأفلام والمسلسلات والصفحات الرئيسية لرفع أرشفة جوجل.
            </p>
          </div>
        </div>
      </div>

      {/* Generator Control Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-emerald-400" />
              <span>مولد ملف sitemap.xml المباشر</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">اضغط لتوليد كود الخريطة مستخرجاً من أفلام وحلقات Supabase الحالية</p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>جاري استخراج الروابط وتوليد XML...</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 fill-slate-950" />
                <span>توليد خريطة الموقع Sitemap الآن</span>
              </>
            )}
          </button>
        </div>

        {sitemapXml && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">معاينة كود sitemap.xml:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ الكود'}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل sitemap.xml</span>
                </button>
              </div>
            </div>

            <textarea
              readOnly
              rows={12}
              value={sitemapXml}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-emerald-400 leading-relaxed focus:outline-none"
            />
          </div>
        )}
      </div>

    </div>
  );
};
