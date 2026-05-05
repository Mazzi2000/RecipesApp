import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/lib/utils/format';

interface NutritionPanelProps {
  calories?: number | null;
  protein?: number | null;
  fat?: number | null;
  carbs?: number | null;
}

export function NutritionPanel({ calories, protein, fat, carbs }: NutritionPanelProps) {
  const { t } = useTranslation();
  const items = [
    { label: t('nutrition.kcal'), value: calories },
    { label: `${t('nutrition.protein')} (g)`, value: protein },
    { label: `${t('nutrition.fat')} (g)`, value: fat },
    { label: `${t('nutrition.carbs')} (g)`, value: carbs },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-md border border-border bg-card p-3 text-center"
        >
          <p className="text-xs uppercase text-muted-foreground">{item.label}</p>
          <p className="text-lg font-semibold">{formatNumber(item.value)}</p>
        </div>
      ))}
    </div>
  );
}
