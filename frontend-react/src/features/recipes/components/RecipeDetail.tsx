import { useTranslation } from 'react-i18next';
import { Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { DeleteRecipeButton } from './DeleteRecipeButton';
import { EditRecipeDialog } from './EditRecipeDialog';
import { IngredientList } from './IngredientList';
import { NutritionPanel } from './NutritionPanel';
import type { RecipeDetail as RecipeDetailType } from '@/lib/api/schemas';

interface RecipeDetailProps {
  recipe: RecipeDetailType;
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const { t } = useTranslation();

  return (
    <article className="space-y-6">
      <Card className="overflow-hidden">
        {recipe.image_url && (
          <div className="relative aspect-[16/9] bg-muted">
            <img
              src={recipe.image_url}
              alt={recipe.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <FavoriteButton recipeId={recipe.id} className="absolute right-3 top-3 h-10 w-10" />
          </div>
        )}
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold leading-tight">{recipe.name}</h1>
              {recipe.description && (
                <p className="mt-1 text-sm text-muted-foreground">{recipe.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <EditRecipeDialog
                recipe={recipe}
                trigger={
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4" />
                    {t('recipes.edit')}
                  </Button>
                }
              />
              <DeleteRecipeButton recipeId={recipe.id} recipeName={recipe.name} />
            </div>
          </div>

          {recipe.recipe_categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {recipe.recipe_categories.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t('recipeDetail.nutritionPerServing')}</h2>
        <NutritionPanel
          calories={recipe.calories_per_serving}
          protein={recipe.protein_per_serving}
          fat={recipe.fat_per_serving}
          carbs={recipe.carbs_per_serving}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t('recipeDetail.ingredients')}</h2>
        <Card>
          <CardContent className="p-4">
            <IngredientList ingredients={recipe.ingredients} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t('recipeDetail.instructions')}</h2>
        <Card>
          <CardContent className="space-y-2 p-4 text-sm">
            {recipe.instructions && recipe.instructions.length > 0 ? (
              <ol className="list-inside list-decimal space-y-2">
                {recipe.instructions.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            ) : (
              <p className="text-muted-foreground">{t('recipeDetail.noInstructions')}</p>
            )}
            {recipe.notes && (
              <p className="border-t border-border pt-3 text-muted-foreground">{recipe.notes}</p>
            )}
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
