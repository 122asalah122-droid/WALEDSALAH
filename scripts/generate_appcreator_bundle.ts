import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { compile } from '@tailwindcss/node';
import { Scanner } from '@tailwindcss/oxide';
import { QUESTIONS_BANK } from '../src/data/questions.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`Loading ${QUESTIONS_BANK.length} questions for AppCreator24 bundle...`);

// Clean minify questions to save space and make file load instantly
const questionsClean = QUESTIONS_BANK.map((q) => ({
  id: q.id,
  lvl: q.level,
  cat: q.category,
  ...(q.topic ? { t: q.topic } : {}),
  qa: q.questionAr,
  qe: q.questionEn,
  oa: q.optionsAr,
  oe: q.optionsEn,
  ans: q.correctIndex,
  ea: q.explanationAr,
  ee: q.explanationEn,
}));

const questionsJson = JSON.stringify(questionsClean);
const QUESTIONS_HASH = crypto
  .createHash('sha1')
  .update(JSON.stringify(QUESTIONS_BANK.map((q) => q.id + '|' + q.questionAr + '|' + q.level)))
  .digest('hex')
  .slice(0, 12);

const htmlTemplate = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>تحدي الابطال :مسابقة لايف | Champions Challenge</title>
  <meta name="description" content="تطبيق تحدي الابطال :مسابقة لايف الحديث بمؤثرات صوتية كاملة وتحدي مباشر أونلاين">
  <meta name="theme-color" content="#030712">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="تحدي الأبطال">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="icon" type="image/svg+xml" href="/icon.svg">
  <style id="inline-tailwind">__COMPILED_TAILWIND_CSS__</style>
  <style>
    * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }
    html, body {
      width: 100%;
      max-width: 100%;
      overflow-x: hidden;
      overscroll-behavior-x: none;
      overflow-anchor: none;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: #030712;
      color: #f8fafc;
      font-family: 'Cairo', 'Noto Sans Arabic', 'Tahoma', 'Segoe UI', system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      touch-action: pan-y;
      -webkit-overflow-scrolling: touch;
    }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: #0b0f19; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 flex flex-col min-h-screen w-full max-w-full relative overflow-x-hidden">

  <!-- أنوار الاستوديو الهادئة والمستقرة (بدون وميض أو رعشة) -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none" aria-hidden="true">
    <div id="stage-glow" class="absolute inset-0" style="background: radial-gradient(ellipse 75% 45% at 50% 0%, rgba(245, 158, 11, 0.14) 0%, rgba(56, 189, 248, 0.06) 45%, rgba(3, 7, 18, 0) 78%);"></div>
    <div class="absolute inset-0" style="background: radial-gradient(ellipse 80% 42% at 50% 100%, rgba(245, 158, 11, 0.11) 0%, rgba(3, 7, 18, 0) 72%);"></div>
  </div>

  <!-- الرأس العلوي (Header) ثابت ولا يتمدد خارج عرض الشاشة -->
  <header class="sticky top-0 z-40 w-full max-w-full overflow-x-hidden bg-slate-950/95 border-b border-slate-800/80 px-2.5 sm:px-6 py-2 sm:py-2.5 shadow-lg">
    <div class="max-w-4xl mx-auto w-full flex flex-wrap sm:flex-nowrap items-center justify-between gap-x-2 gap-y-1.5">
      <div class="flex items-center gap-2 min-w-0 w-full sm:w-auto sm:flex-1">
        <!-- زر الرجوع المتوافق -->
        <button id="btn-back" type="button" onclick="handleBackClick()" class="hidden shrink-0 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-amber-500/40 bg-slate-900 text-amber-400 hover:text-amber-300 transition items-center gap-1">
          <span id="btn-back-arrow">➡️</span>
          <span id="btn-back-text">رجوع</span>
        </button>

        <div class="flex items-center gap-2 min-w-0 flex-1 cursor-pointer" onclick="handleBackClick()">
          <div class="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 flex items-center justify-center font-black text-slate-950 text-base shadow">
            🏆
          </div>
          <div class="min-w-0 flex-1">
            <h1 id="app-title" class="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 truncate">
              تحدي الابطال :مسابقة لايف
            </h1>
            <p class="text-[10px] text-slate-400 truncate">تحدي مباشر أونلاين</p>
          </div>
        </div>
      </div>

      <!-- الأزرار السريعة -->
      <div class="flex items-center justify-between sm:justify-end gap-1 sm:gap-2 w-full sm:w-auto shrink-0">
        <!-- زر الأوسمة وهدايا التشجيع -->
        <button type="button" onclick="openBadgesModal()" id="btn-badges-hud" class="relative flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/40 hover:border-purple-400 text-purple-200 transition text-xs font-bold shrink-0" title="الأوسمة والهدايا">
          <span>🏆</span>
          <span class="hidden sm:inline">الأوسمة</span>
          <span id="hud-badges-count" class="px-1 rounded bg-purple-500/30 font-mono text-[10px]">0</span>
          <span id="hud-gift-dot" class="hidden w-2 h-2 rounded-full bg-rose-500"></span>
        </button>

        <!-- زر الملف الشخصي للمتسابق (الاسم، الصورة، النوع، تاريخ الميلاد) -->
        <button type="button" onclick="openProfileModal()" class="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-100 transition shadow min-w-0" title="الملف الشخصي">
          <span id="hud-profile-avatar" class="text-sm shrink-0">👑</span>
          <span id="hud-profile-name" class="text-xs font-bold text-amber-300 max-w-[56px] sm:max-w-[75px] truncate">المتسابق</span>
        </button>

        <!-- رصيد النقاط -->
        <div class="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold shrink-0" title="رصيد النقاط للمواصلة عند الخسارة">
          <span>🪙</span>
          <span id="hud-user-points">150 نقطة</span>
        </div>

        <!-- زر تبديل اللغة -->
        <button type="button" id="btn-lang" onclick="toggleLanguage()" class="px-2 sm:px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-700 bg-slate-900 hover:border-amber-500 text-amber-400 transition shrink-0">
          <span id="lang-label">English</span>
        </button>

        <!-- زر كتم الصوت -->
        <button type="button" id="btn-sound" onclick="toggleMute()" class="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-amber-400 transition shrink-0" title="الصوت">
          <span id="sound-icon">🔊</span>
        </button>

        <!-- زر سياسة الخصوصية لجوجل بلاي -->
        <button type="button" onclick="openPrivacyModal()" class="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200 transition shrink-0" title="سياسة الخصوصية">
          🛡️
        </button>
      </div>
    </div>
  </header>

  <!-- إشعار منبثق للأوسمة والهدايا -->
  <div id="reward-toast" class="hidden fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm p-3.5 rounded-2xl bg-slate-900/95 border-2 border-amber-400 shadow-2xl flex items-center gap-3 text-right">
    <div id="reward-toast-icon" class="text-2xl shrink-0">🏅</div>
    <div class="flex-1 min-w-0">
      <div class="text-[11px] font-black text-amber-300">🎉 هدية ووسام جديد!</div>
      <div id="reward-toast-title" class="text-xs font-bold text-white truncate"></div>
    </div>
    <span id="reward-toast-pts" class="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-black text-xs shrink-0">+20</span>
  </div>

  <!-- جسم التطبيق الرئيسي -->
  <main class="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-5 flex flex-col justify-start overflow-x-hidden">

    <!-- ================= 1. شاشة البداية (LOBBY) ================= -->
    <section id="screen-lobby" class="flex flex-col space-y-6 text-center py-4 w-full">
      <div class="relative inline-block">
        <div class="absolute -inset-5 rounded-full pointer-events-none" style="background: radial-gradient(circle, rgba(245,158,11,0.22) 0%, rgba(245,158,11,0) 70%);"></div>
        <div class="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 p-1 shadow-2xl shadow-amber-500/25 flex items-center justify-center">
          <div class="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-4xl">
            🏆
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <h2 id="lobby-title" class="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">
          تحدي الابطال :مسابقة لايف
        </h2>
        <p id="lobby-desc" class="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          المسابقة الكبرى مع اختيار مجال الأسئلة، تحدي 4 لاعبين حول العالم، كود التحدي الرباعي، وأوسمة وهدايا تشجيعية!
        </p>
      </div>

      <!-- زر الشارة الموسيقية القوية لتحدي الأبطال + تثبيت التطبيق بدون نت -->
      <div class="max-w-sm mx-auto space-y-2">
        <button id="btn-theme-song" onclick="toggleIntroTheme()" class="w-full py-3 px-4 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition">
          <span id="theme-song-icon">🎵</span>
          <span id="theme-song-text">تشغيل الشارة الموسيقية القوية (تحدي الأبطال)</span>
        </button>
        <button id="btn-bundle-pwa-install" type="button" onclick="triggerBundlePwaInstall()" class="hidden w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs items-center justify-center gap-2 shadow-lg transition">
          <span>📲</span>
          <span>تثبيت التطبيق للعب بدون نت (Offline PWA)</span>
        </button>
      </div>

      <!-- أنماط اللعب الـ 3 المحددة -->
      <div class="space-y-3 max-w-lg mx-auto pt-2">
        <!-- 1. اللعب مع الكمبيوتر مع اختيار المجال -->
        <div class="p-3.5 bg-slate-900 border border-amber-500/30 rounded-2xl text-start space-y-2.5">
          <div class="flex items-center justify-between gap-2">
            <div class="font-extrabold text-xs sm:text-sm text-amber-300 flex items-center gap-2 flex-wrap">
              <span class="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">1</span>
              <span>اللعب مع الكمبيوتر (300 سؤال مخزنة)</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold">✈️ يعمل بدون نت</span>
            </div>
            <span class="text-[10px] text-slate-400 font-mono shrink-0">100 Stg</span>
          </div>
          <select id="classic-category" class="w-full py-2 px-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-200 text-xs font-bold focus:outline-none focus:border-amber-400">
            <option value="all">🌟 شامل (جميع المجالات)</option>
            <option value="islamic">🕌 ديني وإسلامي</option>
            <option value="entertainment">🎬 أفلام ومسلسلات</option>
          </select>
          <div class="grid grid-cols-2 gap-2">
            <button onclick="startSingleGame('ar')" class="py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5">
              <span>▶️</span>
              <span>ابدأ بالعربية</span>
            </button>
            <button onclick="startSingleGame('en')" class="py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5">
              <span>🌐</span>
              <span>Play in English</span>
            </button>
          </div>
        </div>

        <!-- 2. تحدي ثنائي مع صديق بالكود الرباعي فقط (بدون روابط) & 3. تحدي 4 لاعبين حول العالم -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div class="p-3.5 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/50 text-slate-200 font-bold text-xs rounded-2xl flex flex-col justify-between gap-2 shadow-md">
            <div class="flex items-center gap-2.5 text-start">
              <span class="text-2xl">🔑</span>
              <div>
                <div class="font-black text-blue-300">تحدي ثنائي (بالكود 4 أرقام فقط)</div>
                <div class="text-[10px] text-slate-400">بدون روابط • انسحاب أي صديق يغلق المسابقة فوراً</div>
              </div>
            </div>
            <div class="pt-1 space-y-2">
              <select id="mp-1v1-category" class="w-full py-2 px-2.5 rounded-xl bg-slate-950 border border-blue-500/40 text-amber-300 text-xs font-bold focus:outline-none focus:border-blue-400">
                <option value="all">🌟 شامل (جميع المجالات)</option>
                <option value="islamic">🕌 ديني وإسلامي</option>
                <option value="entertainment">🎬 أفلام ومسلسلات</option>
              </select>
              <button onclick="start1v1Friend()" class="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow transition">
                <span>🔑</span>
                <span>إنشاء كود غرفة (4 أرقام)</span>
              </button>
              <div class="flex gap-1.5 pt-1 border-t border-slate-800">
                <input id="join-1v1-code-input" type="text" inputmode="numeric" maxlength="4" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" placeholder="كود الصديق (4 أرقام)" dir="ltr" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-center font-mono font-black text-xs tracking-widest text-amber-300 focus:outline-none focus:border-amber-400" />
                <button onclick="join1v1ByCode()" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shrink-0">دخول</button>
              </div>
            </div>
          </div>

          <button onclick="startMultiplayer()" class="p-3.5 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 hover:from-purple-900/60 hover:to-indigo-900/60 border border-purple-500/50 hover:border-purple-400 text-slate-200 font-bold text-xs rounded-2xl transition flex flex-col justify-center gap-2 text-start shadow-md">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">🌍</span>
              <div>
                <div class="font-black text-purple-300">تحدي 4 لاعبين حول العالم</div>
                <div class="text-[10px] text-slate-400">يستقبل جميع الأجهزة لمدة 60 ثانية</div>
              </div>
            </div>
            <div class="text-[10px] text-purple-200/80 leading-relaxed font-normal">
              استقبال جميع الأجهزة المفتوحة حول العالم لمدة 60 ثانية وانطلاق الأسئلة تلقائياً حتى النهاية.
            </div>
          </button>
        </div>

        <!-- بانر هدايا وأوسمة التحدي -->
        <div onclick="openBadgesModal()" class="p-3 bg-gradient-to-r from-purple-950/50 via-slate-900 to-amber-950/40 border border-purple-500/40 rounded-2xl cursor-pointer hover:border-amber-400 transition flex items-center justify-between text-start">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">🎁</span>
            <div>
              <div class="font-extrabold text-xs text-purple-200">هدايا وأوسمة تحدي الأبطال في جميع الأقسام</div>
              <div class="text-[10px] text-slate-400">احصل على هدية يومية (+30 نقطة) واجمع أوسمة الفوز والتفوق</div>
            </div>
          </div>
          <span class="text-xs font-bold text-amber-300 shrink-0">عرض الأوسمة ←</span>
        </div>

        <!-- بطولة الـ 72 ساعة الدورية -->
        <div onclick="openTournamentModal()" class="p-3 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-2xl cursor-pointer hover:border-amber-400 transition flex items-center justify-between text-start">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">🏆</span>
            <div>
              <div class="font-extrabold text-xs text-amber-300 flex items-center gap-1.5">
                <span>بطولة الـ 72 ساعة الدورية</span>
                <span id="tournament-badge-timer" class="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono font-bold">نقاط x2</span>
              </div>
              <div class="text-[10px] text-slate-400">تتجدد تلقائياً كل 3 أيام مع نقاط مضاعفة لمواصلة اللعب</div>
            </div>
          </div>
          <span class="text-xs font-bold text-amber-400 shrink-0">دخول البطولة ←</span>
        </div>
      </div>

      <!-- مميزات إضافية نظيفة بدون ذكر بنك الأسئلة -->
      <div class="pt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
        <span class="bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">⚡ مسابقة ذكاء وتحدي</span>
        <span class="bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">🔊 Web Audio API أصوات أصلية</span>
        <span class="bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">⭐ تحدي الأبطال المباشر</span>
      </div>
    </section>

    <!-- ================= 2. شاشة المسابقة (GAMEPLAY) ================= -->
    <section id="screen-game" class="hidden flex-col gap-4">
      <!-- شريط الحالة (المستوى، الجائزة، المؤقت، الانسحاب) -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-md">
        <div class="flex items-center gap-2.5">
          <div class="w-12 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs font-mono">
            <span><span id="hud-level">1</span>/100</span>
          </div>
          <div>
            <div class="text-[10px] text-slate-400" id="hud-prize-label">الجائزة الحالية</div>
            <div class="text-sm font-black text-amber-400" id="hud-prize">100 $</div>
          </div>
        </div>

        <!-- عداد الثواني -->
        <div class="flex flex-col items-center">
          <div id="hud-timer-circle" class="w-10 h-10 rounded-full border-2 border-amber-500 flex items-center justify-center font-black text-sm text-amber-300">
            <span id="hud-timer">45</span>
          </div>
        </div>

        <button onclick="walkAway()" class="px-3 py-1.5 text-xs font-bold rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition">
          انسحاب بالمبلغ
        </button>
      </div>

      <!-- وسائل المساعدة الأربعة -->
      <div class="grid grid-cols-4 gap-2">
        <button id="btn-5050" onclick="use5050()" class="py-2 px-1 rounded-xl border border-slate-700 bg-slate-900 hover:border-amber-500 text-slate-200 text-xs font-bold transition flex flex-col items-center gap-0.5">
          <span class="text-base">✂️</span>
          <span>50:50</span>
        </button>
        <button id="btn-audience" onclick="useAudience()" class="py-2 px-1 rounded-xl border border-slate-700 bg-slate-900 hover:border-amber-500 text-slate-200 text-xs font-bold transition flex flex-col items-center gap-0.5">
          <span class="text-base">📊</span>
          <span id="label-aud">الجمهور</span>
        </button>
        <button id="btn-phone" onclick="usePhone()" class="py-2 px-1 rounded-xl border border-slate-700 bg-slate-900 hover:border-amber-500 text-slate-200 text-xs font-bold transition flex flex-col items-center gap-0.5">
          <span class="text-base">📞</span>
          <span id="label-ph">صديق</span>
        </button>
        <button id="btn-switch" onclick="useSwitch()" class="py-2 px-1 rounded-xl border border-slate-700 bg-slate-900 hover:border-amber-500 text-slate-200 text-xs font-bold transition flex flex-col items-center gap-0.5">
          <span class="text-base">🔄</span>
          <span id="label-sw">تبديل</span>
        </button>
      </div>

      <!-- شريط قارئ الأسئلة بالذكاء الاصطناعي والتصنيف -->
      <div class="flex items-center justify-between px-1 text-xs">
        <span id="q-category-badge" class="text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px]">ثقافة عامة</span>
        <div class="flex items-center gap-2">
          <button id="btn-speak-voice" onclick="toggleSpeakQuestion()" class="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-900 hover:border-amber-400 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 shadow">
            <span id="speak-voice-icon">🎙️</span>
            <span id="speak-voice-text">صوت المذيع</span>
          </button>
          <button id="btn-auto-speak" onclick="toggleAutoSpeak()" class="px-2 py-1 rounded-lg border border-blue-500/60 bg-blue-600/20 text-blue-300 font-bold text-xs transition">
            <span id="auto-speak-label">تلقائي: مفعل</span>
          </button>
        </div>
      </div>

      <!-- شريط تعليق الأسئلة أثناء المكالمة -->
      <div id="classic-call-pause-overlay" class="hidden p-5 bg-slate-900 border-2 border-rose-500/60 rounded-2xl text-center space-y-3 shadow-xl">
        <div class="text-3xl">📞</div>
        <h3 class="text-base font-black text-rose-300">مكالمة نشطة الآن — تم فصل الأسئلة مؤقتاً</h3>
        <p class="text-xs text-slate-300">يتوقف العداد والأسئلة تلقائياً أثناء المكالمة حتى تقوم بإنهائها.</p>
        <button onclick="rtcHangup()" class="px-5 py-2 rounded-xl bg-rose-600 text-white font-black text-xs shadow">📵 إنهاء المكالمة واستئناف اللعب</button>
      </div>

      <div id="classic-question-wrap" class="space-y-4">
        <!-- صندوق السؤال -->
        <div class="relative bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/70 rounded-2xl p-5 sm:p-6 text-center shadow-xl shadow-amber-500/10 min-h-[110px] flex items-center justify-center">
          <p id="q-text" class="text-base sm:text-xl font-bold leading-relaxed text-slate-100"></p>
        </div>

        <!-- خيارات الإجابة الأربعة -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="options-box">
          <button onclick="handleAnswer(0)" id="opt-0" class="opt-btn py-3.5 px-4 rounded-xl border-2 border-slate-700 bg-slate-900/90 hover:border-amber-400 active:scale-98 text-slate-200 text-sm font-bold flex items-center justify-between transition">
            <span class="w-6 h-6 rounded-full bg-slate-800 text-amber-400 text-xs flex items-center justify-center font-black">أ</span>
            <span class="opt-content flex-1 text-center"></span>
            <span class="w-4"></span>
          </button>
          <button onclick="handleAnswer(1)" id="opt-1" class="opt-btn py-3.5 px-4 rounded-xl border-2 border-slate-700 bg-slate-900/90 hover:border-amber-400 active:scale-98 text-slate-200 text-sm font-bold flex items-center justify-between transition">
            <span class="w-6 h-6 rounded-full bg-slate-800 text-amber-400 text-xs flex items-center justify-center font-black">ب</span>
            <span class="opt-content flex-1 text-center"></span>
            <span class="w-4"></span>
          </button>
          <button onclick="handleAnswer(2)" id="opt-2" class="opt-btn py-3.5 px-4 rounded-xl border-2 border-slate-700 bg-slate-900/90 hover:border-amber-400 active:scale-98 text-slate-200 text-sm font-bold flex items-center justify-between transition">
            <span class="w-6 h-6 rounded-full bg-slate-800 text-amber-400 text-xs flex items-center justify-center font-black">ج</span>
            <span class="opt-content flex-1 text-center"></span>
            <span class="w-4"></span>
          </button>
          <button onclick="handleAnswer(3)" id="opt-3" class="opt-btn py-3.5 px-4 rounded-xl border-2 border-slate-700 bg-slate-900/90 hover:border-amber-400 active:scale-98 text-slate-200 text-sm font-bold flex items-center justify-between transition">
            <span class="w-6 h-6 rounded-full bg-slate-800 text-amber-400 text-xs flex items-center justify-center font-black">د</span>
            <span class="opt-content flex-1 text-center"></span>
            <span class="w-4"></span>
          </button>
        </div>
      </div>

      <!-- تفسير الإجابة الفوري المباشر -->
      <div id="q-explanation" class="hidden bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 text-center"></div>
    </section>

    <!-- ================= 3. شاشة النتيجة النهائية ================= -->
    <section id="screen-result" class="hidden flex-col items-center justify-center text-center space-y-5 py-6">
      <div id="res-icon" class="text-6xl">🏆</div>
      <div class="space-y-1.5">
        <h3 id="res-title" class="text-2xl sm:text-4xl font-black text-amber-400">مبروك! ربحت المليون!</h3>
        <p id="res-desc" class="text-xs sm:text-sm text-slate-300">أداء عبقري وموسوعي في الإجابة على جميع الأسئلة.</p>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-xs w-full shadow-inner">
        <div class="text-xs text-slate-400">المبلغ النهائي</div>
        <div id="res-cash" class="text-3xl font-black text-amber-400 mt-1">1,000,000 $</div>
        <div class="text-xs text-slate-400 mt-2 flex justify-center gap-4">
          <span>صحيحة: <b class="text-emerald-400" id="res-correct">15</b></span>
          <span>خاطئة: <b class="text-red-400" id="res-wrong">0</b></span>
        </div>
      </div>

      <div class="flex gap-3 pt-2">
        <button onclick="goToLobby()" class="py-3 px-6 bg-slate-900 border border-slate-700 text-amber-300 font-bold text-sm rounded-xl transition">
          🏠 الشاشة الرئيسية
        </button>
      </div>
    </section>

    <!-- ================= 4. شاشة التحدي الأونلاين (MULTIPLAYER & 1V1 PIN) ================= -->
    <section id="screen-multiplayer" class="hidden flex-col gap-3.5">
      <!-- شريط معلومات الغرفة والاسم المستعار -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2 shadow-lg">
        <div class="flex items-center gap-2">
          <button onclick="forfeitMultiNow()" class="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-rose-500/50 bg-rose-950/60 text-rose-300 hover:bg-rose-900/70">
            🚪 انسحاب
          </button>
          <div>
            <div id="mp-mode-title" class="text-xs font-bold text-amber-400">تحدي ثنائي بالكود (4 أرقام)</div>
            <div class="text-[11px] text-emerald-400 flex items-center gap-1.5 font-bold">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>كود الغرفة:</span>
              <span id="mp-room-code" dir="ltr" class="font-mono font-black text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-amber-500/40">8202</span>
              <button onclick="copy1v1Pin()" id="btn-copy-code" class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                📋 نسخ الكود
              </button>
            </div>
          </div>
        </div>

        <!-- محرر الاسم المستعار المحفوظ -->
        <div class="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800">
          <span class="text-xs">👤</span>
          <input id="mp-nickname-input" onchange="saveCustomNickname(this.value)" placeholder="اسمك المستعار..." class="bg-transparent text-xs text-amber-300 font-bold w-24 sm:w-28 focus:outline-none" />
          <span class="text-[10px] text-slate-500">حفظ 💾</span>
        </div>

        <!-- زر الغرفة الخاصة المستقلة للاتصال (متاح فقط خارج اللعب الفعلي) -->
        <div id="mp-private-room-bar" class="w-full pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div class="text-[11px] text-slate-400 font-semibold">
            🔒 الاتصال الصوتي والمرئي مغلق أثناء اللعب ومتاح فقط عبر الغرفة الخاصة المستقلة
          </div>
          <button onclick="openRoomsScreen()" class="py-1.5 px-3 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/50 text-purple-200 text-[11px] font-black transition">
            🔐 فتح الغرفة الخاصة (اتصال + حظر المتصل)
          </button>
        </div>
      </div>

      <!-- بانر انتظار الأجهزة لمدة 60 ثانية في طابور الـ 4 لاعبين حول العالم -->
      <div id="mp-bot-banner" class="hidden p-4 bg-purple-950/35 border border-purple-500/40 rounded-2xl text-center space-y-2.5">
        <div class="flex items-center justify-center gap-2 text-xs font-black text-purple-200">
          <span class="w-3 h-3 rounded-full bg-purple-400"></span>
          <span>🌍 جاري استقبال الأجهزة حول العالم (<span id="mp-queue-count">1</span> / 4) — متبقي <span id="mp-search-countdown" class="font-mono text-amber-300">60</span>ث</span>
        </div>
        <div id="mp-wait-slots" class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]"></div>
        <div class="text-[11px] text-slate-300">
          🌍 أي جهاز يدخل الآن ينضم معك فوراً؛ وتبدأ المنافسة تلقائياً عند انتهاء العداد!
        </div>
      </div>

      <!-- شبكة بطاقات اللاعبين ونقاطهم الحية -->
      <div id="mp-players-grid" class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div class="bg-slate-900/90 border-2 border-amber-500/60 rounded-xl p-2 text-center shadow">
          <div class="text-xl" id="mp-p0-avatar">👑</div>
          <div id="mp-p0-name" class="text-xs font-bold text-amber-300 truncate">أنت</div>
          <div class="text-[11px] text-emerald-400 font-mono font-black mt-0.5"><span id="mp-p0">0</span> نقطة</div>
          <div id="mp-p0-status" class="text-[10px] text-slate-400 mt-1 font-semibold">يفكر... ⏳</div>
        </div>
        <div id="mp-card-p1" class="bg-slate-900/90 border border-slate-800 rounded-xl p-2 text-center shadow">
          <div class="text-xl" id="mp-p1-avatar">⚡</div>
          <div id="mp-p1-name" class="text-xs font-bold text-slate-200 truncate">الخصم / الصديق</div>
          <div class="text-[11px] text-blue-400 font-mono font-black mt-0.5"><span id="mp-p1">0</span> نقطة</div>
          <div id="mp-p1-status" class="text-[10px] text-slate-400 mt-1 font-semibold">يفكر... ⏳</div>
          <div id="mp-p1-actions" class="hidden mt-1.5 pt-1 border-t border-slate-800 flex items-center justify-center gap-1"></div>
        </div>
        <div id="mp-card-p2" class="bg-slate-900/90 border border-slate-800 rounded-xl p-2 text-center shadow">
          <div class="text-xl" id="mp-p2-avatar">🌸</div>
          <div id="mp-p2-name" class="text-xs font-bold text-slate-200 truncate">المتسابق 3</div>
          <div class="text-[11px] text-blue-400 font-mono font-black mt-0.5"><span id="mp-p2">0</span> نقطة</div>
          <div id="mp-p2-status" class="text-[10px] text-slate-400 mt-1 font-semibold">يفكر... ⏳</div>
          <div id="mp-p2-actions" class="hidden mt-1.5 pt-1 border-t border-slate-800 flex items-center justify-center gap-1"></div>
        </div>
        <div id="mp-card-p3" class="bg-slate-900/90 border border-slate-800 rounded-xl p-2 text-center shadow">
          <div class="text-xl" id="mp-p3-avatar">🦁</div>
          <div id="mp-p3-name" class="text-xs font-bold text-slate-200 truncate">المتسابق 4</div>
          <div class="text-[11px] text-blue-400 font-mono font-black mt-0.5"><span id="mp-p3">0</span> نقطة</div>
          <div id="mp-p3-status" class="text-[10px] text-slate-400 mt-1 font-semibold">يفكر... ⏳</div>
          <div id="mp-p3-actions" class="hidden mt-1.5 pt-1 border-t border-slate-800 flex items-center justify-center gap-1"></div>
        </div>
      </div>

      <!-- بانر انتظار إدخال الصديق للكود الرباعي في التحدي الثنائي (بدون روابط) -->
      <div id="mp-waiting-friend-card" class="hidden p-4 bg-slate-900 border-2 border-amber-500/50 rounded-2xl text-center space-y-3">
        <div class="text-xs font-bold text-slate-400">🔑 أعطِ هذا الكود المكون من 4 أرقام لصديقك فقط:</div>
        <div id="mp-wait-pin-big" dir="ltr" class="text-4xl font-mono font-black tracking-[0.35em] text-amber-300 bg-slate-950 py-3 rounded-2xl border border-amber-500/40 select-all">8202</div>
        <button onclick="copy1v1Pin()" class="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow">📋 نسخ كود الغرفة (4 أرقام فقط)</button>
        <div class="flex items-center justify-center gap-2 pt-1">
          <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
          <span class="text-xs font-black text-amber-300">بانتظار دخول صديقك بالكود من جهازه...</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs pt-1">
          <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div class="text-slate-400 text-[10px]">المتسابق الأول (أنت)</div>
            <div class="font-bold text-amber-300 flex items-center justify-center gap-1 mt-0.5">
              <span id="mp-wait-p0-name">أنت</span>
              <span class="text-emerald-400 text-xs">✓ متصل</span>
            </div>
          </div>
          <div id="mp-wait-p1-box" class="p-2.5 rounded-xl bg-slate-950 border border-dashed border-amber-500/40 text-center transition-all">
            <div class="text-slate-400 text-[10px]">المتسابق الثاني (صديقك)</div>
            <div class="font-bold text-slate-400 flex items-center justify-center gap-1 mt-0.5">
              <span class="text-amber-400 text-xs">⏳</span>
              <span class="text-[11px] text-amber-300/80">بانتظار إدخال الكود</span>
            </div>
          </div>
        </div>
      </div>

      <!-- بانر إغلاق المسابقة عند انسحاب أحد الطرفين أو انتهاء المبارزة -->
      <div id="mp-forfeit-closed-panel" class="hidden p-5 bg-slate-900 border-2 border-rose-500/70 rounded-2xl text-center space-y-4 shadow-2xl">
        <div id="mp-closed-icon" class="text-4xl">🔒</div>
        <h3 id="mp-closed-title" class="text-lg font-black text-rose-400">تم إغلاق المسابقة عند الطرفين</h3>
        <p id="mp-closed-desc" class="text-xs text-slate-300 leading-relaxed"></p>
        <div id="mp-closed-scores" class="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-amber-300"></div>
        <button onclick="goToLobby()" class="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-xs rounded-xl border border-slate-700 shadow transition">
          🏠 الرجوع للقائمة الرئيسية
        </button>
      </div>

      <div id="mp-call-pause-overlay" class="hidden p-5 bg-slate-900 border-2 border-rose-500/60 rounded-2xl text-center space-y-3 shadow-xl">
        <div class="text-3xl">📞</div>
        <h3 class="text-base font-black text-rose-300">مكالمة نشطة الآن — تم فصل الأسئلة مؤقتاً</h3>
        <p class="text-xs text-slate-300">أثناء المكالمات يتم إيقاف الأسئلة والعداد مؤقتاً حتى انتهاء المكالمة.</p>
        <button onclick="rtcHangup()" class="px-5 py-2 rounded-xl bg-rose-600 text-white font-black text-xs shadow">📵 إنهاء المكالمة</button>
      </div>

      <div id="mp-gameplay-area" class="space-y-3">
        <!-- وسائل المساعدة + زر المايك في اللعب الثنائي والجماعي -->
        <div id="mp-lifelines-bar" class="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button onclick="useMultiLifeline('5050')" id="mp-ll-5050" class="px-2.5 py-1.5 bg-slate-900 border border-amber-500/40 rounded-lg text-amber-300 font-bold text-[11px] hover:border-amber-400 transition">
            ½ 50:50
          </button>
          <button onclick="useMultiLifeline('aud')" id="mp-ll-aud" class="px-2.5 py-1.5 bg-slate-900 border border-blue-500/40 rounded-lg text-blue-300 font-bold text-[11px] hover:border-blue-400 transition">
            📊 الجمهور
          </button>
          <button onclick="useMultiLifeline('phone')" id="mp-ll-phone" class="px-2.5 py-1.5 bg-slate-900 border border-purple-500/40 rounded-lg text-purple-300 font-bold text-[11px] hover:border-purple-400 transition">
            📞 صديق
          </button>
          <button onclick="rtcToggleMic()" id="mp-btn-mic" class="px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/60 rounded-lg text-emerald-300 font-black text-[11px] flex items-center gap-1 transition">
            <span id="mp-mic-icon">🎙️</span>
            <span id="mp-mic-label">المايك مفتوح</span>
          </button>
        </div>

        <button id="mp-audio-unlock-btn" onclick="rtcUnlockMatchAudio()" class="hidden w-full px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg">
          🔊 اضغط هنا لتفعيل سماع صوت اللاعبين المباشر
        </button>
        <div id="mp-report-toast" class="hidden px-3 py-2 bg-emerald-500/15 border border-emerald-400/60 rounded-xl text-center text-xs font-black text-emerald-300"></div>
        <div id="mp-match-voice-status" class="hidden px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-[11px] text-emerald-300 font-bold">
          <span>🎙️ الصوت المباشر متصل — تسمعون بعضكم الآن</span>
          <button onclick="rtcToggleSpeaker()" id="mp-btn-speaker" class="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-[10px]">🔊 السماعة مفتوحة</button>
        </div>
        <div id="mp-audio-sinks" class="sr-only"></div>

        <!-- صندوق سؤال الجولة مع شريط العد التنازلي التلقائي وأزرار ناطق الأسئلة -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-2 relative overflow-hidden">
          <div class="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span class="text-amber-400 font-bold">الجولة <span id="mp-round">1</span> / 10</span>
            <div class="flex items-center gap-1.5">
              <button onclick="toggleMpSpeakQuestion()" id="btn-mp-speak-voice" class="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-950 hover:border-amber-400 text-slate-200 text-[11px] font-bold flex items-center gap-1 transition">
                <span id="mp-speak-voice-icon">🎙️</span>
                <span id="mp-speak-voice-text">ناطق السؤال</span>
              </button>
              <button onclick="toggleMpAutoSpeak()" id="btn-mp-auto-speak" class="px-2 py-1 rounded-lg border border-blue-500/40 bg-blue-950/40 text-blue-300 text-[10px] font-bold flex items-center gap-1 transition">
                <span>🔊</span>
                <span id="mp-auto-speak-label">تلقائي: مفعل</span>
              </button>
            </div>
            <span class="text-rose-400 font-mono font-bold flex items-center gap-1">⏱️ <span id="mp-timer-sec">40</span>ث (تحويل تلقائي)</span>
          </div>
          <div class="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
            <div id="mp-timer-fill" class="bg-amber-400 h-full w-full transition-all duration-1000 ease-linear"></div>
          </div>
          <p id="mp-q-text" class="text-sm sm:text-base font-bold text-slate-100 pt-1"></p>
        </div>

        <!-- خيارات الإجابة في التحدي (تحويل تلقائي بدون لمس اليد) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2" id="mp-options-box">
          <button onclick="handleMultiAnswer(0)" id="mp-opt-0" class="py-3 px-3 rounded-xl border border-slate-700 bg-slate-900 text-xs font-bold text-slate-200 text-center hover:border-amber-400 transition"></button>
          <button onclick="handleMultiAnswer(1)" id="mp-opt-1" class="py-3 px-3 rounded-xl border border-slate-700 bg-slate-900 text-xs font-bold text-slate-200 text-center hover:border-amber-400 transition"></button>
          <button onclick="handleMultiAnswer(2)" id="mp-opt-2" class="py-3 px-3 rounded-xl border border-slate-700 bg-slate-900 text-xs font-bold text-slate-200 text-center hover:border-amber-400 transition"></button>
          <button onclick="handleMultiAnswer(3)" id="mp-opt-3" class="py-3 px-3 rounded-xl border border-slate-700 bg-slate-900 text-xs font-bold text-slate-200 text-center hover:border-amber-400 transition"></button>
        </div>

        <!-- بانر حالة تثبيت الإجابة ومقارنة النتائج التلقائية دون تخطي -->
        <div id="mp-round-status-banner" class="hidden p-3 rounded-2xl text-center text-xs font-bold transition-all shadow-lg"></div>

        <!-- خيار المواصلة بخصم 50 نقطة عند الإجابة الخاطئة -->
        <div id="mp-revive-prompt" class="hidden p-3.5 rounded-2xl bg-slate-950/95 border-2 border-amber-500/70 text-center space-y-2.5 shadow-xl">
          <div class="text-xs font-black text-rose-400">❌ إجابة غير صحيحة!</div>
          <p class="text-[11px] text-slate-300 font-bold" id="mp-revive-desc">هل تريد خصم 50 نقطة من رصيدك للمواصلة وإعادة المحاولة في نفس السؤال؟</p>
          <div class="flex flex-wrap items-center justify-center gap-2">
            <button onclick="confirmMpRevive()" class="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow">
              ✅ خصم 50 نقطة والمواصلة
            </button>
            <button onclick="declineMpRevive()" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs">
              ❌ لا، أكمل بدون خصم
            </button>
          </div>
        </div>
      </div>

      <!-- شات الغرفة الفوري المباشر المتصل بالخادم مع حذف للجميع -->
      <div class="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2">
        <div class="text-xs font-bold text-slate-400 flex items-center justify-between">
          <span>💬 شات الغرفة المتزامن بالوقت الفعلي</span>
          <span id="mp-chat-badge" class="text-[10px] text-emerald-400">● متصل فوري</span>
        </div>
        <div id="mp-chat" class="h-28 overflow-y-auto space-y-1.5 p-2 bg-slate-950 rounded-xl text-xs">
          <div class="text-slate-400 text-[11px]">🎙️ <b>الحكم الدولي:</b> أهلاً بكم! الأسئلة والدردشة متزامنة بدقة على جميع الأجهزة.</div>
        </div>
        <div class="flex gap-2">
          <input id="mp-chat-input" onkeydown="if(event.key==='Enter')sendChatMessage()" type="text" placeholder="اكتب رسالة لجميع اللاعبين..." class="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500">
          <button onclick="sendChatMessage()" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition">
            إرسال
          </button>
        </div>
      </div>
    </section>

    <!-- ================= 5. الغرفة الخاصة المستقلة للاتصال المباشر (بدون دردشة عامة) ================= -->
    <section id="screen-rooms" class="hidden flex-col gap-3.5">
      <div class="bg-slate-900 border border-purple-500/40 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <button onclick="goToLobby()" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200">← خروج</button>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-sm font-black text-purple-300" id="rooms-header-title">🔐 الغرفة الخاصة (8202)</h3>
              <span id="rtc-peerjs-badge" class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/15 border border-amber-500/40 text-amber-300">📡 جاري ربط PeerJS...</span>
            </div>
            <p class="text-[10px] text-slate-400">اتصال مباشر عبر الإنترنت بين الموبايل واللابتوب عبر PeerJS + ميزة حظر المتصل</p>
          </div>
        </div>
        <button onclick="toggleBlockedDrawer()" id="btn-blocked-toggle" class="px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-black">
          🚫 المحظورون (<span id="blocked-count-badge">0</span>)
        </button>
      </div>

      <!-- قائمة المتصلين المحظورين -->
      <div id="rooms-blocked-drawer" class="hidden bg-rose-950/20 border border-rose-500/40 rounded-2xl p-3 space-y-2 text-xs">
        <div class="font-black text-rose-300 flex items-center justify-between">
          <span>🚫 قائمة المحظورين من الاتصال بك</span>
          <button onclick="toggleBlockedDrawer()" class="text-[11px] text-slate-400">إغلاق</button>
        </div>
        <div id="priv-blocked-list" class="space-y-1.5 text-[11px] text-slate-300">لا يوجد متصلون محظورون حالياً.</div>
      </div>

      <!-- أدوات الغرفة الخاصة -->
      <div id="private-room-controls" class="bg-purple-950/25 border border-purple-500/40 rounded-2xl p-3 space-y-2 text-xs">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>كود غرفتك الخاصة: <span id="priv-room-code-badge" class="font-mono text-sm tracking-widest font-black text-purple-300 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-purple-500/40">8202</span></div>
          <div class="flex items-center gap-1.5">
            <button onclick="createNewPrivateRoom()" class="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold text-[11px]">➕ غرفة جديدة</button>
            <button onclick="copyPrivateRoomLink()" class="px-2.5 py-1 rounded-lg bg-slate-800 border border-amber-500/40 text-amber-300 font-bold text-[11px]">📋 نسخ الرابط</button>
            <button onclick="sharePrivateRoomWhatsApp()" class="px-2.5 py-1 rounded-lg bg-[#25D366] text-white font-bold text-[11px]">💬 واتساب</button>
          </div>
        </div>
        <div class="flex gap-2">
          <input id="priv-join-input" type="text" inputmode="numeric" maxlength="4" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" placeholder="أدخل كود من 4 أرقام (مثال: 8202)..." class="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono tracking-widest text-slate-100 focus:outline-none">
          <button onclick="joinPrivateRoomByInput()" class="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs">دخول</button>
        </div>
      </div>

      <!-- أزرار بدء مكالمة فيديو أو اتصال صوتي في الغرفة الخاصة فقط -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2.5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2 text-xs">
            <span class="text-slate-300 font-bold">المتصلون في الغرفة الخاصة: <b id="rooms-callers-count" class="text-emerald-400">0</b></span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="rtcStartCall(currentPrivateRoomId, 'video')" class="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs">📹 مكالمة فيديو</button>
            <button onclick="rtcStartCall(currentPrivateRoomId, 'audio')" class="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs">📞 اتصال عادي</button>
          </div>
        </div>
        <div id="rooms-participants-list" class="flex flex-wrap gap-1.5"></div>
      </div>

      <!-- شات الغرفة الخاصة -->
      <div class="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2">
        <div id="rooms-chat-list" class="h-56 overflow-y-auto space-y-1.5 p-2.5 bg-slate-950 rounded-xl text-xs">
          <div class="text-slate-400 text-[11px] text-center py-4">غرفة خاصة بالكود فقط — شارك الرابط مع من تثق به ويمكنك حظر أي متصل فوراً.</div>
        </div>
        <div class="flex gap-2">
          <input id="rooms-chat-input" onkeydown="if(event.key==='Enter')sendRoomChatMessage()" type="text" placeholder="اكتب رسالتك في الغرفة الخاصة..." class="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500">
          <button onclick="sendRoomChatMessage()" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl">إرسال</button>
        </div>
      </div>
    </section>

  </main>

  <!-- إشعار مكالمة واردة في الغرفة الخاصة مع خيار الحظر -->
  <div id="rtc-incoming-card" class="hidden fixed bottom-4 inset-x-3 sm:left-auto sm:right-4 sm:w-80 z-50 bg-slate-900 border-2 border-emerald-400 rounded-2xl p-3.5 shadow-2xl space-y-2.5">
    <div class="flex items-center gap-3">
      <div id="rtc-in-avatar" class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-xl">👤</div>
      <div class="min-w-0 flex-1">
        <div id="rtc-in-mode" class="text-xs font-black text-emerald-300">📞 مكالمة خاصة واردة</div>
        <div id="rtc-in-name" class="text-sm font-black text-white truncate">متصل</div>
      </div>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
      <button onclick="rtcAcceptIncoming()" class="py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs">✅ رد</button>
      <button onclick="rtcRejectIncoming()" class="py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-black text-xs">❌ رفض</button>
      <button onclick="rtcBlockIncomingCaller()" class="py-2 rounded-xl bg-rose-600 text-white font-black text-xs">🚫 حظر</button>
      <button onclick="rtcReportIncomingCaller()" class="py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs">🚩 إبلاغ</button>
    </div>
  </div>

  <!-- نافذة الفيديو والصوت المباشر أثناء المكالمة الخاصة فقط -->
  <div id="rtc-video-stage" class="hidden fixed bottom-4 inset-x-3 sm:left-auto sm:right-4 sm:w-[400px] z-40 bg-slate-950/95 border-2 border-amber-500/60 rounded-2xl p-3 shadow-2xl space-y-2">
    <div class="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span id="rtc-stage-title" class="font-black text-amber-300">مكالمة خاصة مباشرة</span>
        <span id="rtc-call-timer" class="font-mono text-emerald-400 font-bold">00:00</span>
      </div>
      <div class="flex items-center gap-1">
        <button onclick="rtcToggleMic()" id="rtc-stage-mic-btn" class="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">🎙️</button>
        <button onclick="rtcToggleCamera()" class="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-[11px]">📹</button>
        <button onclick="rtcToggleVideoStageMinimize()" class="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-[11px]">تصغير</button>
        <button onclick="rtcHangup()" class="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px]">📵 إنهاء</button>
      </div>
    </div>
    <div id="rtc-video-grid" class="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto">
      <div class="relative rounded-xl overflow-hidden bg-slate-900 border border-amber-500/50 aspect-video flex items-center justify-center">
        <video id="rtc-local-video" autoplay playsinline muted class="w-full h-full object-cover hidden"></video>
        <div id="rtc-local-avatar-box" class="text-center">
          <div class="text-2xl">🎙️</div>
          <div class="text-[10px] text-amber-300 font-bold">أنت (مباشر)</div>
        </div>
      </div>
      <div id="rtc-remote-videos" class="contents"></div>
    </div>
    <div id="rtc-audio-sinks" class="hidden"></div>
  </div>

  <!-- نافذة تصويت الجمهور -->
  <div id="modal-aud" class="hidden fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 text-center shadow-2xl">
      <div class="text-3xl">📊</div>
      <h4 class="text-base font-black text-amber-400">تصويت جمهور البرنامج</h4>
      <div class="space-y-2 text-xs" id="aud-bars"></div>
      <button onclick="closeModal('modal-aud')" class="w-full py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
        إغلاق والمتابعة
      </button>
    </div>
  </div>

  <!-- نافذة الاتصال بصديق -->
  <div id="modal-ph" class="hidden fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 text-center shadow-2xl">
      <div class="text-3xl">📞</div>
      <h4 class="text-base font-black text-amber-400">مكالمة الصديق</h4>
      <div class="p-3 bg-slate-950 rounded-xl text-xs text-slate-200 leading-relaxed text-right" id="ph-text"></div>
      <button onclick="closeModal('modal-ph')" class="w-full py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
        شكراً لك (إغلاق)
      </button>
    </div>
  </div>

  <!-- نافذة المواصلة بالنقاط فقط (50 نقطة) -->
  <div id="modal-revival" class="hidden fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
    <div class="bg-slate-900 border-2 border-amber-500/70 rounded-3xl max-w-sm w-full p-5 text-center space-y-3.5 shadow-2xl relative">
      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <button onclick="goToLobby()" class="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-700 bg-slate-950 text-amber-400 hover:text-amber-300">
          ⬅️ الرئيسية
        </button>
        <span class="text-xs text-rose-400 font-bold">إجابة خاطئة</span>
      </div>
      <div class="w-12 h-12 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-2xl border border-rose-500">
        ⚠️
      </div>
      <div>
        <h3 id="revival-title" class="text-base font-black text-amber-300">إجابة خاطئة! هل تريد المواصلة؟</h3>
        <p id="revival-desc" class="text-xs text-slate-300 mt-1">لن يتم حذف أي خيار تلقائياً — يمكنك المواصلة بإجابة السؤال بـ 50 نقطة من رصيدك فقط.</p>
      </div>
      <div class="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
        <span class="text-slate-400 font-bold" id="revival-pts-label">رصيد نقاطك:</span>
        <span class="font-mono font-black text-amber-400 text-sm" id="revival-pts-val">150 نقطة</span>
      </div>
      <div class="space-y-2 pt-1">
        <button id="btn-revive-pts" onclick="reviveWithPoints()" class="w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-between shadow-lg">
          <span id="revival-btn-text">🎁 إجابة السؤال والمواصلة (50 نقطة)</span>
          <span class="px-2 py-0.5 rounded bg-black/20 font-mono text-[11px]">-50 pts</span>
        </button>
        <button onclick="goToLobby()" class="w-full py-2 px-3 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-700">
          ⬅️ الرجوع للقائمة الرئيسية
        </button>
      </div>
    </div>
  </div>

  <!-- نافذة الأوسمة وهدايا التشجيع -->
  <div id="modal-badges" class="hidden fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
    <div class="bg-slate-900 border-2 border-purple-500/60 rounded-3xl max-w-md w-full p-5 max-h-[88vh] overflow-y-auto space-y-4 text-slate-100 shadow-2xl text-right">
      <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🏆</span>
          <div>
            <h3 class="text-sm font-black text-amber-300">الأوسمة وهدايا التشجيع</h3>
            <p class="text-[11px] text-slate-400">مفتوح: <span id="badges-unlocked-summary" class="text-amber-300 font-bold">0 / 10</span></p>
          </div>
        </div>
        <button onclick="closeModal('modal-badges')" class="text-slate-400 hover:text-white text-base">✕</button>
      </div>

      <!-- صندوق الهدية اليومية -->
      <div class="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-400/50 flex items-center justify-between gap-2">
        <div>
          <div class="text-xs font-black text-amber-200">🎁 صندوق الهدية اليومية</div>
          <div class="text-[11px] text-slate-300">احصل على +30 نقطة مجانية كل 24 ساعة!</div>
        </div>
        <button id="btn-claim-daily-gift" onclick="claimDailyEncouragementGift()" class="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shrink-0 shadow">استلام +30</button>
      </div>

      <div id="badges-grid" class="grid grid-cols-1 gap-2"></div>
    </div>
  </div>

  <!-- نافذة بطولة الـ 72 ساعة دورية مع القفل والإشعارات وزر الرجوع للقائمة الرئيسية -->
  <div id="modal-tournament" class="hidden fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
    <div class="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-sm w-full p-5 text-center space-y-4 shadow-2xl relative text-slate-100">
      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <button onclick="goToLobby()" class="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-700 bg-slate-950 text-amber-400 hover:text-amber-300">
          ⬅️ الرئيسية
        </button>
        <button onclick="closeModal('modal-tournament')" class="text-slate-400 hover:text-white">✕</button>
      </div>

      <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl border border-amber-500/40">
        🏆
      </div>
      <div>
        <h3 class="text-base font-black text-amber-400">بطولة الـ 72 ساعة الدورية</h3>
        <p class="text-xs text-slate-300 mt-1">تتجدد تلقائياً كل 3 أيام مع نقاط x2 مضاعفة</p>
      </div>

      <!-- العداد التنازلي -->
      <div class="p-3 bg-slate-950 rounded-xl border border-amber-500/30 text-xs font-mono font-bold text-amber-400 flex justify-around">
        <div><span id="tourn-days">0</span> يوم</div>
        <div><span id="tourn-hours">00</span> س</div>
        <div><span id="tourn-mins">00</span> د</div>
        <div><span id="tourn-secs">00</span> ث</div>
      </div>

      <!-- نظام إشعار التذكير قبل 15 دقيقة -->
      <div class="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
        <span class="text-slate-300">🔔 تذكير قبل البدء بـ 15 دقيقة:</span>
        <button id="btn-tourn-remind" onclick="toggleTournReminder()" class="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px]">
          تفعيل 🔔
        </button>
      </div>

      <!-- تنبيه القفل عند الضغط قبل الموعد -->
      <div id="tourn-locked-toast" class="hidden p-2 rounded-lg bg-rose-500/20 border border-rose-500 text-[11px] text-rose-300">
        عذراً، لم تبدأ البطولة بعد! يرجى الانتظار حتى انتهاء وقت العد التنازلي.
      </div>

      <!-- زر الدخول المقفول أو المفتوح -->
      <button id="btn-enter-tourn" onclick="handleTournamentClick()" class="w-full py-3 px-4 bg-slate-800 border border-slate-700 text-slate-500 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed">
        <span id="tourn-btn-label">🔒 البطولة مغلقة حتى انتهاء العداد (00:00:00)</span>
      </button>

      <div class="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
        <span>🔒 تُفتح البطولة تلقائياً في موعدها المحدد كل 72 ساعة فقط.</span>
      </div>
    </div>
  </div>

  <!-- نافذة الملف الشخصي للمتسابق (الاسم، الصورة الرمزية، النوع، تاريخ الميلاد) -->
  <div id="modal-profile" class="hidden fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
    <div class="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-sm w-full p-5 max-h-[88vh] overflow-y-auto space-y-4 text-slate-100 shadow-2xl relative text-start">
      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 class="text-sm font-black text-amber-400">👤 الملف الشخصي للمتسابق</h3>
        <button onclick="closeModal('modal-profile')" class="text-slate-400 hover:text-white">✕</button>
      </div>

      <!-- معاينة سريعة -->
      <div class="p-3 bg-slate-950 rounded-2xl border border-amber-500/30 flex items-center gap-3">
        <div id="prof-preview-avatar" class="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl shrink-0">
          👑
        </div>
        <div class="min-w-0 flex-1">
          <div id="prof-preview-name" class="font-black text-sm text-amber-300 truncate">المتسابق</div>
          <div id="prof-preview-sub" class="text-[11px] text-slate-400">ذكر • 🇸🇦 السعودية</div>
        </div>
      </div>

      <!-- المدخلات -->
      <div class="space-y-3 text-xs">
        <div>
          <label class="font-bold text-slate-300 block mb-1">الاسم أو اللقب المستعار:</label>
          <input id="prof-input-name" type="text" maxlength="24" class="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none" />
        </div>

        <div>
          <label class="font-bold text-slate-300 block mb-1">الصورة الرمزية (الأفاتار):</label>
          <div class="grid grid-cols-6 gap-1.5" id="prof-avatar-grid">
            <button type="button" onclick="selectProfAvatar('👑')" class="p-1 rounded-lg bg-slate-950 border border-slate-700 text-lg hover:border-amber-400">👑</button>
            <button type="button" onclick="selectProfAvatar('🦁')" class="p-1 rounded-lg bg-slate-950 border border-slate-700 text-lg hover:border-amber-400">🦁</button>
            <button type="button" onclick="selectProfAvatar('🦅')" class="p-1 rounded-lg bg-slate-950 border border-slate-700 text-lg hover:border-amber-400">🦅</button>
            <button type="button" onclick="selectProfAvatar('🚀')" class="p-1 rounded-lg bg-slate-950 border border-slate-700 text-lg hover:border-amber-400">🚀</button>
            <button type="button" onclick="selectProfAvatar('🧠')" class="p-1 rounded-lg bg-slate-950 border border-slate-700 text-lg hover:border-amber-400">🧠</button>
            <button type="button" onclick="selectProfAvatar('⚡')" class="p-1 rounded-lg bg-slate-950 border border-slate-700 text-lg hover:border-amber-400">⚡</button>
            <button type="button" onclick="selectProfAvatar('💎')" class="p-1 rounded-lg bg-slate-950 border border-slate-700 text-lg hover:border-amber-400">💎</button>
            <button type="button" onclick="selectProfAvatar('🌟')" class="p-1 rounded-lg bg-slate-950 border border-slate-700 text-lg hover:border-amber-400">🌟</button>
            <button type="button" onclick="selectProfAvatar('👨‍💼')" class="p-1 rounded-lg bg-slate-950 border border-slate-700 text-lg hover:border-amber-400">👨‍💼</button>
            <button type="button" onclick="selectProfAvatar('👩‍💼')" class="p-1 rounded-lg bg-slate-950 border border-slate-700 text-lg hover:border-amber-400">👩‍💼</button>
            <button type="button" onclick="selectProfAvatar('🏆')" class="p-1 rounded-lg bg-slate-950 border border-slate-700 text-lg hover:border-amber-400">🏆</button>
            <button type="button" onclick="selectProfAvatar('🎯')" class="p-1 rounded-lg bg-slate-950 border border-slate-700 text-lg hover:border-amber-400">🎯</button>
          </div>
        </div>

        <div>
          <label class="font-bold text-slate-300 block mb-1">النوع / الجنس:</label>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" id="prof-btn-male" onclick="selectProfGender('male')" class="py-1.5 px-3 rounded-xl border border-blue-500 bg-blue-500/20 text-blue-300 font-bold text-xs">
              👨 ذكر
            </button>
            <button type="button" id="prof-btn-female" onclick="selectProfGender('female')" class="py-1.5 px-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-400 font-bold text-xs">
              👩 أنثى
            </button>
          </div>
        </div>

        <div>
          <label class="font-bold text-slate-300 block mb-1">تاريخ الميلاد:</label>
          <input id="prof-input-dob" type="date" value="2000-01-01" class="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none" />
        </div>

        <div>
          <label class="font-bold text-slate-300 block mb-1">الدولة:</label>
          <select id="prof-input-country" class="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none">
            <option value="🇸🇦 السعودية">🇸🇦 السعودية</option>
            <option value="🇪🇬 مصر">🇪🇬 مصر</option>
            <option value="🇩🇿 الجزائر">🇩🇿 الجزائر</option>
            <option value="🇲🇦 المغرب">🇲🇦 المغرب</option>
            <option value="🇦🇪 الإمارات">🇦🇪 الإمارات</option>
            <option value="🇮🇶 العراق">🇮🇶 العراق</option>
            <option value="🇯🇴 الأردن">🇯🇴 الأردن</option>
            <option value="🇰🇼 الكويت">🇰🇼 الكويت</option>
            <option value="🇹🇳 تونس">🇹🇳 تونس</option>
            <option value="🇴🇲 عُمان">🇴🇲 عُمان</option>
            <option value="🌐 أخرى">🌐 دولة أخرى</option>
          </select>
        </div>
      </div>

      <button onclick="saveUserProfile()" class="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg">
        💾 حفظ وتطبيق في جميع الأقسام
      </button>
    </div>
  </div>

  <!-- نافذة سياسة الخصوصية لجوجل بلاي (خالية من إذن الموقع ومتوافقة مع إعلانات AdMob و AppCreator24) -->
  <div id="modal-privacy" class="hidden fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 max-h-[85vh] overflow-y-auto space-y-4 text-slate-300 text-xs leading-relaxed">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h4 class="text-sm font-black text-amber-400">🛡️ سياسة الخصوصية وأذونات Google Play والإعلانات</h4>
        <button onclick="closeModal('modal-privacy')" class="text-slate-400 hover:text-white text-base">✕</button>
      </div>
      <p>
        تطبيق <b>تحدي الأبطال</b> يحترم خصوصية مستخدميه التامة ويلتزم بسياسات النشر وحماية البيانات في متجر Google Play وسياسات العائلة (Families Policy).
      </p>
      <div class="space-y-2 text-right">
        <div class="p-2.5 bg-slate-950/80 rounded-xl border border-emerald-500/30 space-y-1.5">
          <p class="font-bold text-emerald-300">🎙️📷 أذونات الميكروفون والكاميرا (عند الاتصال فقط):</p>
          <p class="text-slate-300">يطلب التطبيق إذن الوصول إلى <b>الميكروفون</b> (و<b>الكاميرا</b> اختيارياً عند تشغيل الفيديو) فقط عندما يقوم اللاعب بتشغيل المايك أو بدء مكالمة صوتية/مرئية مباشرة في غرف التحدي أو الغرفة الخاصة. يتم البث لحظياً بين المتصلين دون تسجيل أو تخزين أي صوت أو فيديو على أي خادم، ويمكنك إغلاق الكاميرا أو كتم المايك في أي وقت.</p>
          <p class="text-slate-400 text-[11px]">✅ <b>انعدام أذونات الموقع والملفات:</b> تم إلغاء أذونات الموقع الجغرافي نهائياً (ACCESS_FINE_LOCATION و ACCESS_COARSE_LOCATION)، ولا يطلب التطبيق الوصول إلى جهات الاتصال أو الملفات الشخصية.</p>
        </div>
        <div class="p-2.5 bg-slate-950/80 rounded-xl border border-amber-500/30">
          <p class="font-bold text-amber-300">📢 سياسة الإعلانات والشبكات الإعلانية المعتمدة (Ad Networks Policy):</p>
          <p class="text-slate-300 mt-1">يحتوي التطبيق على إعلانات رقمية مدعومة عبر منصات معتمدة متوافقة مع متجر Google Play (مثل Google AdMob وشبكة AppCreator24 المعتمدة). قد تستخدم هذه الشبكات معرف الإعلانات المجهول (AAID) لتقديم إعلانات ملائمة مع التزام كامل بعدم جمع أو مشاركة أي بيانات شخصية أو حساسة للمستخدمين، وتوافق تام مع برامج العائلة.</p>
        </div>
        <p>• <b>الأصوات:</b> يتم تخليق الأصوات محلياً عبر تقنية Web Audio API دون الحاجة للاتصال بخوادم وسائط خارجية.</p>
        <p>• <b>حماية الأطفال والعائلة:</b> المحتوى الثقافي آمن 100% ومناسب لجميع الفئات العمرية.</p>
      </div>
      <button onclick="closeModal('modal-privacy')" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl">
        فهمت وموافق
      </button>
    </div>
  </div>

  <!-- شاشة الأذونات قبل دخول اللعب الثنائي والرباعي (تطلب إذن الميكروفون الفعلي عند الضغط على متابعة) -->
  <div id="modal-mic-perm" class="hidden fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4">
    <div class="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/15 border-2 border-emerald-400/60 flex items-center justify-center text-3xl">
        🎙️
      </div>
      <div class="space-y-1.5">
        <div id="mic-perm-mode-badge" class="inline-block px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-black">
          🎙️ التحدي الأونلاين
        </div>
        <h4 class="text-lg font-black text-slate-100">شاشة الأذونات والصوت المباشر</h4>
        <p class="text-xs text-slate-300 leading-relaxed">
          للتحدث وسماع اللاعبين الآخرين عن بُعد داخل الغرفة، اضغط على <b>"متابعة"</b> لمنح إذن الميكروفون الفعلي قبل الدخول.
        </p>
      </div>
      <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-right space-y-1.5 text-[11px] text-slate-300">
        <div>🎙️ تشغيل الميكروفون الفعلي وربطه بجميع اللاعبين داخل الغرفة</div>
        <div>🔇 إيقاف موسيقى الخلفية تلقائياً داخل الغرفة لصفاء الصوت</div>
        <div>🛡️ يمكنك كتم المايك أو حظر/الإبلاغ عن أي لاعب في أي وقت</div>
      </div>
      <div id="mic-perm-error" class="hidden p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-xs text-rose-200 text-right"></div>
      <div class="space-y-2 pt-1">
        <button id="btn-mic-perm-continue" onclick="confirmMicPermissionContinue()" class="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-lg">
          🎙️ متابعة وتفعيل الميكروفون
        </button>
        <button id="btn-mic-perm-listen" onclick="continueWithoutMicPermission()" class="hidden w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30">
          الدخول للاستماع فقط (بدون ميكروفون)
        </button>
        <button onclick="cancelMicPermissionScreen()" class="w-full py-2 text-xs text-slate-400 hover:text-slate-200 font-bold">
          رجوع للقائمة الرئيسية
        </button>
      </div>
    </div>
  </div>

  <!-- نافذة الإبلاغ السريع عن لاعب داخل الغرفة -->
  <div id="modal-report" class="hidden fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
    <div class="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
      <div class="px-5 py-3.5 bg-gradient-to-r from-amber-950/80 via-slate-900 to-rose-950/60 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h4 class="text-sm font-black text-amber-300">🚩 الإبلاغ عن لاعب</h4>
          <p id="report-target-label" class="text-[11px] text-slate-300">👤 لاعب</p>
        </div>
        <button onclick="closeReportModal()" class="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold">✕</button>
      </div>
      <div id="report-form-body" class="p-5 space-y-3">
        <div class="text-xs font-bold text-slate-300">اختر سبب الإبلاغ السريع:</div>
        <div id="report-reasons-list" class="space-y-1.5"></div>
        <input id="report-details-input" type="text" maxlength="200" placeholder="تفاصيل إضافية (اختياري)..." class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-400" />
        <div class="flex gap-2 pt-1">
          <button onclick="closeReportModal()" class="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">إلغاء</button>
          <button onclick="submitBundlePlayerReport()" class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-xs shadow">🚩 تأكيد الإبلاغ</button>
        </div>
      </div>
      <div id="report-success-body" class="hidden p-6 text-center space-y-3.5">
        <div class="text-4xl">✅</div>
        <h5 class="text-base font-black text-emerald-300">تم استلام وحفظ البلاغ بنجاح</h5>
        <p id="report-success-desc" class="text-xs text-slate-300 leading-relaxed"></p>
        <div class="flex gap-2 pt-1">
          <button onclick="blockReportedPlayerFromModal()" class="flex-1 py-2.5 rounded-xl bg-rose-600/20 border border-rose-500/60 text-rose-300 font-black text-xs">🚫 حظر اللاعب أيضاً</button>
          <button onclick="closeReportModal()" class="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs">تم، إغلاق</button>
        </div>
      </div>
    </div>
  </div>

  <!-- نافذة التنبيه عند محاولة دخول الأونلاين أو المكالمات بدون إنترنت -->
  <div id="modal-offline-warning" class="hidden fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
    <div class="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-sm w-full p-5 text-center space-y-4 shadow-2xl">
      <div class="w-14 h-14 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-3xl">
        📡
      </div>
      <div class="space-y-1.5">
        <h3 id="offline-warn-title" class="text-base font-black text-amber-300">لا يوجد اتصال بالإنترنت حالياً</h3>
        <p id="offline-warn-desc" class="text-xs text-slate-300 leading-relaxed">
          وضع الأونلاين، التحدي الثنائي، والمكالمات الصوتية والفيديو تتطلب اتصالاً بالإنترنت. يمكنك اللعب الآن مع الكمبيوتر بدون نت مع جميع الأسئلة الـ 300 المخزنة!
        </p>
      </div>
      <div class="space-y-2 pt-1">
        <button onclick="closeModal('modal-offline-warning'); startSingleGame(lang);" class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-lg">
          🎮 اللعب مع الكمبيوتر بدون نت
        </button>
        <button onclick="closeModal('modal-offline-warning')" class="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs">
          إغلاق
        </button>
      </div>
    </div>
  </div>

  <!-- محرك PeerJS المدمج محلياً (بدون أي ملفات خارجية) -->
  <script>/*__INLINE_PEERJS__*/</script>

  <!-- كود الجافاسكربت ومحرك المسابقة -->
  <script>
    const LOCAL_BUILD_VERSION = '__BUILD_VERSION_TOKEN__';
    const LOCAL_QUESTIONS_HASH = '${QUESTIONS_HASH}';
    let QUESTIONS = ${questionsJson};

    const LADDER = [
      100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
      1250, 1500, 1750, 2000, 2500, 3000, 3500, 4000, 4500, 5000,
      6000, 7000, 8000, 9000, 10000, 11500, 13000, 14500, 16000, 18000,
      20000, 22500, 25000, 27500, 30000, 33000, 36000, 39000, 42000, 45000,
      50000, 55000, 60000, 65000, 70000, 75000, 80000, 85000, 90000, 100000,
      110000, 120000, 130000, 140000, 150000, 160000, 170000, 180000, 190000, 200000,
      215000, 230000, 245000, 260000, 275000, 290000, 305000, 320000, 335000, 350000,
      370000, 390000, 410000, 430000, 450000, 470000, 490000, 510000, 530000, 550000,
      575000, 600000, 625000, 650000, 675000, 700000, 725000, 750000, 775000, 800000,
      820000, 840000, 860000, 880000, 900000, 920000, 940000, 960000, 980000, 1000000
    ];
    const MAX_LADDER_STEP = LADDER.length;

    // محرك الأصوات المتكامل عبر Web Audio API
    class AudioSynthesizer {
      constructor() {
        this.ctx = null;
        try {
          this.muted = localStorage.getItem('millionaire_muted') === 'true';
        } catch(e) {
          this.muted = false;
        }
        this.introTimer = null;
        this.tensionTimer = null;
        this.currentAudio = null;
        this.webSpeechTimer = null;
        this.audioWatchdog = null;
        this.speechKeepAlive = null;
        this.webSpeechSafety = null;
        this.speechToken = 0;
      }
      clearWatchdogs() {
        if (this.webSpeechTimer) { clearTimeout(this.webSpeechTimer); this.webSpeechTimer = null; }
        if (this.audioWatchdog) { clearTimeout(this.audioWatchdog); this.audioWatchdog = null; }
        if (this.speechKeepAlive) { clearInterval(this.speechKeepAlive); this.speechKeepAlive = null; }
        if (this.webSpeechSafety) { clearTimeout(this.webSpeechSafety); this.webSpeechSafety = null; }
      }
      init() {
        if (!this.ctx) {
          const AC = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AC();
        }
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        if ('speechSynthesis' in window) {
          try {
            if (window.speechSynthesis.paused) window.speechSynthesis.resume();
            const dummy = new SpeechSynthesisUtterance(' ');
            dummy.volume = 0.01;
            window.speechSynthesis.speak(dummy);
          } catch(e) {}
        }
      }
      playTone(freq, type = 'sine', duration = 0.3, volume = 0.25, delay = 0) {
        if (this.muted) return;
        this.init();
        const start = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(volume, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      }
      playIntro() {
        if (this.muted) return;
        this.stopIntro();
        this.init();
        const notes = [
          { f: 146.83, d: 0.8 }, // D3
          { f: 174.61, d: 0.8 }, // F3
          { f: 220.00, d: 0.8 }, // A3
          { f: 293.66, d: 1.2 }, // D4
          { f: 261.63, d: 0.6 }, // C4
          { f: 293.66, d: 1.5 }, // D4
          { f: 110.00, d: 2.0 }  // A2
        ];
        let del = 0;
        notes.forEach(n => {
          this.playTone(n.f, 'sawtooth', n.d, 0.2, del);
          this.playTone(n.f * 0.5, 'sine', n.d, 0.3, del);
          del += n.d * 0.7;
        });
      }
      stopIntro() {
        if (this.introTimer) {
          clearInterval(this.introTimer);
          this.introTimer = null;
        }
      }
      startTension(rawLevel = 1) {
        if (this.muted) return;
        this.stopTension();
        this.init();
        const tier = Math.max(1, Math.min(15, Math.ceil((Math.min(100, Math.max(1, rawLevel)) / 100) * 15)));
        const tempo = tier > 10 ? 650 : tier > 5 ? 750 : 850;
        let step = 0;
        const notes = [73.42, 87.31, 98.00, 110.0, 116.5, 110.0, 98.00, 87.31];
        this.tensionTimer = setInterval(() => {
          if (this.muted) return;
          const note = notes[step % notes.length];
          step++;
          this.playTone(note, 'sawtooth', 0.35, 0.12);
          if (step % 2 === 0) {
            this.playTone(60, 'sine', 0.16, 0.25);
          }
        }, tempo);
      }
      stopTension() {
        if (this.tensionTimer) {
          clearInterval(this.tensionTimer);
          this.tensionTimer = null;
        }
      }
      speakQuestion(text, options, l = 'ar', lvl = 1, onDone, isMultiplayer = false) {
        this.stopSpeaking();
        const token = ++this.speechToken;

        const levelNamesAr = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر', 'الثالث عشر', 'الرابع عشر', 'الخامس عشر'];
        const levelNamesEn = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen'];

        const stageNum = Math.max(1, Math.min(MAX_LADDER_STEP, lvl));
        const prizeAmt = LADDER[stageNum - 1] || 100;
        const stageStrAr = stageNum === MAX_LADDER_STEP ? 'المئة والأخير' : (stageNum <= 15 ? levelNamesAr[stageNum - 1] : ('رقم ' + stageNum));
        const stageStrEn = stageNum === MAX_LADDER_STEP ? 'one hundred, the final question' : (stageNum <= 15 ? levelNamesEn[stageNum - 1] : String(stageNum));
        const prizeStrAr = (prizeAmt === 1000000) ? 'مليون ريال' : (prizeAmt.toLocaleString('en-US') + ' ريال');
        const prizeStrEn = (prizeAmt === 1000000) ? 'one million dollars' : (prizeAmt.toLocaleString('en-US') + ' dollars');

        const letters = (l === 'ar') ? ['ألف', 'باء', 'جيم', 'دال'] : ['A', 'B', 'C', 'D'];
        const fullText = isMultiplayer
          ? ((l === 'ar')
              ? ('الجولة ' + stageStrAr + '. ' + text + '. الخيار ' + letters[0] + ': ' + options[0] + '. الخيار ' + letters[1] + ': ' + options[1] + '. الخيار ' + letters[2] + ': ' + options[2] + '. الخيار ' + letters[3] + ': ' + options[3] + '.')
              : ('Round ' + stageStrEn + '. ' + text + '. Option ' + letters[0] + ': ' + options[0] + '. Option ' + letters[1] + ': ' + options[1] + '. Option ' + letters[2] + ': ' + options[2] + '. Option ' + letters[3] + ': ' + options[3] + '.'))
          : ((l === 'ar')
              ? ('السؤال ' + stageStrAr + '، بقيمة ' + prizeStrAr + '. ' + text + '. الخيار ' + letters[0] + ': ' + options[0] + '. الخيار ' + letters[1] + ': ' + options[1] + '. الخيار ' + letters[2] + ': ' + options[2] + '. الخيار ' + letters[3] + ': ' + options[3] + '.')
              : ('Question number ' + stageStrEn + ', for ' + prizeStrEn + '. ' + text + '. Option ' + letters[0] + ': ' + options[0] + '. Option ' + letters[1] + ': ' + options[1] + '. Option ' + letters[2] + ': ' + options[2] + '. Option ' + letters[3] + ': ' + options[3] + '.'));

        const isOffline = (typeof navigator !== 'undefined' && navigator.onLine === false);

        // First attempt: Server AI audio stream (online only) with 2.5s start watchdog + Web Speech fallback
        if (!isOffline && typeof Audio !== 'undefined') {
          try {
            const ttsBase = (typeof API_BASE === 'string' && API_BASE) ? API_BASE : '';
            const aud = new Audio(ttsBase + '/api/tts?text=' + encodeURIComponent(fullText) + '&lang=' + (l === 'ar' ? 'ar' : 'en'));
            this.currentAudio = aud;
            let started = false;
            let fellBack = false;

            const doFallback = () => {
              if (fellBack || this.speechToken !== token) return;
              fellBack = true;
              this.clearWatchdogs();
              if (this.currentAudio === aud) {
                try {
                  aud.onplay = null; aud.onplaying = null; aud.onended = null; aud.onerror = null; aud.onstalled = null;
                  aud.pause(); aud.removeAttribute('src');
                } catch(e) {}
                this.currentAudio = null;
              }
              this.speakWithWebSpeech(fullText, l, token, onDone);
            };

            this.audioWatchdog = setTimeout(() => {
              if (!started && this.speechToken === token) doFallback();
            }, 2500);

            const markStarted = () => {
              if (this.speechToken !== token) { try { aud.pause(); } catch(e) {} return; }
              started = true;
              if (this.audioWatchdog) { clearTimeout(this.audioWatchdog); this.audioWatchdog = null; }
            };
            aud.onplay = markStarted;
            aud.onplaying = markStarted;

            aud.onended = () => {
              if (this.speechToken !== token || fellBack) return;
              this.clearWatchdogs();
              this.currentAudio = null;
              isSpeakingVoice = false;
              const icon = document.getElementById('speak-voice-icon');
              const txt = document.getElementById('speak-voice-text');
              if (icon) icon.textContent = '🎙️';
              if (txt) txt.textContent = (lang === 'ar' ? 'صوت المذيع' : 'AI Voice');
              const mpIcon = document.getElementById('mp-speak-voice-icon');
              const mpTxt = document.getElementById('mp-speak-voice-text');
              if (mpIcon) mpIcon.textContent = '🎙️';
              if (mpTxt) mpTxt.textContent = (lang === 'ar' ? 'ناطق السؤال' : 'Read Question');
              if (onDone) onDone();
            };
            aud.onstalled = () => { if (!started && this.speechToken === token) doFallback(); };
            aud.onerror = () => { doFallback(); };
            const p = aud.play();
            if (p !== undefined) {
              p.catch(() => { doFallback(); });
            }
            return;
          } catch(e) {
            this.currentAudio = null;
          }
        }
        this.speakWithWebSpeech(fullText, l, token, onDone);
      }
      speakWithWebSpeech(fullText, l, token, onDone) {
        if (!('speechSynthesis' in window)) {
          isSpeakingVoice = false;
          if (onDone) onDone();
          return;
        }
        if (this.speechToken !== token) return;
        let finished = false;
        const finishWebSpeech = () => {
          if (finished || this.speechToken !== token) return;
          finished = true;
          this.clearWatchdogs();
          isSpeakingVoice = false;
          const icon = document.getElementById('speak-voice-icon');
          const txt = document.getElementById('speak-voice-text');
          if (icon) icon.textContent = '🎙️';
          if (txt) txt.textContent = (lang === 'ar' ? 'صوت المذيع' : 'AI Voice');
          const mpIcon = document.getElementById('mp-speak-voice-icon');
          const mpTxt = document.getElementById('mp-speak-voice-text');
          if (mpIcon) mpIcon.textContent = '🎙️';
          if (mpTxt) mpTxt.textContent = (lang === 'ar' ? 'ناطق السؤال' : 'Read Question');
          if (onDone) onDone();
        };
        try {
          if (window.speechSynthesis.paused) window.speechSynthesis.resume();
          window.speechSynthesis.cancel();
          const utt = new SpeechSynthesisUtterance(fullText);
          utt.lang = (l === 'ar') ? 'ar-SA' : 'en-US';
          utt.rate = 0.95;
          utt.pitch = 0.98;
          window.__currentUtterance = utt;
          utt.onstart = () => {
            if (this.speechToken !== token) {
              try { window.speechSynthesis.cancel(); } catch(e) {}
              return;
            }
          };
          utt.onend = () => finishWebSpeech();
          utt.onerror = () => finishWebSpeech();
          this.speechKeepAlive = setInterval(() => {
            if (this.speechToken !== token) { this.clearWatchdogs(); return; }
            try {
              if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
              }
            } catch(e) {}
          }, 2500);
          this.webSpeechSafety = setTimeout(() => {
            if (!finished && this.speechToken === token) {
              try { window.speechSynthesis.cancel(); } catch(e) {}
              finishWebSpeech();
            }
          }, 14000);
          this.webSpeechTimer = setTimeout(() => {
            if (this.speechToken !== token) return;
            try { window.speechSynthesis.speak(utt); } catch(e) { finishWebSpeech(); }
          }, 40);
        } catch(e) {
          finishWebSpeech();
        }
      }
      stopSpeaking() {
        this.speechToken++;
        this.clearWatchdogs();
        if (this.currentAudio) {
          try {
            const a = this.currentAudio;
            this.currentAudio = null;
            a.onplay = null;
            a.onplaying = null;
            a.onended = null;
            a.onerror = null;
            a.onstalled = null;
            a.pause();
            a.currentTime = 0;
            a.removeAttribute('src');
            a.load();
          } catch(e) {}
          this.currentAudio = null;
        }
        if ('speechSynthesis' in window) {
          try {
            if (window.speechSynthesis.paused) window.speechSynthesis.resume();
            window.speechSynthesis.cancel();
          } catch(e) {}
          setTimeout(() => {
            try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch(e) {}
          }, 25);
        }
        isSpeakingVoice = false;
        const icon = document.getElementById('speak-voice-icon');
        const txt = document.getElementById('speak-voice-text');
        if (icon) icon.textContent = '🎙️';
        if (txt) txt.textContent = (lang === 'ar' ? 'صوت المذيع' : 'AI Voice');
        const mpIcon = document.getElementById('mp-speak-voice-icon');
        const mpTxt = document.getElementById('mp-speak-voice-text');
        if (mpIcon) mpIcon.textContent = '🎙️';
        if (mpTxt) mpTxt.textContent = (lang === 'ar' ? 'ناطق السؤال' : 'Read Question');
      }
      playSelect() {
        this.playTone(440, 'triangle', 0.15, 0.2);
        this.playTone(660, 'sine', 0.2, 0.15, 0.08);
      }
      playCorrect() {
        [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
          this.playTone(f, 'triangle', 0.8, 0.2, i * 0.1);
        });
      }
      playWrong() {
        this.playTone(180, 'sawtooth', 0.6, 0.3);
        this.playTone(130, 'sawtooth', 0.8, 0.35, 0.2);
      }
      playTick() {
        this.playTone(800, 'sine', 0.05, 0.1);
      }
      playLifeline() {
        this.playTone(587.33, 'sine', 0.3, 0.2);
        this.playTone(880, 'triangle', 0.4, 0.25, 0.15);
      }
    }

    const audio = new AudioSynthesizer();

    // حالة التطبيق
    let lang = 'ar';
    let currentLvl = 1;
    let currentQ = null;
    let timerVal = 45;
    let timerId = null;
    let lifelines = { f50: true, aud: true, ph: true, sw: true };
    let correctCount = 0;
    let wrongCount = 0;
    let lastCash = 0;
    let isThemePlaying = false;
    let autoSpeakEnabled = true;
    try {
      const savedAutoSpeak = localStorage.getItem('millionaire_autoread');
      if (savedAutoSpeak !== null) autoSpeakEnabled = (savedAutoSpeak === 'true');
    } catch(e) {}
    let isSpeakingVoice = false;
    let selectedChoiceIdx = -1;
    let isTournamentMode = false;
    let classicCategory = 'all';
    // مسح ذاكرة الأسئلة القديمة تلقائياً عند وجود تحديث وتخزين البنك بالكامل محلياً للعمل بدون إنترنت
    try {
      var savedSig = localStorage.getItem('millionaire_bank_signature_v1');
      if (savedSig !== LOCAL_QUESTIONS_HASH) {
        localStorage.removeItem('millionaire_global_used_questions_all_modes');
        localStorage.removeItem('millionaire_last_classic_run_ids');
        localStorage.removeItem('millionaire_last_picked_topic_map');
        localStorage.removeItem('millionaire_cached_questions_v1');
        localStorage.setItem('millionaire_bank_signature_v1', LOCAL_QUESTIONS_HASH);
      }
      if (!localStorage.getItem('millionaire_cached_questions_v1')) {
        localStorage.setItem('millionaire_cached_questions_v1', JSON.stringify({
          questionsHash: LOCAL_QUESTIONS_HASH,
          questions: QUESTIONS
        }));
      }
    } catch(e) {}

    const sessionUsedIds = new Set();
    let lastClassicRunIds = new Set();
    try {
      const rawLastRun = localStorage.getItem('millionaire_last_classic_run_ids');
      if (rawLastRun) {
        const parsedRun = JSON.parse(rawLastRun);
        if (Array.isArray(parsedRun)) lastClassicRunIds = new Set(parsedRun);
      }
    } catch(e) {}

    let globalUsedQuestionIds = new Set();
    try {
      const validIdsSet = new Set(QUESTIONS.map(q => q.id));
      const savedIds = localStorage.getItem('millionaire_global_used_questions_all_modes');
      if (savedIds) {
        const parsed = JSON.parse(savedIds);
        if (Array.isArray(parsed)) globalUsedQuestionIds = new Set(parsed.filter(id => typeof id === 'string' && validIdsSet.has(id)));
      }
    } catch(e) {}

    let lastTopicByCat = {};
    try {
      const rawLastTopics = localStorage.getItem('millionaire_last_picked_topic_map');
      if (rawLastTopics) {
        const pt = JSON.parse(rawLastTopics);
        if (pt && typeof pt === 'object') lastTopicByCat = pt;
      }
    } catch(e) {}

    function getQTopic(q) {
      return (q && q.t) ? q.t : ((q && q.cat ? q.cat : 'gen') + '_' + (q && q.id ? q.id : '0'));
    }

    function pickWithTopicShuffle(candidates, prevTopic) {
      const nonSame = candidates.filter(q => getQTopic(q) !== prevTopic);
      const pool = nonSame.length > 0 ? nonSame : candidates;
      const counts = {};
      for (let i = 0; i < candidates.length; i++) {
        const tk = getQTopic(candidates[i]);
        counts[tk] = (counts[tk] || 0) + 1;
      }
      const halfCeil = Math.ceil(candidates.length / 2);
      let dominantTopic = null;
      let dominantCount = 0;
      for (const tk in counts) {
        if (tk !== prevTopic && counts[tk] >= halfCeil && counts[tk] > dominantCount) {
          dominantTopic = tk;
          dominantCount = counts[tk];
        }
      }
      const finalPool = dominantTopic ? pool.filter(q => getQTopic(q) === dominantTopic) : pool;
      const pickFrom = finalPool.length > 0 ? finalPool : pool;
      return pickFrom[Math.floor(Math.random() * pickFrom.length)];
    }

    function markQuestionGlobalUsed(id) {
      if (!id) return;
      globalUsedQuestionIds.add(id);
      sessionUsedIds.add(id);
      try {
        localStorage.setItem('millionaire_global_used_questions_all_modes', JSON.stringify(Array.from(globalUsedQuestionIds)));
        localStorage.setItem('millionaire_last_picked_topic_map', JSON.stringify(lastTopicByCat));
      } catch(e) {}
    }

    function matchesClassicCategory(q, cat) {
      if (!cat || cat === 'all' || cat === 'general') return q.cat === 'general';
      if (cat === 'islamic') return q.cat === 'islamic';
      if (cat === 'entertainment') return q.cat === 'sports' || q.cat === 'cinema';
      return q.cat === cat;
    }

    // ==================== نظام الأوسمة وهدايا التشجيع في جميع الأقسام ====================
    const BADGE_DEFS = [
      { id: 'classic_level5', icon: '🥉', title: 'انطلاقة البطل', desc: 'تخطّ السؤال الخامس في اللعب مع الكمبيوتر', pts: 20, section: 'الكمبيوتر' },
      { id: 'classic_level10', icon: '🥈', title: 'فارس المعرفة', desc: 'الوصول للمستوى العاشر مع الكمبيوتر', pts: 40, section: 'الكمبيوتر' },
      { id: 'classic_millionaire', icon: '👑', title: 'بطل تحدي الأبطال', desc: 'إتمام جميع الأسئلة الـ 100 والفوز بالجائزة الكبرى!', pts: 100, section: 'الكمبيوتر' },
      { id: 'classic_streak', icon: '🔥', title: 'سلسلة الإبداع', desc: 'الإجابة على 50 سؤالاً صحيحاً في الكلاسيك', pts: 35, section: 'الكمبيوتر' },
      { id: 'duel_first_win', icon: '⚔️', title: 'نجم المبارزة الثنائية', desc: 'حقق أول فوز في تحدي الكود الثنائي', pts: 30, section: 'الثنائي' },
      { id: 'duel_champion', icon: '🏅', title: 'بطل الكود الرباعي', desc: 'حقق 5 انتصارات في التحدي الثنائي', pts: 60, section: 'الثنائي' },
      { id: 'arena_participant', icon: '🌍', title: 'سفير الأذكياء حول العالم', desc: 'شارك في تحدي 4 لاعبين حول العالم', pts: 25, section: 'الجماعي' },
      { id: 'arena_winner', icon: '🏆', title: 'زعيم ساحة الـ 4 لاعبين', desc: 'احصد المركز الأول في التحدي الجماعي', pts: 50, section: 'الجماعي' },
      { id: 'tournament_hero', icon: '🌟', title: 'متألق بطولة الـ 72 ساعة', desc: 'شارك في جولات البطولة الدورية', pts: 40, section: 'البطولة' },
      { id: 'daily_loyal', icon: '🎁', title: 'هدية الاستمرار اليومي', desc: 'استلام صندوق الهدية اليومي للتشجيع', pts: 15, section: 'الهدايا' },
    ];

    let rewardsState = {
      unlockedIds: [],
      lastDailyGiftAt: 0,
      classicCorrectTotal: 0,
      duelWins: 0,
      arenaMatches: 0,
      arenaWins: 0,
      tournamentPlayed: 0
    };
    try {
      const rawRew = localStorage.getItem('millionaire_rewards_state_v1');
      if (rawRew) rewardsState = Object.assign(rewardsState, JSON.parse(rawRew));
    } catch(e) {}

    function saveRewardsState() {
      try { localStorage.setItem('millionaire_rewards_state_v1', JSON.stringify(rewardsState)); } catch(e) {}
      updateBadgesHud();
    }

    function canClaimDailyGift() {
      return !rewardsState.lastDailyGiftAt || (Date.now() - rewardsState.lastDailyGiftAt >= 24 * 60 * 60 * 1000);
    }

    function showRewardToast(badge, bonusPts) {
      const t = document.getElementById('reward-toast');
      if (!t) return;
      document.getElementById('reward-toast-icon').textContent = badge.icon;
      document.getElementById('reward-toast-title').textContent = badge.title;
      document.getElementById('reward-toast-pts').textContent = '+' + (bonusPts || badge.pts);
      t.classList.remove('hidden');
      setTimeout(() => t.classList.add('hidden'), 4500);
    }

    function tryUnlockBadges() {
      const newly = [];
      const unlock = (id) => {
        if (rewardsState.unlockedIds.indexOf(id) !== -1) return;
        const b = BADGE_DEFS.find(x => x.id === id);
        if (!b) return;
        rewardsState.unlockedIds.push(id);
        userPoints += b.pts;
        newly.push(b);
      };
      if (rewardsState.classicCorrectTotal >= 50) unlock('classic_streak');
      if (rewardsState.duelWins >= 1) unlock('duel_first_win');
      if (rewardsState.duelWins >= 5) unlock('duel_champion');
      if (rewardsState.arenaMatches >= 1) unlock('arena_participant');
      if (rewardsState.arenaWins >= 1) unlock('arena_winner');
      if (rewardsState.tournamentPlayed >= 1) unlock('tournament_hero');
      if (newly.length > 0) {
        savePoints();
        saveRewardsState();
        showRewardToast(newly[0], newly[0].pts);
      } else {
        saveRewardsState();
      }
    }

    function recordClassicRewards(levelReached, isTourn) {
      rewardsState.classicCorrectTotal++;
      if (isTourn) rewardsState.tournamentPlayed++;
      if (levelReached >= 5 && rewardsState.unlockedIds.indexOf('classic_level5') === -1) {
        const b = BADGE_DEFS.find(x => x.id === 'classic_level5');
        rewardsState.unlockedIds.push('classic_level5');
        userPoints += b.pts;
        showRewardToast(b, b.pts);
      }
      if (levelReached >= 10 && rewardsState.unlockedIds.indexOf('classic_level10') === -1) {
        const b = BADGE_DEFS.find(x => x.id === 'classic_level10');
        rewardsState.unlockedIds.push('classic_level10');
        userPoints += b.pts;
        showRewardToast(b, b.pts);
      }
      if (levelReached >= MAX_LADDER_STEP && rewardsState.unlockedIds.indexOf('classic_millionaire') === -1) {
        const b = BADGE_DEFS.find(x => x.id === 'classic_millionaire');
        rewardsState.unlockedIds.push('classic_millionaire');
        userPoints += b.pts;
        showRewardToast(b, b.pts);
      }
      tryUnlockBadges();
      savePoints();
    }

    function claimDailyEncouragementGift() {
      if (!canClaimDailyGift()) return;
      rewardsState.lastDailyGiftAt = Date.now();
      userPoints += 30;
      if (rewardsState.unlockedIds.indexOf('daily_loyal') === -1) {
        const b = BADGE_DEFS.find(x => x.id === 'daily_loyal');
        rewardsState.unlockedIds.push('daily_loyal');
        userPoints += b.pts;
      }
      savePoints();
      saveRewardsState();
      audio.playCorrect();
      showRewardToast({ icon: '🎁', title: 'هدية التشجيع اليومية', pts: 30 }, 30);
      renderBadgesModal();
    }

    function updateBadgesHud() {
      const cntEl = document.getElementById('hud-badges-count');
      if (cntEl) cntEl.textContent = String(rewardsState.unlockedIds.length);
      const dotEl = document.getElementById('hud-gift-dot');
      if (dotEl) {
        if (canClaimDailyGift()) dotEl.classList.remove('hidden');
        else dotEl.classList.add('hidden');
      }
    }

    function renderBadgesModal() {
      const sumEl = document.getElementById('badges-unlocked-summary');
      if (sumEl) sumEl.textContent = rewardsState.unlockedIds.length + ' / ' + BADGE_DEFS.length;
      const gBtn = document.getElementById('btn-claim-daily-gift');
      if (gBtn) {
        if (canClaimDailyGift()) {
          gBtn.disabled = false;
          gBtn.textContent = 'استلام +30';
          gBtn.className = 'px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shrink-0 shadow';
        } else {
          gBtn.disabled = true;
          gBtn.textContent = '✓ تم الاستلام اليوم';
          gBtn.className = 'px-3.5 py-2 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs shrink-0';
        }
      }
      const grid = document.getElementById('badges-grid');
      if (!grid) return;
      grid.innerHTML = '';
      BADGE_DEFS.forEach(function(b) {
        const unlocked = rewardsState.unlockedIds.indexOf(b.id) !== -1;
        const card = document.createElement('div');
        card.className = 'p-3 rounded-2xl border flex items-center gap-3 ' +
          (unlocked ? 'bg-amber-500/10 border-amber-400/60' : 'bg-slate-950/70 border-slate-800 opacity-65');
        card.innerHTML = '<div class="text-2xl shrink-0">' + b.icon + '</div>' +
          '<div class="flex-1 min-w-0">' +
            '<div class="text-xs font-black ' + (unlocked ? 'text-amber-300' : 'text-slate-300') + '">' + b.title + ' <span class="text-[10px] text-slate-400">(' + b.section + ')</span></div>' +
            '<div class="text-[11px] text-slate-400">' + b.desc + '</div>' +
          '</div>' +
          '<span class="px-2 py-0.5 rounded-lg text-[10px] font-black shrink-0 ' + (unlocked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-900 text-amber-400') + '">' +
            (unlocked ? '✓ مُحقق' : ('+' + b.pts)) +
          '</span>';
        grid.appendChild(card);
      });
    }

    function openBadgesModal() {
      renderBadgesModal();
      document.getElementById('modal-badges').classList.remove('hidden');
    }

    // الملف الشخصي المحفوظ للمتسابق (الاسم، الصورة، النوع، تاريخ الميلاد)
    let userProfile = {
      name: 'المتسابق الذهبي',
      avatar: '👑',
      gender: 'male',
      birthDate: '2000-01-01',
      country: '🇸🇦 السعودية'
    };
    try {
      const savedProf = localStorage.getItem('millionaire_user_profile');
      if (savedProf) {
        const parsed = JSON.parse(savedProf);
        if (parsed && parsed.name) userProfile = Object.assign(userProfile, parsed);
      }
    } catch(e) {}

    function openProfileModal() {
      document.getElementById('prof-input-name').value = userProfile.name;
      document.getElementById('prof-preview-avatar').textContent = userProfile.avatar;
      document.getElementById('prof-preview-name').textContent = userProfile.name;
      document.getElementById('prof-preview-sub').textContent = (userProfile.gender === 'female' ? 'أنثى' : 'ذكر') + ' • ' + (userProfile.country || '');
      document.getElementById('prof-input-dob').value = userProfile.birthDate || '2000-01-01';
      document.getElementById('prof-input-country').value = userProfile.country || '🇸🇦 السعودية';
      selectProfGender(userProfile.gender || 'male');
      document.getElementById('modal-profile').classList.remove('hidden');
    }

    function selectProfAvatar(em) {
      userProfile.avatar = em;
      document.getElementById('prof-preview-avatar').textContent = em;
    }

    function selectProfGender(g) {
      userProfile.gender = g;
      const bM = document.getElementById('prof-btn-male');
      const bF = document.getElementById('prof-btn-female');
      if (bM && bF) {
        if (g === 'male') {
          bM.className = 'py-1.5 px-3 rounded-xl border border-blue-500 bg-blue-500/20 text-blue-300 font-bold text-xs';
          bF.className = 'py-1.5 px-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-400 font-bold text-xs';
        } else {
          bF.className = 'py-1.5 px-3 rounded-xl border border-pink-500 bg-pink-500/20 text-pink-300 font-bold text-xs';
          bM.className = 'py-1.5 px-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-400 font-bold text-xs';
        }
      }
      const sub = document.getElementById('prof-preview-sub');
      if (sub) sub.textContent = (g === 'female' ? 'أنثى' : 'ذكر') + ' • ' + (userProfile.country || '');
    }

    function saveUserProfile() {
      const nameInp = document.getElementById('prof-input-name').value.trim();
      if (nameInp) userProfile.name = nameInp;
      userProfile.birthDate = document.getElementById('prof-input-dob').value;
      userProfile.country = document.getElementById('prof-input-country').value;

      try {
        localStorage.setItem('millionaire_user_profile', JSON.stringify(userProfile));
        localStorage.setItem('millionaire_player_name', userProfile.name);
        localStorage.setItem('millionaire_player_avatar', userProfile.avatar);
      } catch(e) {}

      updateProfileUI();
      closeModal('modal-profile');
      audio.playSelect();
    }

    function updateProfileUI() {
      const av = document.getElementById('hud-profile-avatar');
      if (av) av.textContent = userProfile.avatar || '👑';
      const nm = document.getElementById('hud-profile-name');
      if (nm) nm.textContent = userProfile.name || (lang === 'ar' ? 'المتسابق' : 'Contestant');
      const p0 = document.getElementById('mp-p0-name');
      if (p0) p0.textContent = (userProfile.name || 'أنت') + ' (أنت)';
      const inp = document.getElementById('mp-nickname-input');
      if (inp) inp.value = userProfile.name;
      myPlayerName = userProfile.name;
    }

    // رصيد النقاط المحلي: كل لاعب يبدأ بـ 150 نقطة فقط (+50 لكل إجابة صح، وخصم 50 اختياري عند الخطأ)
    let userPoints = 150;
    try {
      const migrated150 = localStorage.getItem('millionaire_points_v150_applied');
      const savedPts = localStorage.getItem('millionaire_player_points');
      if (!migrated150) {
        userPoints = 150;
        localStorage.setItem('millionaire_player_points', '150');
        localStorage.setItem('millionaire_points_v150_applied', '1');
      } else if (savedPts !== null) {
        const parsed = parseInt(savedPts, 10);
        if (!isNaN(parsed) && parsed >= 0) userPoints = parsed;
      }
    } catch(e) {}

    function savePoints() {
      try { localStorage.setItem('millionaire_player_points', userPoints.toString()); } catch(e) {}
      updatePointsDisplay();
    }

    function updatePointsDisplay() {
      const hud = document.getElementById('hud-user-points');
      if (hud) hud.textContent = userPoints + (lang === 'ar' ? ' نقطة' : ' pts');
      const rev = document.getElementById('revival-pts-val');
      if (rev) rev.textContent = userPoints + (lang === 'ar' ? ' نقطة' : ' pts');
    }

    window.addEventListener('DOMContentLoaded', () => {
      updateProfileUI();
      updatePointsDisplay();
      updateBadgesHud();
      const startTheme = () => {
        audio.playIntro();
        isThemePlaying = true;
        document.getElementById('theme-song-icon').textContent = '⏹️';
        document.getElementById('theme-song-text').textContent = (lang === 'ar' ? 'إيقاف الشارة الموسيقية' : 'Stop Theme Song');
        window.removeEventListener('click', startTheme);
        window.removeEventListener('touchstart', startTheme);
      };
      startTheme();
      window.addEventListener('click', startTheme, { once: true });
      window.addEventListener('touchstart', startTheme, { once: true });
    });

    function resetViewportScroll() {
      try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch(e) {
        try { window.scrollTo(0, 0); } catch(e2) {}
      }
      try { document.documentElement.scrollTop = 0; document.documentElement.scrollLeft = 0; } catch(e) {}
      try { document.body.scrollTop = 0; document.body.scrollLeft = 0; } catch(e) {}
    }

    function show(id) {
      ['screen-lobby', 'screen-game', 'screen-result', 'screen-multiplayer', 'screen-rooms'].forEach(s => {
        const el = document.getElementById(s);
        if (!el) return;
        if (s === id) {
          el.classList.remove('hidden');
          el.classList.add('flex', 'flex-col');
        } else {
          el.classList.add('hidden');
          el.classList.remove('flex');
        }
      });

      const backBtn = document.getElementById('btn-back');
      if (backBtn) {
        if (id === 'screen-lobby') {
          backBtn.classList.add('hidden');
          backBtn.classList.remove('flex');
        } else {
          backBtn.classList.remove('hidden');
          backBtn.classList.add('flex');
        }
      }

      resetViewportScroll();
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(resetViewportScroll);
      }
    }

    // Back Navigation & Forfeit / 4P Bot Replacement Synchronization
    function send1v1Forfeit(code) {
      if (!code) return;
      const role = hasAutoJoinedRoom ? 'player2_guest' : 'player1_host';
      const endpoint = (currentMultiMode === '4p') ? '/4p/forfeit' : '/1v1/forfeit';
      const payload = JSON.stringify({
        playerId: myPlayerId,
        role: current4pRole || role,
        name: userProfile.name || myPlayerName
      });
      const url = API_BASE + '/api/rooms/' + encodeURIComponent(code) + endpoint;
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
        }
      } catch(e) {}
      try {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
          body: payload
        }).catch(() => {});
      } catch(e) {}
    }

    function forfeitMultiNow() {
      const isMulti = !document.getElementById('screen-multiplayer').classList.contains('hidden');
      if (isMulti && !is1v1MatchLocked && current1v1RoomCode) {
        send1v1Forfeit(current1v1RoomCode);
        if (currentMultiMode === '4p') {
          goToLobby();
          return;
        }
        const myRoleStr = hasAutoJoinedRoom ? 'player2_guest' : 'player1_host';
        close1v1MatchLocked({
          forfeitedBy: myRoleStr,
          winnerRole: myRoleStr === 'player1_host' ? 'player2_guest' : 'player1_host',
          player1_score: hasAutoJoinedRoom ? mpScores[1] : mpScores[0],
          player2_score: hasAutoJoinedRoom ? mpScores[0] : mpScores[1]
        }, false);
      } else {
        goToLobby();
      }
    }

    function handleBackClick() {
      const lobbyEl = document.getElementById('screen-lobby');
      if (lobbyEl && !lobbyEl.classList.contains('hidden')) {
        resetViewportScroll();
        return;
      }
      goToLobby();
    }

    function onPageUnloadForfeit() {
      audio.stopSpeaking();
      audio.stopTension();
      audio.stopIntro();
      try {
        const isMulti = !document.getElementById('screen-multiplayer').classList.contains('hidden');
        if (isMulti && current1v1RoomCode && !is1v1MatchLocked) {
          send1v1Forfeit(current1v1RoomCode);
        }
      } catch(e) {}
    }

    // Stop background processes and forfeit/replace immediately if closing tab/page/WebView
    window.addEventListener('pagehide', onPageUnloadForfeit);
    window.addEventListener('beforeunload', onPageUnloadForfeit);
    window.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        audio.stopSpeaking();
        audio.stopTension();
        audio.stopIntro();
      }
    });

    function goToLobby() {
      if (current1v1RoomCode && !is1v1MatchLocked) {
        send1v1Forfeit(current1v1RoomCode);
      }
      audio.stopIntro();
      audio.stopTension();
      audio.stopSpeaking();
      isThemePlaying = false;
      isSpeakingVoice = false;
      const themeIcon = document.getElementById('theme-song-icon');
      if (themeIcon) themeIcon.textContent = '🎵';
      clearInterval(timerId);
      timerId = null;
      if (typeof mpActiveTimer !== 'undefined') clearInterval(mpActiveTimer);
      if (typeof mpSearchTimer !== 'undefined') clearInterval(mpSearchTimer);
      if (typeof friendPollTimer !== 'undefined') clearInterval(friendPollTimer);
      if (typeof mpGameStatePollTimer !== 'undefined') clearInterval(mpGameStatePollTimer);
      if (typeof mpHeartbeatTimer !== 'undefined') clearInterval(mpHeartbeatTimer);
      if (typeof mpEventSource !== 'undefined' && mpEventSource) {
        try { mpEventSource.close(); } catch(e) {}
        mpEventSource = null;
      }
      if (typeof mpAutoAdvanceTimer !== 'undefined' && mpAutoAdvanceTimer) {
        clearTimeout(mpAutoAdvanceTimer);
        mpAutoAdvanceTimer = null;
      }
      if (typeof mpDeviceId !== 'undefined') {
        try {
          fetch(API_BASE + '/api/matchmaking/4p/leave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            keepalive: true,
            body: JSON.stringify({ deviceId: mpDeviceId, playerId: myPlayerId })
          }).catch(function() {});
        } catch(e) {}
      }
      is1v1MatchLocked = false;
      hasAutoJoinedRoom = false;
      current4pRole = '';
      current1v1RoomCode = '';
      ['modal-aud', 'modal-ph', 'modal-revival', 'modal-badges', 'modal-tournament', 'modal-profile', 'modal-privacy', 'modal-mic-perm', 'modal-report'].forEach(mid => {
        const mEl = document.getElementById(mid);
        if (mEl) {
          mEl.classList.add('hidden');
          mEl.classList.remove('flex');
        }
      });
      rtcStopMatchMic();
      rtcStopWatching();
      syncCallPauseUI();
      show('screen-lobby');
    }

    function toggleLanguage() {
      lang = (lang === 'ar' ? 'en' : 'ar');
      updateUIStrings();
      if (!document.getElementById('screen-game').classList.contains('hidden') && currentQ) {
        displayQuestion();
      }
    }

    function updateUIStrings() {
      const isAr = (lang === 'ar');
      document.documentElement.lang = lang;
      document.documentElement.dir = isAr ? 'rtl' : 'ltr';
      document.getElementById('lang-label').textContent = isAr ? 'English' : 'عربي';
      const backArrow = document.getElementById('btn-back-arrow');
      const backText = document.getElementById('btn-back-text');
      if (backArrow) backArrow.textContent = isAr ? '➡️' : '⬅️';
      if (backText) backText.textContent = isAr ? 'رجوع' : 'Back';

      if (isAr) {
        document.getElementById('app-title').textContent = 'تحدي الابطال :مسابقة لايف';
        document.getElementById('lobby-title').textContent = 'تحدي الابطال :مسابقة لايف';
        document.getElementById('hud-prize-label').textContent = 'الجائزة الحالية';
        document.getElementById('label-aud').textContent = 'الجمهور';
        document.getElementById('label-ph').textContent = 'صديق';
        document.getElementById('label-sw').textContent = 'تبديل';
        document.getElementById('speak-voice-text').textContent = isSpeakingVoice ? 'إيقاف الصوت' : 'صوت المذيع';
        const mpVtAr = document.getElementById('mp-speak-voice-text');
        if (mpVtAr) mpVtAr.textContent = isSpeakingVoice ? 'إيقاف الصوت' : 'ناطق السؤال';
      } else {
        document.getElementById('app-title').textContent = 'Champions Challenge : Live Quiz';
        document.getElementById('lobby-title').textContent = 'Champions Challenge : Live Quiz';
        document.getElementById('hud-prize-label').textContent = 'Current Prize';
        document.getElementById('label-aud').textContent = 'Audience';
        document.getElementById('label-ph').textContent = 'Friend';
        document.getElementById('label-sw').textContent = 'Switch';
        document.getElementById('speak-voice-text').textContent = isSpeakingVoice ? 'Stop Voice' : 'AI Voice';
        const mpVtEn = document.getElementById('mp-speak-voice-text');
        if (mpVtEn) mpVtEn.textContent = isSpeakingVoice ? 'Stop Voice' : 'Read Question';
      }
      if (typeof updateAutoSpeakLabels === 'function') updateAutoSpeakLabels();
    }

    function toggleMute() {
      audio.muted = !audio.muted;
      try { localStorage.setItem('millionaire_muted', String(audio.muted)); } catch(e) {}
      document.getElementById('sound-icon').textContent = audio.muted ? '🔇' : '🔊';
      if (audio.muted) {
        audio.stopTension();
        audio.stopSpeaking();
      }
    }

    function toggleIntroTheme() {
      if (!isThemePlaying) {
        audio.playIntro();
        isThemePlaying = true;
        document.getElementById('theme-song-icon').textContent = '⏹️';
        document.getElementById('theme-song-text').textContent = (lang === 'ar' ? 'إيقاف الشارة الموسيقية' : 'Stop Theme Song');
      } else {
        audio.stopIntro();
        isThemePlaying = false;
        document.getElementById('theme-song-icon').textContent = '🎵';
        document.getElementById('theme-song-text').textContent = (lang === 'ar' ? 'تشغيل الشارة الموسيقية القوية (تحدي الأبطال)' : 'Play Theme Song (Champions Challenge)');
      }
    }

    function toggleSpeakQuestion(forceStart = false, onDone = null) {
      if (!currentQ) return;
      const isAr = (lang === 'ar');
      const qText = isAr ? currentQ.qa : currentQ.qe;
      const opts = isAr ? currentQ.oa : currentQ.oe;

      if (isSpeakingVoice && !forceStart) {
        audio.stopSpeaking();
        isSpeakingVoice = false;
        document.getElementById('speak-voice-icon').textContent = '🎙️';
        document.getElementById('speak-voice-text').textContent = isAr ? 'صوت المذيع' : 'AI Voice';
        if (onDone) onDone();
      } else {
        audio.speakQuestion(qText, opts, lang, currentLvl, () => {
          if (onDone) onDone();
        });
        isSpeakingVoice = true;
        document.getElementById('speak-voice-icon').textContent = '⏹️';
        document.getElementById('speak-voice-text').textContent = isAr ? 'إيقاف الصوت' : 'Stop Voice';
      }
    }

    function updateAutoSpeakLabels() {
      const isAr = (lang === 'ar');
      const labelText = autoSpeakEnabled
        ? (isAr ? 'تلقائي: مفعل' : 'Auto: ON')
        : (isAr ? 'تلقائي: معطل' : 'Auto: OFF');
      const classicLbl = document.getElementById('auto-speak-label');
      if (classicLbl) classicLbl.textContent = labelText;
      const mpLbl = document.getElementById('mp-auto-speak-label');
      if (mpLbl) mpLbl.textContent = labelText;
    }

    function toggleAutoSpeak() {
      autoSpeakEnabled = !autoSpeakEnabled;
      try { localStorage.setItem('millionaire_autoread', String(autoSpeakEnabled)); } catch(e) {}
      updateAutoSpeakLabels();
      if (autoSpeakEnabled && !isSpeakingVoice && currentQ) {
        toggleSpeakQuestion(true);
      }
    }

    function toggleMpSpeakQuestion(forceStart = false, onDone = null) {
      if (!currentMpQ || rtcInCall) return;
      audio.init();
      const isAr = (lang === 'ar');
      const qText = isAr ? currentMpQ.qa : currentMpQ.qe;
      const opts = isAr ? currentMpQ.oa : currentMpQ.oe;
      const mpIcon = document.getElementById('mp-speak-voice-icon');
      const mpTxt = document.getElementById('mp-speak-voice-text');

      if (isSpeakingVoice && !forceStart) {
        audio.stopSpeaking();
        isSpeakingVoice = false;
        if (mpIcon) mpIcon.textContent = '🎙️';
        if (mpTxt) mpTxt.textContent = isAr ? 'ناطق السؤال' : 'Read Question';
        if (onDone) onDone();
      } else {
        audio.speakQuestion(qText, opts, lang, mpRound || 1, () => {
          if (mpIcon) mpIcon.textContent = '🎙️';
          if (mpTxt) mpTxt.textContent = isAr ? 'ناطق السؤال' : 'Read Question';
          if (onDone) onDone();
        }, true);
        isSpeakingVoice = true;
        if (mpIcon) mpIcon.textContent = '⏹️';
        if (mpTxt) mpTxt.textContent = isAr ? 'إيقاف الصوت' : 'Stop Voice';
      }
    }

    function toggleMpAutoSpeak() {
      audio.init();
      autoSpeakEnabled = !autoSpeakEnabled;
      try { localStorage.setItem('millionaire_autoread', String(autoSpeakEnabled)); } catch(e) {}
      updateAutoSpeakLabels();
      if (autoSpeakEnabled && !isSpeakingVoice && currentMpQ && !rtcInCall && !mpRoundRevealed) {
        toggleMpSpeakQuestion(true);
      } else if (!autoSpeakEnabled && isSpeakingVoice) {
        audio.stopSpeaking();
      }
    }

    function startSingleGame(selectedLang, isTourn = false) {
      audio.init();
      audio.stopIntro();
      audio.stopSpeaking();
      isThemePlaying = false;
      document.getElementById('theme-song-icon').textContent = '🎵';

      if (sessionUsedIds.size > 0) {
        const mergedRun = Array.from(lastClassicRunIds).concat(Array.from(sessionUsedIds));
        lastClassicRunIds = new Set(mergedRun.slice(-150));
        try { localStorage.setItem('millionaire_last_classic_run_ids', JSON.stringify(Array.from(lastClassicRunIds))); } catch(e) {}
      }

      const catEl = document.getElementById('classic-category');
      classicCategory = catEl ? catEl.value : 'all';

      lang = selectedLang;
      isTournamentMode = isTourn;
      updateUIStrings();
      updatePointsDisplay();
      currentLvl = 1;
      correctCount = 0;
      wrongCount = 0;
      lastCash = 0;
      selectedChoiceIdx = -1;
      sessionUsedIds.clear();
      lifelines = { f50: true, aud: true, ph: true, sw: true };

      ['5050', 'audience', 'phone', 'switch'].forEach(id => {
        const btn = document.getElementById('btn-' + id);
        btn.classList.remove('opacity-30', 'pointer-events-none', 'line-through');
      });

      show('screen-game');
      pickQuestionForLevel(1);
    }

    let isTournReminderActive = false;
    let tournCycleRemaining = 0;
    let isTournOpenWindow = false;

    function updateTournamentTimer() {
      const CYCLE_MS = 72 * 60 * 60 * 1000;
      const OPEN_WINDOW_MS = 2 * 60 * 60 * 1000;
      const now = Date.now();
      const cyclePos = now % CYCLE_MS;
      isTournOpenWindow = cyclePos < OPEN_WINDOW_MS;
      tournCycleRemaining = isTournOpenWindow ? 0 : (CYCLE_MS - cyclePos);

      const days = Math.floor(tournCycleRemaining / (24 * 60 * 60 * 1000));
      const hours = Math.floor((tournCycleRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((tournCycleRemaining % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((tournCycleRemaining % (60 * 1000)) / 1000);

      const dEl = document.getElementById('tourn-days');
      const hEl = document.getElementById('tourn-hours');
      const mEl = document.getElementById('tourn-mins');
      const sEl = document.getElementById('tourn-secs');
      if (dEl) dEl.textContent = days;
      if (hEl) hEl.textContent = String(hours).padStart(2, '0');
      if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
      if (sEl) sEl.textContent = String(seconds).padStart(2, '0');

      // Requirement 2: 15-minute notification trigger
      const FIFTEEN_MIN = 15 * 60 * 1000;
      if (tournCycleRemaining <= FIFTEEN_MIN && tournCycleRemaining > (FIFTEEN_MIN - 2000) && isTournReminderActive) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🏆 بطولة تحدي الأبطال الكبرى', {
            body: 'متبقي 15 دقيقة فقط على انطلاق منافسات بطولة العالم! جهز نفسك للمنافسة!',
            icon: '/favicon.ico'
          });
        }
      }

      // Strictly locked outside the scheduled 2-hour open window
      const isLocked = !isTournOpenWindow;
      const enterBtn = document.getElementById('btn-enter-tourn');
      const btnLabel = document.getElementById('tourn-btn-label');
      if (enterBtn && btnLabel) {
        if (isLocked) {
          enterBtn.className = 'w-full py-3 px-4 bg-slate-800 border border-slate-700 text-slate-500 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed';
          btnLabel.textContent = (lang === 'ar' ? '🔒 البطولة مغلقة حتى موعدها المحدد' : '🔒 Tournament Locked Until Scheduled Start');
        } else {
          enterBtn.className = 'w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-98';
          btnLabel.textContent = (lang === 'ar' ? '▶ دخول بطولة الـ 72 ساعة الآن (نقاط مضاعفة)' : '▶ Enter Tournament Now');
        }
      }
    }

    setInterval(updateTournamentTimer, 1000);
    setTimeout(updateTournamentTimer, 100);

    function openTournamentModal() {
      audio.init();
      audio.playSelect();
      updateTournamentTimer();
      document.getElementById('modal-tournament').classList.remove('hidden');
    }

    function handleTournamentClick() {
      if (!isTournOpenWindow) {
        audio.playWrong();
        const toast = document.getElementById('tourn-locked-toast');
        if (toast) {
          toast.classList.remove('hidden');
          setTimeout(() => toast.classList.add('hidden'), 3500);
        }
        return;
      }

      audio.playCorrect();
      closeModal('modal-tournament');
      startTournamentGame();
    }

    async function toggleTournReminder() {
      audio.playSelect();
      if ('Notification' in window) {
        if (Notification.permission !== 'granted') {
          const perm = await Notification.requestPermission();
          if (perm !== 'granted') {
            alert(lang === 'ar' ? 'يرجى تفعيل صلاحية الإشعارات لتنبيهك قبل البدء بـ 15 دقيقة.' : 'Please allow notifications for the 15-minute alert.');
            return;
          }
        }
      }
      isTournReminderActive = !isTournReminderActive;
      const btn = document.getElementById('btn-tourn-remind');
      if (btn) {
        btn.textContent = isTournReminderActive ? (lang === 'ar' ? 'مفعل ✓' : 'Active ✓') : (lang === 'ar' ? 'تفعيل 🔔' : 'Enable 🔔');
      }
      if (isTournReminderActive) {
        alert(lang === 'ar' ? 'تم ضبط التذكير! سنرسل لك إشعاراً قبل انطلاق البطولة بـ 15 دقيقة بالضبط.' : 'Reminder set! Notification will trigger 15 mins before start.');
      }
    }

    function startTournamentGame() {
      startSingleGame(lang, true);
    }

    function restartSingleGame() {
      startSingleGame(lang, isTournamentMode);
    }

    // Topic-interleaved shuffle & zero repetition across the entire 100-question cycle
    function pickQuestionForLevel(level) {
      clearInterval(timerId);
      timerId = null;
      audio.stopSpeaking();
      isSpeakingVoice = false;
      document.getElementById('speak-voice-icon').textContent = '🎙️';
      document.getElementById('speak-voice-text').textContent = (lang === 'ar' ? 'صوت المذيع' : 'AI Voice');
      document.getElementById('q-explanation').classList.add('hidden');

      const catBank = QUESTIONS.filter(q => matchesClassicCategory(q, classicCategory));
      const activeCatBank = catBank.length > 0 ? catBank : QUESTIONS;
      const catTopicKey = (!classicCategory || classicCategory === 'all') ? 'general' : classicCategory;
      const prevTopic = lastTopicByCat[catTopicKey] || '';
      const isDedicated100 = catTopicKey === 'general' || catTopicKey === 'islamic' || catTopicKey === 'entertainment';

      let pool = activeCatBank.filter(q => !sessionUsedIds.has(q.id) && !globalUsedQuestionIds.has(q.id));
      if (pool.length === 0) {
        const catIdSet = new Set(activeCatBank.map(q => q.id));
        for (const id of Array.from(globalUsedQuestionIds)) {
          if (catIdSet.has(id)) globalUsedQuestionIds.delete(id);
        }
        pool = activeCatBank.filter(q => !sessionUsedIds.has(q.id));
        if (pool.length === 0) pool = activeCatBank;
      }

      if (isDedicated100) {
        currentQ = pickWithTopicShuffle(pool, prevTopic) || activeCatBank[0];
      } else {
        const mappedLvl = Math.min(15, Math.max(1, Math.ceil((level / MAX_LADDER_STEP) * 15)));
        const notLast = pool.filter(q => !lastClassicRunIds.has(q.id));
        const basePool = notLast.length > 0 ? notLast : pool;
        const exact = basePool.filter(q => q.lvl === mappedLvl);
        if (exact.length > 0) {
          currentQ = pickWithTopicShuffle(exact, prevTopic);
        } else {
          const tierMin = mappedLvl <= 5 ? 1 : mappedLvl <= 10 ? 6 : 11;
          const tierMax = mappedLvl <= 5 ? 5 : mappedLvl <= 10 ? 10 : 15;
          const tiered = basePool.filter(q => q.lvl >= tierMin && q.lvl <= tierMax);
          currentQ = pickWithTopicShuffle(tiered.length > 0 ? tiered : basePool, prevTopic);
        }
      }

      lastTopicByCat[catTopicKey] = getQTopic(currentQ);
      markQuestionGlobalUsed(currentQ.id);

      displayQuestion();
      audio.startTension(level);

      const timerDisplay = document.getElementById('hud-timer');
      if (autoSpeakEnabled) {
        timerVal = 45;
        if (timerDisplay) timerDisplay.textContent = (lang === 'ar' ? '45s (قراءة...)' : '45s (reading...)');
        setTimeout(() => {
          toggleSpeakQuestion(true, () => {
            if (!timerId && !rtcInCall) startTimer();
          });
          setTimeout(() => {
            if (!timerId && !rtcInCall) startTimer();
          }, 12000);
        }, 300);
      } else {
        startTimer();
      }
    }

    function displayQuestion() {
      const isAr = (lang === 'ar');
      document.getElementById('hud-level').textContent = currentLvl;
      document.getElementById('hud-prize').textContent = LADDER[currentLvl - 1].toLocaleString() + ' $';
      document.getElementById('q-text').textContent = isAr ? currentQ.qa : currentQ.qe;
      document.getElementById('q-category-badge').textContent = currentQ.cat || (isAr ? 'ثقافة عامة' : 'General Knowledge');

      const letters = isAr ? ['أ', 'ب', 'ج', 'د'] : ['A', 'B', 'C', 'D'];
      for (let i = 0; i < 4; i++) {
        const btn = document.getElementById('opt-' + i);
        btn.classList.remove('opacity-25', 'pointer-events-none', 'border-emerald-500', 'bg-emerald-500/20', 'border-red-500', 'bg-red-500/20');
        btn.classList.add('border-slate-700', 'bg-slate-900/90');
        btn.querySelector('span:first-child').textContent = letters[i];
        btn.querySelector('.opt-content').textContent = isAr ? currentQ.oa[i] : currentQ.oe[i];
      }
    }

    function startTimer() {
      if (rtcInCall) return;
      timerVal = 45;
      document.getElementById('hud-timer').textContent = timerVal;
      clearInterval(timerId);
      timerId = setInterval(() => {
        if (rtcInCall) return;
        timerVal--;
        document.getElementById('hud-timer').textContent = timerVal;
        if (timerVal <= 5 && timerVal > 0) audio.playTick();
        if (timerVal <= 0) {
          clearInterval(timerId);
          handleAnswer(-1);
        }
      }, 1000);
    }

    // قواعد اللعب مع الكمبيوتر: لا حذف مجاني! فقط بـ 50 نقطة أو وسيلة مساعدة، وإلا يخسر فوراً
    function handleAnswer(choiceIdx) {
      if (rtcInCall) return;
      clearInterval(timerId);
      audio.stopSpeaking();
      audio.stopTension();
      isSpeakingVoice = false;
      selectedChoiceIdx = choiceIdx;
      document.getElementById('speak-voice-icon').textContent = '🎙️';
      document.getElementById('speak-voice-text').textContent = (lang === 'ar' ? 'صوت المذيع' : 'AI Voice');
      audio.playSelect();

      const isCorrect = (choiceIdx === currentQ.ans);
      const isAr = (lang === 'ar');

      const expBox = document.getElementById('q-explanation');
      expBox.textContent = isAr ? currentQ.ea : currentQ.ee;
      expBox.classList.remove('hidden');

      if (isCorrect) {
        audio.playCorrect();
        correctCount++;
        lastCash = LADDER[currentLvl - 1];

        userPoints += 50;
        savePoints();
        recordClassicRewards(currentLvl, isTournamentMode);

        const btn = document.getElementById('opt-' + choiceIdx);
        btn.classList.remove('border-slate-700', 'bg-slate-900/90');
        btn.classList.add('border-emerald-500', 'bg-emerald-500/20');

        setTimeout(() => {
          if (currentLvl < MAX_LADDER_STEP) {
            currentLvl++;
            pickQuestionForLevel(currentLvl);
          } else {
            finishGame(true);
          }
        }, 1300);
      } else {
        audio.playWrong();
        wrongCount++;

        if (choiceIdx >= 0) {
          const wrongBtn = document.getElementById('opt-' + choiceIdx);
          wrongBtn.classList.remove('border-slate-700', 'bg-slate-900/90');
          wrongBtn.classList.add('border-red-500', 'bg-red-500/20');
        }

        if (userPoints < 50) {
          // لا يملك 50 نقطة للمواصلة -> يخسر فوراً!
          const rightBtn = document.getElementById('opt-' + currentQ.ans);
          if (rightBtn) {
            rightBtn.classList.remove('border-slate-700', 'bg-slate-900/90');
            rightBtn.classList.add('border-emerald-500', 'bg-emerald-500/20');
          }
          setTimeout(() => {
            lastCash = 0;
            finishGame(false);
          }, 950);
          return;
        }

        // يفتح نافذة المواصلة بالنقاط فقط (50 نقطة)
        setTimeout(() => {
          openRevivalModal();
        }, 700);
      }
    }

    function openRevivalModal() {
      updatePointsDisplay();
      const modal = document.getElementById('modal-revival');
      const btnRevive = document.getElementById('btn-revive-pts');
      if (userPoints < 50) btnRevive.classList.add('hidden');
      else btnRevive.classList.remove('hidden');

      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function reviveWithPoints() {
      if (userPoints < 50) return;
      userPoints -= 50;
      savePoints();
      document.getElementById('modal-revival').classList.add('hidden');
      document.getElementById('modal-revival').classList.remove('flex');

      // إجابة السؤال الحالي بـ 50 نقطة والانتقال للمستوى التالي
      audio.playCorrect();
      selectedChoiceIdx = -1;
      document.getElementById('q-explanation').classList.add('hidden');
      lastCash = LADDER[currentLvl - 1];
      if (currentLvl < MAX_LADDER_STEP) {
        currentLvl++;
        pickQuestionForLevel(currentLvl);
      } else {
        finishGame(true);
      }
    }

    function reviveWithLifeline(type) {
      document.getElementById('modal-revival').classList.add('hidden');
      document.getElementById('modal-revival').classList.remove('flex');
      for (let i = 0; i < 4; i++) {
        const btn = document.getElementById('opt-' + i);
        if (btn) btn.classList.remove('border-red-500', 'bg-red-500/20');
      }
      selectedChoiceIdx = -1;
      document.getElementById('q-explanation').classList.add('hidden');
      if (type === '5050') { use5050(); startTimer(); audio.startTension(currentLvl); }
      else if (type === 'aud') { useAudience(); startTimer(); audio.startTension(currentLvl); }
      else if (type === 'ph') { usePhone(); startTimer(); audio.startTension(currentLvl); }
      else if (type === 'sw') { useSwitch(); }
    }

    function restartFreshAttempt() {
      document.getElementById('modal-revival').classList.add('hidden');
      document.getElementById('modal-revival').classList.remove('flex');
      startSingleGame(lang, isTournamentMode);
    }

    function use5050() {
      if (!lifelines.f50) return;
      audio.playLifeline();
      lifelines.f50 = false;
      document.getElementById('btn-5050').classList.add('opacity-30', 'pointer-events-none', 'line-through');

      const wrongs = [0, 1, 2, 3].filter(i => i !== currentQ.ans);
      const toHide = wrongs.sort(() => 0.5 - Math.random()).slice(0, 2);
      toHide.forEach(idx => {
        document.getElementById('opt-' + idx).classList.add('opacity-25', 'pointer-events-none');
      });
    }

    function useAudience() {
      if (!lifelines.aud) return;
      audio.playLifeline();
      lifelines.aud = false;
      document.getElementById('btn-audience').classList.add('opacity-30', 'pointer-events-none', 'line-through');

      const letters = (lang === 'ar' ? ['أ', 'ب', 'ج', 'د'] : ['A', 'B', 'C', 'D']);
      const container = document.getElementById('aud-bars');
      container.innerHTML = '';

      let correctPct = Math.floor(Math.random() * 25) + 60;
      let remain = 100 - correctPct;
      let pcts = [0, 0, 0, 0];
      pcts[currentQ.ans] = correctPct;

      const wrongs = [0, 1, 2, 3].filter(i => i !== currentQ.ans);
      let p1 = Math.floor(Math.random() * (remain - 4));
      let p2 = Math.floor(Math.random() * (remain - p1 - 2));
      let p3 = remain - p1 - p2;
      pcts[wrongs[0]] = p1;
      pcts[wrongs[1]] = p2;
      pcts[wrongs[2]] = p3;

      pcts.forEach((pct, idx) => {
        const row = document.createElement('div');
        row.className = 'flex items-center gap-2';
        row.innerHTML = \`
          <span class="w-4 font-bold text-amber-400">\${letters[idx]}</span>
          <div class="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden">
            <div class="bg-amber-400 h-full rounded-full transition-all duration-700" style="width: \${pct}%"></div>
          </div>
          <span class="w-8 text-right font-bold">\${pct}%</span>
        \`;
        container.appendChild(row);
      });

      document.getElementById('modal-aud').classList.remove('hidden');
    }

    function usePhone() {
      if (!lifelines.ph) return;
      audio.playLifeline();
      lifelines.ph = false;
      document.getElementById('btn-phone').classList.add('opacity-30', 'pointer-events-none', 'line-through');

      const letters = (lang === 'ar' ? ['أ', 'ب', 'ج', 'د'] : ['A', 'B', 'C', 'D']);
      const isAr = (lang === 'ar');
      const advice = isAr
        ? \`مرحباً بك! أنا متأكد بنسبة 85% أن الإجابة الصحيحة هي الخيار (\${letters[currentQ.ans]})!\`
        : \`Hello! I'm pretty confident (85% sure) that option (\${letters[currentQ.ans]}) is the correct answer!\`;

      document.getElementById('ph-text').textContent = advice;
      document.getElementById('modal-ph').classList.remove('hidden');
    }

    function useSwitch() {
      if (!lifelines.sw) return;
      audio.playLifeline();
      lifelines.sw = false;
      document.getElementById('btn-switch').classList.add('opacity-30', 'pointer-events-none', 'line-through');
      pickQuestionForLevel(currentLvl);
    }

    function walkAway() {
      audio.stopSpeaking();
      audio.stopTension();
      isSpeakingVoice = false;
      finishGame(false);
    }

    function finishGame(isWinner) {
      clearInterval(timerId);
      timerId = null;
      if (isTournamentMode) {
        rewardsState.tournamentPlayed++;
        tryUnlockBadges();
      }
      show('screen-result');

      const isAr = (lang === 'ar');
      if (isWinner) {
        document.getElementById('res-icon').textContent = '🏆';
        document.getElementById('res-title').textContent = isAr ? 'مبروك! ربحت المليون!' : 'You Won $1,000,000!';
        document.getElementById('res-desc').textContent = isAr ? 'لقد أثبتت موسوعيتك وأتممت المراحل الـ 100 لتتوج بطلاً!' : 'You completed all 100 stages brilliantly!';
        document.getElementById('res-cash').textContent = '1,000,000 $';
      } else {
        document.getElementById('res-icon').textContent = '👏';
        document.getElementById('res-title').textContent = isAr ? 'انتهت المسابقة' : 'Game Finished';
        document.getElementById('res-desc').textContent = isAr ? 'أداء ممتاز ورحلة معرفية رائعة.' : 'Great effort on your Champions Challenge.';
        document.getElementById('res-cash').textContent = lastCash.toLocaleString() + ' $';
      }
      document.getElementById('res-correct').textContent = correctCount;
      document.getElementById('res-wrong').textContent = wrongCount;
    }

    function closeModal(id) {
      document.getElementById(id).classList.add('hidden');
    }

    function openPrivacyModal() {
      document.getElementById('modal-privacy').classList.remove('hidden');
    }

    /* ================= وضع تحدي 4 لاعبين والدردشة الحية ================= */
    let mpScores = [0, 0, 0, 0];
    let mpRound = 1;

    // الاتصال الفوري بخادم الدردشة والمزامنة
    const API_BASE = (window.location.origin && window.location.origin.startsWith('http') && !window.location.origin.includes('file:')) 
      ? window.location.origin 
      : 'https://ais-pre-dforsaebo7nl3hpgeoyqed-960882533050.europe-west2.run.app';

    let mpBaseDevId = '';
    try { mpBaseDevId = localStorage.getItem('millionaire_device_uuid') || ''; } catch(e) {}
    if (!mpBaseDevId) {
      mpBaseDevId = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
      try { localStorage.setItem('millionaire_device_uuid', mpBaseDevId); } catch(e) {}
    }
    let mpTabSuffix = '';
    try { mpTabSuffix = sessionStorage.getItem('millionaire_tab_uuid') || ''; } catch(e) {}
    if (!mpTabSuffix) {
      mpTabSuffix = 't_' + Math.random().toString(36).substring(2, 7);
      try { sessionStorage.setItem('millionaire_tab_uuid', mpTabSuffix); } catch(e) {}
    }
    const mpDeviceId = mpBaseDevId + '_' + mpTabSuffix;
    const myPlayerId = 'p_' + mpDeviceId;
    let myPlayerName = localStorage.getItem('millionaire_player_name') || (lang === 'ar' ? 'بطل المسابقة' : 'Champion');

    // Requirement 5: Delete Message for Everyone in AppCreator24 chat
    async function deleteChatMessage(msgId) {
      const el = document.getElementById('msg-' + msgId);
      if (el) el.remove();
      try {
        await fetch(\`\${API_BASE}/api/rooms/M-GLOBAL/chat/delete\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId: msgId, requesterId: myPlayerId })
        });
      } catch (err) {}
    }

    // Realtime chat polling ONLY while inside the active multiplayer screen & online
    let knownMessageIds = new Set();
    setInterval(async () => {
      try {
        const mpScr = document.getElementById('screen-multiplayer');
        if (!mpScr || mpScr.classList.contains('hidden')) return;
        if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
        const res = await fetch(\`\${API_BASE}/api/rooms/M-GLOBAL/messages\`);
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.messages && Array.isArray(data.messages)) {
          const chat = document.getElementById('mp-chat');
          if (!chat) return;

          const serverIds = new Set(data.messages.map(m => m.id));

          // Remove any deleted messages
          knownMessageIds.forEach(id => {
            if (!serverIds.has(id)) {
              const el = document.getElementById('msg-' + id);
              if (el) el.remove();
              knownMessageIds.delete(id);
            }
          });

          // Add any new incoming messages
          let hasNew = false;
          data.messages.forEach(m => {
            if (!knownMessageIds.has(m.id)) {
              knownMessageIds.add(m.id);
              hasNew = true;
              const isMine = (m.senderId === myPlayerId || m.senderId === 'my_player');
              if (!isMine && m.senderId && (rtcIsBlocked(m.senderId) || rtcIsBlocked('rtc_' + m.senderId.replace(/^p_/, '')))) {
                return;
              }
              const div = document.createElement('div');
              div.id = 'msg-' + m.id;
              div.className = isMine
                ? 'text-[11px] text-amber-300 flex items-center justify-between gap-1 group bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20'
                : 'text-[11px] text-slate-200 flex items-center justify-between gap-1 px-2 py-1 bg-slate-900/60 rounded-lg border border-slate-800';

              const textSpan = document.createElement('span');
              textSpan.className = 'break-words';
              textSpan.innerHTML = (m.senderAvatar || (isMine ? '👑' : '💬')) + ' <b>' + (m.senderName || 'لاعب') + ':</b> ';
              textSpan.appendChild(document.createTextNode(m.text || ''));
              div.appendChild(textSpan);

              if (isMine) {
                const delBtn = document.createElement('button');
                delBtn.className = 'text-[10px] text-rose-400 hover:text-rose-300 px-1 py-0.5 rounded bg-rose-950/60 border border-rose-800 shrink-0';
                delBtn.textContent = '🗑️';
                delBtn.title = lang === 'ar' ? 'حذف لدى الجميع' : 'Delete for Everyone';
                delBtn.onclick = function() { deleteChatMessage(m.id); };
                div.appendChild(delBtn);
              } else if (m.senderId && m.senderId !== 'system') {
                const actWrap = document.createElement('div');
                actWrap.className = 'flex items-center gap-1 shrink-0';
                const blkBtn = document.createElement('button');
                blkBtn.className = 'text-[10px] text-rose-300 px-1.5 py-0.5 rounded bg-rose-950/70 border border-rose-700 font-bold';
                blkBtn.textContent = '🚫 حظر';
                blkBtn.onclick = function() { blockMpRoomPlayer(m.senderId, m.senderName, m.senderAvatar); div.remove(); };
                const repBtn = document.createElement('button');
                repBtn.className = 'text-[10px] text-slate-950 px-1.5 py-0.5 rounded bg-amber-500 font-black';
                repBtn.textContent = '🚩 إبلاغ';
                repBtn.onclick = function() { openReportPlayerModal(m.senderId, m.senderName, m.senderAvatar, current1v1RoomCode || 'M-GLOBAL'); };
                actWrap.appendChild(blkBtn);
                actWrap.appendChild(repBtn);
                div.appendChild(actWrap);
              }
              chat.appendChild(div);
            }
          });

          if (hasNew) {
            chat.scrollTop = chat.scrollHeight;
          }
        }
      } catch (e) {}
    }, 1200);

    let currentMultiMode = '4p';
    let current4pRole = '';
    let mpActiveTimer = null;
    let mpTimeLeft = 40;
    let mpHasAnswered = false;
    let mpLastAnsweredIsCorrect = null;
    let mpSearchTimer = null;
    let mpHeartbeatTimer = null;
    let mpSearchSec = 60;
    let mpSlotRoles = ['player2_guest', 'player3_guest', 'player4_guest'];
    let lastObservedHumans = {};

    function saveCustomNickname(val) {
      const trimmed = (val || '').trim();
      if (!trimmed) return;
      myPlayerName = trimmed;
      try {
        localStorage.setItem('millionaire_player_name', myPlayerName);
        sessionStorage.setItem('millionaire_player_name', myPlayerName);
      } catch (e) {}
      const p0 = document.getElementById('mp-p0-name');
      if (p0) p0.textContent = myPlayerName + ' (أنت)';
    }

    function copy1v1Pin() {
      const code = normalize4DigitPin(document.getElementById('mp-room-code')?.textContent || current1v1RoomCode || '');
      if (!code) return;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(function() {
          alert(lang === 'ar' ? ('تم نسخ كود الغرفة (' + code + ')! أعطه لصديقك ليدخل به مباشرة.') : ('Room PIN (' + code + ') copied!'));
        }).catch(function() {
          prompt(lang === 'ar' ? 'انسخ كود الغرفة (4 أرقام):' : 'Copy room PIN:', code);
        });
      } else {
        prompt(lang === 'ar' ? 'انسخ كود الغرفة (4 أرقام):' : 'Copy room PIN:', code);
      }
    }

    let friendPollTimer = null;
    let currentRoomBots = [];
    let current1v1RoomCode = '';
    let current1v1Category = 'all';
    let current1v1Role = '';
    let hostRoomCreatedPin = '';
    let mp4pMatched = false;
    let mpGameStatePollTimer = null;
    let mpEventSource = null;
    let mpAutoAdvanceTimer = null;
    let is1v1MatchLocked = false;
    let hasAutoJoinedRoom = false;

    let mpLifelines = { f50: true, aud: true, ph: true };

    function resetMpLifelinesUI() {
      mpLifelines = { f50: true, aud: true, ph: true };
      ['mp-ll-5050', 'mp-ll-aud', 'mp-ll-phone'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) {
          el.classList.remove('opacity-30', 'pointer-events-none', 'line-through');
          el.disabled = false;
        }
      });
    }

    function mapServerQuestions(list) {
      if (!Array.isArray(list)) return [];
      return list.map(function(sq) {
        return {
          id: sq.id,
          lvl: sq.level || 1,
          cat: sq.category || current1v1Category,
          qa: sq.questionAr || sq.question || sq.qa || '',
          qe: sq.questionEn || sq.questionAr || sq.question || sq.qe || '',
          oa: sq.optionsAr || sq.options || sq.oa || ['', '', '', ''],
          oe: sq.optionsEn || sq.optionsAr || sq.options || sq.oe || ['', '', '', ''],
          ans: typeof sq.correctIndex === 'number' ? sq.correctIndex : (typeof sq.ans === 'number' ? sq.ans : 0)
        };
      });
    }

    function syncCallPauseUI() {
      const inCall = !!rtcInCall;
      const cOverlay = document.getElementById('classic-call-pause-overlay');
      const cWrap = document.getElementById('classic-question-wrap');
      if (cOverlay && cWrap) {
        if (inCall) {
          cOverlay.classList.remove('hidden');
          cWrap.classList.add('hidden');
          if (timerId) { clearInterval(timerId); timerId = null; }
          audio.stopSpeaking();
          audio.stopTension();
        } else {
          cOverlay.classList.add('hidden');
          cWrap.classList.remove('hidden');
          const gameScreen = document.getElementById('screen-game');
          if (gameScreen && !gameScreen.classList.contains('hidden') && currentQ && !timerId && timerVal > 0) {
            startTimer();
          }
        }
      }

      const mOverlay = document.getElementById('mp-call-pause-overlay');
      const mArea = document.getElementById('mp-gameplay-area');
      const closedPanel = document.getElementById('mp-forfeit-closed-panel');
      const waitCard = document.getElementById('mp-waiting-friend-card');
      const botBanner = document.getElementById('mp-bot-banner');
      if (mOverlay && mArea) {
        if (inCall) {
          mOverlay.classList.remove('hidden');
          mArea.classList.add('hidden');
          if (mpActiveTimer) { clearInterval(mpActiveTimer); mpActiveTimer = null; }
          audio.stopSpeaking();
        } else {
          mOverlay.classList.add('hidden');
          const mpScreen = document.getElementById('screen-multiplayer');
          const waitingHidden = (!waitCard || waitCard.classList.contains('hidden')) && (!botBanner || botBanner.classList.contains('hidden'));
          const notClosed = (!closedPanel || closedPanel.classList.contains('hidden'));
          if (mpScreen && !mpScreen.classList.contains('hidden') && waitingHidden && notClosed && !is1v1MatchLocked) {
            mArea.classList.remove('hidden');
            if (currentMpQ && !mpRoundRevealed && !mpActiveTimer && mpTimeLeft > 0) {
              mpActiveTimer = setInterval(function() {
                if (rtcInCall) return;
                mpTimeLeft--;
                updateMpTimerBar();
                if (mpTimeLeft <= 0) {
                  clearInterval(mpActiveTimer);
                  mpActiveTimer = null;
                  onMultiQuestionTimeout();
                }
              }, 1000);
            }
          }
        }
      }
    }

    function close1v1MatchLocked(roomData, isNaturalFinish) {
      if (is1v1MatchLocked) return;
      is1v1MatchLocked = true;
      clearInterval(mpActiveTimer);
      mpActiveTimer = null;
      clearInterval(friendPollTimer);
      clearInterval(mpGameStatePollTimer);
      clearInterval(mpHeartbeatTimer);
      if (mpEventSource) {
        try { mpEventSource.close(); } catch(e) {}
        mpEventSource = null;
      }
      if (mpAutoAdvanceTimer) {
        clearTimeout(mpAutoAdvanceTimer);
        mpAutoAdvanceTimer = null;
      }
      audio.stopSpeaking();
      audio.stopTension();
      rtcStopMatchMic();
      mpPendingWrongIdx = -1;
      const revPromptEl = document.getElementById('mp-revive-prompt');
      if (revPromptEl) revPromptEl.classList.add('hidden');

      for (let i = 0; i < 4; i++) {
        const btn = document.getElementById('mp-opt-' + i);
        if (btn) {
          btn.disabled = true;
          btn.classList.add('pointer-events-none', 'opacity-40');
        }
      }

      const waitCard = document.getElementById('mp-waiting-friend-card');
      const botBanner = document.getElementById('mp-bot-banner');
      const callOverlay = document.getElementById('mp-call-pause-overlay');
      const gameArea = document.getElementById('mp-gameplay-area');
      const closedPanel = document.getElementById('mp-forfeit-closed-panel');
      if (waitCard) waitCard.classList.add('hidden');
      if (botBanner) botBanner.classList.add('hidden');
      if (callOverlay) callOverlay.classList.add('hidden');
      if (gameArea) gameArea.classList.add('hidden');
      if (closedPanel) closedPanel.classList.remove('hidden');

      const iconEl = document.getElementById('mp-closed-icon');
      const titleEl = document.getElementById('mp-closed-title');
      const descEl = document.getElementById('mp-closed-desc');
      const scoresEl = document.getElementById('mp-closed-scores');

      if (currentMultiMode === '1v1' && roomData && typeof roomData.player1_score === 'number') {
        const isGuest = (current1v1Role ? current1v1Role === 'player2_guest' : hasAutoJoinedRoom);
        mpScores[0] = isGuest ? (roomData.player2_score || 0) : (roomData.player1_score || 0);
        mpScores[1] = isGuest ? (roomData.player1_score || 0) : (roomData.player2_score || 0);
        updateMpUI();
      }

      if (isNaturalFinish) {
        if (currentMultiMode === '4p') {
          const topOpp = Math.max(mpScores[1], mpScores[2], mpScores[3]);
          const isWinner = mpScores[0] >= topOpp;
          rewardsState.arenaMatches++;
          if (isWinner) rewardsState.arenaWins++;
          tryUnlockBadges();

          if (iconEl) iconEl.textContent = isWinner ? '🏆' : '🌍';
          if (titleEl) {
            titleEl.className = 'text-lg font-black text-purple-300';
            titleEl.textContent = (lang === 'ar')
              ? (isWinner ? 'مبروك! حصدت المركز الأول في التحدي الجماعي!' : 'انتهى تحدي الـ 4 لاعبين حول العالم')
              : (isWinner ? 'You Ranked #1 in 4P Arena!' : '4-Player Match Finished');
          }
          if (descEl) {
            descEl.textContent = (lang === 'ar')
              ? 'اكتملت جميع الجولات العشر بين جميع المتسابقين بنجاح.'
              : 'All 10 synchronized rounds completed across all players.';
          }
          if (scoresEl) {
            const n1 = document.getElementById('mp-p1-name')?.textContent || '2';
            const n2 = document.getElementById('mp-p2-name')?.textContent || '3';
            const n3 = document.getElementById('mp-p3-name')?.textContent || '4';
            scoresEl.textContent = 'أنت: ' + mpScores[0] + ' | ' + n1 + ': ' + mpScores[1] + ' | ' + n2 + ': ' + mpScores[2] + ' | ' + n3 + ': ' + mpScores[3];
          }
          return;
        }

        const isWinner = mpScores[0] >= mpScores[1];
        if (isWinner) rewardsState.duelWins++;
        tryUnlockBadges();

        if (iconEl) iconEl.textContent = isWinner ? '🏆' : '👏';
        if (titleEl) {
          titleEl.className = 'text-lg font-black text-amber-300';
          titleEl.textContent = (lang === 'ar')
            ? (isWinner ? 'مبروك الفوز بالتحدي الثنائي!' : 'انتهى التحدي الثنائي')
            : (isWinner ? 'You Won the 1v1 Duel!' : '1v1 Duel Finished');
        }
        if (descEl) {
          descEl.textContent = (lang === 'ar')
            ? 'اكتملت جميع الجولات العشر بنفس الأسئلة على الجهازين.'
            : 'All 10 synchronized rounds completed on both devices.';
        }
      } else {
        const myRoleStr = current1v1Role || (hasAutoJoinedRoom ? 'player2_guest' : 'player1_host');
        const iWonByForfeit = roomData && roomData.winnerRole === myRoleStr;
        if (iWonByForfeit) {
          rewardsState.duelWins++;
          tryUnlockBadges();
        }
        if (iconEl) iconEl.textContent = '🔒';
        if (titleEl) {
          titleEl.className = 'text-lg font-black ' + (iWonByForfeit ? 'text-emerald-400' : 'text-rose-400');
          titleEl.textContent = (lang === 'ar')
            ? 'تم إغلاق المسابقة عند الطرفين'
            : 'Match Closed for Both Devices';
        }
        if (descEl) {
          descEl.textContent = (lang === 'ar')
            ? (iWonByForfeit ? '🏆 انسحب المنافس! تم إغلاق الأسئلة والمبارزة على الجهازين واحتساب الفوز لك.' : 'تم إغلاق الأسئلة والمسابقة عند الطرفين بسبب الانسحاب.')
            : (iWonByForfeit ? '🏆 Opponent withdrew! Questions locked on both devices and you win by forfeit.' : 'Questions locked and match closed for both devices due to withdrawal.');
        }
      }

      if (scoresEl) {
        scoresEl.textContent = (lang === 'ar')
          ? ('أنت: ' + mpScores[0] + ' نقطة  |  المنافس: ' + mpScores[1] + ' نقطة')
          : ('You: ' + mpScores[0] + ' pts  |  Opponent: ' + mpScores[1] + ' pts');
      }
    }

    function formatContestantStatusHtml(c) {
      const answeredThisRound = c && c.status === 'answered' && (c.answeredRound === undefined || c.answeredRound === mpRound - 1);
      if (!answeredThisRound) {
        return '<span class="text-slate-400">يفكر... ⏳</span>';
      }
      if (c.lastIsCorrect === true) {
        const pts = (typeof c.lastPointsEarned === 'number') ? c.lastPointsEarned : 50;
        return '<span class="text-emerald-400 font-bold">✅ صح (+' + pts + ')</span>';
      }
      if (c.lastIsCorrect === false) {
        return '<span class="text-rose-400 font-bold">❌ خطأ (0)</span>';
      }
      return '<span class="text-emerald-400 font-bold">✓ أجاب</span>';
    }

    function renderMpLiveRoundBanner(contestants) {
      if (mpRoundRevealed || is1v1MatchLocked) return;
      const banner = document.getElementById('mp-round-status-banner');
      if (!banner) return;
      const list = Array.isArray(contestants) ? contestants : [];
      const othersAnswered = list.filter(function(c) {
        if (!c || c.id === myPlayerId) return false;
        return c.status === 'answered' && (c.answeredRound === undefined || c.answeredRound === mpRound - 1);
      });

      if (mpHasAnswered) {
        const isCorrect = (mpLastAnsweredIsCorrect === true);
        const myMsg = isCorrect ? '✅ إجابتك صحيحة! (+50 نقطة)' : '❌ إجابتك خاطئة (0 نقطة)';
        const scoreLine = (currentMultiMode === '1v1')
          ? ('أنت: ' + mpScores[0] + ' نقطة  |  المنافس: ' + mpScores[1] + ' نقطة')
          : ('نقاطك الآن: ' + mpScores[0] + ' نقطة');
        const othersHtml = othersAnswered.map(function(c) {
          const resLabel = c.lastIsCorrect === true ? '✅ صح' : (c.lastIsCorrect === false ? '❌ خطأ' : '✓ أجاب');
          return '<span class="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700">' + (c.avatar || '⚡') + ' ' + c.name + ': ' + resLabel + ' (' + (c.score || 0) + ')</span>';
        }).join(' ');
        banner.className = 'p-3 rounded-2xl text-center text-xs font-bold shadow-lg border ' +
          (isCorrect ? 'bg-emerald-950/35 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/35 border-rose-500/50 text-rose-300');
        banner.innerHTML = '<div class="font-black text-sm">' + myMsg + '</div>' +
          '<div class="font-mono text-amber-300 pt-1">' + scoreLine + '</div>' +
          (othersHtml ? '<div class="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[11px]">' + othersHtml + '</div>' : '') +
          '<div class="text-[11px] text-slate-300 font-normal pt-1">⏱️ بانتظار إجابة بقية المتسابقين — لن ينتقل السؤال قبل إجابة الجميع أو انتهاء الـ 40 ثانية.</div>';
        banner.classList.remove('hidden');
        return;
      }

      if (othersAnswered.length > 0) {
        const badges = othersAnswered.map(function(c) {
          const isOk = c.lastIsCorrect === true;
          const isBad = c.lastIsCorrect === false;
          const badgeCls = isOk
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
            : (isBad ? 'bg-rose-500/15 border-rose-500/40 text-rose-300' : 'bg-slate-900 border-slate-700 text-amber-300');
          const resTxt = isOk ? ('✅ صحيحة (+' + (c.lastPointsEarned ?? 50) + ')') : (isBad ? '❌ خاطئة (0)' : 'أجاب ✓');
          return '<span class="px-2 py-1 rounded-xl border ' + badgeCls + '">📣 ' + (c.avatar || '⚡') + ' ' + c.name + ': ' + resTxt + ' • ' + (c.score || 0) + ' نقطة</span>';
        }).join(' ');
        banner.className = 'p-3 bg-indigo-950/40 border border-indigo-500/40 rounded-2xl text-center text-xs font-bold shadow-lg space-y-1.5';
        banner.innerHTML = '<div class="flex flex-wrap items-center justify-center gap-1.5">' + badges + '</div>' +
          '<div class="text-[11px] text-amber-300">👇 اختر إجابتك الآن من جهازك — الخيارات مفتوحة لك!</div>';
        banner.classList.remove('hidden');
      }
    }

    function applyServerRoomStateToUI(roomData) {
      if (!roomData) return;
      const contestants = Array.isArray(roomData.contestants) ? roomData.contestants : [];

      if (currentMultiMode === '1v1') {
        const isGuest = (current1v1Role ? current1v1Role === 'player2_guest' : hasAutoJoinedRoom);
        mpScores[0] = isGuest ? (roomData.player2_score || 0) : (roomData.player1_score || 0);
        mpScores[1] = isGuest ? (roomData.player1_score || 0) : (roomData.player2_score || 0);
        updateMpUI();

        const opp = contestants.find(function(c) { return c.id !== myPlayerId; });
        if (opp) {
          const p1Name = document.getElementById('mp-p1-name');
          const p1Av = document.getElementById('mp-p1-avatar');
          const p1St = document.getElementById('mp-p1-status');
          if (p1Name) p1Name.textContent = opp.name || p1Name.textContent;
          if (p1Av && opp.avatar) p1Av.textContent = opp.avatar;
          if (p1St) {
            p1St.innerHTML = formatContestantStatusHtml(opp);
          }
        }

        if (roomData.status === 'finished' || roomData.forfeitedBy) {
          close1v1MatchLocked(roomData, !roomData.forfeitedBy);
          return;
        }
      } else {
        // 4P authoritative mapping by role or ID
        const roleScore = function(r) {
          if (r === 'player1_host') return roomData.player1_score || 0;
          if (r === 'player2_guest') return roomData.player2_score || 0;
          if (r === 'player3_guest') return roomData.player3_score || 0;
          if (r === 'player4_guest') return roomData.player4_score || 0;
          return 0;
        };
        const me = contestants.find(function(c) { return c.id === myPlayerId || (current4pRole && c.role === current4pRole); });
        if (me) {
          mpScores[0] = Math.max(mpScores[0], me.score || roleScore(me.role));
        }

        const others = contestants.filter(function(c) { return c !== me; });
        const botsNow = [];
        for (let idx = 0; idx < 3; idx++) {
          const c = others[idx];
          if (!c) continue;
          const slotIdx = idx + 1;
          mpScores[slotIdx] = typeof c.score === 'number' ? Math.max(mpScores[slotIdx], c.score) : roleScore(c.role);
          const nEl = document.getElementById('mp-p' + slotIdx + '-name');
          const aEl = document.getElementById('mp-p' + slotIdx + '-avatar');
          const sEl = document.getElementById('mp-p' + slotIdx + '-status');
          if (nEl) nEl.textContent = c.name;
          if (aEl && c.avatar) aEl.textContent = c.avatar;
          if (sEl) {
            sEl.innerHTML = formatContestantStatusHtml(c);
          }
          if (c.isBot) botsNow.push(c);
          lastObservedHumans[c.role || slotIdx] = { isBot: !!c.isBot, name: c.name, id: c.id };
        }
        currentRoomBots = botsNow;
        updateMpUI();

        if (roomData.status === 'finished') {
          close1v1MatchLocked(roomData, true);
          return;
        }
      }

      if (typeof roomData.currentIndex === 'number' && !is1v1MatchLocked) {
        if (roomData.currentIndex >= 10) {
          close1v1MatchLocked(roomData, !roomData.forfeitedBy);
          return;
        }
        if (roomData.currentIndex + 1 > mpRound) {
          if (mpAutoAdvanceTimer) {
            clearTimeout(mpAutoAdvanceTimer);
            mpAutoAdvanceTimer = null;
          }
          mpRound = roomData.currentIndex + 1;
          updateMpUI();
          loadMpQuestion();
          return;
        }
      }

      renderMpLiveRoundBanner(contestants);

      const roundMatches = (typeof roomData.currentIndex !== 'number' || roomData.currentIndex === mpRound - 1);
      const allAnsweredInRoom = contestants.length > 0 && contestants.every(function(c) { return c.status === 'answered' || c.status === 'eliminated'; });
      const roomRoundTimedOut = !!(roomData.roundStartedAt && (Date.now() - Number(roomData.roundStartedAt) >= 41000));
      if (roomData.status === 'revealed' && !mpRoundRevealed && roundMatches && (mpHasAnswered || allAnsweredInRoom || roomRoundTimedOut)) {
        onMultiQuestionTimeout();
      }
    }

    function startRoomStateAndHeartbeat(code) {
      clearInterval(mpGameStatePollTimer);
      clearInterval(mpHeartbeatTimer);
      if (mpEventSource) {
        try { mpEventSource.close(); } catch(e) {}
        mpEventSource = null;
      }

      const myRoleStr = (currentMultiMode === '4p')
        ? (current4pRole || 'player1_host')
        : (current1v1Role || (hasAutoJoinedRoom ? 'player2_guest' : 'player1_host'));

      // Real-time SSE listener so opponent answers, reveals, and disconnects sync in < 1 second
      try {
        const sseUrl = API_BASE + '/api/rooms/' + encodeURIComponent(code) + '/events?playerId=' + encodeURIComponent(myPlayerId) + '&role=' + encodeURIComponent(myRoleStr);
        mpEventSource = new EventSource(sseUrl);
        mpEventSource.onmessage = function(ev) {
          if (!ev || !ev.data || is1v1MatchLocked) return;
          try {
            const parsed = JSON.parse(ev.data);
            if (!parsed || !parsed.event) return;
            if (parsed.event === 'duel:forfeited' && parsed.data) {
              close1v1MatchLocked(parsed.data, false);
              return;
            }
            if ((parsed.event === 'duel:player_answered' || parsed.event === 'score:updated') && parsed.data) {
              applyServerRoomStateToUI(parsed.data);
              return;
            }
            if (parsed.event === 'duel:next_round' && parsed.data) {
              applyServerRoomStateToUI(parsed.data);
              return;
            }
            if (parsed.event === 'duel:round_revealed' && parsed.data) {
              applyServerRoomStateToUI(Object.assign({}, parsed.data, { status: 'revealed' }));
              return;
            }
            if (parsed.event === 'room:bot_replaced' && parsed.data && Array.isArray(parsed.data.contestants)) {
              applyServerRoomStateToUI({ contestants: parsed.data.contestants, status: 'playing' });
            }
          } catch(e) {}
        };
      } catch(e) {}

      mpGameStatePollTimer = setInterval(async function() {
        if (!code || is1v1MatchLocked) return;
        try {
          const res = await fetch(API_BASE + '/api/rooms/' + encodeURIComponent(code) + '/state');
          if (!res.ok) return;
          const data = await res.json();
          if (data && data.success && data.room) {
            applyServerRoomStateToUI(data.room);
          }
        } catch(e) {}
      }, currentMultiMode === '1v1' ? 350 : 850);

      const sendBeat = async function() {
        if (!code || is1v1MatchLocked) return;
        try {
          const res = await fetch(API_BASE + '/api/rooms/' + encodeURIComponent(code) + '/1v1/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: myRoleStr, playerId: myPlayerId })
          });
          if (!res.ok) return;
          const d = await res.json();
          if (d && Array.isArray(d.contestants)) {
            applyServerRoomStateToUI({
              contestants: d.contestants,
              status: d.status,
              forfeitedBy: d.forfeitedBy,
              winnerRole: d.winnerRole
            });
          }
        } catch(e) {}
      };
      sendBeat();
      mpHeartbeatTimer = setInterval(sendBeat, currentMultiMode === '1v1' ? 900 : 2000);
    }

    var bundleOnlineCheckBusy = false;
    function showOfflineWarningModal() {
      var m = document.getElementById('modal-offline-warning');
      var t = document.getElementById('offline-warn-title');
      var d = document.getElementById('offline-warn-desc');
      if (t) t.textContent = (lang === 'ar' ? 'لا يوجد اتصال بالإنترنت حالياً' : 'No Internet Connection');
      if (d) d.textContent = (lang === 'ar'
        ? 'وضع الأونلاين، التحدي الثنائي، والمكالمات الصوتية والفيديو تتطلب اتصالاً بالإنترنت. يمكنك اللعب الآن مع الكمبيوتر بدون نت مع جميع الأسئلة الـ 300 المخزنة!'
        : 'Online duels, multiplayer, and voice/video calls require an internet connection. You can play vs Computer offline right now with all 300 stored questions!');
      if (m) m.classList.remove('hidden');
    }

    async function verifyInternetBeforeOnline(onOnline) {
      if (bundleOnlineCheckBusy) return;
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        showOfflineWarningModal();
        return;
      }
      bundleOnlineCheckBusy = true;
      try {
        var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        var timer = ctrl ? setTimeout(function() { try { ctrl.abort(); } catch(e) {} }, 2500) : null;
        var res = await fetch(API_BASE + '/api/app-meta?ping=1&t=' + Date.now(), {
          cache: 'no-store',
          signal: ctrl ? ctrl.signal : undefined
        });
        if (timer) clearTimeout(timer);
        if (!res.ok) {
          showOfflineWarningModal();
          return;
        }
        onOnline();
      } catch(e) {
        showOfflineWarningModal();
      } finally {
        bundleOnlineCheckBusy = false;
      }
    }

    var pendingMicPermCallback = null;
    var bundleReportTarget = null;
    var bundleSelectedReportReason = 'abusive_language';
    var BUNDLE_REPORT_REASONS = [
      { key: 'abusive_language', ar: 'ألفاظ غير لائقة أو سباب', icon: '🤬' },
      { key: 'mic_spam', ar: 'إزعاج أو ضوضاء متعمدة في الميكروفون', icon: '🔊' },
      { key: 'harassment', ar: 'مضايقة أو تحرش باللاعبين', icon: '⚠️' },
      { key: 'cheating', ar: 'غش أو سلوك غير رياضي', icon: '🚫' },
      { key: 'inappropriate_profile', ar: 'اسم أو محتوى غير مناسب', icon: '🏷️' }
    ];

    function openMicPermissionScreen(modeLabel, onContinue) {
      audio.stopIntro();
      audio.stopTension();
      pendingMicPermCallback = onContinue;
      var modal = document.getElementById('modal-mic-perm');
      var badge = document.getElementById('mic-perm-mode-badge');
      var errEl = document.getElementById('mic-perm-error');
      var listenBtn = document.getElementById('btn-mic-perm-listen');
      var contBtn = document.getElementById('btn-mic-perm-continue');
      if (badge) badge.textContent = '🎙️ ' + (modeLabel || 'التحدي الأونلاين');
      if (errEl) { errEl.classList.add('hidden'); errEl.textContent = ''; }
      if (listenBtn) listenBtn.classList.add('hidden');
      if (contBtn) { contBtn.disabled = false; contBtn.textContent = '🎙️ متابعة وتفعيل الميكروفون'; }
      if (modal) modal.classList.remove('hidden');
    }

    async function confirmMicPermissionContinue() {
      var contBtn = document.getElementById('btn-mic-perm-continue');
      var errEl = document.getElementById('mic-perm-error');
      var listenBtn = document.getElementById('btn-mic-perm-listen');
      audio.init();
      audio.stopIntro();
      audio.stopTension();
      if (contBtn) { contBtn.disabled = true; contBtn.textContent = '⏳ جاري طلب إذن الميكروفون...'; }
      if (errEl) errEl.classList.add('hidden');

      var granted = await rtcRequestMicOnContinue();
      if (granted) {
        var modal = document.getElementById('modal-mic-perm');
        if (modal) modal.classList.add('hidden');
        var cb = pendingMicPermCallback;
        pendingMicPermCallback = null;
        if (typeof cb === 'function') cb(true);
      } else {
        if (contBtn) { contBtn.disabled = false; contBtn.textContent = '🔄 إعادة المحاولة والمتابعة'; }
        if (errEl) {
          errEl.textContent = 'تعذر فتح الميكروفون. يرجى السماح بصلاحية الميكروفون من المتصفح للتحدث مع اللاعبين.';
          errEl.classList.remove('hidden');
        }
        if (listenBtn) listenBtn.classList.remove('hidden');
      }
    }

    function continueWithoutMicPermission() {
      audio.stopIntro();
      audio.stopTension();
      var modal = document.getElementById('modal-mic-perm');
      if (modal) modal.classList.add('hidden');
      var cb = pendingMicPermCallback;
      pendingMicPermCallback = null;
      if (typeof cb === 'function') cb(false);
    }

    function cancelMicPermissionScreen() {
      pendingMicPermCallback = null;
      var modal = document.getElementById('modal-mic-perm');
      if (modal) modal.classList.add('hidden');
    }

    function blockMpRoomPlayer(playerId, name, avatar) {
      if (!playerId || playerId === myPlayerId) return;
      rtcBlockCaller(playerId, name || 'لاعب', avatar || '👤');
      if (String(playerId).indexOf('p_') === 0) {
        rtcBlockCaller('rtc_' + String(playerId).slice(2), name || 'لاعب', avatar || '👤');
      }
    }

    function renderMpOpponentActions(slotIdx, opp) {
      var box = document.getElementById('mp-p' + slotIdx + '-actions');
      if (!box) return;
      if (!opp || !opp.id || opp.id === myPlayerId || opp.isBot) {
        box.classList.add('hidden');
        box.innerHTML = '';
        return;
      }
      box.classList.remove('hidden');
      box.innerHTML = '';
      var isBlk = rtcIsBlocked(opp.id) || (String(opp.id).indexOf('p_') === 0 && rtcIsBlocked('rtc_' + String(opp.id).slice(2)));
      var blkBtn = document.createElement('button');
      blkBtn.className = isBlk
        ? 'px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 text-slate-300 text-[10px] font-bold'
        : 'px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold';
      blkBtn.textContent = isBlk ? '✅ محظور' : '🚫 حظر';
      blkBtn.onclick = function() {
        if (isBlk) {
          rtcUnblockCaller(opp.id);
          if (String(opp.id).indexOf('p_') === 0) rtcUnblockCaller('rtc_' + String(opp.id).slice(2));
        } else {
          blockMpRoomPlayer(opp.id, opp.name, opp.avatar);
        }
        renderMpOpponentActions(slotIdx, opp);
      };
      var repBtn = document.createElement('button');
      repBtn.className = 'px-1.5 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black';
      repBtn.textContent = '🚩 إبلاغ';
      repBtn.onclick = function() {
        openReportPlayerModal(opp.id, opp.name || 'لاعب', opp.avatar || '👤', current1v1RoomCode || '');
      };
      box.appendChild(blkBtn);
      box.appendChild(repBtn);
    }

    function openReportPlayerModal(id, name, avatar, roomId) {
      bundleReportTarget = {
        id: id || name || 'unknown',
        name: name || 'لاعب',
        avatar: avatar || '👤',
        roomId: roomId || current1v1RoomCode || ''
      };
      bundleSelectedReportReason = BUNDLE_REPORT_REASONS[0].key;
      var lbl = document.getElementById('report-target-label');
      if (lbl) lbl.textContent = bundleReportTarget.avatar + ' ' + bundleReportTarget.name;
      var formB = document.getElementById('report-form-body');
      var succB = document.getElementById('report-success-body');
      if (formB) formB.classList.remove('hidden');
      if (succB) succB.classList.add('hidden');
      var det = document.getElementById('report-details-input');
      if (det) det.value = '';
      renderReportReasonsList();
      var m = document.getElementById('modal-report');
      if (m) m.classList.remove('hidden');
    }

    function renderReportReasonsList() {
      var list = document.getElementById('report-reasons-list');
      if (!list) return;
      list.innerHTML = '';
      BUNDLE_REPORT_REASONS.forEach(function(r) {
        var btn = document.createElement('button');
        var sel = bundleSelectedReportReason === r.key;
        btn.className = 'w-full px-3 py-2 rounded-xl border text-right flex items-center gap-2 text-xs font-bold transition ' +
          (sel ? 'bg-amber-500/15 border-amber-400 text-amber-200' : 'bg-slate-950/70 border-slate-800 text-slate-300');
        btn.innerHTML = '<span>' + r.icon + '</span><span class="flex-1">' + r.ar + '</span><span>' + (sel ? '●' : '○') + '</span>';
        btn.onclick = function() {
          bundleSelectedReportReason = r.key;
          renderReportReasonsList();
        };
        list.appendChild(btn);
      });
    }

    async function submitBundlePlayerReport() {
      if (!bundleReportTarget) return;
      var det = document.getElementById('report-details-input');
      var rObj = BUNDLE_REPORT_REASONS.find(function(x) { return x.key === bundleSelectedReportReason; }) || BUNDLE_REPORT_REASONS[0];
      var record = {
        id: 'rep_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        reporterId: myPlayerId,
        reporterName: userProfile.name || myPlayerName,
        reportedId: bundleReportTarget.id,
        reportedName: bundleReportTarget.name,
        roomId: bundleReportTarget.roomId || '',
        reason: rObj.key,
        reasonLabel: rObj.ar,
        details: (det && det.value ? det.value : '').trim().slice(0, 200),
        createdAt: Date.now()
      };
      try {
        var prev = JSON.parse(localStorage.getItem('millionaire_player_reports') || '[]');
        if (!Array.isArray(prev)) prev = [];
        prev.unshift(record);
        localStorage.setItem('millionaire_player_reports', JSON.stringify(prev.slice(0, 200)));
      } catch(e) {}
      try {
        await fetch(API_BASE + '/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        });
      } catch(e) {}

      var formB = document.getElementById('report-form-body');
      var succB = document.getElementById('report-success-body');
      var succDesc = document.getElementById('report-success-desc');
      if (formB) formB.classList.add('hidden');
      if (succB) succB.classList.remove('hidden');
      if (succDesc) {
        succDesc.textContent = 'تم تسجيل وحفظ بلاغك ضد (' + record.reportedName + ') بسبب: "' + record.reasonLabel + '". شكراً لمساعدتنا في الحفاظ على بيئة لعب محترمة.';
      }
      var toast = document.getElementById('mp-report-toast');
      if (toast) {
        toast.textContent = '✅ تم حفظ البلاغ ضد (' + record.reportedName + ') بنجاح';
        toast.classList.remove('hidden');
        setTimeout(function() { toast.classList.add('hidden'); }, 4500);
      }
    }

    function blockReportedPlayerFromModal() {
      if (bundleReportTarget) {
        blockMpRoomPlayer(bundleReportTarget.id, bundleReportTarget.name, bundleReportTarget.avatar);
      }
      closeReportModal();
    }

    function closeReportModal() {
      var m = document.getElementById('modal-report');
      if (m) m.classList.add('hidden');
    }

    function rtcReportIncomingCaller() {
      if (!rtcIncoming) return;
      openReportPlayerModal(rtcIncoming.fromId, rtcIncoming.fromName, rtcIncoming.fromAvatar, rtcIncoming.roomId || rtcWatchedRoom);
    }

    function start1v1Friend(forcedCode, forcedCat, _netVerified, _permPassed) {
      audio.init();
      audio.stopIntro();
      audio.stopTension();
      if (!_netVerified) {
        verifyInternetBeforeOnline(function() { start1v1Friend(forcedCode, forcedCat, true, false); });
        return;
      }
      if (!_permPassed) {
        openMicPermissionScreen('تحدي ثنائي (1 ضد 1)', function() {
          start1v1Friend(forcedCode, forcedCat, true, true);
        });
        return;
      }
      audio.stopSpeaking();
      if (rtcInCall) rtcHangup();
      clearInterval(friendPollTimer);
      clearInterval(mpGameStatePollTimer);
      clearInterval(mpHeartbeatTimer);
      if (mpAutoAdvanceTimer) {
        clearTimeout(mpAutoAdvanceTimer);
        mpAutoAdvanceTimer = null;
      }
      is1v1MatchLocked = false;
      hostRoomCreatedPin = '';
      serverRoomQuestions = [];
      currentMultiMode = '1v1';
      current4pRole = '';
      current1v1Role = 'player1_host';
      mpHasAnswered = false;
      mpLastAnsweredIsCorrect = null;
      mpChosenAnswer = -1;
      mpRoundRevealed = false;
      mpRoundScoreAwarded = false;
      mpPendingWrongIdx = -1;
      resetMpLifelinesUI();
      show('screen-multiplayer');

      const closedPanel = document.getElementById('mp-forfeit-closed-panel');
      if (closedPanel) closedPanel.classList.add('hidden');
      const subBanner = document.getElementById('mp-bot-sub-banner');
      if (subBanner) subBanner.classList.add('hidden');
      const privBar = document.getElementById('mp-private-room-bar');
      if (privBar) privBar.classList.remove('hidden');

      const catSelect = document.getElementById('mp-1v1-category');
      const isJoiningGuest = (typeof forcedCode === 'string' && normalize4DigitPin(forcedCode).length === 4);
      hasAutoJoinedRoom = isJoiningGuest;
      if (isJoiningGuest) {
        current1v1Role = 'player2_guest';
        current1v1Category = (typeof forcedCat === 'string' && forcedCat.trim()) ? forcedCat.trim() : 'all';
      } else {
        current1v1Category = (catSelect && catSelect.value) ? catSelect.value : 'all';
      }

      const title = document.getElementById('mp-mode-title');
      if (title) title.textContent = (lang === 'ar' ? 'تحدي ثنائي بالكود (4 أرقام)' : '1v1 PIN Duel');

      const botBanner = document.getElementById('mp-bot-banner');
      if (botBanner) botBanner.classList.add('hidden');

      const copyBtn = document.getElementById('btn-copy-code');
      if (copyBtn) copyBtn.classList.remove('hidden');

      const code = isJoiningGuest
        ? normalize4DigitPin(forcedCode)
        : String(Math.floor(1000 + Math.random() * 9000));

      current1v1RoomCode = code;
      rtcStopWatching();

      const codeEl = document.getElementById('mp-room-code');
      if (codeEl) codeEl.textContent = code;
      const bigPinEl = document.getElementById('mp-wait-pin-big');
      if (bigPinEl) bigPinEl.textContent = code;

      document.getElementById('mp-card-p2').classList.add('hidden');
      document.getElementById('mp-card-p3').classList.add('hidden');
      document.getElementById('mp-p1-name').textContent = (lang === 'ar' ? 'الصديق المتحدي' : 'Challenger Friend');

      const llBar = document.getElementById('mp-lifelines-bar');
      if (llBar) llBar.classList.remove('hidden');

      initNicknameInput();
      const waitP0 = document.getElementById('mp-wait-p0-name');
      if (waitP0) waitP0.textContent = userProfile.name || myPlayerName;

      mpScores = [0, 0, 0, 0];
      mpRound = 1;
      updateMpUI();

      const waitCard = document.getElementById('mp-waiting-friend-card');
      const gameArea = document.getElementById('mp-gameplay-area');

      if (!isJoiningGuest) {
        if (waitCard) waitCard.classList.remove('hidden');
        if (gameArea) gameArea.classList.add('hidden');
        rtcStartMatchMic(code);

        fetch(API_BASE + '/api/rooms/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: code,
            hostId: myPlayerId,
            hostName: userProfile.name || myPlayerName,
            hostAvatar: userProfile.avatar || '👑',
            category: current1v1Category,
            lang: lang,
            excludeIds: Array.from(globalUsedQuestionIds)
          })
        })
          .then(function(r) { return r.json(); })
          .then(function(d) {
            if (d && d.roomId) {
              current1v1RoomCode = d.roomId;
              hostRoomCreatedPin = d.roomId;
              if (codeEl) codeEl.textContent = d.roomId;
              if (bigPinEl) bigPinEl.textContent = d.roomId;
            } else {
              hostRoomCreatedPin = code;
            }
            if (d && d.success && Array.isArray(d.questions) && d.questions.length > 0) {
              serverRoomQuestions = mapServerQuestions(d.questions);
            }
          })
          .catch(function() {
            hostRoomCreatedPin = code;
          });

        clearInterval(friendPollTimer);
        friendPollTimer = setInterval(async function() {
          if (hostRoomCreatedPin !== current1v1RoomCode) return;
          try {
            const res = await fetch(API_BASE + '/api/rooms/' + encodeURIComponent(current1v1RoomCode) + '/state');
            if (!res.ok) return;
            const data = await res.json();
            if (data.success && data.room) {
              if (data.room.status === 'finished' || data.room.forfeitedBy) {
                clearInterval(friendPollTimer);
                close1v1MatchLocked(data.room, !data.room.forfeitedBy);
                return;
              }
              const contestants = data.room.contestants || [];
              if (contestants.length >= 2) {
                const opp = contestants.find(function(c) { return c.id !== myPlayerId; }) || contestants[1];
                const waitP1Box = document.getElementById('mp-wait-p1-box');
                if (waitP1Box && opp) {
                  waitP1Box.className = 'p-2.5 rounded-xl bg-slate-950 border border-emerald-500/60 text-center';
                  waitP1Box.innerHTML = '<div class="text-slate-400 text-[10px]">المتسابق الثاني (صديقك)</div>' +
                    '<div class="font-bold text-emerald-300 flex items-center justify-center gap-1 mt-0.5">' +
                    '<span>' + (opp.avatar || '⚡') + '</span>' +
                    '<span class="truncate">' + (opp.name || 'الصديق') + '</span>' +
                    '<span class="text-emerald-400 text-xs">✓ دخل بالكود</span>' +
                    '</div>';
                }
                if (opp) {
                  document.getElementById('mp-p1-name').textContent = opp.name || 'الصديق';
                  const p1Av = document.getElementById('mp-p1-avatar');
                  if (p1Av && opp.avatar) p1Av.textContent = opp.avatar;
                  renderMpOpponentActions(1, opp);
                }
              }

              if ((data.room.status === 'reading' || data.room.status === 'playing') && contestants.length >= 2) {
                clearInterval(friendPollTimer);
                if (serverRoomQuestions.length === 0) {
                  try {
                    const qr = await fetch(API_BASE + '/api/rooms/' + encodeURIComponent(current1v1RoomCode) + '/questions?playerId=' + encodeURIComponent(myPlayerId));
                    const qd = await qr.json();
                    if (qd && qd.success && Array.isArray(qd.questions) && qd.questions.length > 0) {
                      serverRoomQuestions = mapServerQuestions(qd.questions);
                    }
                  } catch(e) {}
                }
                if (waitCard) waitCard.classList.add('hidden');
                if (gameArea) gameArea.classList.remove('hidden');
                if (privBar) privBar.classList.add('hidden');
                audio.stopIntro();
                audio.stopTension();
                rtcStartMatchMic(current1v1RoomCode);
                audio.playCorrect();
                startRoomStateAndHeartbeat(current1v1RoomCode);
                loadMpQuestion();
                syncCallPauseUI();
              } else if (contestants.length >= 2) {
                fetch(API_BASE + '/api/rooms/' + encodeURIComponent(current1v1RoomCode) + '/start', { method: 'POST' }).catch(function() {});
              }
            }
          } catch(e) {}
        }, 550);
      }
    }

    async function join1v1ByCode(_netVerified, _permPassed) {
      audio.init();
      audio.stopIntro();
      audio.stopTension();
      const inp = document.getElementById('join-1v1-code-input');
      const digits = normalize4DigitPin(inp && inp.value ? inp.value : '');
      if (digits.length !== 4) {
        alert(lang === 'ar' ? 'يرجى إدخال كود غرفة الصديق المكون من 4 أرقام فقط (مثال: 8202)' : 'Please enter a valid 4-digit room PIN.');
        return;
      }
      if (!_netVerified) {
        verifyInternetBeforeOnline(function() { join1v1ByCode(true, false); });
        return;
      }
      if (!_permPassed) {
        openMicPermissionScreen('تحدي ثنائي (دخول بالكود)', function() {
          join1v1ByCode(true, true);
        });
        return;
      }

      audio.stopSpeaking();
      if (rtcInCall) rtcHangup();

      try {
        const res = await fetch(API_BASE + '/api/rooms/' + encodeURIComponent(digits) + '/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: myPlayerId,
            name: userProfile.name || myPlayerName,
            avatar: userProfile.avatar || '👑',
            role: 'player2_guest',
            isGuest: true,
            requireExisting: true
          })
        });
        const d = await res.json();
        if (!res.ok || !d.success) {
          alert((d && d.error) ? d.error : 'كود الغرفة غير صحيح أو لم يتم إنشاؤه بعد.');
          return;
        }
        if (inp) inp.value = '';
        serverRoomQuestions = [];
        hasAutoJoinedRoom = true;
        currentMultiMode = '1v1';
        current4pRole = '';
        current1v1Role = d.role || 'player2_guest';
        is1v1MatchLocked = false;
        current1v1RoomCode = digits;
        current1v1Category = (d.room && d.room.category) ? d.room.category : 'all';
        mpHasAnswered = false;
        mpLastAnsweredIsCorrect = null;
        mpChosenAnswer = -1;
        mpRoundRevealed = false;
        mpRoundScoreAwarded = false;
        mpPendingWrongIdx = -1;
        resetMpLifelinesUI();

        show('screen-multiplayer');
        const waitCard = document.getElementById('mp-waiting-friend-card');
        const botBanner = document.getElementById('mp-bot-banner');
        const closedPanel = document.getElementById('mp-forfeit-closed-panel');
        const privBar = document.getElementById('mp-private-room-bar');
        const gameArea = document.getElementById('mp-gameplay-area');
        if (waitCard) waitCard.classList.add('hidden');
        if (botBanner) botBanner.classList.add('hidden');
        if (closedPanel) closedPanel.classList.add('hidden');
        if (privBar) privBar.classList.add('hidden');
        if (gameArea) gameArea.classList.remove('hidden');

        const title = document.getElementById('mp-mode-title');
        if (title) title.textContent = (lang === 'ar' ? 'تحدي ثنائي بالكود (4 أرقام)' : '1v1 PIN Duel');
        const codeEl = document.getElementById('mp-room-code');
        if (codeEl) codeEl.textContent = digits;

        document.getElementById('mp-card-p2').classList.add('hidden');
        document.getElementById('mp-card-p3').classList.add('hidden');
        initNicknameInput();
        mpScores = [0, 0, 0, 0];
        mpRound = 1;
        updateMpUI();

        if (d.room && Array.isArray(d.room.contestants)) {
          const opp = d.room.contestants.find(function(c) { return c.id !== myPlayerId; });
          if (opp) {
            document.getElementById('mp-p1-name').textContent = opp.name || 'المتسابق الأول';
            const p1Av = document.getElementById('mp-p1-avatar');
            if (p1Av && opp.avatar) p1Av.textContent = opp.avatar;
            renderMpOpponentActions(1, opp);
          }
        }

        const qRes = await fetch(API_BASE + '/api/rooms/' + encodeURIComponent(digits) + '/questions?category=' + encodeURIComponent(current1v1Category) + '&playerId=' + encodeURIComponent(myPlayerId));
        const qData = await qRes.json();
        if (qData && qData.success && Array.isArray(qData.questions) && qData.questions.length > 0) {
          serverRoomQuestions = mapServerQuestions(qData.questions);
        }

        rtcStartMatchMic(digits);
        audio.playCorrect();
        startRoomStateAndHeartbeat(digits);
        loadMpQuestion();
        syncCallPauseUI();
      } catch (e) {
        alert('تعذر الاتصال بالخادم للتحقق من الكود.');
      }
    }

    function render4pWaitSlots(waitingPlayers) {
      const box = document.getElementById('mp-wait-slots');
      if (!box) return;
      box.innerHTML = '';
      for (let i = 0; i < 4; i++) {
        const p = waitingPlayers[i];
        const card = document.createElement('div');
        if (p) {
          card.className = 'p-2 rounded-xl bg-slate-950 border border-emerald-500/50 text-center';
          card.innerHTML = '<div class="text-lg">' + (p.avatar || '👤') + '</div>' +
            '<div class="font-bold text-emerald-300 truncate">' + p.name + '</div>' +
            '<div class="text-[10px] text-emerald-400">✓ متصل الآن</div>';
        } else {
          card.className = 'p-2 rounded-xl bg-slate-950/60 border border-dashed border-purple-500/40 text-center';
          card.innerHTML = '<div class="text-lg">🌍</div>' +
            '<div class="font-bold text-slate-400">بانتظار جهاز...</div>' +
            '<div class="text-[10px] text-purple-300/70">مقعد متاح</div>';
        }
        box.appendChild(card);
      }
    }

    function enterMatched4pRoom(d) {
      if (mp4pMatched) return;
      const roomId = d.roomId || (d.room && d.room.id);
      if (!roomId) return;
      mp4pMatched = true;
      clearInterval(mpSearchTimer);
      mpSearchTimer = null;

      currentMultiMode = '4p';
      current1v1RoomCode = roomId;
      current1v1Role = '';
      current4pRole = d.role || 'player1_host';
      hasAutoJoinedRoom = false;
      is1v1MatchLocked = false;
      lastObservedHumans = {};
      mpHasAnswered = false;
      mpLastAnsweredIsCorrect = null;
      mpChosenAnswer = -1;
      mpRoundRevealed = false;
      mpRoundScoreAwarded = false;
      mpPendingWrongIdx = -1;
      mpScores = [0, 0, 0, 0];
      mpRound = 1;
      resetMpLifelinesUI();
      updateMpUI();

      const botBanner = document.getElementById('mp-bot-banner');
      const privBar = document.getElementById('mp-private-room-bar');
      const gameArea = document.getElementById('mp-gameplay-area');
      if (botBanner) botBanner.classList.add('hidden');
      if (privBar) privBar.classList.add('hidden');
      if (gameArea) gameArea.classList.remove('hidden');

      const codeEl = document.getElementById('mp-room-code');
      if (codeEl) codeEl.textContent = roomId;

      const contestants = d.contestants || (d.room && d.room.contestants) || [];
      const me = contestants.find(function(c) { return c.id === myPlayerId || (current4pRole && c.role === current4pRole); });
      const others = contestants.filter(function(c) { return c !== me; });
      currentRoomBots = others.filter(function(c) { return c.isBot; });

      for (let i = 0; i < 3; i++) {
        const opp = others[i];
        const slotIdx = i + 1;
        if (!opp) {
          renderMpOpponentActions(slotIdx, null);
          continue;
        }
        const nEl = document.getElementById('mp-p' + slotIdx + '-name');
        const aEl = document.getElementById('mp-p' + slotIdx + '-avatar');
        if (nEl) nEl.textContent = opp.name;
        if (aEl && opp.avatar) aEl.textContent = opp.avatar;
        renderMpOpponentActions(slotIdx, opp);
        lastObservedHumans[opp.role || slotIdx] = { isBot: !!opp.isBot, name: opp.name, id: opp.id };
      }

      const qs = (d.room && Array.isArray(d.room.questions)) ? d.room.questions : [];
      if (qs.length > 0) {
        serverRoomQuestions = mapServerQuestions(qs);
      }

      audio.stopIntro();
      audio.stopTension();
      rtcStartMatchMic(roomId);
      audio.playCorrect();
      startRoomStateAndHeartbeat(roomId);
      loadMpQuestion();
      syncCallPauseUI();
    }

    function startMultiplayer(_netVerified, _permPassed) {
      audio.init();
      audio.stopIntro();
      audio.stopTension();
      if (!_netVerified) {
        verifyInternetBeforeOnline(function() { startMultiplayer(true, false); });
        return;
      }
      if (!_permPassed) {
        openMicPermissionScreen('تحدي 4 لاعبين حول العالم', function() {
          startMultiplayer(true, true);
        });
        return;
      }
      audio.stopSpeaking();
      if (rtcInCall) rtcHangup();
      clearInterval(friendPollTimer);
      clearInterval(mpSearchTimer);
      clearInterval(mpGameStatePollTimer);
      clearInterval(mpHeartbeatTimer);
      currentMultiMode = '4p';
      hasAutoJoinedRoom = false;
      current1v1Role = '';
      current4pRole = '';
      mp4pMatched = false;
      is1v1MatchLocked = false;
      current1v1RoomCode = '';
      serverRoomQuestions = [];
      mpHasAnswered = false;
      mpLastAnsweredIsCorrect = null;
      mpChosenAnswer = -1;
      mpRoundRevealed = false;
      mpRoundScoreAwarded = false;
      mpPendingWrongIdx = -1;
      resetMpLifelinesUI();
      show('screen-multiplayer');

      const waitCard = document.getElementById('mp-waiting-friend-card');
      const gameArea = document.getElementById('mp-gameplay-area');
      const closedPanel = document.getElementById('mp-forfeit-closed-panel');
      const subBanner = document.getElementById('mp-bot-sub-banner');
      const privBar = document.getElementById('mp-private-room-bar');
      if (waitCard) waitCard.classList.add('hidden');
      if (closedPanel) closedPanel.classList.add('hidden');
      if (subBanner) subBanner.classList.add('hidden');
      if (gameArea) gameArea.classList.add('hidden');
      if (privBar) privBar.classList.remove('hidden');

      const title = document.getElementById('mp-mode-title');
      if (title) title.textContent = (lang === 'ar' ? 'تحدي 4 لاعبين حول العالم' : '4-Player Online Arena');

      const copyBtn = document.getElementById('btn-copy-code');
      if (copyBtn) copyBtn.classList.add('hidden');
      const codeEl = document.getElementById('mp-room-code');
      if (codeEl) codeEl.textContent = '4P-LIVE';

      rtcStopWatching();

      document.getElementById('mp-card-p2').classList.remove('hidden');
      document.getElementById('mp-card-p3').classList.remove('hidden');
      document.getElementById('mp-p1-name').textContent = 'بانتظار متسابق...';
      document.getElementById('mp-p2-name').textContent = 'بانتظار متسابق...';
      document.getElementById('mp-p3-name').textContent = 'بانتظار متسابق...';

      const llBar = document.getElementById('mp-lifelines-bar');
      if (llBar) llBar.classList.remove('hidden');

      const botBanner = document.getElementById('mp-bot-banner');
      if (botBanner) botBanner.classList.remove('hidden');
      mpSearchSec = 60;
      const qCntEl = document.getElementById('mp-queue-count');
      if (qCntEl) qCntEl.textContent = '1';
      updateSearchCountdown();
      render4pWaitSlots([{ name: userProfile.name || myPlayerName, avatar: userProfile.avatar || '👑' }]);

      initNicknameInput();
      mpScores = [0, 0, 0, 0];
      mpRound = 1;
      updateMpUI();

      let fillBotsRequested = false;

      fetch(API_BASE + '/api/matchmaking/4p/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: mpDeviceId,
          playerId: myPlayerId,
          name: userProfile.name || myPlayerName,
          avatar: userProfile.avatar || '👑',
          country: userProfile.country || 'SA',
          category: 'all',
          lang: lang,
          excludeIds: Array.from(globalUsedQuestionIds)
        })
      })
        .then(function(r) { return r.json(); })
        .then(function(d) {
          if (d && d.matched && (d.room || d.roomId)) {
            enterMatched4pRoom(d);
          } else if (d && Array.isArray(d.players)) {
            if (typeof d.searchSecondsLeft === 'number') {
              mpSearchSec = d.searchSecondsLeft;
              updateSearchCountdown();
            }
            if (qCntEl) qCntEl.textContent = String(d.queueCount || d.players.length || 1);
            render4pWaitSlots(d.players);
          }
        })
        .catch(function() {});

      mpSearchTimer = setInterval(async function() {
        if (mp4pMatched) return;
        try {
          if (mpSearchSec > 0) mpSearchSec--;
          updateSearchCountdown();

          const res = await fetch(API_BASE + '/api/matchmaking/4p/status?deviceId=' + encodeURIComponent(mpDeviceId));
          if (!res.ok) return;
          const d = await res.json();
          if (mp4pMatched) return;

          if (typeof d.searchSecondsLeft === 'number') {
            mpSearchSec = d.searchSecondsLeft;
            updateSearchCountdown();
          }
          if (typeof d.queueCount === 'number' && qCntEl) {
            qCntEl.textContent = String(Math.max(1, d.queueCount));
          }
          if (Array.isArray(d.players) && d.players.length > 0) {
            render4pWaitSlots(d.players);
          }

          if (d.matched && (d.room || d.roomId)) {
            enterMatched4pRoom(d);
            return;
          }

          if (mpSearchSec <= 0 && !fillBotsRequested && !mp4pMatched) {
            fillBotsRequested = true;
            const fRes = await fetch(API_BASE + '/api/matchmaking/4p/fill-bots', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                deviceId: mpDeviceId,
                playerId: myPlayerId,
                name: userProfile.name || myPlayerName,
                avatar: userProfile.avatar || '👑',
                country: userProfile.country || 'SA',
                lang: lang,
                excludeIds: Array.from(globalUsedQuestionIds)
              })
            });
            const fData = await fRes.json();
            if (fData && fData.matched && (fData.room || fData.roomId)) {
              enterMatched4pRoom(fData);
            } else {
              fillBotsRequested = false;
            }
          }
        } catch(e) {}
      }, 1000);
    }

    function updateSearchCountdown() {
      const el = document.getElementById('mp-search-countdown');
      if (el) el.textContent = String(mpSearchSec);
    }

    function initNicknameInput() {
      const inp = document.getElementById('mp-nickname-input');
      if (inp) {
        inp.value = userProfile.name || myPlayerName;
      }
      const p0 = document.getElementById('mp-p0-name');
      if (p0) p0.textContent = (userProfile.name || myPlayerName) + ' (أنت)';
    }

    function updateMpUI() {
      document.getElementById('mp-p0').textContent = mpScores[0];
      document.getElementById('mp-p1').textContent = mpScores[1];
      document.getElementById('mp-p2').textContent = mpScores[2];
      document.getElementById('mp-p3').textContent = mpScores[3];
      document.getElementById('mp-round').textContent = mpRound;
    }

    let currentMpQ = null;

    function useMultiLifeline(type) {
      if ((currentMultiMode !== '1v1' && currentMultiMode !== '4p') || !currentMpQ || is1v1MatchLocked || mpHasAnswered || mpRoundRevealed || rtcInCall || mpPendingWrongIdx !== -1) return;
      audio.init();
      const q = currentMpQ;
      const isAr = (lang === 'ar');
      const letters = isAr ? ['أ', 'ب', 'ج', 'د'] : ['A', 'B', 'C', 'D'];

      if (type === '5050') {
        if (!mpLifelines.f50) return;
        mpLifelines.f50 = false;
        const btn = document.getElementById('mp-ll-5050');
        if (btn) {
          btn.classList.add('opacity-30', 'pointer-events-none', 'line-through');
          btn.disabled = true;
        }
        const wrongs = [0, 1, 2, 3].filter(i => i !== q.ans).sort(() => 0.5 - Math.random());
        const toHide = wrongs.slice(0, 2);
        toHide.forEach(idx => {
          const opt = document.getElementById('mp-opt-' + idx);
          if (opt) {
            opt.textContent = '---';
            opt.disabled = true;
            opt.classList.add('opacity-20', 'pointer-events-none');
          }
        });
        audio.playLifeline();
      } else if (type === 'aud') {
        if (!mpLifelines.aud) return;
        mpLifelines.aud = false;
        const btn = document.getElementById('mp-ll-aud');
        if (btn) {
          btn.classList.add('opacity-30', 'pointer-events-none', 'line-through');
          btn.disabled = true;
        }
        audio.playLifeline();

        const container = document.getElementById('aud-bars');
        if (container) {
          container.innerHTML = '';
          const activeWrongs = [0, 1, 2, 3].filter(i => {
            if (i === q.ans) return false;
            const optEl = document.getElementById('mp-opt-' + i);
            return !(optEl && optEl.textContent === '---');
          });
          const pcts = [0, 0, 0, 0];
          if (activeWrongs.length <= 1) {
            const correctPct = Math.floor(Math.random() * 18) + 74;
            pcts[q.ans] = correctPct;
            if (activeWrongs[0] !== undefined) pcts[activeWrongs[0]] = 100 - correctPct;
          } else {
            const correctPct = Math.floor(Math.random() * 25) + 60;
            const remain = 100 - correctPct;
            if (activeWrongs.length === 2) {
              const p1 = Math.floor(Math.random() * (remain - 2)) + 1;
              pcts[q.ans] = correctPct;
              pcts[activeWrongs[0]] = p1;
              pcts[activeWrongs[1]] = remain - p1;
            } else {
              const p1 = Math.floor(Math.random() * (remain - 4));
              const p2 = Math.floor(Math.random() * (remain - p1 - 2));
              const p3 = remain - p1 - p2;
              pcts[q.ans] = correctPct;
              pcts[activeWrongs[0]] = p1;
              pcts[activeWrongs[1]] = p2;
              pcts[activeWrongs[2]] = p3;
            }
          }

          const opts = isAr ? q.oa : q.oe;
          pcts.forEach((pct, idx) => {
            const row = document.createElement('div');
            row.className = 'flex items-center gap-2';
            row.innerHTML = '<span class="w-4 font-bold text-amber-400">' + letters[idx] + '</span>' +
              '<div class="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden">' +
              '<div class="bg-amber-400 h-full rounded-full transition-all duration-700" style="width: ' + pct + '%"></div>' +
              '</div>' +
              '<span class="w-8 text-right font-bold">' + pct + '%</span>' +
              '<span class="max-w-[95px] truncate text-[10px] text-slate-400">' + (opts[idx] || '') + '</span>';
            container.appendChild(row);
          });
        }
        const modalAud = document.getElementById('modal-aud');
        if (modalAud) modalAud.classList.remove('hidden');
      } else if (type === 'phone') {
        if (!mpLifelines.phone) return;
        mpLifelines.phone = false;
        const btn = document.getElementById('mp-ll-phone');
        if (btn) {
          btn.classList.add('opacity-30', 'pointer-events-none', 'line-through');
          btn.disabled = true;
        }
        audio.playLifeline();
        const opts = isAr ? q.oa : q.oe;
        const correctOptText = (opts && opts[q.ans]) ? (' — ' + opts[q.ans]) : '';
        const advice = isAr
          ? ('مرحباً بك! أنا متأكد بنسبة 88% أن الإجابة الصحيحة هي الخيار (' + letters[q.ans] + ')' + correctOptText + '!')
          : ('Hello! I am 88% confident that option (' + letters[q.ans] + ')' + correctOptText + ' is the correct answer!');
        const phEl = document.getElementById('ph-text');
        if (phEl) phEl.textContent = advice;
        const modalPh = document.getElementById('modal-ph');
        if (modalPh) modalPh.classList.remove('hidden');
      }
    }

    function getDeterministicRoomQuestion(roomCode, roundNum, cat) {
      const code = (roomCode || '8202').toUpperCase().trim();
      const rawCat = cat || current1v1Category || 'all';
      const targetCat = (!rawCat || rawCat === 'all') ? 'general' : rawCat;
      const catPool = QUESTIONS.filter(function(q) {
        if (targetCat === 'general') return q.cat === 'general';
        if (targetCat === 'islamic') return q.cat === 'islamic';
        if (targetCat === 'entertainment') return q.cat === 'sports' || q.cat === 'cinema';
        return q.cat === targetCat;
      });
      const pool = catPool.length >= 10 ? catPool : QUESTIONS;
      const isStrictCategory = targetCat === 'general' || targetCat === 'islamic' || targetCat === 'entertainment';
      const isDedicated100 = isStrictCategory;
      let seed = 0;
      for (let i = 0; i < code.length; i++) {
        seed = (seed * 31 + code.charCodeAt(i)) % 2147483647;
      }
      const roundIdx = Math.max(0, roundNum - 1);
      const targetLevel = Math.min(15, roundIdx + 1);
      const prevTopic = currentMpQ ? getQTopic(currentMpQ) : '';
      const tierQuestions = isDedicated100
        ? pool.filter(q => !globalUsedQuestionIds.has(q.id))
        : pool.filter(q => q.lvl === targetLevel && !globalUsedQuestionIds.has(q.id));
      const poolUnseen = pool.filter(q => !globalUsedQuestionIds.has(q.id));
      const fullUnseen = isStrictCategory ? poolUnseen : QUESTIONS.filter(q => !globalUsedQuestionIds.has(q.id));
      const basePool = tierQuestions.length > 0
        ? tierQuestions
        : (poolUnseen.length > 0 ? poolUnseen : (fullUnseen.length > 0 ? fullUnseen : pool));
      const nonSameTopic = basePool.filter(q => getQTopic(q) !== prevTopic);
      const activePool = nonSameTopic.length > 0 ? nonSameTopic : basePool;
      const idx = Math.abs(seed + roundIdx * 997) % activePool.length;
      return activePool[idx];
    }

    let mpChosenAnswer = -1;
    let mpRoundRevealed = false;
    let mpRoundScoreAwarded = false;
    let mpPendingWrongIdx = -1;
    let serverRoomQuestions = [];

    function loadMpQuestion() {
      if (is1v1MatchLocked) return;
      clearInterval(mpActiveTimer);
      mpActiveTimer = null;
      audio.stopSpeaking();
      mpHasAnswered = false;
      mpLastAnsweredIsCorrect = null;
      mpChosenAnswer = -1;
      mpRoundRevealed = false;
      mpRoundScoreAwarded = false;
      mpPendingWrongIdx = -1;
      mpTimeLeft = 40;

      const revPrompt = document.getElementById('mp-revive-prompt');
      if (revPrompt) revPrompt.classList.add('hidden');
      const banner = document.getElementById('mp-round-status-banner');
      if (banner) {
        banner.className = 'hidden';
        banner.innerHTML = '';
      }

      const p0Status = document.getElementById('mp-p0-status');
      if (p0Status) p0Status.innerHTML = '<span class="text-slate-400">يفكر... ⏳</span>';
      const p1Status = document.getElementById('mp-p1-status');
      if (p1Status) p1Status.innerHTML = '<span class="text-slate-400">يفكر... ⏳</span>';
      const p2Status = document.getElementById('mp-p2-status');
      if (p2Status) p2Status.innerHTML = '<span class="text-slate-400">يفكر... ⏳</span>';
      const p3Status = document.getElementById('mp-p3-status');
      if (p3Status) p3Status.innerHTML = '<span class="text-slate-400">يفكر... ⏳</span>';

      const currentCode = (document.getElementById('mp-room-code')?.textContent || current1v1RoomCode || '8202').trim();
      const q = (serverRoomQuestions && serverRoomQuestions[mpRound - 1])
        ? serverRoomQuestions[mpRound - 1]
        : getDeterministicRoomQuestion(currentCode, mpRound, current1v1Category);

      markQuestionGlobalUsed(q.id);
      currentMpQ = q;

      const isAr = (lang === 'ar');
      const qText = document.getElementById('mp-q-text');
      if (qText) qText.textContent = isAr ? q.qa : q.qe;

      for (let i = 0; i < 4; i++) {
        const btn = document.getElementById('mp-opt-' + i);
        if (btn) {
          btn.textContent = isAr ? q.oa[i] : q.oe[i];
          btn.className = 'py-3 px-3 rounded-xl border border-slate-700 bg-slate-900 text-xs font-bold text-slate-200 text-center hover:border-amber-400 transition';
          btn.classList.remove('pointer-events-none', 'opacity-40', 'opacity-20');
          btn.disabled = false;
        }
      }

      updateMpTimerBar();
      updateAutoSpeakLabels();

      if (!rtcInCall && !audio.muted && autoSpeakEnabled) {
        setTimeout(function() {
          if (!mpHasAnswered && !mpRoundRevealed && !rtcInCall && !is1v1MatchLocked && currentMpQ && currentMpQ.id === q.id) {
            toggleMpSpeakQuestion(true);
          }
        }, 160);
      }

      if (!rtcInCall) {
        mpActiveTimer = setInterval(function() {
          if (rtcInCall) return;
          mpTimeLeft--;
          updateMpTimerBar();
          if (mpTimeLeft <= 0) {
            clearInterval(mpActiveTimer);
            mpActiveTimer = null;
            onMultiQuestionTimeout();
          }
        }, 1000);
      }
      syncCallPauseUI();
    }

    function updateMpTimerBar() {
      const secEl = document.getElementById('mp-timer-sec');
      if (secEl) secEl.textContent = mpTimeLeft;
      const fillEl = document.getElementById('mp-timer-fill');
      if (fillEl) {
        const pct = Math.max(0, (mpTimeLeft / 40) * 100);
        fillEl.style.width = pct + '%';
        fillEl.className = (mpTimeLeft <= 8) ? 'bg-rose-500 h-full transition-all duration-1000' : 'bg-amber-400 h-full transition-all duration-1000';
      }
    }

    function onMultiQuestionTimeout() {
      if (mpRoundRevealed || is1v1MatchLocked) return;
      mpRoundRevealed = true;
      mpPendingWrongIdx = -1;
      const revPrompt = document.getElementById('mp-revive-prompt');
      if (revPrompt) revPrompt.classList.add('hidden');
      clearInterval(mpActiveTimer);
      mpActiveTimer = null;
      audio.stopSpeaking();

      const q = currentMpQ || QUESTIONS[(mpRound * 7) % QUESTIONS.length];
      const isCorrect = (mpChosenAnswer === q.ans);

      if (isCorrect) {
        audio.playCorrect();
        if (!mpRoundScoreAwarded) {
          mpRoundScoreAwarded = true;
          mpScores[0] += 50;
          userPoints += 50;
          savePoints();
        }
      } else {
        audio.playWrong();
      }

      updateMpUI();
      revealMultiAnswers(mpChosenAnswer);
    }

    function confirmMpRevive() {
      if (mpHasAnswered || mpRoundRevealed || userPoints < 50) {
        const rp = document.getElementById('mp-revive-prompt');
        if (rp) rp.classList.add('hidden');
        return;
      }
      userPoints = Math.max(0, userPoints - 50);
      savePoints();
      mpPendingWrongIdx = -1;
      const rp = document.getElementById('mp-revive-prompt');
      if (rp) rp.classList.add('hidden');
      const banner = document.getElementById('mp-round-status-banner');
      if (banner) {
        banner.className = 'p-3 bg-emerald-500/15 border border-emerald-400/60 text-emerald-300 rounded-2xl text-center text-xs font-black shadow-lg';
        banner.innerHTML = '✅ تم خصم 50 نقطة من رصيدك — يمكنك اختيار إجابة أخرى الآن! (رصيدك: ' + userPoints + ' نقطة)';
        banner.classList.remove('hidden');
      }
    }

    function declineMpRevive() {
      const rp = document.getElementById('mp-revive-prompt');
      if (rp) rp.classList.add('hidden');
      const idx = mpPendingWrongIdx >= 0 ? mpPendingWrongIdx : 0;
      mpPendingWrongIdx = -1;
      commitMultiAnswer(idx, false);
    }

    function handleMultiAnswer(idx) {
      if (mpHasAnswered || mpRoundRevealed || rtcInCall || mpPendingWrongIdx !== -1) return;
      const q = currentMpQ || QUESTIONS[(mpRound * 7) % QUESTIONS.length];
      const isCorrect = (idx === q.ans);

      // On wrong answer: ask player whether to deduct 50 pts to continue trying the same question!
      if (!isCorrect && userPoints >= 50) {
        mpPendingWrongIdx = idx;
        audio.playWrong();
        const pickedBtn = document.getElementById('mp-opt-' + idx);
        if (pickedBtn) {
          pickedBtn.className = 'py-3 px-3 rounded-xl border border-rose-500 bg-rose-500/20 text-xs font-bold text-rose-200 text-center transition';
          setTimeout(function() {
            if (!mpHasAnswered && !mpRoundRevealed && pickedBtn && pickedBtn.textContent !== '---') {
              pickedBtn.className = 'py-3 px-3 rounded-xl border border-slate-700 bg-slate-900 text-xs font-bold text-slate-200 text-center hover:border-amber-400 transition';
            }
          }, 950);
        }
        const desc = document.getElementById('mp-revive-desc');
        if (desc) {
          desc.textContent = 'هل تريد خصم 50 نقطة من رصيدك (' + userPoints + ' نقطة) للمواصلة وإعادة المحاولة في نفس السؤال؟';
        }
        const rp = document.getElementById('mp-revive-prompt');
        if (rp) rp.classList.remove('hidden');
        return;
      }

      commitMultiAnswer(idx, isCorrect);
    }

    function commitMultiAnswer(idx, isCorrect) {
      mpHasAnswered = true;
      mpLastAnsweredIsCorrect = isCorrect;
      mpChosenAnswer = idx;

      audio.stopSpeaking();
      if (isCorrect) audio.playCorrect();
      else audio.playWrong();

      for (let i = 0; i < 4; i++) {
        const btn = document.getElementById('mp-opt-' + i);
        if (btn) {
          btn.classList.add('pointer-events-none');
          if (i === idx) {
            btn.classList.remove('border-slate-700', 'bg-slate-900');
            if (isCorrect) {
              btn.classList.add('border-emerald-400', 'bg-emerald-500/20', 'text-emerald-200', 'ring-2', 'ring-emerald-400/50');
            } else {
              btn.classList.add('border-rose-400', 'bg-rose-500/20', 'text-rose-200', 'ring-2', 'ring-rose-400/50');
            }
          } else {
            btn.classList.add('opacity-40');
          }
        }
      }

      const pts = isCorrect ? 50 : 0;

      if (isCorrect && !mpRoundScoreAwarded) {
        mpRoundScoreAwarded = true;
        mpScores[0] += 50;
        userPoints += 50;
        savePoints();
        updateMpUI();
      }

      const p0Status = document.getElementById('mp-p0-status');
      if (p0Status) {
        p0Status.innerHTML = isCorrect
          ? '<span class="text-emerald-400 font-bold">✅ صح (+50)</span>'
          : '<span class="text-rose-400 font-bold">❌ خطأ (0)</span>';
      }

      renderMpLiveRoundBanner([]);

      const code = (document.getElementById('mp-room-code')?.textContent || current1v1RoomCode || '').trim();
      if (code) {
        const role = (currentMultiMode === '4p')
          ? (current4pRole || 'player1_host')
          : (current1v1Role || (hasAutoJoinedRoom ? 'player2_guest' : 'player1_host'));
        fetch(API_BASE + '/api/rooms/' + encodeURIComponent(code) + '/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId: myPlayerId,
            role: role,
            optionIndex: idx,
            roundIndex: Math.max(0, mpRound - 1),
            responseTime: Math.max(0, 40 - mpTimeLeft),
            isCorrect: isCorrect,
            pointsEarned: pts
          })
        }).then(function(r) { return r.json(); }).then(function(data) {
          if (data) {
            applyServerRoomStateToUI(Object.assign({}, data, { status: data.status || 'reading' }));
          }
          if (data && (data.status === 'revealed' || data.bothAnswered || data.allAnswered)) {
            onMultiQuestionTimeout();
          }
        }).catch(function() {});
      }
    }

    function revealMultiAnswers(chosenIdx) {
      const q = currentMpQ || QUESTIONS[(mpRound * 7) % QUESTIONS.length];

      for (let i = 0; i < 4; i++) {
        const btn = document.getElementById('mp-opt-' + i);
        if (!btn) continue;
        btn.classList.add('pointer-events-none');
        btn.classList.remove('opacity-40', 'ring-2', 'ring-amber-400/50');
        if (i === q.ans) {
          btn.classList.remove('border-slate-700', 'bg-slate-900', 'border-amber-400', 'bg-amber-500/20', 'text-slate-200');
          btn.classList.add('border-emerald-500', 'bg-emerald-500/30', 'text-emerald-200');
        } else if (i === chosenIdx) {
          btn.classList.remove('border-slate-700', 'bg-slate-900', 'border-amber-400', 'bg-amber-500/20', 'text-slate-200');
          btn.classList.add('border-rose-500', 'bg-rose-500/30', 'text-rose-200');
        }
      }

      const p0Status = document.getElementById('mp-p0-status');
      if (p0Status) {
        p0Status.innerHTML = (chosenIdx === q.ans)
          ? '<span class="text-emerald-400 font-bold">صح ✅</span>'
          : '<span class="text-rose-400 font-bold">خطأ ❌</span>';
      }

      const banner = document.getElementById('mp-round-status-banner');
      if (banner) {
        const isCorrect = (chosenIdx === q.ans);
        const myResultText = isCorrect ? '✅ إجابتك صحيحة!' : (chosenIdx === -1 ? '⏱️ انتهى وقت العداد!' : '❌ إجابتك خاطئة!');
        const oppScoreText = (currentMultiMode === '1v1')
          ? (' • أنت: ' + mpScores[0] + ' نقطة | الخصم: ' + mpScores[1] + ' نقطة')
          : (' • نقاطك: ' + mpScores[0] + ' نقطة');
        banner.className = 'p-3 rounded-2xl text-center text-xs font-bold transition-all shadow-lg ' + (isCorrect ? 'bg-emerald-950/40 border border-emerald-500 text-emerald-300' : 'bg-rose-950/40 border border-rose-500 text-rose-300');
        banner.innerHTML = '<div class="font-black text-sm">' + myResultText + '</div>' +
          '<div class="pt-1 font-mono">' + oppScoreText + '</div>' +
          '<div class="text-[10px] text-slate-300 font-normal pt-1">⏳ جاري الانتقال التلقائي للسؤال التالي...</div>';
        banner.classList.remove('hidden');
      }

      const code = (document.getElementById('mp-room-code')?.textContent || current1v1RoomCode || '').trim();
      if (code) {
        fetch(API_BASE + '/api/rooms/' + encodeURIComponent(code) + '/state')
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data && data.success && data.room) {
              applyServerRoomStateToUI(data.room);
            }
          }).catch(function() {});
      }

      if (mpAutoAdvanceTimer) clearTimeout(mpAutoAdvanceTimer);
      mpAutoAdvanceTimer = setTimeout(async function() {
        mpAutoAdvanceTimer = null;
        if (is1v1MatchLocked) return;
        const roundRequested = mpRound;
        const roomCode = (document.getElementById('mp-room-code')?.textContent || current1v1RoomCode || '').trim();
        let nextData = null;
        if (roomCode) {
          try {
            const nRes = await fetch(API_BASE + '/api/rooms/' + encodeURIComponent(roomCode) + '/next', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ currentRound: roundRequested })
            });
            nextData = await nRes.json().catch(function() { return null; });
          } catch(e) {}
        }
        if (nextData && nextData.deferred) {
          // Server is waiting for the linked player(s) to finish answering Q; SSE/poll will advance when ready
          if (banner) {
            banner.innerHTML = '<div class="font-black text-sm text-amber-300">⏳ بانتظار إجابة بقية المتسابقين...</div>' +
              '<div class="text-[10px] text-slate-300 font-normal pt-1">سيتم الانتقال للسؤال التالي تلقائياً فور انتهاء الجميع</div>';
          }
          return;
        }
        if (mpRound !== roundRequested) return;
        if (mpRound < 10) {
          mpRound++;
          updateMpUI();
          loadMpQuestion();
        } else {
          const isGuest = (current1v1Role ? current1v1Role === 'player2_guest' : hasAutoJoinedRoom);
          close1v1MatchLocked({
            player1_score: isGuest ? mpScores[1] : mpScores[0],
            player2_score: isGuest ? mpScores[0] : mpScores[1]
          }, true);
        }
      }, 2800);
    }

    async function sendChatMessage() {
      const input = document.getElementById('mp-chat-input');
      const txt = input.value.trim();
      if (!txt) return;

      const msgId = 'm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      input.value = '';
      knownMessageIds.add(msgId);

      const myAvatar = userProfile.avatar || '👑';
      const myName = userProfile.name || myPlayerName;
      const chat = document.getElementById('mp-chat');
      const msg = document.createElement('div');
      msg.id = 'msg-' + msgId;
      msg.className = 'text-[11px] text-amber-300 flex items-center justify-between gap-1 group bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20';
      const spanEl = document.createElement('span');
      spanEl.className = 'break-words';
      spanEl.innerHTML = myAvatar + ' <b>' + myName + ':</b> ';
      spanEl.appendChild(document.createTextNode(txt));
      const delBtn = document.createElement('button');
      delBtn.title = (lang === 'ar' ? 'حذف لدى الجميع' : 'Delete for Everyone');
      delBtn.className = 'text-[10px] text-rose-400 hover:text-rose-300 px-1 py-0.5 rounded bg-rose-950/60 border border-rose-800 shrink-0';
      delBtn.textContent = '🗑️';
      delBtn.onclick = function() { deleteChatMessage(msgId); };
      msg.appendChild(spanEl);
      msg.appendChild(delBtn);
      chat.appendChild(msg);
      chat.scrollTop = chat.scrollHeight;

      try {
        await fetch(API_BASE + '/api/rooms/M-GLOBAL/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: msgId,
            senderId: myPlayerId,
            senderName: myName,
            senderAvatar: myAvatar,
            text: txt,
            message: txt
          })
        });
      } catch (err) {}

      if (currentRoomBots && currentRoomBots.length > 0) {
        setTimeout(function() {
          const b = currentRoomBots[Math.floor(Math.random() * currentRoomBots.length)];
          const replies = [
            'بالتوفيق يا بطل! التحدي مشتعل 🔥',
            'أهلاً بك معنا، لنرى من سيصل للمركز الأول 💪',
            'سؤال قوي ورائع، أحسنت 👏',
            'المنافسة قوية جداً بيننا اليوم 🎯',
            'ما شاء الله، إجابات سريعة وتركيز عالي!',
            'أحسنت! سأحاول التعويض في السؤال القادم 👏',
            'تحدي ممتع ومنافسة شريفة 🌟',
          ];
          const bText = replies[Math.floor(Math.random() * replies.length)];
          const bMsg = document.createElement('div');
          bMsg.className = 'text-[11px] text-slate-300 flex items-center justify-between gap-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800';
          bMsg.innerHTML = '<span class="break-words">' + (b.avatar || '🌟') + ' <b>' + (b.name || 'متسابق').split(' ')[0] + ':</b> ' + bText + '</span>';
          chat.appendChild(bMsg);
          chat.scrollTop = chat.scrollHeight;
        }, 1500 + Math.floor(Math.random() * 1200));
      }
    }

    // 1v1 uses strictly 4-digit numeric PIN codes (no links); keep private call room deep-link only
    function checkUrlRoomOnStartup() {
      try {
        let privRoom = '';
        const href = window.location.href || '';
        if (window.location.search) {
          const urlParams = new URLSearchParams(window.location.search);
          privRoom = urlParams.get('privateRoom') || '';
        }
        if (!privRoom && href) {
          const mp = href.match(/[?&]privateRoom=([A-Za-z0-9_-]+)/i);
          if (mp && mp[1]) privRoom = mp[1];
        }
        if (privRoom && privRoom.trim()) {
          var cleanPrivDigits = privRoom.trim().replace(/^PRIV-/i, '').replace(/\D/g, '').slice(0, 4);
          if (cleanPrivDigits.length === 4) {
            currentPrivateRoomId = cleanPrivDigits;
            openRoomsScreen();
          }
        }
      } catch (e) {}
    }

    // =========================================================================
    // محرك الغرفة الخاصة (4 أرقام فقط) + الاتصال المباشر عبر PeerJS بين الموبايل واللابتوب
    // =========================================================================
    var currentRoomTab = 'private';
    var currentPrivateRoomId = String(Math.floor(1000 + Math.random() * 9000));
    var currentActiveCallRoom = currentPrivateRoomId;
    var roomsKnownMsgIds = new Set();
    var roomsPollTimer = null;

    function normalize4DigitPin(val) {
      return String(val || '').trim().replace(/^PRIV-/i, '').replace(/\D/g, '').slice(0, 4);
    }

    function getSelectedChatRoomId() {
      return currentPrivateRoomId;
    }

    function openRoomsScreen(_netVerified) {
      if (!_netVerified) {
        verifyInternetBeforeOnline(function() { openRoomsScreen(true); });
        return;
      }
      audio.stopIntro();
      audio.stopTension();
      show('screen-rooms');
      switchRoomTab();
    }

    function switchRoomTab() {
      currentRoomTab = 'private';
      var hdr = document.getElementById('rooms-header-title');
      var badge = document.getElementById('priv-room-code-badge');
      if (badge) badge.textContent = currentPrivateRoomId;
      if (hdr) hdr.textContent = '🔐 الغرفة الخاصة (' + currentPrivateRoomId + ')';
      currentActiveCallRoom = currentPrivateRoomId;
      rtcWatchRoom(currentPrivateRoomId);
      rtcRenderBlockedList();
      loadRoomsChatMessages(true);
    }

    function createNewPrivateRoom() {
      currentPrivateRoomId = String(Math.floor(1000 + Math.random() * 9000));
      switchRoomTab();
    }

    function joinPrivateRoomByInput() {
      var inp = document.getElementById('priv-join-input');
      var digits = normalize4DigitPin(inp && inp.value ? inp.value : '');
      if (digits.length !== 4) {
        alert('يرجى إدخال كود مكون من 4 أرقام فقط (مثال: 8202)');
        return;
      }
      currentPrivateRoomId = digits;
      inp.value = '';
      switchRoomTab();
    }

    function getPrivateShareUrl() {
      var base = 'https://ais-pre-dforsaebo7nl3hpgeoyqed-960882533050.europe-west2.run.app/appcreator24.html';
      try {
        if (window.location && window.location.origin && window.location.origin.indexOf('file:') !== 0 && window.location.origin !== 'null') {
          var orig = window.location.origin.replace('ais-dev-', 'ais-pre-');
          var p = window.location.pathname || '/appcreator24.html';
          if (p === '/') p = '/appcreator24.html';
          base = orig + p;
        }
      } catch(e) {}
      return base + '?privateRoom=' + encodeURIComponent(currentPrivateRoomId);
    }

    function copyPrivateRoomLink() {
      var link = getPrivateShareUrl();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(function() {
          alert('تم نسخ رابط الغرفة الخاصة رقم ' + currentPrivateRoomId + ' بنجاح!');
        }).catch(function() { prompt('انسخ رابط الغرفة الخاصة:', link); });
      } else {
        prompt('انسخ رابط الغرفة الخاصة:', link);
      }
    }

    function sharePrivateRoomWhatsApp() {
      var link = getPrivateShareUrl();
      var txt = '🔐 انضم معي إلى الغرفة الخاصة رقم (' + currentPrivateRoomId + ') عبر PeerJS للدردشة ومكالمات الفيديو والصوت:\\n' + link;
      window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(txt), '_blank');
    }

    function renderSingleRoomChatMessage(m) {
      var list = document.getElementById('rooms-chat-list');
      if (!list || !m || !m.id) return false;
      if (roomsKnownMsgIds.has(m.id)) return false;
      if (m.senderId !== rtcPeerId && rtcIsBlocked(m.senderId)) return false;
      roomsKnownMsgIds.add(m.id);
      var isMine = (m.senderId === rtcPeerId);
      var row = document.createElement('div');
      row.id = 'rmsg-' + m.id;
      row.className = isMine
        ? 'text-[11px] text-amber-300 flex items-center justify-between gap-1 bg-amber-500/10 px-2.5 py-1.5 rounded-xl border border-amber-500/20'
        : 'text-[11px] text-slate-200 flex items-center justify-between gap-1 px-2.5 py-1.5 bg-slate-900 rounded-xl border border-slate-800';
      var contentSpan = document.createElement('span');
      contentSpan.className = 'break-words';
      contentSpan.textContent = (m.senderAvatar || '💬') + ' ' + m.senderName + ': ' + m.text;
      row.appendChild(contentSpan);
      if (isMine) {
        var delBtn = document.createElement('button');
        delBtn.className = 'text-[10px] text-rose-400 px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-800 shrink-0';
        delBtn.textContent = '🗑️';
        delBtn.onclick = function() { deleteRoomChatMessage(m.id); };
        row.appendChild(delBtn);
      } else if (m.senderId && m.senderId !== 'system') {
        var acts = document.createElement('div');
        acts.className = 'flex items-center gap-1 shrink-0';
        var blkBtn = document.createElement('button');
        blkBtn.className = 'text-[10px] text-rose-300 px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-700 shrink-0';
        blkBtn.textContent = '🚫 حظر';
        blkBtn.onclick = function() { rtcBlockCaller(m.senderId, m.senderName, m.senderAvatar); };
        var repBtn = document.createElement('button');
        repBtn.className = 'text-[10px] text-slate-950 px-1.5 py-0.5 rounded bg-amber-500 font-black shrink-0';
        repBtn.textContent = '🚩 إبلاغ';
        repBtn.onclick = function() { openReportPlayerModal(m.senderId, m.senderName, m.senderAvatar, getSelectedChatRoomId()); };
        acts.appendChild(blkBtn);
        acts.appendChild(repBtn);
        row.appendChild(acts);
      }
      list.appendChild(row);
      list.scrollTop = list.scrollHeight;
      return true;
    }

    async function loadRoomsChatMessages(reset) {
      var list = document.getElementById('rooms-chat-list');
      if (!list) return;
      if (reset) {
        roomsKnownMsgIds.clear();
        list.innerHTML = '';
      }
      var rId = getSelectedChatRoomId();
      try {
        var res = await fetch(API_BASE + '/api/rooms/' + encodeURIComponent(rId) + '/messages');
        if (!res.ok) return;
        var data = await res.json();
        if (data && Array.isArray(data.messages)) {
          data.messages.forEach(function(m) {
            renderSingleRoomChatMessage(m);
          });
        }
      } catch(e) {}
    }

    async function sendRoomChatMessage() {
      var inp = document.getElementById('rooms-chat-input');
      var txt = (inp && inp.value ? inp.value : '').trim();
      if (!txt) return;
      inp.value = '';
      var rId = getSelectedChatRoomId();
      var msgId = 'm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      var msgObj = {
        id: msgId,
        senderId: rtcPeerId,
        senderName: userProfile.name || myPlayerName,
        senderAvatar: userProfile.avatar || '👑',
        text: txt,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      renderSingleRoomChatMessage(msgObj);
      rtcBroadcastData({ type: 'chat', roomId: rId, message: msgObj });
      try {
        await fetch(API_BASE + '/api/rooms/' + encodeURIComponent(rId) + '/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.assign({ message: txt }, msgObj))
        });
      } catch(e) {}
    }

    async function deleteRoomChatMessage(msgId) {
      var el = document.getElementById('rmsg-' + msgId);
      if (el) el.remove();
      var rId = getSelectedChatRoomId();
      rtcBroadcastData({ type: 'chat_delete', roomId: rId, messageId: msgId });
      fetch(API_BASE + '/api/rooms/' + encodeURIComponent(rId) + '/chat/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: msgId, requesterId: rtcPeerId })
      }).catch(function() {});
    }

    roomsPollTimer = setInterval(function() {
      var sec = document.getElementById('screen-rooms');
      if (sec && !sec.classList.contains('hidden')) {
        loadRoomsChatMessages(false);
      }
    }, 1800);

    // =========================================================================
    // محرك PeerJS المباشر (صوت + فيديو + رسائل فورية بين الموبايل واللابتوب) + حظر المتصل
    // =========================================================================
    var rtcPeerId = 'rtc_' + mpDeviceId;
    var rtcPeer = null;
    var rtcPeerReady = false;
    var rtcRoomHostPeer = null;
    var rtcDataConns = {};
    var rtcHostGuestConns = {};
    var rtcMediaConns = {};
    var rtcPendingMediaCalls = {};
    var rtcRoomPeersMap = {};
    var rtcMeshPcs = {};
    var rtcMeshPendingIce = {};
    var rtcMeshMakingOffer = {};
    var rtcMatchWs = null;

    var rtcMicStream = null;
    var rtcCamStream = null;
    var rtcCombinedStream = null;
    var rtcMicOn = true;
    var rtcUserDisabledMic = false;
    var rtcCamOn = false;
    var rtcFacing = 'user';
    var rtcInCall = false;
    var rtcMatchMicRoom = '';
    var rtcSpeakerMuted = false;
    var rtcSilentCtx = null;
    var rtcSilentStream = null;
    var rtcLastDialTs = {};
    var rtcCallMode = 'audio';
    var rtcCallRoom = '';
    var rtcWatchedRoom = '';
    var rtcIncoming = null;
    var rtcSignalSeq = 0;
    var rtcProcessedIds = new Set();
    var rtcCallSec = 0;
    var rtcCallTimer = null;
    var rtcStageHidden = false;
    var rtcBlockedPeers = [];
    try {
      var rawBlocked = localStorage.getItem('millionaire_blocked_callers');
      if (rawBlocked) rtcBlockedPeers = JSON.parse(rawBlocked) || [];
    } catch(e) { rtcBlockedPeers = []; }

    var RTC_ICE = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    };

    function rtcUpdatePeerStatusBadge(ready, errText) {
      var el = document.getElementById('rtc-peerjs-badge');
      if (!el) return;
      if (ready) {
        el.className = 'px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300';
        el.textContent = '📡 PeerJS متصل مباشر';
      } else {
        el.className = 'px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/15 border border-amber-500/40 text-amber-300';
        el.textContent = errText ? ('⚠️ PeerJS: ' + errText) : '📡 جاري ربط PeerJS...';
      }
    }

    function rtcSaveBlocked() {
      try { localStorage.setItem('millionaire_blocked_callers', JSON.stringify(rtcBlockedPeers)); } catch(e) {}
    }

    function rtcIsBlocked(peerId) {
      return rtcBlockedPeers.some(function(b) { return b.peerId === peerId; });
    }

    function rtcBlockCaller(peerId, name, avatar) {
      if (!peerId || peerId === rtcPeerId) return;
      if (!rtcIsBlocked(peerId)) {
        rtcBlockedPeers.unshift({ peerId: peerId, name: name || 'متصل', avatar: avatar || '👤', blockedAt: Date.now() });
        rtcSaveBlocked();
      }
      if (rtcIncoming && rtcIncoming.fromId === peerId) {
        rtcIncoming = null;
        var inCard = document.getElementById('rtc-incoming-card');
        if (inCard) inCard.classList.add('hidden');
      }
      if (rtcMeshPcs[peerId]) {
        rtcCloseMeshPc(peerId);
      }
      var mAud = document.getElementById('mp-aud-' + peerId);
      if (mAud) mAud.remove();
      if (rtcMediaConns[peerId]) {
        try { rtcMediaConns[peerId].close(); } catch(e) {}
        delete rtcMediaConns[peerId];
      }
      if (rtcPendingMediaCalls[peerId]) {
        try { rtcPendingMediaCalls[peerId].close(); } catch(e) {}
        delete rtcPendingMediaCalls[peerId];
      }
      if (rtcDataConns[peerId]) {
        try { rtcDataConns[peerId].close(); } catch(e) {}
        delete rtcDataConns[peerId];
      }
      delete rtcRoomPeersMap[peerId];
      var el = document.getElementById('rtc-peer-' + peerId);
      if (el) el.remove();
      var ae = document.getElementById('rtc-aud-' + peerId);
      if (ae) ae.remove();
      if (rtcInCall && rtcCallRoom) rtcSendSignal(peerId, 'reject', {});
      rtcRenderBlockedList();
      rtcRenderParticipants();
    }

    function rtcUnblockCaller(peerId) {
      rtcBlockedPeers = rtcBlockedPeers.filter(function(b) { return b.peerId !== peerId; });
      rtcSaveBlocked();
      rtcRenderBlockedList();
    }

    function rtcBlockIncomingCaller() {
      if (!rtcIncoming) return;
      rtcBlockCaller(rtcIncoming.fromId, rtcIncoming.fromName, rtcIncoming.fromAvatar);
    }

    function toggleBlockedDrawer() {
      var dr = document.getElementById('rooms-blocked-drawer');
      if (dr) {
        dr.classList.toggle('hidden');
        rtcRenderBlockedList();
      }
    }

    function rtcRenderBlockedList() {
      var badge = document.getElementById('blocked-count-badge');
      if (badge) badge.textContent = rtcBlockedPeers.length;
      var list = document.getElementById('priv-blocked-list');
      if (!list) return;
      if (!rtcBlockedPeers.length) {
        list.innerHTML = '<div class="text-slate-400">لا يوجد متصلون محظورون حالياً.</div>';
        return;
      }
      list.innerHTML = '';
      rtcBlockedPeers.forEach(function(b) {
        var row = document.createElement('div');
        row.className = 'flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800';
        row.innerHTML = '<span class="truncate">' + (b.avatar || '👤') + ' <b>' + (b.name || 'متصل') + '</b></span>';
        var ub = document.createElement('button');
        ub.className = 'px-2 py-1 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] shrink-0';
        ub.textContent = 'فك الحظر';
        ub.onclick = function() { rtcUnblockCaller(b.peerId); };
        row.appendChild(ub);
        list.appendChild(row);
      });
    }

    function rtcRenderParticipants() {
      var list = Object.keys(rtcRoomPeersMap)
        .map(function(id) { return rtcRoomPeersMap[id]; })
        .filter(function(p) { return p && !rtcIsBlocked(p.peerId); });
      var cntEl = document.getElementById('rooms-callers-count');
      if (cntEl) cntEl.textContent = list.length;
      var pList = document.getElementById('rooms-participants-list');
      if (!pList) return;
      pList.innerHTML = '';
      list.forEach(function(p) {
        var isMe = p.peerId === rtcPeerId;
        var chip = document.createElement('div');
        chip.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] ' +
          (p.inCall ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-slate-950 border-slate-800');
        chip.innerHTML = '<span>' + (p.avatar || '👤') + '</span><span class="font-bold text-slate-200">' +
          (isMe ? ((p.name || 'أنت') + ' (أنت)') : (p.name || 'متصل')) + '</span><span>' +
          (p.inCall ? (p.callMode === 'video' ? '📹' : '📞') : '💬') + '</span>';
        if (!isMe) {
          var bBtn = document.createElement('button');
          bBtn.className = 'px-1.5 py-0.5 rounded bg-rose-600/30 border border-rose-500/40 text-rose-300 font-black text-[10px]';
          bBtn.textContent = '🚫 حظر';
          bBtn.onclick = function() { rtcBlockCaller(p.peerId, p.name, p.avatar); };
          var rBtn = document.createElement('button');
          rBtn.className = 'px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px]';
          rBtn.textContent = '🚩 إبلاغ';
          rBtn.onclick = function() { openReportPlayerModal(p.peerId, p.name, p.avatar, rtcWatchedRoom || getSelectedChatRoomId()); };
          chip.appendChild(bBtn);
          chip.appendChild(rBtn);
        }
        pList.appendChild(chip);
      });
    }

    function rtcBroadcastData(payload) {
      Object.keys(rtcDataConns).forEach(function(pid) {
        var c = rtcDataConns[pid];
        if (c && c.open) { try { c.send(payload); } catch(e) {} }
      });
      Object.keys(rtcHostGuestConns).forEach(function(pid) {
        var c = rtcHostGuestConns[pid];
        if (c && c.open) { try { c.send(payload); } catch(e) {} }
      });
    }

    function rtcEnsurePeerJs(roomId) {
      if (typeof Peer === 'undefined') {
        rtcUpdatePeerStatusBadge(false, 'Offline');
        return;
      }
      if (rtcPeer && !rtcPeer.destroyed) {
        if (rtcPeer.disconnected) { try { rtcPeer.reconnect(); } catch(e) {} }
        if (rtcPeerReady && roomId) rtcJoinPeerJsCoordinator(roomId);
        return;
      }
      try {
        rtcPeer = new Peer(rtcPeerId, { debug: 1, secure: true, config: RTC_ICE });
        rtcPeer.on('open', function(id) {
          rtcPeerId = id;
          rtcPeerReady = true;
          rtcUpdatePeerStatusBadge(true);
          var r = rtcCallRoom || rtcWatchedRoom || roomId;
          if (r) rtcJoinPeerJsCoordinator(r);
          if (rtcMatchMicRoom && !rtcInCall) {
            Object.keys(rtcRoomPeersMap).forEach(function(pid) { rtcConnectMatchMicPeer(rtcRoomPeersMap[pid]); });
          }
        });
        rtcPeer.on('connection', function(conn) {
          rtcSetupDataConn(conn);
        });
        rtcPeer.on('call', function(mediaConn) {
          rtcHandleIncomingPeerCall(mediaConn);
        });
        rtcPeer.on('disconnected', function() {
          rtcPeerReady = false;
          rtcUpdatePeerStatusBadge(false);
          setTimeout(function() {
            if (rtcPeer && !rtcPeer.destroyed && rtcPeer.disconnected) {
              try { rtcPeer.reconnect(); } catch(e) {}
            }
          }, 1800);
        });
        rtcPeer.on('error', function(err) {
          if (err && err.type === 'peer-unavailable') return;
          rtcUpdatePeerStatusBadge(rtcPeerReady, err && err.type ? err.type : '');
        });
      } catch(e) {}
    }

    function rtcJoinPeerJsCoordinator(roomId) {
      if (!roomId || !rtcPeer || rtcPeer.destroyed || typeof Peer === 'undefined') return;
      var hostId = 'champions_room_' + roomId;
      if (rtcRoomHostPeer && !rtcRoomHostPeer.destroyed) {
        if (rtcRoomHostPeer.id === hostId) return;
        try { rtcRoomHostPeer.destroy(); } catch(e) {}
        rtcRoomHostPeer = null;
        rtcHostGuestConns = {};
      }
      try {
        var hp = new Peer(hostId, { debug: 0, secure: true, config: RTC_ICE });
        rtcRoomHostPeer = hp;
        hp.on('open', function() {
          rtcRoomPeersMap[rtcPeerId] = {
            peerId: rtcPeerId, name: userProfile.name || myPlayerName, avatar: userProfile.avatar || '👑',
            callMode: rtcCallMode, micOn: rtcMicOn, camOn: rtcCamOn, inCall: rtcInCall
          };
          rtcRenderParticipants();
        });
        hp.on('connection', function(gc) {
          gc.on('open', function() {
            rtcHostGuestConns[gc.peer] = gc;
            var roster = Object.keys(rtcRoomPeersMap).map(function(k) { return rtcRoomPeersMap[k]; });
            try { gc.send({ type: 'roster', roomId: roomId, peers: roster }); } catch(e) {}
          });
          gc.on('data', function(raw) {
            if (!raw || typeof raw !== 'object') return;
            if (raw.type === 'hello' && raw.participant && !rtcIsBlocked(raw.participant.peerId)) {
              rtcRoomPeersMap[raw.participant.peerId] = raw.participant;
              rtcConnectDataPeer(raw.participant.peerId);
              rtcRenderParticipants();
              var roster = Object.keys(rtcRoomPeersMap).map(function(k) { return rtcRoomPeersMap[k]; });
              Object.keys(rtcHostGuestConns).forEach(function(k) {
                var c = rtcHostGuestConns[k];
                if (c && c.open) { try { c.send({ type: 'roster', roomId: roomId, peers: roster }); } catch(e) {} }
              });
            } else if (raw.type === 'chat' || raw.type === 'chat_delete') {
              Object.keys(rtcHostGuestConns).forEach(function(k) {
                var c = rtcHostGuestConns[k];
                if (k !== gc.peer && c && c.open) { try { c.send(raw); } catch(e) {} }
              });
              rtcHandleDataPayload(gc.peer, raw);
            }
          });
          gc.on('close', function() { delete rtcHostGuestConns[gc.peer]; });
        });
        hp.on('error', function(err) {
          if (err && err.type === 'unavailable-id') {
            try { hp.destroy(); } catch(e) {}
            rtcRoomHostPeer = null;
            rtcConnectHostSlot(hostId, roomId);
          }
        });
      } catch(e) {}
    }

    function rtcConnectHostSlot(hostId, roomId) {
      if (!rtcPeer || rtcPeer.destroyed || !rtcPeerReady) return;
      try {
        var c = rtcPeer.connect(hostId, { reliable: true });
        c.on('open', function() {
          rtcDataConns[hostId] = c;
          try {
            c.send({
              type: 'hello', roomId: roomId,
              participant: {
                peerId: rtcPeerId, name: userProfile.name || myPlayerName, avatar: userProfile.avatar || '👑',
                callMode: rtcCallMode, micOn: rtcMicOn, camOn: rtcCamOn, inCall: rtcInCall
              }
            });
          } catch(e) {}
        });
        c.on('data', function(raw) { rtcHandleDataPayload(c.peer, raw); });
        c.on('close', function() { delete rtcDataConns[hostId]; });
      } catch(e) {}
    }

    function rtcConnectDataPeer(remoteId) {
      if (!remoteId || remoteId === rtcPeerId || rtcIsBlocked(remoteId)) return;
      if (!rtcPeer || rtcPeer.destroyed || !rtcPeerReady) return;
      if (rtcDataConns[remoteId] && rtcDataConns[remoteId].open) return;
      try {
        var c = rtcPeer.connect(remoteId, { reliable: true });
        rtcSetupDataConn(c);
      } catch(e) {}
    }

    function rtcSetupDataConn(conn) {
      var rid = conn.peer;
      if (rtcIsBlocked(rid)) { try { conn.close(); } catch(e) {} return; }
      conn.on('open', function() {
        rtcDataConns[rid] = conn;
        try {
          conn.send({
            type: 'hello', roomId: rtcCallRoom || rtcWatchedRoom,
            participant: {
              peerId: rtcPeerId, name: userProfile.name || myPlayerName, avatar: userProfile.avatar || '👑',
              callMode: rtcCallMode, micOn: rtcMicOn, camOn: rtcCamOn, inCall: rtcInCall
            }
          });
        } catch(e) {}
      });
      conn.on('data', function(raw) { rtcHandleDataPayload(rid, raw); });
      conn.on('close', function() { delete rtcDataConns[rid]; });
      conn.on('error', function() { delete rtcDataConns[rid]; });
    }

    function rtcHandleDataPayload(fromId, msg) {
      if (!msg || typeof msg !== 'object' || rtcIsBlocked(fromId)) return;
      var curRoom = rtcCallRoom || rtcWatchedRoom;
      if (msg.roomId && curRoom && msg.roomId !== curRoom) return;

      if (msg.type === 'hello' && msg.participant) {
        if (!rtcIsBlocked(msg.participant.peerId)) {
          rtcRoomPeersMap[msg.participant.peerId] = msg.participant;
          rtcConnectDataPeer(msg.participant.peerId);
          rtcRenderParticipants();
        }
        return;
      }
      if (msg.type === 'roster' && Array.isArray(msg.peers)) {
        msg.peers.forEach(function(p) {
          if (p && p.peerId && !rtcIsBlocked(p.peerId)) {
            rtcRoomPeersMap[p.peerId] = p;
            if (p.peerId !== rtcPeerId) rtcConnectDataPeer(p.peerId);
          }
        });
        rtcRenderParticipants();
        return;
      }
      if (msg.type === 'chat' && msg.message) {
        renderSingleRoomChatMessage(msg.message);
        return;
      }
      if (msg.type === 'chat_delete' && msg.messageId) {
        var delEl = document.getElementById('rmsg-' + msg.messageId);
        if (delEl) delEl.remove();
        return;
      }
      if (msg.type === 'media_state' && msg.participant) {
        if (!rtcIsBlocked(msg.participant.peerId)) {
          rtcRoomPeersMap[msg.participant.peerId] = msg.participant;
          rtcRenderParticipants();
        }
        return;
      }
      if (msg.type === 'ring' && !rtcInCall && curRoom) {
        rtcShowIncomingAlert(msg.fromId || fromId, msg.fromName, msg.fromAvatar, msg.callMode);
        return;
      }
      if (msg.type === 'hangup') {
        rtcRemoveMediaPeer(msg.fromId || fromId);
      }
    }

    function rtcUpdateMicUI() {
      var pairs = [
        { btn: document.getElementById('mp-btn-mic'), icon: document.getElementById('mp-mic-icon'), lbl: document.getElementById('mp-mic-label'), stage: false },
        { btn: document.getElementById('rtc-stage-mic-btn'), icon: null, lbl: null, stage: true }
      ];
      pairs.forEach(function(p) {
        if (!p.btn) return;
        if (p.stage) {
          p.btn.textContent = rtcMicOn ? '🎙️' : '🔇';
          p.btn.className = rtcMicOn
            ? 'px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold'
            : 'px-2 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold';
        } else {
          p.btn.className = rtcMicOn
            ? 'px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/60 rounded-lg text-emerald-300 font-black text-[11px] flex items-center gap-1 transition'
            : 'px-3 py-1.5 bg-rose-500/15 border border-rose-500/60 rounded-lg text-rose-300 font-black text-[11px] flex items-center gap-1 transition';
          if (p.icon) p.icon.textContent = rtcMicOn ? '🎙️' : '🔇';
          if (p.lbl) p.lbl.textContent = rtcMicOn ? (lang === 'ar' ? 'المايك مفتوح' : 'Mic ON') : (lang === 'ar' ? 'المايك مقفول' : 'Mic OFF');
        }
      });
    }

    function rtcRebuildStream() {
      var tracks = [];
      if (rtcMicStream) rtcMicStream.getAudioTracks().forEach(function(t) { if (t.readyState === 'live') tracks.push(t); });
      if (rtcCamStream && rtcCamOn) rtcCamStream.getVideoTracks().forEach(function(t) { if (t.readyState === 'live') tracks.push(t); });
      rtcCombinedStream = tracks.length ? new MediaStream(tracks) : null;
      var lv = document.getElementById('rtc-local-video');
      var lav = document.getElementById('rtc-local-avatar-box');
      if (lv && lav) {
        if (rtcCamOn && rtcCombinedStream) {
          lv.srcObject = rtcCombinedStream;
          lv.classList.remove('hidden');
          lav.classList.add('hidden');
        } else {
          lv.srcObject = null;
          lv.classList.add('hidden');
          lav.classList.remove('hidden');
        }
      }
    }

    function rtcGetVoiceConstraints() {
      return {
        echoCancellation: { ideal: true },
        noiseSuppression: { ideal: true },
        autoGainControl: { ideal: true },
        channelCount: { ideal: 1 },
        sampleRate: { ideal: 48000 },
        sampleSize: { ideal: 16 },
        googEchoCancellation: true,
        googEchoCancellation2: true,
        googAutoGainControl: true,
        googAutoGainControl2: true,
        googNoiseSuppression: true,
        googNoiseSuppression2: true,
        googHighpassFilter: true,
        googTypingNoiseDetection: true
      };
    }

    function rtcTuneAudioSender(pc) {
      if (!pc || typeof pc.getSenders !== 'function') return;
      try {
        pc.getSenders().forEach(function(sender) {
          if (sender.track && sender.track.kind === 'audio') {
            try { if ('contentHint' in sender.track) sender.track.contentHint = 'speech'; } catch(e) {}
            if (typeof sender.getParameters === 'function' && typeof sender.setParameters === 'function') {
              var params = sender.getParameters();
              if (params && Array.isArray(params.encodings) && params.encodings.length > 0) {
                params.encodings[0].maxBitrate = 48000;
                params.encodings[0].priority = 'high';
                params.encodings[0].networkPriority = 'high';
                sender.setParameters(params).catch(function() {});
              }
            }
          }
        });
      } catch(e) {}
    }

    function rtcSyncTracksToPeers() {
      if (!rtcCombinedStream) return;
      Object.keys(rtcMediaConns).forEach(function(pid) {
        var mc = rtcMediaConns[pid];
        var pc = mc && mc.peerConnection;
        if (!pc) return;
        var senders = pc.getSenders();
        rtcCombinedStream.getTracks().forEach(function(track) {
          var s = senders.find(function(x) { return x.track && x.track.kind === track.kind; });
          if (s) s.replaceTrack(track).catch(function() {});
          else pc.addTrack(track, rtcCombinedStream);
        });
        rtcTuneAudioSender(pc);
      });

      var audioTrack = rtcCombinedStream.getAudioTracks().find(function(t) { return t.readyState === 'live'; });
      if (audioTrack) {
        Object.keys(rtcMeshPcs).forEach(function(pid) {
          var pc = rtcMeshPcs[pid];
          if (!pc || pc.signalingState === 'closed') return;
          try {
            var s = pc.getSenders().find(function(x) { return x.track && x.track.kind === 'audio'; });
            if (s) s.replaceTrack(audioTrack).catch(function() {});
            else pc.addTrack(audioTrack, rtcCombinedStream);
            rtcTuneAudioSender(pc);
          } catch(e) {}
        });
      }
    }

    async function rtcRequestMicOnContinue() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return false;
      rtcUserDisabledMic = false;
      try {
        if (rtcSilentCtx && rtcSilentCtx.state === 'suspended') {
          await rtcSilentCtx.resume().catch(function() {});
        }
      } catch(e) {}
      if (rtcMicStream && rtcMicStream.getAudioTracks().some(function(t) { return t.readyState === 'live'; })) {
        rtcMicStream.getAudioTracks().forEach(function(t) { t.enabled = true; });
        rtcMicOn = true;
        rtcUpdateMicUI();
        rtcRebuildStream();
        rtcSyncTracksToPeers();
        return true;
      }
      var stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: rtcGetVoiceConstraints(), video: false });
      } catch(err) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch(e2) {
          rtcUpdateMicUI();
          return false;
        }
      }
      rtcMicStream = stream;
      rtcMicStream.getAudioTracks().forEach(function(t) {
        t.enabled = true;
        try { if ('contentHint' in t) t.contentHint = 'speech'; } catch(e) {}
      });
      rtcMicOn = true;
      rtcUpdateMicUI();
      rtcRebuildStream();
      rtcSyncTracksToPeers();
      return true;
    }

    async function rtcEnsureAutoMic() {
      if (rtcUserDisabledMic) { rtcMicOn = false; rtcUpdateMicUI(); return false; }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return false;
      if (rtcMicStream && rtcMicStream.getAudioTracks().some(function(t) { return t.readyState === 'live'; })) {
        rtcMicStream.getAudioTracks().forEach(function(t) {
          t.enabled = true;
          try { if ('contentHint' in t) t.contentHint = 'speech'; } catch(e) {}
        });
        rtcMicOn = true;
        rtcUpdateMicUI();
        return true;
      }
      var stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: rtcGetVoiceConstraints(), video: false });
      } catch(err) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch(e2) {
          rtcUpdateMicUI();
          return false;
        }
      }
      rtcMicStream = stream;
      rtcMicStream.getAudioTracks().forEach(function(t) {
        t.enabled = true;
        try { if ('contentHint' in t) t.contentHint = 'speech'; } catch(e) {}
      });
      rtcMicOn = true;
      rtcUpdateMicUI();
      rtcRebuildStream();
      rtcSyncTracksToPeers();
      return true;
    }

    function rtcGetOrCreateCallStream() {
      if (rtcMicStream && rtcMicStream.getAudioTracks().some(function(t) { return t.readyState === 'live'; })) {
        return rtcMicStream;
      }
      if (rtcCombinedStream && rtcCombinedStream.getTracks().some(function(t) { return t.readyState === 'live'; })) {
        return rtcCombinedStream;
      }
      try {
        if (!rtcSilentStream) {
          var AC = window.AudioContext || window.webkitAudioContext;
          if (AC) {
            var ctx = new AC();
            var dest = ctx.createMediaStreamDestination();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            gain.gain.value = 0;
            osc.connect(gain);
            gain.connect(dest);
            osc.start();
            rtcSilentCtx = ctx;
            rtcSilentStream = dest.stream;
          }
        }
        return rtcSilentStream;
      } catch(e) { return null; }
    }

    function rtcUnlockMatchAudio() {
      var btn = document.getElementById('mp-audio-unlock-btn');
      if (btn) btn.classList.add('hidden');
      rtcSpeakerMuted = false;
      var spBtn = document.getElementById('mp-btn-speaker');
      if (spBtn) spBtn.textContent = '🔊 السماعة مفتوحة';
      var sinks = document.getElementById('mp-audio-sinks');
      if (sinks) {
        sinks.querySelectorAll('audio').forEach(function(a) {
          a.muted = false;
          a.volume = 1;
          a.play().catch(function() {});
        });
      }
    }

    function rtcAttachMatchRemoteAudio(rid, stream) {
      var ms = document.getElementById('mp-audio-sinks');
      if (ms) {
        var ma = document.getElementById('mp-aud-' + rid);
        if (!ma) {
          ma = document.createElement('audio');
          ma.id = 'mp-aud-' + rid;
          ma.autoplay = true;
          ma.playsInline = true;
          ma.setAttribute('autoplay', '');
          ma.setAttribute('playsinline', '');
          ms.appendChild(ma);
        }
        ma.muted = rtcSpeakerMuted;
        ma.volume = 1;
        ma.srcObject = stream;
        var playMatchAudio = function() {
          if (rtcSpeakerMuted) return;
          var pr = ma.play();
          if (pr && typeof pr.then === 'function') {
            pr.then(function() {
              var ub = document.getElementById('mp-audio-unlock-btn');
              if (ub) ub.classList.add('hidden');
            }).catch(function() {
              var ub = document.getElementById('mp-audio-unlock-btn');
              if (ub) ub.classList.remove('hidden');
            });
          }
        };
        ma.onloadedmetadata = playMatchAudio;
        ma.oncanplay = playMatchAudio;
        playMatchAudio();
        window.addEventListener('pointerdown', playMatchAudio, { once: true });
        window.addEventListener('touchstart', playMatchAudio, { once: true });
      }
      var vs = document.getElementById('mp-match-voice-status');
      if (vs) vs.classList.remove('hidden');
    }

    function rtcCloseMeshPc(rid) {
      var pc = rtcMeshPcs[rid];
      if (pc) {
        try {
          pc.onicecandidate = null;
          pc.ontrack = null;
          pc.oniceconnectionstatechange = null;
          pc.close();
        } catch(e) {}
        delete rtcMeshPcs[rid];
      }
      delete rtcMeshPendingIce[rid];
      delete rtcMeshMakingOffer[rid];
    }

    function rtcCloseAllMeshPcs() {
      Object.keys(rtcMeshPcs).forEach(function(rid) { rtcCloseMeshPc(rid); });
      rtcMeshPcs = {};
      rtcMeshPendingIce = {};
      rtcMeshMakingOffer = {};
      if (rtcMatchWs) {
        try { rtcMatchWs.close(); } catch(e) {}
        rtcMatchWs = null;
      }
    }

    function rtcCreateOrGetMeshPc(remotePeer) {
      var rid = remotePeer.peerId;
      var existing = rtcMeshPcs[rid];
      if (existing && existing.signalingState !== 'closed' && existing.iceConnectionState !== 'failed' && existing.iceConnectionState !== 'closed') {
        var curStream = rtcGetOrCreateCallStream();
        if (curStream) {
          var tr = curStream.getAudioTracks().find(function(t) { return t.readyState === 'live'; });
          if (tr) {
            var snd = existing.getSenders().find(function(s) { return s.track && s.track.kind === 'audio'; });
            if (!snd) existing.addTrack(tr, curStream);
            else if (snd.track !== tr) snd.replaceTrack(tr).catch(function() {});
          }
        }
        return existing;
      }
      if (existing) rtcCloseMeshPc(rid);

      var pc = new RTCPeerConnection(RTC_ICE);
      rtcMeshPcs[rid] = pc;

      // Add local audio track BEFORE exchanging any SDP offer/answer
      var localStream = rtcGetOrCreateCallStream();
      if (localStream) {
        var audioTracks = localStream.getAudioTracks().filter(function(t) { return t.readyState === 'live'; });
        if (audioTracks.length > 0) {
          audioTracks.forEach(function(track) { pc.addTrack(track, localStream); });
          rtcTuneAudioSender(pc);
        } else {
          try { pc.addTransceiver('audio', { direction: 'sendrecv' }); } catch(e) {}
        }
      } else {
        try { pc.addTransceiver('audio', { direction: 'sendrecv' }); } catch(e) {}
      }

      pc.onicecandidate = function(ev) {
        if (ev.candidate && rtcMatchMicRoom) {
          rtcSendSignal(rid, 'ice', { candidate: ev.candidate.toJSON(), matchMic: true });
        }
      };

      pc.ontrack = function(ev) {
        if (rtcIsBlocked(rid)) return;
        var st = (ev.streams && ev.streams[0]) ? ev.streams[0] : new MediaStream([ev.track]);
        rtcAttachMatchRemoteAudio(rid, st);
      };

      pc.oniceconnectionstatechange = function() {
        var st = pc.iceConnectionState;
        if (st === 'failed' || st === 'closed') {
          if (rtcMeshPcs[rid] === pc) {
            rtcCloseMeshPc(rid);
            var ma = document.getElementById('mp-aud-' + rid);
            if (ma) ma.remove();
          }
        }
      };

      return pc;
    }

    async function rtcDrainMeshIce(rid, pc) {
      var q = rtcMeshPendingIce[rid];
      if (!q || !q.length) return;
      delete rtcMeshPendingIce[rid];
      for (var i = 0; i < q.length; i++) {
        try { await pc.addIceCandidate(new RTCIceCandidate(q[i])); } catch(e) {}
      }
    }

    async function rtcInitiateMeshOffer(p) {
      if (!rtcMatchMicRoom || rtcInCall || !p || !p.peerId || rtcIsBlocked(p.peerId)) return;
      if (rtcMeshMakingOffer[p.peerId]) return;
      rtcMeshMakingOffer[p.peerId] = true;
      try {
        if (!rtcUserDisabledMic && (!rtcMicStream || !rtcMicStream.getAudioTracks().some(function(t) { return t.readyState === 'live'; }))) {
          await rtcEnsureAutoMic();
        }
        var pc = rtcCreateOrGetMeshPc(p);
        if (pc.signalingState !== 'stable') return;
        var offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false });
        if (!rtcMatchMicRoom || rtcInCall) return;
        await pc.setLocalDescription(offer);
        await rtcSendSignal(p.peerId, 'offer', { sdp: pc.localDescription, matchMic: true });
      } catch(e) {
      } finally {
        rtcMeshMakingOffer[p.peerId] = false;
      }
    }

    function rtcToggleSpeaker() {
      rtcSpeakerMuted = !rtcSpeakerMuted;
      var btn = document.getElementById('mp-btn-speaker');
      if (btn) btn.textContent = rtcSpeakerMuted ? '🔇 السماعة مكتومة' : '🔊 السماعة مفتوحة';
      var sinks = document.getElementById('mp-audio-sinks');
      if (sinks) {
        sinks.querySelectorAll('audio').forEach(function(a) {
          a.muted = rtcSpeakerMuted;
          if (!rtcSpeakerMuted) a.play().catch(function() {});
        });
      }
    }

    function rtcConnectMatchMicPeer(p) {
      if (!rtcMatchMicRoom || rtcInCall) return;
      if (!p || !p.peerId || p.peerId === rtcPeerId || rtcIsBlocked(p.peerId)) return;
      var existing = rtcMeshPcs[p.peerId];
      if (existing) {
        var ice = existing.iceConnectionState;
        if (ice === 'connected' || ice === 'completed' || ice === 'checking') return;
        if (ice === 'failed' || ice === 'closed') {
          rtcCloseMeshPc(p.peerId);
        } else {
          var lastD = rtcLastDialTs[p.peerId] || 0;
          if (Date.now() - lastD < 5500) return;
          rtcCloseMeshPc(p.peerId);
        }
      }
      var nowTs = Date.now();
      if (rtcLastDialTs[p.peerId] && nowTs - rtcLastDialTs[p.peerId] < 3000) return;

      if (rtcPeerId < p.peerId) {
        rtcLastDialTs[p.peerId] = nowTs;
        rtcInitiateMeshOffer(p);
      } else {
        if (!rtcLastDialTs['seen_' + p.peerId]) {
          rtcLastDialTs['seen_' + p.peerId] = nowTs;
        } else if (nowTs - rtcLastDialTs['seen_' + p.peerId] >= 4000) {
          rtcLastDialTs[p.peerId] = nowTs;
          rtcInitiateMeshOffer(p);
        }
      }
    }

    function rtcConnectMatchWebSocket(voiceRoom) {
      if (rtcMatchWs) {
        try { rtcMatchWs.close(); } catch(e) {}
        rtcMatchWs = null;
      }
      try {
        var baseUrl = API_BASE || (window.location.origin);
        var wsBase = baseUrl.replace(/^http:/i, 'ws:').replace(/^https:/i, 'wss:');
        var ws = new WebSocket(wsBase + '/ws?roomId=' + encodeURIComponent(voiceRoom) + '&peerId=' + encodeURIComponent(rtcPeerId));
        rtcMatchWs = ws;
        ws.onmessage = function(ev) {
          try {
            var parsed = JSON.parse(ev.data);
            if (!parsed || !parsed.event) return;
            if (parsed.event === 'rtc:signal' && parsed.data) {
              rtcHandleSignal(parsed.data);
            } else if ((parsed.event === 'rtc:welcome' || parsed.event === 'rtc:peer_joined') && parsed.data && Array.isArray(parsed.data.participants)) {
              parsed.data.participants.forEach(function(p) {
                if (p && p.peerId && !rtcIsBlocked(p.peerId)) {
                  rtcRoomPeersMap[p.peerId] = p;
                  if (p.peerId !== rtcPeerId && rtcMatchMicRoom && !rtcInCall) rtcConnectMatchMicPeer(p);
                }
              });
            } else if (parsed.event === 'rtc:peer_left' && parsed.data && parsed.data.peerId) {
              rtcCloseMeshPc(parsed.data.peerId);
              delete rtcRoomPeersMap[parsed.data.peerId];
              var ma = document.getElementById('mp-aud-' + parsed.data.peerId);
              if (ma) ma.remove();
            }
          } catch(e) {}
        };
      } catch(e) {}
    }

    async function rtcStartMatchMic(roomCode) {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
      var clean = String(roomCode || '').trim();
      if (!clean || rtcInCall) return;
      audio.stopIntro();
      audio.stopTension();
      var voiceRoom = 'voice_' + clean;
      if (rtcMatchMicRoom === voiceRoom) {
        await rtcEnsureAutoMic();
        Object.keys(rtcRoomPeersMap).forEach(function(pid) { rtcConnectMatchMicPeer(rtcRoomPeersMap[pid]); });
        return;
      }
      rtcStopWatching();
      rtcCloseAllMeshPcs();
      rtcMatchMicRoom = voiceRoom;
      rtcWatchedRoom = voiceRoom;
      rtcSignalSeq = 0;
      rtcRoomPeersMap = {};
      rtcLastDialTs = {};

      // Acquire mic track BEFORE joining signaling
      await rtcEnsureAutoMic();
      if (rtcMatchMicRoom !== voiceRoom || rtcInCall) return;
      rtcConnectMatchWebSocket(voiceRoom);

      try {
        var r = await fetch(API_BASE + '/api/rooms/' + encodeURIComponent(voiceRoom) + '/rtc/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            peerId: rtcPeerId,
            name: userProfile.name || myPlayerName,
            avatar: userProfile.avatar || '👑',
            callMode: 'audio',
            micOn: rtcMicOn,
            camOn: false,
            inCall: false
          })
        });
        var d = await r.json();
        if (d && Array.isArray(d.participants) && rtcMatchMicRoom === voiceRoom) {
          d.participants.forEach(function(p) {
            if (p && p.peerId && !rtcIsBlocked(p.peerId)) {
              rtcRoomPeersMap[p.peerId] = p;
              if (p.peerId !== rtcPeerId) {
                rtcConnectMatchMicPeer(p);
              }
            }
          });
        }
      } catch(e) {}
    }

    function rtcStopMatchMic() {
      rtcCloseAllMeshPcs();
      if (!rtcMatchMicRoom) return;
      var prev = rtcMatchMicRoom;
      rtcMatchMicRoom = '';
      rtcWatchedRoom = '';
      rtcRoomPeersMap = {};
      Object.keys(rtcMediaConns).forEach(function(k) { try { rtcMediaConns[k].close(); } catch(e) {} });
      rtcMediaConns = {};
      var ms = document.getElementById('mp-audio-sinks');
      if (ms) ms.innerHTML = '';
      var vs = document.getElementById('mp-match-voice-status');
      if (vs) vs.classList.add('hidden');
      var ub = document.getElementById('mp-audio-unlock-btn');
      if (ub) ub.classList.add('hidden');
      if (prev) {
        fetch(API_BASE + '/api/rooms/' + encodeURIComponent(prev) + '/rtc/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ peerId: rtcPeerId })
        }).catch(function() {});
      }
    }

    async function rtcToggleMic() {
      var next = !rtcMicOn;
      rtcUserDisabledMic = !next;
      if (next) {
        var ok = await rtcEnsureAutoMic();
        if (ok) {
          rtcSyncTracksToPeers();
          if (rtcMatchMicRoom) {
            Object.keys(rtcRoomPeersMap).forEach(function(pid) { rtcConnectMatchMicPeer(rtcRoomPeersMap[pid]); });
          }
        }
      } else {
        rtcMicOn = false;
        if (rtcMicStream) rtcMicStream.getAudioTracks().forEach(function(t) { t.enabled = false; });
        rtcUpdateMicUI();
      }
      if (rtcInCall || rtcMatchMicRoom) rtcPublishMedia();
    }

    function rtcWatchRoom(roomId) {
      var clean = normalize4DigitPin(roomId) || (roomId || '').trim();
      if (!clean) return;
      rtcWatchedRoom = clean;
      rtcSignalSeq = 0;
      rtcRoomPeersMap = {};
      rtcEnsurePeerJs(clean);
      fetch(API_BASE + '/api/rooms/' + encodeURIComponent(clean) + '/rtc/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peerId: rtcPeerId,
          name: userProfile.name || myPlayerName,
          avatar: userProfile.avatar || '👑',
          callMode: rtcCallMode,
          micOn: rtcMicOn,
          camOn: rtcCamOn,
          inCall: rtcInCall
        })
      }).then(function(r) { return r.json(); }).then(function(d) {
        if (d && Array.isArray(d.participants)) {
          d.participants.forEach(function(p) {
            if (p && p.peerId && !rtcIsBlocked(p.peerId)) {
              rtcRoomPeersMap[p.peerId] = p;
              if (p.peerId !== rtcPeerId) rtcConnectDataPeer(p.peerId);
            }
          });
          rtcRenderParticipants();
        }
      }).catch(function() {});
    }

    function rtcStopWatching() {
      if (rtcInCall) rtcHangup();
      var prev = rtcWatchedRoom;
      rtcWatchedRoom = '';
      rtcIncoming = null;
      rtcRoomPeersMap = {};
      var inCard = document.getElementById('rtc-incoming-card');
      if (inCard) inCard.classList.add('hidden');
      if (prev) {
        fetch(API_BASE + '/api/rooms/' + encodeURIComponent(prev) + '/rtc/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ peerId: rtcPeerId })
        }).catch(function() {});
      }
      Object.keys(rtcDataConns).forEach(function(k) { try { rtcDataConns[k].close(); } catch(e) {} });
      rtcDataConns = {};
      if (rtcRoomHostPeer) { try { rtcRoomHostPeer.destroy(); } catch(e) {} rtcRoomHostPeer = null; }
      rtcHostGuestConns = {};
    }

    function rtcPublishMedia() {
      var pPayload = {
        peerId: rtcPeerId, name: userProfile.name || myPlayerName, avatar: userProfile.avatar || '👑',
        micOn: rtcMicOn, camOn: rtcCamOn, callMode: rtcCallMode, inCall: rtcInCall
      };
      rtcBroadcastData({ type: 'media_state', roomId: rtcCallRoom || rtcWatchedRoom, participant: pPayload });
      var r = rtcCallRoom || rtcWatchedRoom;
      if (!r) return;
      fetch(API_BASE + '/api/rooms/' + encodeURIComponent(r) + '/rtc/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pPayload)
      }).catch(function() {});
    }

    function rtcSendSignal(toId, type, payload) {
      var r = rtcCallRoom || rtcMatchMicRoom || rtcWatchedRoom;
      if (!r) return Promise.resolve();
      var data = {
        fromId: rtcPeerId,
        fromName: userProfile.name || myPlayerName,
        fromAvatar: userProfile.avatar || '👑',
        toId: toId,
        type: type,
        callMode: rtcCallMode,
        payload: payload
      };
      if (rtcMatchWs && rtcMatchWs.readyState === WebSocket.OPEN && r === rtcMatchMicRoom) {
        try {
          rtcMatchWs.send(JSON.stringify({ event: 'rtc:signal', roomId: r, data: data }));
          return Promise.resolve();
        } catch(e) {}
      }
      return fetch(API_BASE + '/api/rooms/' + encodeURIComponent(r) + '/rtc/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(function() {});
    }

    async function rtcAcquireCam(facing) {
      try {
        if (rtcCamStream) rtcCamStream.getTracks().forEach(function(t) { t.stop(); });
        rtcCamStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
        rtcCamOn = true;
        rtcFacing = facing;
        rtcRebuildStream();
        rtcSyncTracksToPeers();
      } catch(e) { rtcCamOn = false; }
    }

    function rtcCallPeerViaPeerJS(remotePeer, isMatchMic) {
      if (!rtcPeer || rtcPeer.destroyed || !rtcPeerReady) return;
      var stream = rtcCombinedStream || rtcGetOrCreateCallStream();
      if (!stream || rtcIsBlocked(remotePeer.peerId)) return;
      if (rtcMediaConns[remotePeer.peerId]) {
        try { rtcMediaConns[remotePeer.peerId].close(); } catch(e) {}
        delete rtcMediaConns[remotePeer.peerId];
      }
      try {
        var useMatch = !!isMatchMic || (!!rtcMatchMicRoom && !rtcInCall);
        var mc = rtcPeer.call(remotePeer.peerId, stream, {
          metadata: {
            roomId: rtcCallRoom || rtcMatchMicRoom || rtcWatchedRoom,
            matchMic: useMatch,
            name: userProfile.name || myPlayerName,
            avatar: userProfile.avatar || '👑',
            callMode: useMatch ? 'audio' : rtcCallMode
          }
        });
        if (mc) rtcBindMediaConn(mc, remotePeer, useMatch);
      } catch(e) {}
    }

    function rtcHandleIncomingPeerCall(mediaConn) {
      var rid = mediaConn.peer;
      if (rtcIsBlocked(rid)) { try { mediaConn.close(); } catch(e) {} return; }
      var meta = mediaConn.metadata || {};
      var info = {
        peerId: rid,
        name: meta.name || 'متصل',
        avatar: meta.avatar || '👤',
        callMode: meta.callMode === 'video' ? 'video' : 'audio'
      };
      if (meta.matchMic && rtcMatchMicRoom && String(meta.roomId || '') === rtcMatchMicRoom && !rtcInCall) {
        try {
          mediaConn.answer(rtcCombinedStream || rtcGetOrCreateCallStream() || undefined);
          rtcBindMediaConn(mediaConn, info, true);
        } catch(e) {}
        return;
      }
      if (rtcInCall) {
        try {
          mediaConn.answer(rtcCombinedStream || rtcGetOrCreateCallStream() || undefined);
          rtcBindMediaConn(mediaConn, info, false);
        } catch(e) {}
      } else {
        rtcPendingMediaCalls[rid] = mediaConn;
        if (!rtcIncoming) {
          rtcShowIncomingAlert(rid, info.name, info.avatar, info.callMode);
        }
      }
    }

    function rtcBindMediaConn(mc, info, isMatchMic) {
      var rid = mc.peer;
      if (rtcMediaConns[rid] && rtcMediaConns[rid] !== mc) {
        try { rtcMediaConns[rid].close(); } catch(e) {}
      }
      rtcMediaConns[rid] = mc;
      mc.on('stream', function(stream) {
        if (rtcIsBlocked(rid)) { try { mc.close(); } catch(e) {} return; }
        var pInfo = rtcRoomPeersMap[rid] || info || { peerId: rid, name: 'متصل', avatar: '👤' };

        if (isMatchMic || (rtcMatchMicRoom && !rtcInCall)) {
          var ms = document.getElementById('mp-audio-sinks');
          if (ms) {
            var ma = document.getElementById('mp-aud-' + rid);
            if (!ma) {
              ma = document.createElement('audio');
              ma.id = 'mp-aud-' + rid;
              ma.autoplay = true;
              ma.playsInline = true;
              ms.appendChild(ma);
            }
            ma.muted = rtcSpeakerMuted;
            ma.volume = 1;
            ma.srcObject = stream;
            var playMatchAudio = function() {
              if (ma.paused) ma.play().catch(function() {});
            };
            playMatchAudio();
            window.addEventListener('pointerdown', playMatchAudio);
            window.addEventListener('touchstart', playMatchAudio);
          }
          var vs = document.getElementById('mp-match-voice-status');
          if (vs) vs.classList.remove('hidden');
          return;
        }

        var rv = document.getElementById('rtc-remote-videos');
        var as = document.getElementById('rtc-audio-sinks');
        if (rv) {
          var box = document.getElementById('rtc-peer-' + rid);
          if (!box) {
            box = document.createElement('div');
            box.id = 'rtc-peer-' + rid;
            box.className = 'relative rounded-xl overflow-hidden bg-slate-900 border border-slate-700 aspect-video flex items-center justify-center';
            var vid = document.createElement('video');
            vid.autoplay = true;
            vid.playsInline = true;
            vid.className = 'w-full h-full object-cover';
            vid.srcObject = stream;
            var lbl = document.createElement('div');
            lbl.className = 'absolute bottom-1 inset-x-1 px-1.5 py-0.5 rounded bg-slate-950/80 text-[10px] text-white flex items-center justify-between gap-1 font-bold';
            var nm = document.createElement('span');
            nm.className = 'truncate';
            nm.textContent = pInfo.name || 'متصل';
            var blk = document.createElement('button');
            blk.className = 'px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-black shrink-0';
            blk.textContent = '🚫 حظر';
            blk.onclick = function() { rtcBlockCaller(rid, pInfo.name, pInfo.avatar); };
            var rep = document.createElement('button');
            rep.className = 'px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-black shrink-0';
            rep.textContent = '🚩 إبلاغ';
            rep.onclick = function() { openReportPlayerModal(rid, pInfo.name, pInfo.avatar, rtcCallRoom || rtcWatchedRoom); };
            lbl.appendChild(nm);
            lbl.appendChild(blk);
            lbl.appendChild(rep);
            box.appendChild(vid);
            box.appendChild(lbl);
            rv.appendChild(box);
          } else {
            var v = box.querySelector('video');
            if (v && v.srcObject !== stream) v.srcObject = stream;
          }
        }
        if (as && !document.getElementById('rtc-aud-' + rid)) {
          var aud = document.createElement('audio');
          aud.id = 'rtc-aud-' + rid;
          aud.autoplay = true;
          aud.srcObject = stream;
          as.appendChild(aud);
        }
      });
      mc.on('close', function() { rtcRemoveMediaPeer(rid); });
      if (mc.peerConnection) {
        rtcTuneAudioSender(mc.peerConnection);
        if (typeof mc.peerConnection.addEventListener === 'function') {
          mc.peerConnection.addEventListener('iceconnectionstatechange', function() {
            var st = mc.peerConnection && mc.peerConnection.iceConnectionState;
            if (st === 'connected' || st === 'completed') {
              rtcTuneAudioSender(mc.peerConnection);
            }
            if (st === 'failed' || st === 'closed') {
              rtcRemoveMediaPeer(rid);
            }
          });
        }
      }
    }

    function rtcRemoveMediaPeer(pid) {
      if (rtcMediaConns[pid]) { try { rtcMediaConns[pid].close(); } catch(e) {} delete rtcMediaConns[pid]; }
      var el = document.getElementById('rtc-peer-' + pid);
      if (el) el.remove();
      var ae = document.getElementById('rtc-aud-' + pid);
      if (ae) ae.remove();
      var ma = document.getElementById('mp-aud-' + pid);
      if (ma) ma.remove();
    }

    function rtcShowIncomingAlert(fromId, fromName, fromAvatar, mode) {
      if (rtcIsBlocked(fromId)) return;
      rtcIncoming = { roomId: rtcWatchedRoom || currentPrivateRoomId, fromId: fromId, fromName: fromName || 'صديق', fromAvatar: fromAvatar || '👤', callMode: mode || 'audio' };
      var inCard = document.getElementById('rtc-incoming-card');
      var inMode = document.getElementById('rtc-in-mode');
      var inName = document.getElementById('rtc-in-name');
      var inAv = document.getElementById('rtc-in-avatar');
      if (inMode) inMode.textContent = mode === 'video' ? '📹 مكالمة فيديو خاصة واردة' : '📞 اتصال صوتي خاص وارد';
      if (inName) inName.textContent = fromName || 'متصل';
      if (inAv) inAv.textContent = fromAvatar || '👤';
      if (inCard) inCard.classList.remove('hidden');
    }

    async function rtcStartCall(roomId, mode) {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        showOfflineWarningModal();
        return;
      }
      rtcCallRoom = (roomId || currentPrivateRoomId || '').trim();
      if (!rtcCallRoom) return;
      rtcWatchedRoom = rtcCallRoom;
      rtcCallMode = (mode === 'video') ? 'video' : 'audio';
      rtcInCall = true;
      rtcStageHidden = false;
      rtcIncoming = null;
      syncCallPauseUI();
      var inCard = document.getElementById('rtc-incoming-card');
      if (inCard) inCard.classList.add('hidden');

      rtcEnsurePeerJs(rtcCallRoom);
      await rtcEnsureAutoMic();
      if (rtcCallMode === 'video') await rtcAcquireCam(rtcFacing);
      else {
        if (rtcCamStream) rtcCamStream.getTracks().forEach(function(t) { t.stop(); });
        rtcCamStream = null;
        rtcCamOn = false;
        rtcRebuildStream();
      }

      rtcUpdateCallStageUI();
      clearInterval(rtcCallTimer);
      rtcCallSec = 0;
      rtcCallTimer = setInterval(function() {
        rtcCallSec++;
        var tEl = document.getElementById('rtc-call-timer');
        if (tEl) {
          var m = Math.floor(rtcCallSec / 60), s = rtcCallSec % 60;
          tEl.textContent = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
        }
      }, 1000);

      // Answer pending PeerJS calls
      Object.keys(rtcPendingMediaCalls).forEach(function(pid) {
        var pmc = rtcPendingMediaCalls[pid];
        if (pmc && !rtcIsBlocked(pid)) {
          try {
            pmc.answer(rtcCombinedStream || undefined);
            rtcBindMediaConn(pmc, rtcRoomPeersMap[pid]);
          } catch(e) {}
        }
      });
      rtcPendingMediaCalls = {};

      try {
        var res = await fetch(API_BASE + '/api/rooms/' + encodeURIComponent(rtcCallRoom) + '/rtc/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            peerId: rtcPeerId,
            name: userProfile.name || myPlayerName,
            avatar: userProfile.avatar || '👑',
            callMode: rtcCallMode,
            micOn: rtcMicOn,
            camOn: rtcCamOn,
            inCall: true
          })
        });
        var data = await res.json();
        if (data && Array.isArray(data.participants)) {
          data.participants.forEach(function(p) {
            if (!rtcIsBlocked(p.peerId)) {
              rtcRoomPeersMap[p.peerId] = p;
              if (p.peerId !== rtcPeerId && p.inCall && !rtcMediaConns[p.peerId]) {
                rtcCallPeerViaPeerJS(p);
              }
            }
          });
          rtcRenderParticipants();
        }
      } catch(e) {}

      // Also initiate PeerJS calls to any inCall peers discovered via PeerJS room coordinator
      Object.keys(rtcRoomPeersMap).forEach(function(pid) {
        var p = rtcRoomPeersMap[pid];
        if (p && pid !== rtcPeerId && p.inCall && !rtcIsBlocked(pid) && !rtcMediaConns[pid]) {
          rtcCallPeerViaPeerJS(p);
        }
      });

      rtcBroadcastData({
        type: 'ring', roomId: rtcCallRoom, fromId: rtcPeerId,
        fromName: userProfile.name || myPlayerName, fromAvatar: userProfile.avatar || '👑', callMode: rtcCallMode
      });
      rtcSendSignal(undefined, 'ring', { name: userProfile.name || myPlayerName, avatar: userProfile.avatar || '👑' });
    }

    function rtcUpdateCallStageUI() {
      var stg = document.getElementById('rtc-video-stage');
      var tit = document.getElementById('rtc-stage-title');
      if (rtcInCall) {
        if (stg) {
          if (rtcStageHidden) stg.classList.add('hidden');
          else stg.classList.remove('hidden');
        }
        if (tit) tit.textContent = (rtcCallMode === 'video' ? '📹 مكالمة فيديو - ' : '📞 اتصال صوتي - ') + rtcCallRoom;
      } else {
        if (stg) stg.classList.add('hidden');
      }
    }

    function rtcToggleVideoStageMinimize() {
      rtcStageHidden = !rtcStageHidden;
      rtcUpdateCallStageUI();
    }

    async function rtcToggleCamera() {
      if (!rtcInCall) return;
      if (rtcCamOn) {
        if (rtcCamStream) rtcCamStream.getTracks().forEach(function(t) { t.stop(); });
        rtcCamStream = null;
        rtcCamOn = false;
        rtcCallMode = 'audio';
        rtcRebuildStream();
      } else {
        await rtcAcquireCam(rtcFacing);
        if (rtcCamOn) {
          rtcCallMode = 'video';
          Object.keys(rtcMediaConns).forEach(function(pid) {
            rtcCallPeerViaPeerJS(rtcRoomPeersMap[pid] || { peerId: pid, name: 'متصل', avatar: '👤' });
          });
        }
      }
      rtcUpdateCallStageUI();
      rtcPublishMedia();
    }

    async function rtcSwitchCamera() {
      await rtcAcquireCam(rtcFacing === 'user' ? 'environment' : 'user');
      rtcPublishMedia();
    }

    function rtcAcceptIncoming() {
      if (!rtcIncoming) return;
      var rm = rtcIncoming.roomId;
      var md = rtcIncoming.callMode;
      rtcIncoming = null;
      var inCard = document.getElementById('rtc-incoming-card');
      if (inCard) inCard.classList.add('hidden');
      rtcStartCall(rm, md);
    }

    function rtcRejectIncoming() {
      if (!rtcIncoming) return;
      var toId = rtcIncoming.fromId;
      rtcIncoming = null;
      if (rtcPendingMediaCalls[toId]) { try { rtcPendingMediaCalls[toId].close(); } catch(e) {} delete rtcPendingMediaCalls[toId]; }
      var inCard = document.getElementById('rtc-incoming-card');
      if (inCard) inCard.classList.add('hidden');
      rtcSendSignal(toId, 'reject', {});
    }

    function rtcHangup() {
      rtcInCall = false;
      syncCallPauseUI();
      clearInterval(rtcCallTimer);
      if (rtcCamStream) rtcCamStream.getTracks().forEach(function(t) { t.stop(); });
      rtcCamStream = null;
      rtcCamOn = false;
      rtcRebuildStream();
      Object.keys(rtcMediaConns).forEach(function(pid) { try { rtcMediaConns[pid].close(); } catch(e) {} });
      rtcMediaConns = {};
      Object.keys(rtcPendingMediaCalls).forEach(function(pid) { try { rtcPendingMediaCalls[pid].close(); } catch(e) {} });
      rtcPendingMediaCalls = {};
      var rv = document.getElementById('rtc-remote-videos');
      if (rv) rv.innerHTML = '';
      var as = document.getElementById('rtc-audio-sinks');
      if (as) as.innerHTML = '';
      rtcBroadcastData({ type: 'hangup', roomId: rtcCallRoom, fromId: rtcPeerId });
      rtcSendSignal(undefined, 'hangup', {});
      rtcPublishMedia();
      rtcUpdateCallStageUI();
    }

    async function rtcHandleSignal(sig) {
      if (!sig || !sig.fromId || sig.fromId === rtcPeerId) return;
      if (sig.toId && sig.toId !== rtcPeerId) return;
      if (rtcIsBlocked(sig.fromId)) return;
      if (sig.id && rtcProcessedIds.has(sig.id)) return;
      if (sig.id) rtcProcessedIds.add(sig.id);

      // Native WebRTC Mesh offer/answer/ice for 1v1 & 4-Player Match Voice
      if (sig.type === 'offer') {
        if (!rtcMatchMicRoom || rtcInCall) return;
        var p = sig.payload || {};
        if (!p.sdp) return;
        var rInfo = rtcRoomPeersMap[sig.fromId] || { peerId: sig.fromId, name: sig.fromName || 'متسابق', avatar: sig.fromAvatar || '👤' };
        rtcRoomPeersMap[sig.fromId] = rInfo;
        var existing = rtcMeshPcs[sig.fromId];
        var isPolite = rtcPeerId > sig.fromId;
        var collision = !!rtcMeshMakingOffer[sig.fromId] || (existing && existing.signalingState !== 'stable');
        if (collision && !isPolite) return;
        if (collision && isPolite && existing) rtcCloseMeshPc(sig.fromId);
        try {
          if (!rtcUserDisabledMic && (!rtcMicStream || !rtcMicStream.getAudioTracks().some(function(t) { return t.readyState === 'live'; }))) {
            await rtcEnsureAutoMic();
          }
          var pc = rtcCreateOrGetMeshPc(rInfo);
          await pc.setRemoteDescription(new RTCSessionDescription(p.sdp));
          await rtcDrainMeshIce(sig.fromId, pc);
          var ans = await pc.createAnswer();
          await pc.setLocalDescription(ans);
          await rtcSendSignal(sig.fromId, 'answer', { sdp: pc.localDescription, matchMic: true });
        } catch(e) {
          rtcCloseMeshPc(sig.fromId);
        }
        return;
      }

      if (sig.type === 'answer') {
        if (!rtcMatchMicRoom || rtcInCall) return;
        var pa = sig.payload || {};
        if (!pa.sdp) return;
        var pca = rtcMeshPcs[sig.fromId];
        if (!pca || pca.signalingState !== 'have-local-offer') return;
        try {
          await pca.setRemoteDescription(new RTCSessionDescription(pa.sdp));
          await rtcDrainMeshIce(sig.fromId, pca);
        } catch(e) {
          rtcCloseMeshPc(sig.fromId);
        }
        return;
      }

      if (sig.type === 'ice') {
        if (!rtcMatchMicRoom || rtcInCall) return;
        var pi = sig.payload || {};
        if (!pi.candidate) return;
        var pci = rtcMeshPcs[sig.fromId];
        if (pci && pci.remoteDescription) {
          pci.addIceCandidate(new RTCIceCandidate(pi.candidate)).catch(function() {});
        } else {
          if (!rtcMeshPendingIce[sig.fromId]) rtcMeshPendingIce[sig.fromId] = [];
          if (rtcMeshPendingIce[sig.fromId].length < 40) rtcMeshPendingIce[sig.fromId].push(pi.candidate);
        }
        return;
      }

      if (sig.type === 'ring' && !rtcInCall && rtcWatchedRoom) {
        rtcShowIncomingAlert(sig.fromId, sig.fromName, sig.fromAvatar, sig.callMode);
        return;
      }
      if (sig.type === 'hangup') {
        rtcRemoveMediaPeer(sig.fromId);
      }
    }

    // Room presence & self-healing WebRTC Mesh audio reconciler
    setInterval(function() {
      var target = rtcInCall ? rtcCallRoom : (rtcMatchMicRoom || rtcWatchedRoom);
      if (!target) return;
      if (rtcSilentCtx && rtcSilentCtx.state === 'suspended') {
        try { rtcSilentCtx.resume(); } catch(e) {}
      }
      if (rtcMatchMicRoom && !rtcInCall) {
        if (!rtcUserDisabledMic) {
          var hasLiveMic = rtcMicStream && rtcMicStream.getAudioTracks().some(function(t) { return t.readyState === 'live' && t.enabled; });
          if (!hasLiveMic) {
            rtcEnsureAutoMic().catch(function() {});
          }
        }
        Object.keys(rtcMeshPcs).forEach(function(pid) {
          var pc = rtcMeshPcs[pid];
          var ice = pc && pc.iceConnectionState;
          if (ice === 'failed' || ice === 'closed') {
            rtcCloseMeshPc(pid);
          }
        });
        var sinks = document.getElementById('mp-audio-sinks');
        if (sinks) {
          sinks.querySelectorAll('audio').forEach(function(a) {
            if (a.paused && !rtcSpeakerMuted) a.play().catch(function() {});
          });
        }
      }
      rtcPublishMedia();
      fetch(API_BASE + '/api/rooms/' + encodeURIComponent(target) + '/rtc/state?peerId=' + encodeURIComponent(rtcPeerId) + '&since=' + rtcSignalSeq + '&ping=1')
        .then(function(r) { return r.json(); })
        .then(function(d) {
          if (!d || !d.success) return;
          if (Array.isArray(d.participants)) {
            d.participants.forEach(function(p) {
              if (p && p.peerId && !rtcIsBlocked(p.peerId)) {
                rtcRoomPeersMap[p.peerId] = p;
                if (p.peerId !== rtcPeerId) {
                  rtcConnectDataPeer(p.peerId);
                  if (rtcMatchMicRoom && !rtcInCall) rtcConnectMatchMicPeer(p);
                }
              }
            });
            rtcRenderParticipants();
          }
          if (Array.isArray(d.signals)) {
            d.signals.forEach(function(sig) {
              if (sig.seq > rtcSignalSeq) rtcSignalSeq = sig.seq;
              rtcHandleSignal(sig);
            });
          }
        }).catch(function() {});
    }, 2000);

    // ==================== محرك التحديث التلقائي المباشر من المنصة (OTA Live Auto-Update) ====================
    var liveOtaCheckInFlight = false;
    var lastLiveOtaCheckAt = 0;

    async function hydrateSyncedPlayerFromUrl() {
      try {
        if (!window.location.search) return;
        var urlParams = new URLSearchParams(window.location.search);
        var syncPlayerId = urlParams.get('syncPlayer');
        if (syncPlayerId && syncPlayerId.trim()) {
          var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
          var t = ctrl ? setTimeout(function() { try { ctrl.abort(); } catch(e) {} }, 2500) : null;
          try {
            var res = await fetch(API_BASE + '/api/profile/' + encodeURIComponent(syncPlayerId.trim()) + '?t=' + Date.now(), {
              cache: 'no-store',
              signal: ctrl ? ctrl.signal : undefined
            });
            if (t) clearTimeout(t);
            if (res.ok) {
              var payload = await res.json();
              if (payload && payload.found && payload.data) {
                var d = payload.data;
                if (typeof d.userPoints === 'number' && !isNaN(d.userPoints) && d.userPoints >= 0) {
                  userPoints = d.userPoints;
                  savePoints();
                }
                if (d.userProfile && typeof d.userProfile === 'object') {
                  userProfile = Object.assign(userProfile, d.userProfile);
                  try {
                    localStorage.setItem('millionaire_user_profile', JSON.stringify(userProfile));
                    localStorage.setItem('millionaire_player_name', userProfile.name || 'المتسابق الذهبي');
                    localStorage.setItem('millionaire_player_avatar', userProfile.avatar || '👑');
                  } catch(e) {}
                  updateProfileUI();
                }
                if (d.rewardsState && typeof d.rewardsState === 'object') {
                  rewardsState = Object.assign(rewardsState, d.rewardsState);
                  saveRewardsState();
                }
                if (Array.isArray(d.usedIds) && d.usedIds.length > 0) {
                  d.usedIds.forEach(function(qid) {
                    if (typeof qid === 'string') globalUsedQuestionIds.add(qid);
                  });
                  try {
                    localStorage.setItem('millionaire_global_used_questions_all_modes', JSON.stringify(Array.from(globalUsedQuestionIds)));
                  } catch(e) {}
                }
                if (Array.isArray(d.lastClassicRunIds) && d.lastClassicRunIds.length > 0) {
                  d.lastClassicRunIds.forEach(function(qid) {
                    if (typeof qid === 'string') lastClassicRunIds.add(qid);
                  });
                  try {
                    localStorage.setItem('millionaire_last_classic_run_ids', JSON.stringify(Array.from(lastClassicRunIds).slice(-150)));
                  } catch(e) {}
                }
              }
            }
          } catch(e) {
            if (t) clearTimeout(t);
          }
          try {
            urlParams.delete('syncPlayer');
            urlParams.delete('v');
            var cleanQs = urlParams.toString();
            var cleanUrl = window.location.pathname + (cleanQs ? '?' + cleanQs : '') + (window.location.hash || '');
            window.history.replaceState(null, '', cleanUrl);
          } catch(e) {}
        }
      } catch(e) {}
    }

    function applyCachedQuestionsIfNewer() {
      try {
        var raw = localStorage.getItem('millionaire_cached_questions_v1');
        if (!raw) return;
        var parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.questions) && parsed.questions.length >= 100 && parsed.questionsHash) {
          QUESTIONS = parsed.questions;
        } else {
          localStorage.removeItem('millionaire_cached_questions_v1');
        }
      } catch(e) {}
    }

    async function syncLiveQuestionsFromPlatform(remoteQHash) {
      try {
        var cachedHash = '';
        try {
          var raw = localStorage.getItem('millionaire_cached_questions_v1');
          if (raw) cachedHash = (JSON.parse(raw).questionsHash || '');
        } catch(e) {}
        if (remoteQHash && (remoteQHash === LOCAL_QUESTIONS_HASH || remoteQHash === cachedHash)) return;
        var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        var t = ctrl ? setTimeout(function() { try { ctrl.abort(); } catch(e) {} }, 4000) : null;
        var res = await fetch(API_BASE + '/api/questions/bank?format=compact&v=' + encodeURIComponent(LOCAL_QUESTIONS_HASH), {
          cache: 'no-store',
          signal: ctrl ? ctrl.signal : undefined
        });
        if (t) clearTimeout(t);
        var qCt = (res.headers && res.headers.get && res.headers.get('content-type')) || '';
        if (!res.ok || res.redirected || qCt.indexOf('application/json') === -1) return;
        var d = await res.json();
        if (d && d.success && !d.upToDate && Array.isArray(d.questions) && d.questions.length >= 100) {
          QUESTIONS = d.questions;
          try {
            localStorage.setItem('millionaire_cached_questions_v1', JSON.stringify({
              questionsHash: d.questionsHash || remoteQHash || '',
              questions: d.questions
            }));
          } catch(e) {}
        }
      } catch(e) {}
    }

    async function checkLivePlatformUpdate(force) {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
      var now = Date.now();
      if (liveOtaCheckInFlight) return;
      if (!force && now - lastLiveOtaCheckAt < 30000) return;
      liveOtaCheckInFlight = true;
      lastLiveOtaCheckAt = now;
      try {
        var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        var timer = ctrl ? setTimeout(function() { try { ctrl.abort(); } catch(e) {} }, 2800) : null;
        var res = await fetch(API_BASE + '/api/app-meta?t=' + now, {
          cache: 'no-store',
          signal: ctrl ? ctrl.signal : undefined
        });
        if (timer) clearTimeout(timer);
        var contentType = (res.headers && res.headers.get && res.headers.get('content-type')) || '';
        if (!res.ok || res.redirected || contentType.indexOf('application/json') === -1) {
          liveOtaCheckInFlight = false;
          return;
        }
        var meta = await res.json();
        if (!meta || !meta.success || !meta.version) { liveOtaCheckInFlight = false; return; }

        if (meta.version !== LOCAL_BUILD_VERSION) {
          var isDifferentOrigin = !window.location.origin || window.location.origin.indexOf('file:') === 0 || window.location.origin === 'null' || window.location.origin !== API_BASE;
          // When embedded inside AppCreator24 HTML section (different/local origin), never redirect top-level WebView URL
          // to avoid external sign-in walls; sync only JSON questions silently if accessible.
          if (!isDifferentOrigin) {
            var switchKey = 'ota_switched_' + meta.version;
            var alreadySwitched = false;
            try { alreadySwitched = !!sessionStorage.getItem(switchKey); } catch(e) {}

            var activeClassicScreen = document.getElementById('screen-classic');
            var inActiveMatch = activeClassicScreen && !activeClassicScreen.classList.contains('hidden');

            if (!alreadySwitched && !inActiveMatch) {
              try { sessionStorage.setItem(switchKey, '1'); } catch(e) {}
              var nextParams = new URLSearchParams(window.location.search || '');
              nextParams.set('v', meta.version);
              window.location.replace(API_BASE + '/appcreator24.html?' + nextParams.toString() + (window.location.hash || ''));
              return;
            }
          }

          if (meta.questionsHash && meta.questionsHash !== LOCAL_QUESTIONS_HASH) {
            syncLiveQuestionsFromPlatform(meta.questionsHash);
          }
        }
      } catch(e) {
      } finally {
        liveOtaCheckInFlight = false;
      }
    }

    function updateOfflineStatusBadge() {
      var el = document.getElementById('bundle-offline-badge');
      if (!el) return;
      var offline = (typeof navigator !== 'undefined' && navigator.onLine === false);
      if (offline) {
        el.classList.remove('hidden');
        el.classList.add('flex');
      } else {
        el.classList.add('hidden');
        el.classList.remove('flex');
      }
    }

    var deferredBundleInstallPrompt = null;
    window.addEventListener('beforeinstallprompt', function(e) {
      try {
        e.preventDefault();
        deferredBundleInstallPrompt = e;
        var ib = document.getElementById('btn-bundle-pwa-install');
        if (ib) { ib.classList.remove('hidden'); ib.classList.add('flex'); }
      } catch(err) {}
    });
    window.addEventListener('appinstalled', function() {
      deferredBundleInstallPrompt = null;
      var ib = document.getElementById('btn-bundle-pwa-install');
      if (ib) { ib.classList.add('hidden'); ib.classList.remove('flex'); }
    });
    async function triggerBundlePwaInstall() {
      if (!deferredBundleInstallPrompt) return;
      try {
        await deferredBundleInstallPrompt.prompt();
        await deferredBundleInstallPrompt.userChoice;
      } catch(e) {}
      deferredBundleInstallPrompt = null;
      var ib = document.getElementById('btn-bundle-pwa-install');
      if (ib) { ib.classList.add('hidden'); ib.classList.remove('flex'); }
    }

    // Register Offline-First Service Worker when served via http(s)
    try {
      if ('serviceWorker' in navigator && window.location && window.location.protocol.indexOf('http') === 0) {
        navigator.serviceWorker.register('/sw.js').catch(function() {});
      }
    } catch(e) {}

    // Sync initial audio icon from persisted setting
    try {
      var sIcon = document.getElementById('sound-icon');
      if (sIcon) sIcon.textContent = audio.muted ? '🔇' : '🔊';
    } catch(e) {}

    // Zero network requests on startup/Lobby/Play vs Computer!
    // Only hydrate syncPlayer if explicitly present in URL query string.
    applyCachedQuestionsIfNewer();
    if (window.location && window.location.search && window.location.search.indexOf('syncPlayer=') !== -1) {
      hydrateSyncedPlayerFromUrl();
    }
    checkUrlRoomOnStartup();
    updateOfflineStatusBadge();
    window.addEventListener('DOMContentLoaded', function() {
      checkUrlRoomOnStartup();
      updateOfflineStatusBadge();
    });
    window.addEventListener('load', checkUrlRoomOnStartup);
    window.addEventListener('online', updateOfflineStatusBadge);
    window.addEventListener('offline', updateOfflineStatusBadge);
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'visible') {
        updateOfflineStatusBadge();
      }
    });
  </script>

  <div id="bundle-offline-badge" class="hidden fixed bottom-3 left-3 z-50 items-center gap-2 rounded-xl bg-slate-900/95 border border-emerald-500/60 px-3 py-2 text-xs font-bold text-emerald-300 shadow-2xl">
    <span>✈️</span>
    <span>وضع بدون نت نشط • 300 سؤال مخزنة للعب مع الكمبيوتر</span>
  </div>
</body>
</html>`;

async function generateBundle() {
  const scanner = new Scanner({});
  const candidates = scanner.scanFiles([
    {
      content: htmlTemplate,
      extension: 'html',
    },
  ]);

  const tailwindInput = `@import "tailwindcss";`;
  const compiler = await compile(tailwindInput, {
    base: path.resolve(__dirname, '..'),
    onDependency: () => {},
  });
  let compiledCss = compiler.build(candidates);
  // Protect against accidental closing style tag inside CSS
  compiledCss = compiledCss.replace(/<\/style>/gi, '<\\/style>');

  const peerJsPath = path.resolve(__dirname, '../node_modules/peerjs/dist/peerjs.min.js');
  let peerJsCode = '';
  if (fs.existsSync(peerJsPath)) {
    peerJsCode = fs.readFileSync(peerJsPath, 'utf8').replace(/<\/script/gi, '<\\/script');
  }

  let assembledHtml = htmlTemplate
    .replace('__COMPILED_TAILWIND_CSS__', () => compiledCss)
    .replace('/*__INLINE_PEERJS__*/', () => peerJsCode);

  const finalVersionHash = 'v_' + crypto.createHash('sha1').update(assembledHtml).digest('hex').slice(0, 12);
  const finalHtmlOutput = assembledHtml.replace('__BUILD_VERSION_TOKEN__', finalVersionHash);

  fs.writeFileSync(path.join(__dirname, '../appcreator24_code.html'), finalHtmlOutput, 'utf8');

  const standaloneDir = path.join(__dirname, '../standalone');
  fs.mkdirSync(standaloneDir, { recursive: true });
  fs.writeFileSync(path.join(standaloneDir, 'index.html'), finalHtmlOutput, 'utf8');

  const publicPath = path.join(__dirname, '../public');
  if (fs.existsSync(publicPath)) {
    fs.writeFileSync(path.join(publicPath, 'appcreator24.html'), finalHtmlOutput, 'utf8');
    fs.writeFileSync(path.join(publicPath, 'standalone-index.html'), finalHtmlOutput, 'utf8');
  }

  const distPath = path.join(__dirname, '../dist');
  if (fs.existsSync(distPath)) {
    fs.writeFileSync(path.join(distPath, 'appcreator24.html'), finalHtmlOutput, 'utf8');
    fs.writeFileSync(path.join(distPath, 'standalone-index.html'), finalHtmlOutput, 'utf8');
  }

  const kb = Math.round(Buffer.byteLength(finalHtmlOutput, 'utf8') / 1024);
  console.log(
    `Successfully generated 100% self-contained single-file bundle (${finalVersionHash}, ${kb} KB) with ${QUESTIONS_BANK.length} questions and ZERO external scripts/styles!`
  );
}

generateBundle().catch((err) => {
  console.error('Bundle generation failed:', err);
  process.exit(1);
});
