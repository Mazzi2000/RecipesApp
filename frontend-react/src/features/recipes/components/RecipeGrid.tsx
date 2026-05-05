import { RecipeCard } from './RecipeCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Recipe } from '@/lib/api/schemas';

interface RecipeGridProps {
  recipes: Recipe[];
  isLoading?: boolean;
}

export function RecipeGrid({ recipes, isLoading }: RecipeGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5] w-full" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {recipes.map((r) => (
        <RecipeCard key={r.id} recipe={r} />
      ))}
    </div>
  );
}
