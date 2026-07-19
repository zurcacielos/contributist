"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Globe, ChevronDown } from 'lucide-react';

export function LanguageSelector() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', label: 'English', flagCode: 'us' },
    { code: 'es', label: 'Español', flagCode: 'ar' },
    { code: 'zh', label: '中文', flagCode: 'cn' },
    { code: 'ru', label: 'Русский', flagCode: 'ru' },
    { code: 'pt', label: 'Português', flagCode: 'pt' },
    { code: 'ja', label: '日本語', flagCode: 'jp' },
    { code: 'fr', label: 'Français', flagCode: 'fr' },
    { code: 'de', label: 'Deutsch', flagCode: 'de' },
    { code: 'ko', label: '한국어', flagCode: 'kr' },
    { code: 'hi', label: 'हिन्दी', flagCode: 'in' }
  ];

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (nextLocale: string) => {
    const searchParams = typeof window !== 'undefined' ? window.location.search : '';
    router.replace(`${pathname}${searchParams}`, { locale: nextLocale });
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--lang-trigger-bg)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          color: 'var(--text-main)',
          fontSize: '0.80rem',
          fontWeight: 'bold',
          padding: '6px 12px',
          width: 'auto',
          height: '42px',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.15s ease-in-out'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--lang-trigger-hover-border)';
          e.currentTarget.style.backgroundColor = 'var(--lang-trigger-hover-bg)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.backgroundColor = 'var(--lang-trigger-bg)';
          }
        }}
      >
        <img
          src={`https://flagcdn.com/w40/${currentLanguage.flagCode}.png`}
          width="18"
          height="13"
          alt={currentLanguage.label}
          style={{ borderRadius: '2px', objectFit: 'cover' }}
        />
        <span>{currentLanguage.label}</span>
        <ChevronDown size={14} style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div
          className="language-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: 'var(--lang-menu-bg)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--lang-menu-border)',
            borderRadius: '8px',
            boxShadow: 'var(--modal-shadow)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            padding: '4px',
            width: '160px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {languages.map((lang) => {
            const isSelected = lang.code === currentLocale;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  background: isSelected ? 'var(--lang-menu-item-selected-bg)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: isSelected ? 'var(--menu-item-hover-text)' : 'var(--text-muted)',
                  fontSize: '0.80rem',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--menu-item-hover-bg)';
                  e.currentTarget.style.color = 'var(--menu-item-hover-text)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isSelected ? 'var(--lang-menu-item-selected-bg)' : 'transparent';
                  e.currentTarget.style.color = isSelected ? 'var(--menu-item-hover-text)' : 'var(--text-muted)';
                }}
              >
                <img
                  src={`https://flagcdn.com/w40/${lang.flagCode}.png`}
                  width="18"
                  height="13"
                  alt={lang.label}
                  style={{ borderRadius: '2px', objectFit: 'cover' }}
                />
                <span>{lang.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
