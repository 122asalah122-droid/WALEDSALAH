import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Share2, Check, HelpCircle, Mic, Radio, Sparkles } from 'lucide-react';
import { Question, Language, GameStatus } from '../types/game';
import { sounds } from '../utils/soundEffects';
import { speechService } from '../utils/speechService';

interface QuestionCardProps {
  question: Question;
  currentLevel?: number;
  selectedIndex: number | null;
  onSelectOption: (index: number) => void;
  gameStatus: GameStatus;
  eliminatedOptions: number[]; // indices hidden by 50:50
  lang: Language;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentLevel,
  selectedIndex,
  onSelectOption,
  gameStatus,
  eliminatedOptions,
  lang,
}) => {
  const activeLevel = currentLevel || question.level || 1;
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(speechService.getIsSpeaking());
  const [autoRead, setAutoRead] = useState(speechService.getAutoRead());

  const letterLabels = lang === 'ar' ? ['أ', 'ب', 'ج', 'د'] : ['A', 'B', 'C', 'D'];
  const questionText = lang === 'ar' ? question.questionAr : question.questionEn;
  const options = lang === 'ar' ? question.optionsAr : question.optionsEn;
  const explanation = lang === 'ar' ? question.explanationAr : question.explanationEn;

  const isRevealed = gameStatus === 'revealed' || gameStatus === 'gameover' || gameStatus === 'victory';

  // Listen to speech synthesis status
  useEffect(() => {
    const unsubscribe = speechService.subscribe((status) => {
      setIsSpeaking(status.isSpeaking);
    });
    return () => {
      unsubscribe();
      speechService.stop();
    };
  }, []);

  // Stop speech if answer is picked or revealed
  useEffect(() => {
    if (selectedIndex !== null || isRevealed) {
      speechService.stop();
    }
  }, [selectedIndex, isRevealed]);

  const handleToggleSpeak = () => {
    sounds.playSelectAnswer();
    if (isSpeaking) {
      speechService.stop();
    } else {
      speechService.speakQuestionAndOptions(activeLevel, questionText, options, lang);
    }
  };

  const handleToggleAutoRead = () => {
    sounds.playSelectAnswer();
    const nextVal = !autoRead;
    setAutoRead(nextVal);
    speechService.setAutoRead(nextVal);
    if (nextVal && !isSpeaking && gameStatus === 'playing') {
      speechService.speakQuestionAndOptions(activeLevel, questionText, options, lang);
    }
  };

  const handleShareQuestion = async () => {
    sounds.playSelectAnswer();
    const shareTitle = lang === 'ar' ? 'سؤال تحدي الأبطال' : 'Champions Challenge Question';
    const shareText = `🏆 ${questionText}\n\n${letterLabels[0]}: ${options[0]}\n${letterLabels[1]}: ${options[1]}\n${letterLabels[2]}: ${options[2]}\n${letterLabels[3]}: ${options[3]}\n\nهل تعرف الإجابة الصحيحة؟ العب الآن!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const categoryNames: Record<string, { ar: string; en: string }> = {
    sports: { ar: 'رياضة وبطولات', en: 'Sports' },
    cinema: { ar: 'أفلام ومسلسلات', en: 'Movies & Series' },
    islamic: { ar: 'ثقافة إسلامية', en: 'Islamic Heritage' },
    general: { ar: 'معلومات عامة', en: 'General Knowledge' },
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Category & AI Speech Utilities Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-medium">
            {lang === 'ar'
              ? categoryNames[question.category]?.ar || 'ثقافة عامة'
              : categoryNames[question.category]?.en || 'General Knowledge'}
          </span>
          <span className="text-slate-600">·</span>
          <span className="font-mono text-amber-300">
            {lang === 'ar' ? `المستوى ${question.level} من 15` : `Level ${question.level} / 15`}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Read aloud AI voice button */}
          <button
            onClick={handleToggleSpeak}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium shadow-sm ${
              isSpeaking
                ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700/60'
            }`}
            title={lang === 'ar' ? 'تشغيل أو إيقاف صوت الذكاء الاصطناعي' : 'Toggle AI Voice Narrator'}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'ar' ? 'إيقاف الصوت' : 'Stop Voice'}</span>
                <span className="flex items-end gap-0.5 h-3 ml-1">
                  <span className="w-0.5 bg-amber-400 h-2" />
                  <span className="w-0.5 bg-amber-400 h-3" />
                  <span className="w-0.5 bg-amber-400 h-1.5" />
                </span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{lang === 'ar' ? 'ناطق الأسئلة' : 'Read Question'}</span>
              </>
            )}
          </button>

          {/* Auto-read toggle */}
          <button
            onClick={handleToggleAutoRead}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
              autoRead
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/60 font-semibold'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-300'
            }`}
            title={lang === 'ar' ? 'تبديل القراءة التلقائية للأسئلة' : 'Toggle auto-read questions'}
          >
            <Radio className={`w-3 h-3 ${autoRead ? 'text-blue-400' : 'text-slate-500'}`} />
            <span>
              {lang === 'ar'
                ? autoRead ? 'قراءة تلقائية: مفعلة' : 'قراءة تلقائية'
                : autoRead ? 'Auto-Read: ON' : 'Auto-Read'}
            </span>
          </button>

          {/* Share question */}
          <button
            onClick={handleShareQuestion}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700/60 transition-all text-xs"
            title={lang === 'ar' ? 'مشاركة السؤال مع الأصدقاء' : 'Share question'}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">
                  {lang === 'ar' ? 'تم النسخ!' : 'Copied!'}
                </span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">
                  {lang === 'ar' ? 'مشاركة' : 'Share'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Question Box (Studio TV Hexagonal look with responsive neon border) */}
      <div className={`relative p-6 sm:p-8 bg-gradient-to-b from-slate-900 via-blue-950/60 to-slate-900 border-2 rounded-2xl text-center transition-all duration-300 ${
        isRevealed && selectedIndex === question.correctIndex
          ? 'border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.5)] ring-2 ring-emerald-400/40'
          : isRevealed && selectedIndex !== null && selectedIndex !== question.correctIndex
          ? 'border-rose-500 shadow-[0_0_35px_rgba(225,29,72,0.5)] ring-2 ring-rose-500/40'
          : 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]'
      }`}>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 bg-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider rounded-full shadow-md">
          {lang === 'ar' ? `السؤال رقم ${question.level}` : `Question #${question.level}`}
        </div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-100 leading-relaxed font-sans select-text">
          {questionText}
        </h2>
      </div>

      {/* 4 Answer Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-2">
        {options.map((option, idx) => {
          const isEliminated = eliminatedOptions.includes(idx);
          const isSelected = selectedIndex === idx;
          const isCorrect = question.correctIndex === idx;

          let btnStyle = 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:border-amber-400 hover:bg-slate-800/90 hover:shadow-lg hover:shadow-amber-500/10';
          let letterBadgeStyle = 'bg-slate-800 border-slate-700 text-amber-400';

          if (isEliminated) {
            btnStyle = 'bg-slate-950/30 border-slate-900 text-transparent cursor-not-allowed pointer-events-none opacity-20';
            letterBadgeStyle = 'bg-slate-900 border-slate-900 text-slate-700';
          } else if (isRevealed) {
            if (isCorrect) {
              btnStyle = 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 border-emerald-300 text-white font-extrabold shadow-lg scale-[1.01]';
              letterBadgeStyle = 'bg-emerald-700 border-white text-white';
            } else if (isSelected && !isCorrect) {
              btnStyle = 'bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 border-rose-400 text-white font-bold shadow-lg';
              letterBadgeStyle = 'bg-rose-800 border-rose-300 text-white';
            } else {
              btnStyle = 'bg-slate-950/60 border-slate-800/60 text-slate-500 opacity-60';
              letterBadgeStyle = 'bg-slate-900 border-slate-800 text-slate-600';
            }
          } else if (isSelected) {
            // Locked in state
            btnStyle = 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 border-amber-300 text-slate-950 font-extrabold shadow-lg scale-[1.01]';
            letterBadgeStyle = 'bg-slate-950 border-amber-300 text-amber-400';
          }

          return (
            <button
              key={idx}
              disabled={isEliminated || selectedIndex !== null}
              onClick={() => onSelectOption(idx)}
              className={`relative flex items-center justify-between p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 text-left active:scale-[0.99] group ${btnStyle}`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <span
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-sm shrink-0 transition-all ${letterBadgeStyle}`}
                >
                  {letterLabels[idx]}
                </span>
                <span className="text-sm sm:text-base font-semibold truncate leading-tight">
                  {isEliminated ? '' : option}
                </span>
              </div>
              {!isEliminated && isRevealed && isCorrect && (
                <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Educational Explanation Box (revealed after answer) */}
      {isRevealed && (
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-xs space-y-1 animate-fadeIn">
          <div className="font-bold text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>{lang === 'ar' ? 'معلومة ذهبية وإيضاح:' : 'Educational Insight:'}</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
};
