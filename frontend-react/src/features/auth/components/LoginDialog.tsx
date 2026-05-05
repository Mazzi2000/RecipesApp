import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLogin } from '@/features/auth/api/useLogin';
import { loginFormSchema, type LoginFormValues } from '@/features/auth/schemas/login.schema';

export function LoginDialog() {
  const { t } = useTranslation();
  const { loginOpen, closeLogin } = useAuth();
  const login = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { username: '', password: '' },
  });

  useEffect(() => {
    if (!loginOpen) {
      form.reset();
      login.reset();
    }
    // form and login are intentionally excluded: both produce new object refs on every render.
    // This effect should only fire when the dialog opens/closes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginOpen]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
      closeLogin();
    } catch {
      // error rendered below from mutation state
    }
  });

  return (
    <Dialog open={loginOpen} onOpenChange={(open) => (open ? null : closeLogin())}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('auth.login', { defaultValue: 'Log in' })}</DialogTitle>
          <DialogDescription>
            {t('auth.loginDescription', { defaultValue: 'Enter your credentials to continue.' })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">{t('auth.username', { defaultValue: 'Username' })}</Label>
            <Input
              id="username"
              autoComplete="username"
              autoFocus
              {...form.register('username')}
            />
            {form.formState.errors.username && (
              <p className="text-xs text-destructive">
                {t(form.formState.errors.username.message ?? '', {
                  defaultValue: 'Username required',
                })}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.password', { defaultValue: 'Password' })}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...form.register('password')}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">
                {t(form.formState.errors.password.message ?? '', {
                  defaultValue: 'Password required',
                })}
              </p>
            )}
          </div>

          {login.isError && (
            <p className="text-sm text-destructive">
              {login.error instanceof Error
                ? login.error.message
                : t('errors.loginFailed', { defaultValue: 'Login failed' })}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={closeLogin}>
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button type="submit" disabled={login.isPending}>
              {login.isPending
                ? t('common.loading', { defaultValue: 'Loading...' })
                : t('auth.signIn', { defaultValue: 'Sign in' })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
