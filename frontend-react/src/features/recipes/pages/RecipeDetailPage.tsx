import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { useRecipe } from '@/features/recipes/api/useRecipe';
import { RecipeDetail } from '@/features/recipes/components/RecipeDetail';

export function RecipeDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const recipeId = id ? Number(id) : undefined;
  const navigate = useNavigate();
  const location = useLocation();

  const recipeQuery = useRecipe(recipeId);

  const back = () => {
    const state = location.state as { from?: string } | null;
    if (state?.from) {
      navigate(state.from, { state: { scrollY: (location.state as { scrollY?: number })?.scrollY } });
    } else {
      navigate('/');
    }
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={back}>
        <ArrowLeft className="h-4 w-4" />
        {t('recipes.backToList')}
      </Button>

      {recipeQuery.isLoading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {recipeQuery.isError && (
        <EmptyState
          title={t('recipes.errorLoading')}
          description={recipeQuery.error instanceof Error ? recipeQuery.error.message : undefined}
        />
      )}

      {recipeQuery.data && <RecipeDetail recipe={recipeQuery.data} />}
    </div>
  );
}
