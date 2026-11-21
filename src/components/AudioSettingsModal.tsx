import React, { useState } from 'react';
import { Volume2, VolumeX, Mic, Bell, X, Check } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { Language } from '../types/game';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [muted, setMutedState] = useState(sounds.getMuted());
  const [volume, setVolumeState] = useState(sounds.getVolume());
  const [voiceEnabled, setVoiceState] = useState(sounds.getVoiceEnabled());

  if (!isOpen) return null;

  const handleMuteToggle = () => {
    const next = !muted;
    setMutedState(next);
    sounds.setMuted(next);
    if (!next) sounds.playSelectAnswer();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolumeState(v);
    sounds.setVolume(v);
  };

  const handleVoiceToggle = () => {
    const next = !voiceEnabled;
    setVoiceState(next);
    sounds.setVoiceEnabled(next);
    if (next) {
      sounds.speakHost(
        lang === 'ar' ? 'أهلاً بك في مسابقة تحدي الأبطال' : 'Welcome to Champions Challenge',
        lang
      );
    }
  };

  const testAudio = () => {
    sounds.playCorrect();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md p-6 bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-700 font-bold text-xs shadow transition active:scale-95"
              title={lang === 'ar' ? 'الرجوع للقائمة الرئيسية' : 'Back to Main Menu'}
            >
              {lang === 'ar' ? '⬅️ رجوع' : 'Back ➡️'}
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-300">
                  {lang === 'ar' ? 'إعدادات الصوت والمؤثرات' : 'Sound Settings'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {lang === 'ar' ? 'التحكم بنطق الأسئلة والموسيقى' : 'Speech & Audio controls'}
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

        {/* Controls */}
        <div className="py-6 space-y-6">
          {/* Master Mute */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm text-slate-200">
                {lang === 'ar' ? 'الصوت العام' : 'Master Audio'}
              </div>
              <div className="text-xs text-slate-400">
                {lang === 'ar' ? 'كتم أو تشغيل المؤثرات الصوتية والموسيقى' : 'Mute or enable all sound effects & tension'}
              </div>
            </div>
            <button
              onClick={handleMuteToggle}
              className={`p-3 rounded-xl border transition-all ${
                !muted
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Volume Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>{lang === 'ar' ? 'مستوى الصوت' : 'Volume Level'}</span>
              <span className="font-mono">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              disabled={muted}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-40"
            />
          </div>

          {/* Voice Host (Speech synthesis) */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm text-slate-200">
                {lang === 'ar' ? 'المذيع الصوتي الآلي' : 'Host Voice Announcer'}
              </div>
              <div className="text-xs text-slate-400">
                {lang === 'ar' ? 'قراءة نص السؤال والخيارات بصوت المذيع' : 'Read question and options aloud'}
              </div>
            </div>
            <button
              onClick={handleVoiceToggle}
              className={`p-3 rounded-xl border transition-all ${
                voiceEnabled
                  ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>

          {/* Audio Test Button */}
          <div className="pt-2">
            <button
              onClick={testAudio}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ar' ? 'تجربة المؤثرات الصوتية (Test Sound)' : 'Test Sound Effect'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
          >
            <Check className="w-4 h-4" />
            <span>{lang === 'ar' ? 'تم وحفظ' : 'Done & Save'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
