import type { Ingredient } from '@/lib/api/schemas';

interface IngredientListProps {
  ingredients: Ingredient[];
  servingsMultiplier?: number;
}

function scaleNotes(notes: string, multiplier: number): string {
  // Normalize comma decimal separator: "0,5 g" or "0, 5 g" → "0.5 g"
  const normalized = notes.replace(/(\d),\s*(\d)/g, '$1.$2');
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (!match) return notes;
  const scaled = parseFloat((parseFloat(match[1]) * multiplier).toFixed(2));
  return match[2] ? `${scaled}${match[2]}`.trim() : `${scaled}`;
}

export function IngredientList({ ingredients, servingsMultiplier = 1 }: IngredientListProps) {
  if (ingredients.length === 0) return null;
  return (
    <ul className="overflow-hidden rounded-lg border border-border text-base">
      {ingredients.map((ing, idx) => {
        const displayAmount = ing.amount != null
          ? `${parseFloat((ing.amount * servingsMultiplier).toFixed(2))} ${ing.unit ?? ''}`.trim()
          : (ing.original_text ?? '');
        const displayNotes = ing.notes != null ? scaleNotes(ing.notes, servingsMultiplier) : null;
        return (
          <li
            key={ing.id ?? idx}
            className="flex items-baseline justify-between gap-3 px-4 py-2.5 odd:bg-muted/60 border-b border-border last:border-b-0"
          >
            <span className="font-medium">
              {ing.name} {displayNotes != null && (
                <span className="text-muted-foreground">({displayNotes})</span>
              )}
            </span>
            <span className="font-semibold text-primary whitespace-nowrap">{displayAmount}</span>
          </li>
        );
      })}
    </ul>
  );
}
