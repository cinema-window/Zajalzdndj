import React, { useState, useMemo, useEffect } from 'react';
import { MovieItem, EpisodeItem } from '../types';
import { fetchEpisodesApi, bulkUpsertEpisodesApi } from '../services/apiService';
import { FileText, Upload, CheckCircle2, AlertTriangle, Layers, Play, RefreshCw, Database, Sparkles } from 'lucide-react';
import { ImageToUrlConverter } from './ImageToUrlConverter';

interface TxtEpisodeImporterProps {
  movies: MovieItem[];
  onRefreshMovies?: () => void;
}

interface ParsedEpisodeItem {
  episodeNumber: number;
  title: string;
  embedUrl: string;
  videoUrl: string;
  status: 'new' | 'exists' | 'invalid';
  rawLine: string;
}

export const TxtEpisodeImporter: React.FC<TxtEpisodeImporterProps> = ({ movies, onRefreshMovies }) => {
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('');
  const [customSeriesId, setCustomSeriesId] = useState<string>('');
  const [seriesNameAr, setSeriesNameAr] = useState<string>('');
  const [seasonNumber, setSeasonNumber] = useState<number>(1);
  const [categoryAr, setCategoryAr] = useState<string>('مسلسلات');

  const [rawText, setRawText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  const [sharedPosterUrl, setSharedPosterUrl] = useState<string>('');
  const [sharedBackdropUrl, setSharedBackdropUrl] = useState<string>('');
  const [sharedDescription, setSharedDescription] = useState<string>('');
  const [sharedReleaseYear, setSharedReleaseYear] = useState<string>(new Date().getFullYear().toString());
  const [titleFormatOption, setTitleFormatOption] = useState<'url_extracted' | 'series_ep' | 'ep_only'>('url_extracted');

  const [existingEpisodes, setExistingEpisodes] = useState<EpisodeItem[]>([]);
  const [isLoadingExisting, setIsLoadingExisting] = useState<boolean>(false);

  const [manualEdits, setManualEdits] = useState<Record<number, { episodeNumber?: number; title?: string }>>({});

  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishProgress, setPublishProgress] = useState<{ current: number; total: number } | null>(null);
  const [importReport, setImportReport] = useState<{
    total: number;
    inserted: number;
    failed: number;
    errors: { episodeNumber: number; error: string }[];
  } | null>(null);

  const seriesList = useMemo(() => {
    const map = new Map<string, { id: string; nameAr: string; poster?: string; backdrop?: string }>();
    movies.forEach(m => {
      const sId = m.seriesId || m.id;
      if (!map.has(sId)) {
        map.set(sId, {
          id: sId,
          nameAr: m.seriesNameAr || m.titleAr,
          poster: m.posterUrl || m.thumbnail,
          backdrop: m.backdropUrl
        });
      }
    });
    return Array.from(map.values());
  }, [movies]);

  const handleSeriesSelect = (sId: string) => {
    setSelectedSeriesId(sId);
    if (sId === 'custom') {
      setSeriesNameAr('');
      return;
    }
    const found = seriesList.find(s => s.id === sId);
    if (found) {
      setSeriesNameAr(found.nameAr);
      if (found.poster) setSharedPosterUrl(found.poster);
      if (found.backdrop) setSharedBackdropUrl(found.backdrop);
    }
  };

  const currentSeriesId = selectedSeriesId === 'custom' ? customSeriesId.trim() : selectedSeriesId;

  useEffect(() => {
    if (!currentSeriesId) return;
    setIsLoadingExisting(true);
    fetchEpisodesApi(currentSeriesId, seasonNumber)
      .then(eps => {
        setExistingEpisodes(eps);
      })
      .catch(err => console.error('Failed fetching existing episodes:', err))
      .finally(() => setIsLoadingExisting(false));
  }, [currentSeriesId, seasonNumber]);

  const existingEpisodeSet = useMemo(() => {
    return new Set(existingEpisodes.map(e => e.episodeNumber));
  }, [existingEpisodes]);

  const parsedEpisodes: ParsedEpisodeItem[] = useMemo(() => {
    if (!rawText.trim()) return [];

    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const parsed: ParsedEpisodeItem[] = [];

    lines.forEach((line, index) => {
      let epNum: number | null = null;
      let url = '';
      let extractedTitleFromUrl = '';

      const urlMatch = line.match(/(https?:\/\/[^\s|]+)/i);
      if (urlMatch) {
        url = urlMatch[1];
      }

      const cleanLineForText = line.replace(/(https?:\/\/[^\s|]+)/gi, '').trim();

      let decodedUrl = url;
      if (url) {
        try {
          decodedUrl = decodeURIComponent(url);
        } catch {}
      }

      const arTextMatch = cleanLineForText.match(/(?:الحلقة|حلقة)\s*(\d+)/i);
      const enTextMatch = cleanLineForText.match(/(?:ep|episode)\s*(\d+)/i);
      const leadTextMatch = cleanLineForText.match(/^(\d+)\s*[-:|]/);

      const arUrlMatch = decodedUrl.match(/(?:الحلقة|حلقة)\s*[-_=\s]*(\d+)/i);
      const enUrlMatch = decodedUrl.match(/(?:episode|epizod|ep|halqa|halqah|h)\s*[-_=\s]*(\d+)/i);
      const queryEpMatch = decodedUrl.match(/(?:\?|&)(?:ep|episode|epnum|h|e|number|v)=(\d+)/i);
      const slugEpMatch = decodedUrl.match(/[-_\/](?:e|s\d+e|ep|h)(\d+)(?:[-_.\/?#]|$)/i);
      const trailingNumberMatch = decodedUrl.match(/[-_\/](\d+)(?:\.[a-z0-9]{2,4})?(?:\?|#|$)/i);

      if (arTextMatch) {
        epNum = parseInt(arTextMatch[1], 10);
      } else if (enTextMatch) {
        epNum = parseInt(enTextMatch[1], 10);
      } else if (leadTextMatch) {
        epNum = parseInt(leadTextMatch[1], 10);
      } else if (arUrlMatch) {
        epNum = parseInt(arUrlMatch[1], 10);
      } else if (enUrlMatch) {
        epNum = parseInt(enUrlMatch[1], 10);
      } else if (queryEpMatch) {
        epNum = parseInt(queryEpMatch[1], 10);
      } else if (slugEpMatch) {
        epNum = parseInt(slugEpMatch[1], 10);
      } else if (trailingNumberMatch) {
        epNum = parseInt(trailingNumberMatch[1], 10);
      } else {
        const anyNumMatch = cleanLineForText.match(/\d+/);
        if (anyNumMatch) {
          epNum = parseInt(anyNumMatch[0], 10);
        } else {
          epNum = index + 1;
        }
      }

      let cleanTitle = cleanLineForText
        .replace(/^[-:|]+|[-:|]+$/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if ((!cleanTitle || cleanTitle === String(epNum)) && url) {
        try {
          const urlObj = new URL(url);
          const queryTitle = urlObj.searchParams.get('title') || urlObj.searchParams.get('name') || urlObj.searchParams.get('t');
          if (queryTitle) {
            extractedTitleFromUrl = decodeURIComponent(queryTitle).replace(/[-_+]/g, ' ').trim();
          } else {
            const pathname = urlObj.pathname.replace(/\/+$/, '');
            const lastSegment = pathname.split('/').pop() || '';
            if (lastSegment && !lastSegment.match(/^(watch|play|video|embed|index\.[a-z]+)$/i)) {
              const cleanSegment = decodeURIComponent(lastSegment)
                .replace(/\.[a-z0-9]{2,4}$/i, '')
                .replace(/[-_+]/g, ' ')
                .trim();
              if (cleanSegment) {
                extractedTitleFromUrl = cleanSegment;
              }
            }
          }
        } catch {}

        if (extractedTitleFromUrl) {
          cleanTitle = extractedTitleFromUrl;
        }
      }

      if (titleFormatOption === 'series_ep') {
        cleanTitle = seriesNameAr ? `${seriesNameAr} - الحلقة ${epNum}` : `الحلقة ${epNum}`;
      } else if (titleFormatOption === 'ep_only') {
        cleanTitle = `الحلقة ${epNum}`;
      } else if (!cleanTitle || cleanTitle === String(epNum)) {
        cleanTitle = seriesNameAr ? `${seriesNameAr} - الحلقة ${epNum}` : `الحلقة ${epNum}`;
      }

      const manualEdit = manualEdits[index];
      if (manualEdit) {
        if (manualEdit.episodeNumber !== undefined) epNum = manualEdit.episodeNumber;
        if (manualEdit.title !== undefined) cleanTitle = manualEdit.title;
      }

      const isExists = existingEpisodeSet.has(epNum);

      parsed.push({
        episodeNumber: epNum,
        title: cleanTitle,
        embedUrl: url,
        videoUrl: url,
        status: isExists ? 'exists' : (url || cleanTitle ? 'new' : 'invalid'),
        rawLine: line
      });
    });

    const map = new Map<number, ParsedEpisodeItem>();
    parsed.forEach(p => map.set(p.episodeNumber, p));
    const result = Array.from(map.values());
    result.sort((a, b) => a.episodeNumber - b.episodeNumber);

    return result;
  }, [rawText, existingEpisodeSet, titleFormatOption, seriesNameAr, manualEdits]);

  const missingNumbers = useMemo(() => {
    if (parsedEpisodes.length < 2) return [];
    const nums = parsedEpisodes.map(p => p.episodeNumber).sort((a, b) => a - b);
    const min = nums[0];
    const max = nums[nums.length - 1];
    const presentSet = new Set(nums);
    const missing: number[] = [];

    for (let i = min; i <= max; i++) {
      if (!presentSet.has(i)) {
        missing.push(i);
      }
    }
    return missing;
  }, [parsedEpisodes]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setRawText(content);
      }
    };
    reader.readAsText(file);
  };

  const handlePublishAll = async () => {
    if (!currentSeriesId) {
      alert('يرجى اختيار أو كتابة معرف المسلسل (Series ID) أولاً');
      return;
    }
    if (parsedEpisodes.length === 0) {
      alert('لم يتم العثور على أي حلقات صالحة للاستيراد');
      return;
    }

    setIsPublishing(true);
    setPublishProgress({ current: 0, total: parsedEpisodes.length });
    setImportReport(null);

    const payloadList: Partial<EpisodeItem>[] = parsedEpisodes.map(ep => ({
      seriesId: currentSeriesId,
      seriesNameAr: seriesNameAr || currentSeriesId,
      seasonNumber: seasonNumber,
      episodeNumber: ep.episodeNumber,
      title: ep.title,
      embedUrl: ep.embedUrl,
      videoUrl: ep.videoUrl,
      description: sharedDescription || `الحلقة ${ep.episodeNumber} من ${seriesNameAr || currentSeriesId}`,
      posterUrl: sharedPosterUrl,
      backdropUrl: sharedBackdropUrl,
      categoryAr: categoryAr,
      releaseYear: sharedReleaseYear,
      published: true
    }));

    try {
      const result = await bulkUpsertEpisodesApi(payloadList, (processed, total) => {
        setPublishProgress({ current: processed, total });
      });

      setImportReport({
        total: result.total,
        inserted: result.inserted,
        failed: result.failed,
        errors: result.errors
      });

      const updated = await fetchEpisodesApi(currentSeriesId, seasonNumber);
      setExistingEpisodes(updated);
      if (onRefreshMovies) {
        onRefreshMovies();
      }
    } catch (err: any) {
      alert('حدث خطأ أثناء رفع الحلقات: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setIsPublishing(false);
      setPublishProgress(null);
    }
  };

  return (
    <div className="space-y-6 text-right dir-rtl">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0 shadow-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>أداة استيراد الحلقات الجماعي من ملف TXT</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-bold">
                تلقائية وذكية ⚡
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              قم برفع أو لصق ملف نصي يحتوي على روابط الحلقات والعناوين. تقوم الأداة بتحليل الملف واستخراج أرقام الحلقات ونشرها دفعة واحدة في قاعدة البيانات.
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Series & Season Setup */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          <span>1. تحديد المسلسل والموسم</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] text-slate-400 font-bold block mb-1.5">
              اختر المسلسل
            </label>
            <select
              value={selectedSeriesId}
              onChange={(e) => handleSeriesSelect(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">-- اختر المسلسل --</option>
              {seriesList.map(s => (
                <option key={s.id} value={s.id}>{s.nameAr} ({s.id})</option>
              ))}
              <option value="custom">+ إضافة مسلسل جديد / معرف مخصص</option>
            </select>
          </div>

          {selectedSeriesId === 'custom' && (
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1.5">
                معرّف المسلسل الإنجليزي (Series ID)
              </label>
              <input
                type="text"
                value={customSeriesId}
                onChange={(e) => setCustomSeriesId(e.target.value)}
                placeholder="مثال: wadi-alziab-s1"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] text-slate-400 font-bold block mb-1.5">
              اسم المسلسل بالعربية
            </label>
            <input
              type="text"
              value={seriesNameAr}
              onChange={(e) => setSeriesNameAr(e.target.value)}
              placeholder="مثال: مسلسل وادي الذئاب"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-bold block mb-1.5">
              رقم الموسم (Season Number)
            </label>
            <input
              type="number"
              min={1}
              value={seasonNumber}
              onChange={(e) => setSeasonNumber(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {currentSeriesId && (
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              الحلقات المسجلة حالياً للموسم ({seasonNumber}) في قاعدة البيانات:
            </span>
            <span className="font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              {isLoadingExisting ? 'جارٍ الفحص...' : `${existingEpisodes.length} حلقة`}
            </span>
          </div>
        )}
      </div>

      {/* Step 2: TXT Content Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span>2. رفع أو لصق محتوى ملف TXT</span>
          </h3>

          <label className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl font-bold text-xs hover:opacity-90 transition-all cursor-pointer flex items-center gap-2 shadow-md">
            <Upload className="w-3.5 h-3.5" />
            <span>{fileName ? `تم تحميل: ${fileName}` : 'اختر ملف TXT من جهازك'}</span>
            <input type="file" accept=".txt,.log,.json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        <textarea
          rows={6}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={`ألصق المحتوى النصي هنا مباشرة...\nأمثلة على التنسیقات المدعومة:\n1 - الحلقة الأولى - https://embed.com/e1\nالحلقة 02: عنوان الحلقة | https://embed.com/e2\n03 | https://embed.com/e3\nhttps://embed.com/e4 (سيتم تحليله تلقائياً كـ الحلقة 4)`}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed"
        />
      </div>

      {/* Step 3: Shared Metadata Override & Title Naming Rule */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>3. خيارات تسمية العناوين والبيانات المشتركة</span>
        </h3>

        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
          <label className="text-[11px] text-amber-400 font-bold block">
            نمط استخراج وصياغة عنوان الحلقة:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
              titleFormatOption === 'url_extracted' ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}>
              <input
                type="radio"
                name="titleFormat"
                value="url_extracted"
                checked={titleFormatOption === 'url_extracted'}
                onChange={() => setTitleFormatOption('url_extracted')}
                className="accent-amber-500"
              />
              <span>تلقائي (تفريغ العنوان ورقم الحلقة من الرابط مباشرة)</span>
            </label>

            <label className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
              titleFormatOption === 'series_ep' ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}>
              <input
                type="radio"
                name="titleFormat"
                value="series_ep"
                checked={titleFormatOption === 'series_ep'}
                onChange={() => setTitleFormatOption('series_ep')}
                className="accent-amber-500"
              />
              <span>تنسيق موحد: [اسم المسلسل] - الحلقة X</span>
            </label>

            <label className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
              titleFormatOption === 'ep_only' ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}>
              <input
                type="radio"
                name="titleFormat"
                value="ep_only"
                checked={titleFormatOption === 'ep_only'}
                onChange={() => setTitleFormatOption('ep_only')}
                className="accent-amber-500"
              />
              <span>تنسيق موحد: الحلقة X</span>
            </label>
          </div>
        </div>

        <div className="pt-2">
          <ImageToUrlConverter
            initialPosterUrl={sharedPosterUrl}
            initialBackdropUrl={sharedBackdropUrl}
            onApplyUrls={({ posterUrl, backdropUrl }) => {
              if (posterUrl) setSharedPosterUrl(posterUrl);
              if (backdropUrl) setSharedBackdropUrl(backdropUrl);
            }}
          />
        </div>
      </div>

      {/* Warnings & Sequence Gap Alert */}
      {missingNumbers.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center gap-3 text-amber-400 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <span className="font-bold block">تنبيه وجود فجوات في تسلسل الحلقات:</span>
            <span>الحلقات التالية غير موجودة في النص المدخل: {missingNumbers.slice(0, 15).join('، ')}{missingNumbers.length > 15 ? '...' : ''}</span>
          </div>
        </div>
      )}

      {/* Step 4: Parsed Preview & Bulk Actions */}
      {parsedEpisodes.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>معاينة وتعديل الحلقات المحللة ({parsedEpisodes.length} حلقة)</span>
            </h3>

            <button
              onClick={handlePublishAll}
              disabled={isPublishing || !currentSeriesId}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs hover:opacity-95 transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPublishing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري النشر في قاعدة البيانات ({publishProgress?.current}/{publishProgress?.total})...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>نشر جميع الحلقات الآن ({parsedEpisodes.length})</span>
                </>
              )}
            </button>
          </div>

          {publishProgress && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>تقدم عملية الحفظ والـ Upsert...</span>
                <span>{Math.round((publishProgress.current / publishProgress.total) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{ width: `${(publishProgress.current / publishProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {importReport && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-5 h-5" />
                <span>اكتملت عملية الاستيراد والنشر بنجاح!</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-slate-300 pt-2">
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <span className="block text-slate-500">إجمالي المعالجة</span>
                  <span className="font-bold text-white text-sm">{importReport.total}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <span className="block text-slate-500">تم الحفظ / التحديث</span>
                  <span className="font-bold text-emerald-400 text-sm">{importReport.inserted}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <span className="block text-slate-500">فشل الحفظ</span>
                  <span className="font-bold text-red-400 text-sm">{importReport.failed}</span>
                </div>
              </div>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto border border-slate-800 rounded-2xl bg-slate-950">
            <table className="w-full text-right text-xs">
              <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px]">
                <tr>
                  <th className="p-3 w-12">#</th>
                  <th className="p-3 w-32">رقم الحلقة</th>
                  <th className="p-3">عنوان الحلقة (قابل للتعديل)</th>
                  <th className="p-3">رابط التشغيل المستخرج</th>
                  <th className="p-3 w-32">الحالة في DB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {parsedEpisodes.map((ep, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-all">
                    <td className="p-3 text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={ep.episodeNumber}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setManualEdits(prev => ({
                            ...prev,
                            [idx]: { ...prev[idx], episodeNumber: isNaN(val) ? 1 : val }
                          }));
                        }}
                        className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-amber-400 font-bold focus:outline-none focus:border-amber-500 text-xs"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={ep.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setManualEdits(prev => ({
                            ...prev,
                            [idx]: { ...prev[idx], title: val }
                          }));
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-amber-500 text-xs"
                      />
                    </td>
                    <td className="p-3 font-mono text-[10px] text-slate-400 truncate max-w-xs" title={ep.embedUrl}>
                      {ep.embedUrl || 'بدون رابط'}
                    </td>
                    <td className="p-3">
                      {ep.status === 'exists' ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                          تحديث
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          حلقة جديدة
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
