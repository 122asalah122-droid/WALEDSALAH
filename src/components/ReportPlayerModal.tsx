import React, { useState } from 'react';
import { Flag, X, CheckCircle2, ShieldAlert, Ban } from 'lucide-react';
import { Language } from '../types/game';

export interface ReportTarget {
  id: string;
  name: string;
  avatar?: string;
  roomId?: string;
}

export interface PlayerReportRecord {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedId: string;
  reportedName: string;
  roomId: string;
  reason: string;
  reasonLabel: string;
  details: string;
  createdAt: number;
}

export const REPORT_REASONS = [
  {
    key: 'abusive_language',
    ar: 'ألفاظ غير لائقة أو سباب',
    en: 'Abusive language or profanity',
    icon: '🤬',
  },
  {
    key: 'mic_spam',
    ar: 'إزعاج أو ضوضاء متعمدة في الميكروفون',
    en: 'Mic spam or deliberate noise',
    icon: '🔊',
  },
  {
    key: 'harassment',
    ar: 'مضايقة أو تحرش باللاعبين',
    en: 'Harassment or bullying',
    icon: '⚠️',
  },
  {
    key: 'cheating',
    ar: 'غش أو سلوك غير رياضي',
    en: 'Cheating or unsportsmanlike conduct',
    icon: '🚫',
  },
  {
    key: 'inappropriate_profile',
    ar: 'اسم أو محتوى غير مناسب',
    en: 'Inappropriate name or content',
    icon: '🏷️',
  },
] as const;

const REPORTS_STORAGE_KEY = 'millionaire_player_reports';

export function getSavedPlayerReports(): PlayerReportRecord[] {
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function submitPlayerReport(params: {
  reporterId: string;
  reporterName: string;
  target: ReportTarget;
  reason: string;
  reasonLabel: string;
  details?: string;
}): Promise<PlayerReportRecord> {
  const record: PlayerReportRecord = {
    id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    reporterId: params.reporterId || 'local_player',
    reporterName: params.reporterName || 'متسابق',
    reportedId: params.target.id || params.target.name,
    reportedName: params.target.name || 'لاعب',
    roomId: params.target.roomId || '',
    reason: params.reason,
    reasonLabel: params.reasonLabel,
    details: (params.details || '').trim().slice(0, 300),
    createdAt: Date.now(),
  };

  try {
    const existing = getSavedPlayerReports();
    const updated = [record, ...existing].slice(0, 200);
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));
  } catch {}

  try {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    const data = await res.json();
    if (data && data.reportId) {
      record.id = data.reportId;
    }
  } catch {}

  return record;
}

interface ReportPlayerModalProps {
  isOpen: boolean;
  target: ReportTarget | null;
  lang: Language;
  reporterId: string;
  reporterName: string;
  onClose: () => void;
  onBlockPlayer?: (target: ReportTarget) => void;
  onReported?: (record: PlayerReportRecord) => void;
}

export const ReportPlayerModal: React.FC<ReportPlayerModalProps> = ({
  isOpen,
  target,
  lang,
  reporterId,
  reporterName,
  onClose,
  onBlockPlayer,
  onReported,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0].key);
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRecord, setSubmittedRecord] = useState<PlayerReportRecord | null>(null);

  if (!isOpen || !target) return null;

  const resetAndClose = () => {
    setSelectedReason(REPORT_REASONS[0].key);
    setDetails('');
    setSubmittedRecord(null);
    setIsSubmitting(false);
    onClose();
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const reasonObj = REPORT_REASONS.find((r) => r.key === selectedReason) || REPORT_REASONS[0];
    const record = await submitPlayerReport({
      reporterId,
      reporterName,
      target,
      reason: reasonObj.key,
      reasonLabel: lang === 'ar' ? reasonObj.ar : reasonObj.en,
      details,
    });
    setIsSubmitting(false);
    setSubmittedRecord(record);
    if (onReported) {
      onReported(record);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500/60 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-rose-950/60 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-amber-200">
                {lang === 'ar' ? 'الإبلاغ عن لاعب' : 'Report Player'}
              </h3>
              <p className="text-[11px] text-slate-300 truncate max-w-[220px]">
                {target.avatar || '👤'} {target.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            aria-label={lang === 'ar' ? 'إغلاق' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {submittedRecord ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 border-2 border-emerald-400 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-black text-emerald-300">
                {lang === 'ar' ? 'تم استلام وحفظ البلاغ بنجاح' : 'Report Saved Successfully'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'ar'
                  ? `شكراً لمساعدتنا في الحفاظ على بيئة لعب محترمة. تم تسجيل بلاغك ضد (${target.name}) بسبب: "${submittedRecord.reasonLabel}".`
                  : `Thank you for keeping the game safe. Your report against (${target.name}) for "${submittedRecord.reasonLabel}" has been saved.`}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {onBlockPlayer && (
                <button
                  type="button"
                  onClick={() => {
                    onBlockPlayer(target);
                    resetAndClose();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600/35 border border-rose-500/60 text-rose-300 font-black text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Ban className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'حظر هذا اللاعب أيضاً' : 'Also Block Player'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={resetAndClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition"
              >
                {lang === 'ar' ? 'تم، إغلاق' : 'Done'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="text-xs text-slate-300 flex items-center gap-1.5 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {lang === 'ar' ? 'اختر سبب الإبلاغ السريع:' : 'Select a quick reason for reporting:'}
              </span>
            </div>

            <div className="space-y-2">
              {REPORT_REASONS.map((item) => {
                const isSelected = selectedReason === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSelectedReason(item.key)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-start flex items-center gap-2.5 text-xs font-bold transition ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 text-amber-200 ring-1 ring-amber-400/40'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="flex-1">{lang === 'ar' ? item.ar : item.en}</span>
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-amber-400 bg-amber-400' : 'border-slate-600'
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </span>
                  </button>
                );
              })}
            </div>

            <div>
              <input
                type="text"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={200}
                placeholder={
                  lang === 'ar' ? 'تفاصيل إضافية (اختياري)...' : 'Additional details (optional)...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={resetAndClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 disabled:opacity-50 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-1.5"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting
                    ? lang === 'ar'
                      ? 'جاري الحفظ...'
                      : 'Saving...'
                    : lang === 'ar'
                    ? 'تأكيد الإبلاغ'
                    : 'Confirm Report'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
