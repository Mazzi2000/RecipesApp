import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';
import { cn } from '@/lib/utils/cn';

const LABELS: Record<SupportedLanguage, string> = {
  en: 'EN',
  pl: 'PL',
};

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = (i18n.resolvedLanguage ?? i18n.language).slice(0, 2) as SupportedLanguage;

  return (
    <div className="flex gap-1" role="group" aria-label="Language">
      {SUPPORTED_LANGUAGES.map((lng) => (
        <Button
          key={lng}
          variant="ghost"
          size="sm"
          aria-pressed={current === lng}
          onClick={() => void i18n.changeLanguage(lng)}
          className={cn(
            'px-2 text-xs',
            current === lng ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
          )}
        >
          {LABELS[lng]}
        </Button>
      ))}
    </div>
  );
}
