import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/context/AuthContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, openLogin } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openLogin();
    }
  }, [isLoading, isAuthenticated, openLogin]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted-foreground">
          {t('auth.required', { defaultValue: 'Sign in to continue.' })}
        </p>
        <Button onClick={openLogin}>{t('auth.login', { defaultValue: 'Log in' })}</Button>
      </div>
    );
  }

  return <>{children}</>;
}
