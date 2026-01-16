import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'pl', label: 'PL', flag: '🇵🇱' },
];

interface LanguageSelectorProps {
  variant?: 'default' | 'compact';
  className?: string;
}

const LanguageSelector = ({ variant = 'default', className }: LanguageSelectorProps) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.split('-')[0] || 'fr';

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={cn(
              'px-2 py-1 text-xs font-semibold rounded transition-colors',
              currentLang === lang.code
                ? 'bg-primary-foreground/20'
                : 'hover:bg-primary-foreground/20'
            )}
            aria-label={`Switch to ${lang.label}`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all',
            currentLang === lang.code
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80 text-foreground'
          )}
          aria-label={`Switch to ${lang.label}`}
        >
          <span>{lang.flag}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
