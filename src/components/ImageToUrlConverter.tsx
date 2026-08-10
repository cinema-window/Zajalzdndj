import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Copy, Check, Sparkles, RefreshCw, Link as LinkIcon, FileImage, ShieldCheck, Zap, ExternalLink, Key, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import { uploadImageToPublicHostApi, extractDirectImageUrl, updateSeriesImagesApi } from '../services/apiService';

interface ImageToUrlConverterProps {
  onApplyUrls?: (urls: { posterUrl: string; backdropUrl: string }) => void;
  initialPosterUrl?: string;
  initialBackdropUrl?: string;
}

export const ImageToUrlConverter: React.FC<ImageToUrlConverterProps> = ({
  onApplyUrls,
  initialPosterUrl = '',
  initialBackdropUrl = ''
}) => {
  const [posterUrl, setPosterUrl] = useState<string>(initialPosterUrl);
  const [backdropUrl, setBackdropUrl] = useState<string>(initialBackdropUrl);

  const [posterFileName, setPosterFileName] = useState<string>('');
  const [backdropFileName, setBackdropFileName] = useState<string>('');

  const [isProcessingPoster, setIsProcessingPoster] = useState<boolean>(false);
  const [isProcessingBackdrop, setIsProcessingBackdrop] = useState<boolean>(false);
  const [posterError, setPosterError] = useState<string>('');
  const [backdropError, setBackdropError] = useState<string>('');

  const [copiedType, setCopiedType] = useState<'poster' | 'backdrop' | null>(null);
  
  // Custom ImgBB API Key
  const [imgbbApiKey, setImgbbApiKey] = useState<string>('e9e89619f148fc6d25c412c38bd47977');
  const [showKeyInput, setShowKeyInput] = useState<boolean>(true);

  // Raw Link Extractor Inputs
  const [rawPosterInput, setRawPosterInput] = useState<string>('');
  const [rawBackdropInput, setRawBackdropInput] = useState<string>('');

  // Series Instant Image Sync State
  const [syncSeriesTarget, setSyncSeriesTarget] = useState<string>('digital-circus');
  const [customSyncName, setCustomSyncName] = useState<string>('');
  const [isSyncingSeries, setIsSyncingSeries] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>('');

  const handleSyncToAllSeriesEpisodes = async () => {
    if (!posterUrl && !backdropUrl) {
      setSyncStatus('⚠️ يرجى رفع أو استخراج صورة البوستر أو الخلفية أولاً!');
      return;
    }

    setIsSyncingSeries(true);
    setSyncStatus('جاري تحديث الصور عبر جميع حلقات المسلسل...');

    let seriesId = syncSeriesTarget;
    let seriesNameAr = '';

    if (syncSeriesTarget === 'digital-circus') {
      seriesNameAr = 'السيرك الرقمي';
    } else if (syncSeriesTarget === 'bab-alhara-series') {
      seriesNameAr = 'باب الحارة';
    } else if (syncSeriesTarget === 'murder-drones') {
      seriesNameAr = 'Murder Drones';
    } else if (syncSeriesTarget === 'ask-mantik-series') {
      seriesNameAr = 'عشق منطق انتقام';
    } else if (syncSeriesTarget === 'custom') {
      seriesId = customSyncName.trim();
      seriesNameAr = customSyncName.trim();
    }

    try {
      const res = await updateSeriesImagesApi(seriesId, posterUrl, backdropUrl, seriesNameAr);
      if (res.success) {
        setSyncStatus(`✅ تم تطبيق الصور وتحديث جميع حلقات المسلسل (${seriesNameAr || seriesId}) بنجاح عبر المنصة!`);
      } else {
        setSyncStatus('❌ متعذر تطبيق الصور على المسلسل');
      }
    } catch {
      setSyncStatus('❌ حدث خطأ في تحديث صور المسلسل');
    } finally {
      setIsSyncingSeries(false);
    }
  };

  // Upload & extract real direct HTTPS URL
  const processImageFile = async (
    file: File,
    type: 'poster' | 'backdrop'
  ) => {
    if (type === 'poster') {
      setIsProcessingPoster(true);
      setPosterError('');
    } else {
      setIsProcessingBackdrop(true);
      setBackdropError('');
    }

    try {
      const res = await uploadImageToPublicHostApi(file, type, imgbbApiKey);
      if (res.success && res.url) {
        if (type === 'poster') {
          setPosterUrl(res.url);
          setPosterFileName(file.name);
        } else {
          setBackdropUrl(res.url);
          setBackdropFileName(file.name);
        }

        if (onApplyUrls) {
          onApplyUrls({
            posterUrl: type === 'poster' ? res.url : posterUrl,
            backdropUrl: type === 'backdrop' ? res.url : backdropUrl
          });
        }
      } else {
        const err = res.error || 'فشل رفع الصورة على الخادم الأونلاين';
        if (type === 'poster') setPosterError(err);
        else setBackdropError(err);
      }
    } catch (err: any) {
      console.error('Failed to convert image:', err);
      const errMsg = 'حدث خطأ أثناء الاتصال بخادم رفع الصور المباشر';
      if (type === 'poster') setPosterError(errMsg);
      else setBackdropError(errMsg);
    } finally {
      if (type === 'poster') setIsProcessingPoster(false);
      else setIsProcessingBackdrop(false);
    }
  };

  // Convert raw Web URLs to direct image URLs
  const handleExtractFromUrl = (type: 'poster' | 'backdrop', rawUrl: string) => {
    if (!rawUrl) return;
    const direct = extractDirectImageUrl(rawUrl);
    if (type === 'poster') {
      setPosterUrl(direct);
      setPosterFileName('رابط_مستخرج');
    } else {
      setBackdropUrl(direct);
      setBackdropFileName('رابط_مستخرج');
    }

    if (onApplyUrls) {
      onApplyUrls({
        posterUrl: type === 'poster' ? direct : posterUrl,
        backdropUrl: type === 'backdrop' ? direct : backdropUrl
      });
    }
  };

  const handleCopy = (url: string, type: 'poster' | 'backdrop') => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Quick Presets with HTTP 200 Verified Direct Links
  const applyPreset = (preset: 'digital-circus' | 'murder-drones') => {
    let p = '';
    let b = '';

    if (preset === 'digital-circus') {
      p = 'https://img.youtube.com/vi/HwAPLk_sQ3w/hqdefault.jpg';
      b = 'https://img.youtube.com/vi/HwAPLk_sQ3w/maxresdefault.jpg';
      setPosterFileName('السيرك_الرقمي_بوستر.jpg');
      setBackdropFileName('السيرك_الرقمي_خلفية.jpg');
    } else if (preset === 'murder-drones') {
      p = 'https://img.youtube.com/vi/mImFz8mkaHo/hqdefault.jpg';
      b = 'https://img.youtube.com/vi/mImFz8mkaHo/maxresdefault.jpg';
      setPosterFileName('ريبوت_القتال_بوستر.jpg');
      setBackdropFileName('ريبوت_القتال_خلفية.jpg');
    }

    setPosterUrl(p);
    setBackdropUrl(b);

    if (onApplyUrls) {
      onApplyUrls({ posterUrl: p, backdropUrl: b });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl dir-rtl text-right">
      
      {/* Header Title & Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>مُحول ومستخرج صور ImgBB والروابط المباشرة (ImgBB & Direct URL Extractor)</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>i.ibb.co روابط أونلاين 100%</span>
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              رفع الصور واستخراج روابط مباشرة عبر موقع ImgBB (https://imgbb.com) وi.ibb.co، أو استخراج صور اليوتيوب وجوجل درايف بضغطة زر.
            </p>
          </div>
        </div>

        {/* Quick Presets & ImgBB Link */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://imgbb.com/"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            title="زيارة موقع ImgBB لرفع الصور وتوليد مفتاح API مجاني"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>موقع ImgBB.com</span>
          </a>

          <button
            onClick={() => applyPreset('digital-circus')}
            className="px-3.5 py-2 bg-gradient-to-r from-red-600/20 to-blue-600/20 hover:from-red-600/30 hover:to-blue-600/30 border border-red-500/30 text-amber-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>بوستر وخلفية السيرك الرقمي</span>
          </button>

          <button
            onClick={() => applyPreset('murder-drones')}
            className="px-3.5 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>بوستر وخلفية ريبوت القتال</span>
          </button>

          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="إدخال مفتاح ImgBB API"
          >
            <Key className="w-3.5 h-3.5 text-slate-400" />
            <span>مفتاح ImgBB</span>
          </button>
        </div>
      </div>

      {/* Custom ImgBB Key Drawer */}
      {showKeyInput && (
        <div className="bg-slate-950/90 border border-blue-500/40 rounded-2xl p-4 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-blue-400 flex items-center gap-2">
              <Key className="w-4 h-4" />
              <span>مفتاح ImgBB API (استضافة دائمية وسريعة على i.ibb.co):</span>
            </label>
            <a
              href="https://api.imgbb.com/"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-blue-300 hover:text-blue-200 underline flex items-center gap-1"
            >
              <span>احصل على مفتاح مجاني من api.imgbb.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={imgbbApiKey}
              onChange={(e) => setImgbbApiKey(e.target.value)}
              placeholder="ضع مفتاح ImgBB API الخاص بك هنا..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none font-mono"
            />
          </div>
        </div>
      )}

      {/* Grid: 2 Image Upload / Link Extraction Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Zone 1: Poster Image */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 flex items-center gap-2">
                <FileImage className="w-4 h-4" />
                <span>1. صورة البوستر (Poster Image - عمودية)</span>
              </span>
              {posterFileName && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 truncate max-w-[120px]">
                  {posterFileName}
                </span>
              )}
            </div>

            {/* Drag & Drop File Upload */}
            <label className="relative border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[160px] cursor-pointer transition-all bg-slate-900/40 group overflow-hidden">
              {posterUrl ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden group">
                  <img src={posterUrl} alt="Poster Preview" className="w-full h-full object-cover rounded-xl" />
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                    <Upload className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold text-white">تغيير صورة البوستر</span>
                  </div>
                  <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>رابط أونلاين فعال</span>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2 py-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-slate-200">اضغط لاختيار صورة البوستر من جهازك</div>
                  <div className="text-[10px] text-slate-400">سيتم الرفع وتحويل الصورة لرابط أونلاين مباشر خلال ثانية واحدة ⚡</div>
                </div>
              )}

              {isProcessingPoster && (
                <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center gap-2 text-amber-400 text-xs font-bold">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span>جاري رفع الصورة وتوليد الرابط المباشر...</span>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) processImageFile(file, 'poster');
                }}
                className="hidden"
              />
            </label>

            {posterError && (
              <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{posterError}</span>
              </div>
            )}

            {/* Alternative: Extract Direct Link from Raw Web URL */}
            <div className="pt-2 border-t border-slate-900 space-y-2">
              <label className="text-[11px] text-slate-400 block font-bold">أو استخرج رابط البوستر من رابط صفحة/يوتيوب:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={rawPosterInput}
                  onChange={(e) => setRawPosterInput(e.target.value)}
                  placeholder="ضع رابط يوتيوب أو Google Drive أو صورة..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-slate-200 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => handleExtractFromUrl('poster', rawPosterInput)}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>استخراج</span>
                </button>
              </div>
            </div>
          </div>

          {/* Generated Link Input & Actions */}
          <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
            <label className="text-[11px] text-amber-400 font-bold block">الرابط المستخرج للبوستر (Direct URL):</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={posterUrl}
                placeholder="سيظهر الرابط الفعّال هنا بعد الرفع..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[11px] font-mono text-emerald-300 focus:outline-none"
              />
              <button
                onClick={() => handleCopy(posterUrl, 'poster')}
                disabled={!posterUrl}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {copiedType === 'poster' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'poster' ? 'تم' : 'نسخ'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Zone 2: Backdrop Image */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span>2. صورة خلفية الحلقة (Backdrop Image - أفقية)</span>
              </span>
              {backdropFileName && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 truncate max-w-[120px]">
                  {backdropFileName}
                </span>
              )}
            </div>

            {/* Drag & Drop File Upload */}
            <label className="relative border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[160px] cursor-pointer transition-all bg-slate-900/40 group overflow-hidden">
              {backdropUrl ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden group">
                  <img src={backdropUrl} alt="Backdrop Preview" className="w-full h-full object-cover rounded-xl" />
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                    <Upload className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold text-white">تغيير صورة الخلفية</span>
                  </div>
                  <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>رابط أونلاين فعال</span>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2 py-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-slate-200">اضغط لاختيار صورة خلفية الحلقة من جهازك</div>
                  <div className="text-[10px] text-slate-400">سيتم الرفع وتحويل الصورة لرابط أونلاين مباشر خلال ثانية واحدة ⚡</div>
                </div>
              )}

              {isProcessingBackdrop && (
                <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center gap-2 text-amber-400 text-xs font-bold">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span>جاري رفع الصورة وتوليد الرابط المباشر...</span>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) processImageFile(file, 'backdrop');
                }}
                className="hidden"
              />
            </label>

            {backdropError && (
              <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{backdropError}</span>
              </div>
            )}

            {/* Alternative: Extract Direct Link from Raw Web URL */}
            <div className="pt-2 border-t border-slate-900 space-y-2">
              <label className="text-[11px] text-slate-400 block font-bold">أو استخرج رابط الخلفية من رابط صفحة/يوتيوب:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={rawBackdropInput}
                  onChange={(e) => setRawBackdropInput(e.target.value)}
                  placeholder="ضع رابط يوتيوب أو Google Drive أو صورة..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-slate-200 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => handleExtractFromUrl('backdrop', rawBackdropInput)}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>استخراج</span>
                </button>
              </div>
            </div>
          </div>

          {/* Generated Link Input & Actions */}
          <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
            <label className="text-[11px] text-amber-400 font-bold block">الرابط المستخرج للخلفية (Direct URL):</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={backdropUrl}
                placeholder="سيظهر الرابط الفعّال هنا بعد الرفع..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[11px] font-mono text-emerald-300 focus:outline-none"
              />
              <button
                onClick={() => handleCopy(backdropUrl, 'backdrop')}
                disabled={!backdropUrl}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {copiedType === 'backdrop' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'backdrop' ? 'تم' : 'نسخ'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Action Apply Button */}
      {onApplyUrls && (posterUrl || backdropUrl) && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onApplyUrls({ posterUrl, backdropUrl })}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition-all flex items-center gap-2 cursor-pointer transform hover:scale-[1.01]"
          >
            <ShieldCheck className="w-4 h-4 fill-slate-950 text-amber-500" />
            <span>تطبيق الروابط المستخرجة تلقائياً على نموذج الاستيراد/الإضافة</span>
          </button>
        </div>
      )}

      {/* Instant Series Image Sync Card */}
      {(posterUrl || backdropUrl) && (
        <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-amber-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>مزامنة وتطبيق الصورة على كل حلقات المسلسل تلقائياً ⚡</span>
            </h4>
            <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold">
              تطبيق فوري على جميع الحلقات
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            عند تغيير البوستر أو صورة الخلفية، اضغط هنا لتطبيق هذه الصور فوراً وبلمسة واحدة على كافة حلقات المسلسل:
          </p>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <select
              value={syncSeriesTarget}
              onChange={(e) => setSyncSeriesTarget(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="digital-circus">🎪 مسلسل السيرك الرقمي (Digital Circus)</option>
              <option value="bab-alhara-series">🚪 مسلسل باب الحارة (Bab Al Hara)</option>
              <option value="murder-drones">🤖 مسلسل Murder Drones (قتلة الطائرات)</option>
              <option value="ask-mantik-series">❤️ مسلسل عشق منطق انتقام</option>
              <option value="custom">✍️ اسم مسلسل آخر...</option>
            </select>

            {syncSeriesTarget === 'custom' && (
              <input
                type="text"
                value={customSyncName}
                onChange={(e) => setCustomSyncName(e.target.value)}
                placeholder="أدخل اسم المسلسل بالعربي أو الإنجليزي..."
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 flex-grow"
              />
            )}

            <button
              onClick={handleSyncToAllSeriesEpisodes}
              disabled={isSyncingSeries}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              {isSyncingSeries ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>جاري المزامنة...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-slate-950 text-emerald-500" />
                  <span>تحديث جميع الحلقات بنفس الصور الآن 🚀</span>
                </>
              )}
            </button>
          </div>

          {syncStatus && (
            <div className={`text-xs font-bold p-3 rounded-xl border ${syncStatus.includes('✅') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-900 border-slate-800 text-amber-400'}`}>
              {syncStatus}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
