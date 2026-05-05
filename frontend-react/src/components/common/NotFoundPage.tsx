import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-semibold">404</h1>
      <p className="text-muted-foreground">
        {t('notFound.message', { defaultValue: 'Page not found.' })}
      </p>
      <Button asChild>
        <Link to="/">{t('notFound.backHome', { defaultValue: 'Back to recipes' })}</Link>
      </Button>
    </div>
  );
}
