import type { Ingredient } from '@/lib/api/schemas';

interface IngredientListProps {
  ingredients: Ingredient[];
}

export function IngredientList({ ingredients }: IngredientListProps) {
  if (ingredients.length === 0) return null;
  return (
    <ul className="space-y-1.5 text-sm">
      {ingredients.map((ing, idx) => (
        <li key={ing.id ?? idx} className="flex items-baseline justify-between gap-3">
          <span>{ing.name}</span>
          <span className="text-muted-foreground">
            {ing.amount != null ? `${ing.amount} ${ing.unit ?? ''}`.trim() : (ing.original_text ?? '')}
          </span>
        </li>
      ))}
    </ul>
  );
}
