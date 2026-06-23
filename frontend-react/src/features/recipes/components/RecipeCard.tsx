import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { AddToPlannerDialog } from '@/features/planner/components/AddToPlannerDialog';
import { formatNumber } from '@/lib/utils/format';
import type { Recipe } from '@/lib/api/schemas';

interface RecipeCardProps {
  recipe: Recipe;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggle?: (id: number) => void;
}

export function RecipeCard({ recipe, isSelectMode, isSelected, onToggle }: RecipeCardProps) {
  const { t } = useTranslation();
  const location = useLocation();

  const linkState = {
    from: location.pathname + location.search,
    scrollY: typeof window !== 'undefined' ? window.scrollY : 0,
  };

  const cardContent = (
    <>
      <div className="relative aspect-video bg-muted">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <span className="text-sm">{t('app.title')}</span>
          </div>
        )}
      </div>
      <CardContent className="space-y-1 p-4">
        <p className="line-clamp-2 font-medium leading-tight">{recipe.name}</p>
        {recipe.calories_per_serving != null ? (
          <p className="text-xs text-muted-foreground">
            {formatNumber(recipe.calories_per_serving)} {t('nutrition.kcal')}
            {recipe.protein_per_serving != null && (
              <>
                {' · '}
                {formatNumber(recipe.protein_per_serving)}g {t('nutrition.protein')}
              </>
            )}
            {recipe.prep_time_minutes != null && (
              <>
                {' · '}
                {recipe.prep_time_minutes} {t('addRecipeForm.minutes')}
              </>
            )}
          </p>
        ) : null}
      </CardContent>
    </>
  );

  if (isSelectMode) {
    return (
      <Card
        className={`group relative cursor-pointer overflow-hidden transition ${isSelected ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`}
        onClick={() => onToggle?.(recipe.id)}
      >
        <div
          className={`absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-white bg-black/40'}`}
        >
          {isSelected && <Check className="h-3.5 w-3.5" />}
        </div>
        {cardContent}
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden transition hover:border-primary/50">
      <Link
        to={`/recipes/${recipe.id}`}
        state={linkState}
        className="block"
        aria-label={recipe.name}
      >
        {cardContent}
      </Link>
      <AddToPlannerDialog recipeId={recipe.id} recipeName={recipe.name} className="absolute left-2 top-2" />
      <FavoriteButton recipeId={recipe.id} className="absolute right-2 top-2" />
    </Card>
  );
}
