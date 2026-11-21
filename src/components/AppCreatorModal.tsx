import React, { useState } from 'react';
import { Copy, Check, Download, ExternalLink, ShieldCheck, HelpCircle, Code2, Globe } from 'lucide-react';
import { Language } from '../types/game';

interface AppCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const AppCreatorModal: React.FC<AppCreatorModalProps> = ({ isOpen, onClose, lang }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedBundleUrl, setCopiedBundleUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<'method1' | 'method2' | 'graphics'>('method1');

  if (!isOpen) return null;

  const appUrl = 'https://ais-pre-dforsaebo7nl3hpgeoyqed-960882533050.europe-west2.run.app';
  const mobileBundleUrl = `${appUrl}/appcreator24.html`;
  const coverUrl = '/google_play_cover.jpg';
  const iconUrl = '/google_play_icon.jpg';

  const handleCopyCode = async () => {
    try {
      const response = await fetch('/appcreator24.html');
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      window.open('/appcreator24.html', '_blank');
    }
  };

  const handleDownloadFile = () => {
    const link = document.createElement('a');
    link.href = '/download-index';
    link.download = 'index.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(appUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleCopyBundleUrl = async () => {
    await navigator.clipboard.writeText(mobileBundleUrl);
    setCopiedBundleUrl(true);
    setTimeout(() => setCopiedBundleUrl(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-700 font-bold text-xs shadow transition active:scale-95"
              title={lang === 'ar' ? 'الرجوع للقائمة الرئيسية' : 'Back to Main Menu'}
            >
              {lang === 'ar' ? '⬅️ رجوع' : 'Back ➡️'}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-amber-400">
                  {lang === 'ar' ? 'كود AppCreator24 & النشر' : 'AppCreator24 Code'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {lang === 'ar' ? 'الحزمة الجاهزة للتطبيق' : 'Ready self-contained code'}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('method1')}
            className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'method1'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? '🌐 رابط التحديث التلقائي (Web)' : '🌐 Live Auto-Update URL'}</span>
          </button>

          <button
            onClick={() => setActiveTab('method2')}
            className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'method2'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? '📋 كود HTML (مع OTA تلقائي)' : '📋 Standalone HTML + OTA'}</span>
          </button>

          <button
            onClick={() => setActiveTab('graphics')}
            className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'graphics'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🖼️</span>
            <span>{lang === 'ar' ? 'غلاف وأيقونة Google Play' : 'Google Play Cover & Icon'}</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {activeTab === 'graphics' ? (
            <div className="space-y-5">
              {/* Feature Graphic Banner */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 text-xs sm:text-sm flex items-center gap-1.5">
                    <span>🌟</span>
                    <span>{lang === 'ar' ? 'غلاف متجر Google Play (الصورة البارزة 1024x500)' : 'Google Play Feature Graphic (1024x500)'}</span>
                  </span>
                  <a
                    href={coverUrl}
                    download="google_play_cover.jpg"
                    className="py-1 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'تحميل الغلاف' : 'Download Cover'}</span>
                  </a>
                </div>
                <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-xl group">
                  <img
                    src={coverUrl}
                    alt="Google Play Cover"
                    className="w-full aspect-video object-cover transition duration-300 group-hover:scale-102"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-700/60 flex items-center justify-between text-[11px] text-slate-300">
                    <span>16:9 Ultra HD • استوديو تحدي الأبطال وتحدي 4 لاعبين وسلّم الجوائز</span>
                    <a
                      href={coverUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 hover:underline"
                    >
                      عرض بالحجم الكامل ↗
                    </a>
                  </div>
                </div>
              </div>

              {/* App Icon */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 text-xs sm:text-sm flex items-center gap-1.5">
                    <span>💎</span>
                    <span>{lang === 'ar' ? 'أيقونة التطبيق لـ Google Play و AppCreator24 (512x512)' : 'App Icon (512x512 High-Res)'}</span>
                  </span>
                  <a
                    href={iconUrl}
                    download="google_play_icon.jpg"
                    className="py-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg border border-slate-700 flex items-center gap-1 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'ar' ? 'تحميل الأيقونة' : 'Download Icon'}</span>
                  </a>
                </div>
                <div className="flex items-center gap-4 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-amber-500/40 shadow-lg shrink-0">
                    <img src={iconUrl} alt="App Icon" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-200">
                      {lang === 'ar' ? 'أيقونة ذهبية فاخرة بدقة عالية' : 'Premium Golden 3D App Icon'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {lang === 'ar'
                        ? 'ضعها في AppCreator24 في خانة General Info -> App Icon لكي تظهر على هواتف المستخدمين ومتجر Google Play.'
                        : 'Upload in AppCreator24 General Info -> App Icon for app launcher and Google Play listing.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Google Play Listing Metadata Helper */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5 text-xs">
                <div className="font-bold text-amber-400">📝 معلومات جاهزة لنسخها في Google Play Console:</div>
                <div><b>عنوان اللعبة (Title):</b> تحدي الأبطال - تحدي 4 لاعبين</div>
                <div><b>الوصف القصير (Short Description):</b> لعبة تحدي الأبطال الحديثة مع بنك 300 سؤال متجدد وسلّم 100 مرحلة، وتحدي مباشر 4 لاعبين وأصوات كاملة.</div>
              </div>
            </div>
          ) : activeTab === 'method1' ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-2xl space-y-2">
                <div className="font-bold text-blue-400 flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'تحديث مباشر تلقائي على الموبايل بدون رفع نسخة جديدة!' : 'Automatic Live Updates Without Re-uploading APK!'}</span>
                </div>
                <p className="text-xs text-slate-300">
                  {lang === 'ar'
                    ? 'بربط قسم Web في AppCreator24 بأحد الرابطين أدناه، أي تعديل أو سؤال جديد ينزل مباشرة على هواتف اللاعبين فور نشر التحديث على المنصة دون الحاجة لرفع APK أو AAB جديد!'
                    : 'Link your AppCreator24 Web section to either URL below so every future update appears immediately on mobile without rebuilding APK/AAB!'}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">
                  {lang === 'ar' ? '1) رابط التطبيق الكامل لقسم Web في AppCreator24 (مُوصى به):' : '1) Full Web App URL for AppCreator24 Web Section (Recommended):'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={appUrl}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-amber-300"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shrink-0"
                  >
                    {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedUrl ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ الرابط' : 'Copy URL')}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">
                  {lang === 'ar' ? '2) رابط النسخة السريعة المخصصة للموبايل (AppCreator24 Live):' : '2) Lightweight Mobile Bundle Live URL:'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={mobileBundleUrl}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300"
                  />
                  <button
                    onClick={handleCopyBundleUrl}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition shrink-0"
                  >
                    {copiedBundleUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                    <span>{copiedBundleUrl ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ' : 'Copy')}</span>
                  </button>
                </div>
              </div>

              {/* Steps */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                <div className="font-bold text-amber-400 text-xs">
                  {lang === 'ar' ? 'خطوات الضبط لمرة واحدة فقط في AppCreator24:' : 'One-time setup steps in AppCreator24:'}
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
                  <li>{lang === 'ar' ? 'افتح حسابك في AppCreator24 واضغط على تطبيقك.' : 'Open your AppCreator24 dashboard.'}</li>
                  <li>{lang === 'ar' ? 'انتقل إلى Sections (الأقسام) -> Create Section (إنشاء قسم جديد).' : 'Go to Sections -> Create Section.'}</li>
                  <li>{lang === 'ar' ? 'اختر نوع القسم: Web.' : 'Choose section type: Web.'}</li>
                  <li>{lang === 'ar' ? 'الصق الرابط أعلاه في حقل (Page URL).' : 'Paste the URL above in Page URL.'}</li>
                  <li>{lang === 'ar' ? 'فعّل خيار (Show loader) واختر NO لـ (Open links in external browser).' : 'Set Open in external browser to NO and Enable loader.'}</li>
                  <li>{lang === 'ar' ? 'اضغط Save — ومن بعدها أي تحديث جديد سيظهر على الموبايل تلقائياً!' : 'Click Save — future updates appear automatically on mobile!'}</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'ملف HTML مزوّد بمحرك التحديث التلقائي المباشر (OTA) + أوفلاين 100%' : 'Standalone HTML with Built-in Live OTA Auto-Update + 100% Offline'}</span>
                </div>
                <p className="text-xs text-slate-300">
                  {lang === 'ar'
                    ? 'إذا كنت تستخدم قسم HTML في AppCreator24: ضع هذه النسخة لمرة واحدة فقط، وهي تفحص المنصة تلقائياً عند كل تشغيل لتسحب أحدث التحديثات والأسئلة مع الحفاظ على نقاط وأوسمة اللاعب، وتعمل أوفلاين عند انقطاع الإنترنت!'
                    : 'Includes all 300 offline questions PLUS automatic OTA platform sync so future updates load directly on mobile while keeping player points & badges.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleCopyCode}
                  className="py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 hover:from-amber-400 transition"
                >
                  {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? (lang === 'ar' ? 'تم نسخ الكود بالكامل!' : 'Code Copied!') : (lang === 'ar' ? '📋 اضغط لنسخ الكود بالكامل' : 'Copy Full Standalone Code')}</span>
                </button>

                <button
                  onClick={handleDownloadFile}
                  className="py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'ar' ? '💾 تحميل ملف index.html واحد (بدون ملفات خارجية)' : 'Download Single index.html (Zero External Files)'}</span>
                </button>
              </div>

              {/* Steps for HTML Section */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="font-bold text-amber-400 text-xs">
                  {lang === 'ar' ? 'طريقة لصق الكود في قسم HTML في AppCreator24:' : 'How to paste in AppCreator24 HTML Section:'}
                </div>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-300">
                  <li>{lang === 'ar' ? 'في AppCreator24 اضغط Sections -> New Section -> اختر (HTML).' : 'In AppCreator24: Sections -> New Section -> HTML.'}</li>
                  <li>{lang === 'ar' ? 'اختر (Insert HTML code) أو (Upload HTML file).' : 'Select (Insert HTML code) or upload the downloaded file.'}</li>
                  <li>{lang === 'ar' ? 'الصق الكود المنسوخ واضغط حفظ (Save).' : 'Paste the code and hit Save.'}</li>
                </ol>
              </div>
            </div>
          )}

          {/* Google Play Safety Cert */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>{lang === 'ar' ? 'متوافق مع سياسات متجر Google Play' : 'Google Play Policy Compliant'}</span>
            </span>
            <span>{lang === 'ar' ? 'سياسة خصوصية مدمجة باللغتين' : 'Built-in Privacy Policy'}</span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition"
          >
            {lang === 'ar' ? 'إغلاق النافذة' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
