import { RecipeCard } from './RecipeCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Recipe } from '@/lib/api/schemas';

interface RecipeGridProps {
  recipes: Recipe[];
  isLoading?: boolean;
  isSelectMode?: boolean;
  selectedIds?: Set<number>;
  onToggle?: (id: number) => void;
}

export function RecipeGrid({ recipes, isLoading, isSelectMode, selectedIds, onToggle }: RecipeGridProps) {
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
        <RecipeCard
          key={r.id}
          recipe={r}
          isSelectMode={isSelectMode}
          isSelected={selectedIds?.has(r.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
