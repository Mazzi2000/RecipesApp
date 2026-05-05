import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { AddToPlannerDialog } from '@/features/planner/components/AddToPlannerDialog';
import { formatNumber } from '@/lib/utils/format';
import type { Recipe } from '@/lib/api/schemas';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const { t } = useTranslation();
  const location = useLocation();

  const linkState = {
    from: location.pathname + location.search,
    scrollY: typeof window !== 'undefined' ? window.scrollY : 0,
  };

  return (
    <Card className="group relative overflow-hidden transition hover:border-primary/50">
      <Link
        to={`/recipes/${recipe.id}`}
        state={linkState}
        className="block"
        aria-label={recipe.name}
      >
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
            </p>
          ) : null}
        </CardContent>
      </Link>
      <AddToPlannerDialog recipeId={recipe.id} recipeName={recipe.name} className="absolute left-2 top-2" />
      <FavoriteButton recipeId={recipe.id} className="absolute right-2 top-2" />
    </Card>
  );
}
