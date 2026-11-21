import React, { useState, useEffect } from 'react';
import { User, Calendar, Flag, Sparkles, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { UserProfile, Language, DEFAULT_USER_PROFILE } from '../types/game';
import { sounds } from '../utils/soundEffects';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

const AVATAR_OPTIONS = [
  '👑', '🦁', '🦅', '🚀', '🧠', '⚡', '💎', '🌟', 
  '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '🏆', '🎯', '🔥', '🛡️'
];

const COUNTRIES = [
  { code: 'SA', nameAr: 'السعودية', nameEn: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'EG', nameAr: 'مصر', nameEn: 'Egypt', flag: '🇪🇬' },
  { code: 'DZ', nameAr: 'الجزائر', nameEn: 'Algeria', flag: '🇩🇿' },
  { code: 'MA', nameAr: 'المغرب', nameEn: 'Morocco', flag: '🇲🇦' },
  { code: 'AE', nameAr: 'الإمارات', nameEn: 'UAE', flag: '🇦🇪' },
  { code: 'IQ', nameAr: 'العراق', nameEn: 'Iraq', flag: '🇮🇶' },
  { code: 'JO', nameAr: 'الأردن', nameEn: 'Jordan', flag: '🇯🇴' },
  { code: 'KW', nameAr: 'الكويت', nameEn: 'Kuwait', flag: '🇰🇼' },
  { code: 'TN', nameAr: 'تونس', nameEn: 'Tunisia', flag: '🇹🇳' },
  { code: 'OM', nameAr: 'سلطنة عُمان', nameEn: 'Oman', flag: '🇴🇲' },
  { code: 'OTHER', nameAr: 'دولة أخرى', nameEn: 'Other Country', flag: '🌐' },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  lang,
  profile,
  onSaveProfile,
}) => {
  const [name, setName] = useState<string>(profile.name || DEFAULT_USER_PROFILE.name);
  const [avatar, setAvatar] = useState<string>(profile.avatar || DEFAULT_USER_PROFILE.avatar);
  const [gender, setGender] = useState<'male' | 'female' | 'unspecified'>(profile.gender || 'male');
  const [birthDate, setBirthDate] = useState<string>(profile.birthDate || '2000-01-01');
  const [country, setCountry] = useState<string>(profile.country || '🇸🇦 السعودية');
  const [savedToast, setSavedToast] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setName(profile.name || DEFAULT_USER_PROFILE.name);
      setAvatar(profile.avatar || DEFAULT_USER_PROFILE.avatar);
      setGender(profile.gender || 'male');
      setBirthDate(profile.birthDate || '2000-01-01');
      setCountry(profile.country || '🇸🇦 السعودية');
      setSavedToast(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSave = () => {
    const cleanName = name.trim() || (lang === 'ar' ? 'المتسابق' : 'Contestant');
    const updated: UserProfile = {
      name: cleanName,
      avatar,
      gender,
      birthDate,
      country,
    };

    try {
      localStorage.setItem('millionaire_user_profile', JSON.stringify(updated));
      localStorage.setItem('millionaire_player_name', cleanName);
      localStorage.setItem('millionaire_player_avatar', avatar);
    } catch {}

    sounds.playSelectAnswer();
    onSaveProfile(updated);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 space-y-5 shadow-2xl relative text-slate-100">
        {/* Top Header with Back Button */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-700 bg-slate-950 text-amber-400 hover:text-amber-300 transition active:scale-95"
          >
            {lang === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{lang === 'ar' ? 'رجوع' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-black text-amber-300">
              {lang === 'ar' ? 'الملف الشخصي للمتسابق' : 'Contestant Profile'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {/* Profile Card Preview */}
        <div className="p-4 bg-gradient-to-r from-amber-500/10 via-slate-950 to-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-3xl">
              {avatar}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg text-slate-100 truncate">
                {name || (lang === 'ar' ? 'المتسابق' : 'Contestant')}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {gender === 'female' ? (lang === 'ar' ? 'أنثى' : 'Female') : (lang === 'ar' ? 'ذكر' : 'Male')}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
              <span>{country}</span>
              {birthDate && (
                <span>🎂 {birthDate}</span>
              )}
            </div>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4 text-start">
          {/* 1. Name */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'ar' ? 'الاسم أو اللقب المستعار:' : 'Contestant Name / Nickname:'}</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={lang === 'ar' ? 'اكتب اسمك هنا...' : 'Enter your name...'}
              maxLength={24}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition"
            />
          </div>

          {/* 2. Avatar Selection */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'ar' ? 'اختر الصورة الرمزية (الأفاتار):' : 'Select Contestant Avatar:'}</span>
            </label>
            <div className="grid grid-cols-8 gap-2">
              {AVATAR_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => {
                    sounds.playSelectAnswer();
                    setAvatar(em);
                  }}
                  className={`w-full aspect-square rounded-xl text-xl flex items-center justify-center border transition-all ${
                    avatar === em
                      ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 scale-110 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Gender (النوع) */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              {lang === 'ar' ? 'النوع / الجنس:' : 'Gender:'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                  gender === 'male'
                    ? 'bg-blue-600/30 border-blue-400 text-blue-200 ring-1 ring-blue-400 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>👨 ذكر (Male)</span>
                {gender === 'male' && <Check className="w-4 h-4 text-blue-400" />}
              </button>

              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                  gender === 'female'
                    ? 'bg-pink-600/30 border-pink-400 text-pink-200 ring-1 ring-pink-400 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>👩 أنثى (Female)</span>
                {gender === 'female' && <Check className="w-4 h-4 text-pink-400" />}
              </button>
            </div>
          </div>

          {/* 4. Birth Date (تاريخ الميلاد) */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'ar' ? 'تاريخ الميلاد:' : 'Date of Birth:'}</span>
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none transition"
            />
          </div>

          {/* 5. Country (الدولة) */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'ar' ? 'الدولة / العلم:' : 'Country / Region:'}</span>
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none transition"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={`${c.flag} ${lang === 'ar' ? c.nameAr : c.nameEn}`}>
                  {c.flag} {lang === 'ar' ? c.nameAr : c.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm rounded-xl shadow-lg active:scale-98 transition flex items-center justify-center gap-2"
          >
            {savedToast ? (
              <>
                <Check className="w-5 h-5 text-slate-950" />
                <span>{lang === 'ar' ? 'تم حفظ الملف الشخصي بنجاح!' : 'Profile Saved Successfully!'}</span>
              </>
            ) : (
              <span>{lang === 'ar' ? '💾 حفظ وتطبيق في جميع الأقسام' : '💾 Save & Apply Everywhere'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
