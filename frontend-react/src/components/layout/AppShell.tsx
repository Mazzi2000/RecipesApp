import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Header } from './Header';
import { NavTabs } from './NavTabs';
import { LoginDialog } from '@/features/auth/components/LoginDialog';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export function AppShell() {
  return (
    <div className="min-h-full bg-background text-foreground">
      <Header />
      <NavTabs />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <LoginDialog />
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}
