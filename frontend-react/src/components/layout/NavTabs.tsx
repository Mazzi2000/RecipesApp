import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/features/auth/context/AuthContext';

export function NavTabs() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const tabs = [
    { to: '/', label: t('nav.recipes'), end: true },
    ...(isAuthenticated
      ? [
          { to: '/favorites', label: t('nav.favorites'), end: false },
          { to: '/planner', label: t('nav.mealPlanner'), end: false },
        ]
      : []),
  ];

  return (
    <nav className="border-b border-border">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                'inline-flex items-center px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
