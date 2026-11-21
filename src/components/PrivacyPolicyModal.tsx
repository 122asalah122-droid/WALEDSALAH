import React from 'react';
import { ShieldCheck, X, Check, Lock, Globe, FileText } from 'lucide-react';
import { Language } from '../types/game';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-700 font-bold text-xs shadow transition active:scale-95"
              title={lang === 'ar' ? 'الرجوع للقائمة الرئيسية' : 'Back to Main Menu'}
            >
              {lang === 'ar' ? '⬅️ رجوع' : 'Back ➡️'}
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-amber-300">
                  {lang === 'ar' ? 'سياسة الخصوصية وأمان Google Play' : 'Privacy Policy (Google Play)'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {lang === 'ar' ? 'حماية البيانات لمنصة AppCreator24 ومتجر جوجل بلاي' : 'Data protection for AppCreator24 & Google Play'}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed custom-scrollbar">
          <section className="space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-emerald-500/30">
            <h4 className="font-bold text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {lang === 'ar'
                  ? '1. أذونات الكاميرا والميكروفون والخصوصية (Google Play Permissions)'
                  : '1. Camera, Microphone & Device Permissions (Google Play)'}
              </span>
            </h4>
            <p className="text-slate-200">
              {lang === 'ar'
                ? '• إذن الميكروفون والكاميرا (RECORD_AUDIO & CAMERA): يطلب تطبيق "تحدي الأبطال" إذن الوصول إلى الميكروفون (والكاميرا اختيارياً عند تفعيل مكالمة الفيديو) فقط عندما يبدأ المستخدم أو ينضم إلى مكالمة صوتية أو مرئية مباشرة داخل غرف التحدي أو الغرفة الخاصة. يتم بث الصوت والفيديو لحظياً وبشكل مشفر بين المتصلين دون تسجيل أو تخزين أي مقاطع أو صوتيات على خوادمنا، ويمكن للمستخدم كتم الميكروفون أو إغلاق الكاميرا في أي لحظة.'
                : '• Camera & Microphone (CAMERA & RECORD_AUDIO): "Champions Challenge" requests Microphone access (and optional Camera access for video calls) ONLY when you explicitly start or join a live audio/video call in challenge or private rooms. Media is streamed live in real time between participants without being recorded or stored on any server, and you can mute or disable it anytime.'}
            </p>
            <p className="text-slate-300 text-[11px] sm:text-xs">
              {lang === 'ar'
                ? '• عدم الوصول للموقع الجغرافي أو الملفات: تم إيقاف وإلغاء طلب أذونات الموقع الجغرافي (ACCESS_FINE_LOCATION و ACCESS_COARSE_LOCATION) نهائياً، ولا يطلب التطبيق الوصول إلى جهات الاتصال أو الرسائل أو الملفات الشخصية على جهازك.'
                : '• Zero Location, Contacts & Files Access: Location permissions (ACCESS_FINE_LOCATION & ACCESS_COARSE_LOCATION) are completely disabled, and the app never accesses your contacts, SMS, or personal device files.'}
            </p>
          </section>

          <section className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-amber-500/30">
            <h4 className="font-bold text-amber-300 flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ar' ? '2. الإعلانات وشبكات الإعلانات المعتمدة (Third-Party Ad Networks)' : '2. Advertisements & Third-Party Ad Networks'}</span>
            </h4>
            <p className="text-slate-300">
              {lang === 'ar'
                ? 'لتوفير كافة مميزات المسابقة مجاناً لجميع المستخدمين، يقوم التطبيق بعرض إعلانات رقمية عبر شبكات إعلانية معتمدة ومتوافقة بالكامل مع سياسات Google Play ومتجر AppCreator24 (مثل Google AdMob و AppCreator24 Ads).'
                : 'To provide all quiz features for free, the app displays digital ads through certified third-party ad networks compliant with Google Play and AppCreator24 policies (such as Google AdMob and AppCreator24 Ads).'}
            </p>
            <p className="text-slate-400 text-[11px] space-y-1">
              <span>{lang === 'ar' ? '• الإعلانات المعروضة متوافقة تماماً مع معايير سياسة العائلات (Families Policy) وسياسات حماية الأطفال (COPPA).' : '• Ads comply with Google Play Families Policy and COPPA standards.'}</span><br />
              <span>{lang === 'ar' ? '• قد تستخدم شبكات الإعلانات معرّف إعلانات جوجل المجهول (Google Advertising ID - AAID) لعرض إعلانات سياقية ومكافحة الاحتيال، دون الوصول إلى أي معلومات شخصية.' : '• Ad networks may use the anonymous Google Advertising ID (AAID) for contextual ad delivery and fraud prevention without collecting personal data.'}</span><br />
              <span>{lang === 'ar' ? '• لا يتم بيع أو مشاركة أي بيانات للمستخدمين أو سجلات المحادثات مع أي أطراف ثالثة أو معلنين.' : '• User data and game chat are never sold or shared with advertisers.'}</span>
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-amber-400 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>{lang === 'ar' ? '3. حماية البيانات وتخزين النقاط محلياً' : '3. Data Security & Local Storage'}</span>
            </h4>
            <p className="text-slate-300">
              {lang === 'ar'
                ? 'جميع رصيد النقاط والمستويات والاسم المستعار والإعدادات الصوتية تُحفظ محلياً على جهاز المستخدم (Local Storage) لضمان سرعة فائقة وعدم الحاجة لأي تسجيل حساب إجباري أو جمع بيانات شخصية.'
                : 'All game points, custom nicknames, and audio settings are saved locally on the user device (Local Storage) for maximum speed, security, and convenience without mandatory account creation.'}
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-amber-400 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{lang === 'ar' ? '4. اللعب المباشر وغرف الدردشة المؤقتة' : '4. Live Multiplayer & Temporary Chat'}</span>
            </h4>
            <p className="text-slate-300">
              {lang === 'ar'
                ? 'يتم تبادل رموز الغرف ورسائل الشات أثناء اللعب فقط لإجراء التحدي التفاعلي اللحظي بين المتسابقين، مع دعم ميزة "حذف الرسائل لدى الجميع". لا يتم تسجيل أو الاحتفاظ بأي محادثات على خوادم دائمة بعد انتهاء الجلسة.'
                : 'Room PINs and live chat messages are processed solely during active matches with Delete for Everyone support. Chat logs are not retained permanently after game sessions.'}
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-amber-400 flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{lang === 'ar' ? '5. أمان التطبيق والتوافق مع AppCreator24 و Google Play' : '5. App Security & Google Play Compliance'}</span>
            </h4>
            <p className="text-slate-300">
              {lang === 'ar'
                ? 'التطبيق مهيأ بالكامل لبيئة WebView وهواتف أندرويد الحديثة وخالٍ من أي أكواد ضارة أو مكتبات تتبع غير مصرح بها، ويلتزم بأحدث إرشادات وسياسات مطوري Google Play.'
                : 'The application is fully optimized for Android WebViews, free of unauthorized tracking SDKs, and strictly complies with the latest Google Play Developer Program Policies.'}
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {lang === 'ar' ? 'الإصدار 2.4.0 · معتمد لجوجل بلاي' : 'Version 2.4.0 · Google Play Certified'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/20"
          >
            {lang === 'ar' ? 'موافق وإغلاق' : 'Accept & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
