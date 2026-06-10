import React, { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Language {
  code: string;
  name: string;
  flag: string;
  googleCode: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', googleCode: 'en' },
  { code: 'es', name: 'Español', flag: '🇪🇸', googleCode: 'es' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', googleCode: 'fr' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', googleCode: 'de' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', googleCode: 'ru' },
  { code: 'zh', name: '中文', flag: '🇨🇳', googleCode: 'zh-CN' },
  { code: 'pt', name: 'Português', flag: '🇵🇹', googleCode: 'pt' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', googleCode: 'tr' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', googleCode: 'vi' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', googleCode: 'ja' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', googleCode: 'ar' },
];

export const LanguageSelector: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>(LANGUAGES[0]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Read cookie utility
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  // Set cookie utility
  const setTranslationCookie = (lang: string) => {
    const domain = window.location.hostname;
    // Set for current session
    document.cookie = `googtrans=/en/${lang}; path=/;`;
    document.cookie = `googtrans=/en/${lang}; path=/; domain=${domain};`;
    // If working on subdomain, set for root domain too
    if (domain.includes('.')) {
      const rootDomain = domain.split('.').slice(-2).join('.');
      document.cookie = `googtrans=/en/${lang}; path=/; domain=.${rootDomain};`;
    }
  };

  // Initialize and detect automatic regional language
  useEffect(() => {
    // 1. Check for stored manual preference
    const stored = localStorage.getItem('user_lang_code');
    const cookieVal = getCookie('googtrans');

    if (stored) {
      const found = LANGUAGES.find(l => l.code === stored);
      if (found) {
        setCurrentLang(found);
        // Sync cookie
        setTranslationCookie(found.googleCode);
      }
    } else {
      // Auto detect from browser
      const browserLangLong = navigator.language || (navigator as any).userLanguage || 'en';
      const browserLang = browserLangLong.split('-')[0].toLowerCase();
      
      const matched = LANGUAGES.find(l => l.code === browserLang);
      if (matched && matched.code !== 'en') {
        // Automatically translate
        setCurrentLang(matched);
        localStorage.setItem('user_lang_code', matched.code);
        setTranslationCookie(matched.googleCode);

        // Notify user about auto translation
        setTimeout(() => {
          toast.info(`🌐 Region detected: ${matched.name}`, {
            description: `We translated the platform to your native language. You can change it back to English anytime!`,
            action: {
              label: 'Reset to EN',
              onClick: () => selectLanguage(LANGUAGES[0]),
            },
            duration: 8000
          });
        }, 1500);
      }
    }

    // Close on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectLanguage = (lang: Language) => {
    setCurrentLang(lang);
    localStorage.setItem('user_lang_code', lang.code);
    setTranslationCookie(lang.googleCode);
    setIsOpen(false);

    // Apply translation inside Google translate combo if loaded, else trigger reload
    const translateCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (translateCombo) {
      translateCombo.value = lang.googleCode;
      translateCombo.dispatchEvent(new Event('change'));
      toast.success(`Language updated to ${lang.name}`);
    } else {
      toast.loading(`Translating to ${lang.name}...`);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-secondary/30 hover:bg-secondary/50 hover:border-primary/20 text-foreground transition-all duration-200 cursor-pointer h-10 select-none text-[10px] md:text-xs"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1">
          <span className="text-[14px] leading-none">{currentLang.flag}</span>
          <span className="hidden sm:inline font-bold uppercase tracking-wider text-foreground/80">{currentLang.code}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-foreground/45 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-black/95 backdrop-blur-xl p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-2.5 py-1.5 border-b border-white/5 mb-1.5">
            <span className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em] block">
              Translate Interface
            </span>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-0.5 custom-scrollbar">
            {LANGUAGES.map((lang) => {
              const isSelected = currentLang.code === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => selectLanguage(lang)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-150 text-left cursor-pointer select-none ${
                    isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/70 hover:bg-white/5 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[15px]">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Invisible container required for Google Translate Widget element loading */}
      <div id="google_translate_element" className="absolute pointer-events-none opacity-0 h-0 w-0 overflow-hidden" />
    </div>
  );
};
