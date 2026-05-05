import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLogout } from '@/features/auth/api/useLogout';

export function Header() {
  const { t } = useTranslation();
  const { isAuthenticated, user, openLogin } = useAuth();
  const logout = useLogout();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          {t('app.title')}
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {t('auth.loggedInAs')} <strong className="text-foreground">{user?.username}</strong>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t('auth.logout')}</span>
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={openLogin}>
              <LogIn className="h-4 w-4" />
              <span>{t('auth.login')}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
