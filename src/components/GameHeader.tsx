import React from 'react';
import { Volume2, VolumeX, Globe, Settings, Users, Sparkles, Trophy, Coins, ArrowLeft, ArrowRight, Award, Crown } from 'lucide-react';
import { Language, GameMode, UserProfile } from '../types/game';
import { sounds } from '../utils/soundEffects';
import { PWAInstallButton } from './PWAInstallButton';

interface GameHeaderProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  lang: Language;
  onToggleLang: () => void;
  onOpenAudioSettings: () => void;
  onOpenQuestionBrowser: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenAppCreator?: () => void;
  userPoints?: number;
  onOpenTournament?: () => void;
  canGoBack?: boolean;
  onBack?: () => void;
  userProfile?: UserProfile;
  onOpenProfile?: () => void;
  onOpenBadges?: () => void;
  badgesCount?: number;
  hasDailyGift?: boolean;
  isVip?: boolean;
  onOpenVip?: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  currentMode,
  onSelectMode,
  lang,
  onToggleLang,
  onOpenAudioSettings,
  onOpenQuestionBrowser,
  isMuted,
  onToggleMute,
  onOpenAppCreator,
  userPoints = 100,
  onOpenTournament,
  canGoBack,
  onBack,
  userProfile,
  onOpenProfile,
  onOpenBadges,
  badgesCount = 0,
  hasDailyGift = false,
  isVip = false,
  onOpenVip,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full max-w-full overflow-x-hidden bg-slate-950/95 border-b border-slate-800/90">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 sm:py-0 sm:h-16 flex flex-wrap sm:flex-nowrap items-center justify-between gap-x-2 gap-y-1.5 sm:gap-4">
        {/* Zone 1: Back Button & Brand Wordmark */}
        <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto sm:flex-1">
          {canGoBack && onBack && (
            <button
              type="button"
              onClick={onBack}
              className="shrink-0 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-amber-500/40 transition-colors flex items-center gap-1 shadow-md active:scale-95"
              title={lang === 'ar' ? 'رجوع للخلف' : 'Back'}
            >
              {lang === 'ar' ? <ArrowRight className="w-4 h-4 shrink-0" /> : <ArrowLeft className="w-4 h-4 shrink-0" />}
              <span className="text-xs font-bold">{lang === 'ar' ? 'رجوع' : 'Back'}</span>
            </button>
          )}

          <div
            onClick={() => (canGoBack && onBack ? onBack() : onSelectMode('classic'))}
            className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer select-none"
          >
            <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 text-base">
              🏆
            </div>
            <span className="text-sm sm:text-base md:text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 truncate">
              {lang === 'ar' ? 'تحدي الابطال :مسابقة لايف' : 'Champions Challenge : Live Quiz'}
            </span>
          </div>
        </div>

        {/* Zone 2: Mode Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => onSelectMode('classic')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentMode === 'classic'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'التحدي الكلاسيكي' : 'Classic Game'}</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('multiplayer4')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentMode === 'multiplayer4'
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'تحدي 4 لاعبين + شات' : '4-Player Battle + Chat'}</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions Group */}
        <div className="flex items-center justify-between sm:justify-end gap-1 sm:gap-2 w-full sm:w-auto shrink-0">
          {/* User Profile Button */}
          {onOpenProfile && (
            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400 rounded-xl text-xs font-bold transition-colors shadow-sm active:scale-95 group min-w-0"
              title={lang === 'ar' ? 'الملف الشخصي للمتسابق' : 'Contestant Profile'}
            >
              <span className="text-sm sm:text-base leading-none shrink-0">
                {userProfile?.avatar || '👤'}
              </span>
              <span className="max-w-[54px] sm:max-w-[90px] truncate text-amber-300">
                {userProfile?.name || (lang === 'ar' ? 'ملفي' : 'Profile')}
              </span>
            </button>
          )}

          {/* Badges & Gifts Button */}
          {onOpenBadges && (
            <button
              type="button"
              onClick={onOpenBadges}
              className={`relative flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition-colors shadow-sm active:scale-95 border shrink-0 ${
                hasDailyGift
                  ? 'bg-emerald-500/15 border-emerald-400/70 text-emerald-300'
                  : 'bg-slate-900 hover:bg-slate-800 border-amber-500/40 text-amber-300'
              }`}
              title={lang === 'ar' ? 'الأوسمة والهدايا التشجيعية' : 'Badges & Gifts'}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'الأوسمة' : 'Badges'}</span>
              <span className="font-mono text-[10px] px-1 rounded bg-slate-950/70">
                {badgesCount}
              </span>
              {hasDailyGift && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5" />
              )}
            </button>
          )}

          {/* VIP Membership Button */}
          {onOpenVip && (
            <button
              type="button"
              onClick={onOpenVip}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-black transition-colors shadow-sm active:scale-95 border whitespace-nowrap shrink-0 ${
                isVip
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 border-amber-300 text-slate-950'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/50 text-amber-300'
              }`}
              title={lang === 'ar' ? 'عضوية VIP — فتح المايك والكاميرا بدون إعلانات' : 'VIP Membership — Unlock Mic, Camera & No Ads'}
            >
              <Crown className="w-3.5 h-3.5 shrink-0" />
              <span>{isVip ? 'VIP ✓' : 'VIP'}</span>
            </button>
          )}

          {/* User Points Badge */}
          <div
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 font-mono text-xs font-black shadow-sm shrink-0"
            title={lang === 'ar' ? 'رصيد نقاطك للمواصلة عند الخسارة' : 'Reward Points for Revivals'}
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{userPoints.toLocaleString()}</span>
          </div>

          {/* 72h Tournament Button */}
          {onOpenTournament && (
            <button
              type="button"
              onClick={onOpenTournament}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-gradient-to-r from-amber-600/30 to-amber-500/20 hover:from-amber-500/40 hover:to-amber-400/30 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-bold transition-colors shadow-sm active:scale-95 shrink-0"
              title={lang === 'ar' ? 'بطولة الـ 72 ساعة (نقاط x2)' : '72h Championship (x2 Pts)'}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline font-mono">{lang === 'ar' ? 'بطولة 72h' : '72h Cup'}</span>
            </button>
          )}

          {/* Offline PWA Install Button */}
          <PWAInstallButton lang={lang} compact />

          {/* Language Toggle */}
          <button
            type="button"
            onClick={onToggleLang}
            className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
            title={lang === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono">{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* Quick Sound Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`p-1.5 sm:p-2 rounded-xl border transition-colors shrink-0 ${
              !isMuted
                ? 'bg-slate-900 border-slate-800 text-amber-400 hover:text-amber-300'
                : 'bg-rose-950/40 border-rose-900/60 text-rose-400'
            }`}
            title={lang === 'ar' ? 'كتم/تشغيل الصوت' : 'Mute/Unmute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Audio Settings Modal Opener */}
          <button
            type="button"
            onClick={onOpenAudioSettings}
            className="p-1.5 sm:p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors shrink-0"
            title={lang === 'ar' ? 'إعدادات الصوت والمذيع' : 'Audio & Voice Settings'}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
