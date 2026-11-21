import React, { useState, useMemo } from 'react';
import { BookOpen, Search, Filter, Copy, Check, X, Download, Share2 } from 'lucide-react';
import { Question, Language } from '../types/game';
import { QUESTIONS_BANK } from '../data/questions';
import { questionTracker } from '../utils/questionTracker';
import { sounds } from '../utils/soundEffects';

interface QuestionsBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const QuestionsBrowserModal: React.FC<QuestionsBrowserModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState<number>(40);

  const categories: { key: string; ar: string; en: string }[] = [
    { key: 'all', ar: `جميع الأقسام (${QUESTIONS_BANK.length} سؤال)`, en: `All Categories (${QUESTIONS_BANK.length} Qs)` },
    { key: 'general', ar: '🌟 شامل الكل / معلومات عامة (100)', en: '🌟 General Knowledge (100)' },
    { key: 'islamic', ar: '🕌 ديني وإسلامي (100)', en: '🕌 Islamic Heritage (100)' },
    { key: 'entertainment', ar: '🎬 أفلام ومسلسلات (100)', en: '🎬 Movies & Series (100)' },
  ];

  const filteredQuestions = useMemo(() => {
    return QUESTIONS_BANK.filter((q) => {
      if (selectedCategory !== 'all' && !questionTracker.matchesCategory(q, selectedCategory)) return false;
      if (selectedLevel !== 'all' && q.level !== parseInt(selectedLevel)) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchAr = q.questionAr.toLowerCase().includes(query) || q.optionsAr.some((o) => o.toLowerCase().includes(query));
        const matchEn = q.questionEn.toLowerCase().includes(query) || q.optionsEn.some((o) => o.toLowerCase().includes(query));
        return matchAr || matchEn;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedLevel]);

  if (!isOpen) return null;

  const handleCopyQuestion = (q: Question) => {
    sounds.playSelectAnswer();
    const text = `${q.questionAr}\nأ) ${q.optionsAr[0]}\nب) ${q.optionsAr[1]}\nج) ${q.optionsAr[2]}\nد) ${q.optionsAr[3]}\nالإجابة الصحيحة: ${q.optionsAr[q.correctIndex]}`;
    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJSON = () => {
    sounds.playCorrect();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(QUESTIONS_BANK, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `millionaire_questions_bank_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-700 font-bold text-xs shadow transition active:scale-95"
              title={lang === 'ar' ? 'الرجوع للقائمة الرئيسية' : 'Back to Main Menu'}
            >
              {lang === 'ar' ? '⬅️ رجوع' : 'Back ➡️'}
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-amber-300">
                  {lang === 'ar'
                    ? `بنك الأسئلة الشامل (${QUESTIONS_BANK.length} سؤال)`
                    : `Question Bank (${QUESTIONS_BANK.length} Questions)`}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {lang === 'ar'
                    ? 'أسئلة موثقة وشاملة (100 عام • 100 ديني عن الأنبياء والقرآن • 100 أفلام ومسلسلات مصرية وتركية) بدون تكرار'
                    : 'Verified unique questions with continuous rotation & zero repetition'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl border border-slate-700 text-slate-200 transition-all"
              title={lang === 'ar' ? 'تصدير الأسئلة لملف JSON لـ AppCreator24' : 'Export JSON'}
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ar' ? 'تصدير JSON' : 'Export JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3 sm:p-4 bg-slate-950/60 border-b border-slate-800 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث في نصوص الأسئلة أو الخيارات...' : 'Search questions or options...'}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2 px-10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Category & Tier Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
            >
              {categories.map((c) => (
                <option key={c.key} value={c.key}>
                  {lang === 'ar' ? c.ar : c.en}
                </option>
              ))}
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
            >
              <option value="all">{lang === 'ar' ? 'كل المستويات (1-15)' : 'All Levels (1-15)'}</option>
              {Array.from({ length: 15 }, (_, i) => i + 1).map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lang === 'ar' ? `المستوى ${lvl}` : `Level ${lvl}`}
                </option>
              ))}
            </select>

            <span className="text-xs text-slate-400 ml-auto font-mono">
              {lang === 'ar'
                ? `النتائج: ${filteredQuestions.length} سؤال`
                : `Results: ${filteredQuestions.length} questions`}
            </span>
          </div>
        </div>

        {/* Questions Scrollable List */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 custom-scrollbar">
          {filteredQuestions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              {lang === 'ar' ? 'لا توجد أسئلة تطابق البحث' : 'No questions matching search'}
            </div>
          ) : (
            <>
              {filteredQuestions.slice(0, displayLimit).map((q) => {
              const letterLabels = lang === 'ar' ? ['أ', 'ب', 'ج', 'د'] : ['A', 'B', 'C', 'D'];
              const options = lang === 'ar' ? q.optionsAr : q.optionsEn;

              return (
                <div
                  key={q.id}
                  className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[10px] font-mono font-bold">
                          {lang === 'ar' ? `مستوى ${q.level}` : `Level ${q.level}`}
                        </span>
                        <span className="text-[11px] text-slate-400 capitalize">
                          {q.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100">
                        {lang === 'ar' ? q.questionAr : q.questionEn}
                      </h4>
                      {/* Secondary language question preview */}
                      <p className="text-xs text-slate-400 italic">
                        {lang === 'ar' ? q.questionEn : q.questionAr}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopyQuestion(q)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs shrink-0 transition-all"
                      title={lang === 'ar' ? 'نسخ نص السؤال' : 'Copy Question'}
                    >
                      {copiedId === q.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* 4 Choices */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {options.map((opt, idx) => {
                      const isCorrect = q.correctIndex === idx;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs ${
                            isCorrect
                              ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 font-bold'
                              : 'bg-slate-900 border border-slate-800 text-slate-300'
                          }`}
                        >
                          <span className="font-bold text-amber-400">{letterLabels[idx]}:</span>
                          <span className="truncate">{opt}</span>
                          {isCorrect && (
                            <span className="ml-auto text-[10px] text-emerald-400 font-mono">
                              ✓ {lang === 'ar' ? 'صحيح' : 'Correct'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span className="text-amber-400 font-semibold">
                      {lang === 'ar' ? 'الإيضاح: ' : 'Explanation: '}
                    </span>
                    {lang === 'ar' ? q.explanationAr : q.explanationEn}
                  </div>
                </div>
              );
            })}
              {filteredQuestions.length > displayLimit && (
                <button
                  onClick={() => setDisplayLimit((prev) => prev + 40)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs transition"
                >
                  {lang === 'ar'
                    ? `عرض المزيد (${filteredQuestions.length - displayLimit} سؤال متبقي)`
                    : `Show more (${filteredQuestions.length - displayLimit} remaining)`}
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>
            {lang === 'ar' ? 'محتوى شامل يدعم التوافق مع الهواتف الذكية' : 'AppCreator24 & Android ready'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-all"
          >
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
