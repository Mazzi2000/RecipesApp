import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { CATEGORIES, type Category } from '@/lib/api/schemas';
import { cn } from '@/lib/utils/cn';

interface CategoryFiltersProps {
  value: Category | null;
  onChange: (value: Category | null) => void;
}

export function CategoryFilters({ value, onChange }: CategoryFiltersProps) {
  const { t } = useTranslation();
  const items: { key: Category | null; label: string }[] = [
    { key: null, label: t('categories.all') },
    ...CATEGORIES.map((c) => ({ key: c, label: t(`categories.${c}`) })),
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = value === item.key;
        return (
          <Button
            key={item.key ?? 'all'}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(item.key)}
            className={cn(!isActive && 'border-border bg-card hover:bg-accent')}
          >
            {item.label}
          </Button>
        );
      })}
    </div>
  );
}
