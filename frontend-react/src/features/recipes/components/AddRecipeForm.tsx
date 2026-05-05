import { useFieldArray, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES, type CreateRecipeInput, type RecipeDetail } from '@/lib/api/schemas';

const optionalNumber = z
  .union([z.string(), z.number()])
  .transform((v) => (v === '' || v == null ? 0 : Number(v)))
  .pipe(z.number().nonnegative());

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  image_url: z.string().optional(),
  category: z.enum(['', ...CATEGORIES] as ['' | (typeof CATEGORIES)[number], ...('' | (typeof CATEGORIES)[number])[]]).default(''),
  prep_time_minutes: optionalNumber,
  calories_per_serving: optionalNumber,
  protein_per_serving: optionalNumber,
  fat_per_serving: optionalNumber,
  carbs_per_serving: optionalNumber,
  servings: optionalNumber,
  notes: z.string().optional(),
  instructionsText: z.string().optional(),
  tagsText: z.string().optional(),
  ingredients: z
    .array(
      z.object({
        name: z.string(),
        amount: z.union([z.string(), z.number()]).optional(),
        unit: z.string().optional(),
      }),
    )
    .default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface AddRecipeFormProps {
  onSave: (values: CreateRecipeInput) => Promise<void>;
  isSaving?: boolean;
  onSuccess?: () => void;
  initialValues?: Partial<RecipeDetail>;
}

function buildDefaultValues(initial?: Partial<RecipeDetail>): FormValues {
  if (!initial) {
    return {
      name: '',
      description: '',
      image_url: '',
      category: '',
      prep_time_minutes: 0,
      calories_per_serving: 0,
      protein_per_serving: 0,
      fat_per_serving: 0,
      carbs_per_serving: 0,
      servings: 1,
      notes: '',
      instructionsText: '',
      tagsText: '',
      ingredients: [{ name: '', amount: '', unit: '' }],
    };
  }
  return {
    name: initial.name ?? '',
    description: initial.description ?? '',
    image_url: initial.image_url ?? '',
    category: (initial.category ?? '') as FormValues['category'],
    prep_time_minutes: initial.prep_time_minutes ?? 0,
    calories_per_serving: initial.calories_per_serving ?? 0,
    protein_per_serving: initial.protein_per_serving ?? 0,
    fat_per_serving: initial.fat_per_serving ?? 0,
    carbs_per_serving: initial.carbs_per_serving ?? 0,
    servings: initial.servings ?? 1,
    notes: initial.notes ?? '',
    instructionsText: (initial.instructions ?? []).join('\n'),
    tagsText: (initial.tags ?? []).join(', '),
    ingredients:
      initial.ingredients && initial.ingredients.length > 0
        ? initial.ingredients.map((i) => ({
            name: i.name,
            amount: i.amount != null ? String(i.amount) : '',
            unit: i.unit ?? '',
          }))
        : [{ name: '', amount: '', unit: '' }],
  };
}

export function AddRecipeForm({ onSave, isSaving = false, onSuccess, initialValues }: AddRecipeFormProps) {
  const { t } = useTranslation();
  const isEditMode = initialValues != null;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: buildDefaultValues(initialValues),
  });

  const ingredientsField = useFieldArray({ control: form.control, name: 'ingredients' });

  const onSubmit = form.handleSubmit(async (values) => {
    const instructions =
      values.instructionsText
        ?.split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean) ?? [];
    const tags =
      values.tagsText
        ?.split(',')
        .map((s: string) => s.trim())
        .filter(Boolean) ?? [];

    await onSave({
      name: values.name,
      description: values.description || undefined,
      image_url: values.image_url || initialValues?.image_url || undefined,
      // pass through fields not in the form so they are never wiped on edit
      source_url: initialValues?.source_url ?? undefined,
      total_time_minutes: initialValues?.total_time_minutes ?? undefined,
      difficulty: initialValues?.difficulty ?? undefined,
      category: (values.category || null) as never,
      prep_time_minutes: values.prep_time_minutes,
      servings: Math.max(1, values.servings),
      calories_per_serving: values.calories_per_serving,
      protein_per_serving: values.protein_per_serving,
      fat_per_serving: values.fat_per_serving,
      carbs_per_serving: values.carbs_per_serving,
      sodium_per_serving: initialValues?.sodium_per_serving ?? 0,
      fiber_per_serving: initialValues?.fiber_per_serving ?? 0,
      notes: values.notes ?? '',
      instructions,
      tags,
      recipe_categories: tags,
      ingredients: values.ingredients
        .filter((ing: { name: string }) => ing.name.trim().length > 0)
        .map((ing: { name: string; amount?: string | number; unit?: string }) => ({
          name: ing.name.trim(),
          amount: ing.amount === '' || ing.amount == null ? undefined : Number(ing.amount),
          unit: ing.unit?.trim() || undefined,
        })),
    });

    if (!isEditMode) form.reset();
    onSuccess?.();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">{t('addRecipeForm.recipeName')}</Label>
        <Input
          id="name"
          placeholder={t('addRecipeForm.recipeNamePlaceholder')}
          {...form.register('name')}
        />
        {form.formState.errors.name && (
          <p className="text-xs text-destructive">{t('addRecipeForm.nameRequired')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('addRecipeForm.description')}</Label>
        <Textarea
          id="description"
          rows={2}
          placeholder={t('addRecipeForm.descriptionPlaceholder')}
          {...form.register('description')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">{t('addRecipeForm.imageUrl')}</Label>
        <Input
          id="image_url"
          type="text"
          placeholder="https://..."
          {...form.register('image_url')}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t('addRecipeForm.category')}</Label>
          <Select
            value={form.watch('category')}
            onValueChange={(v) => form.setValue('category', v as FormValues['category'])}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('addRecipeForm.chooseCategory')} />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {t(`categories.${c}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prep">{t('addRecipeForm.prepTime')}</Label>
          <Input
            id="prep"
            type="number"
            min={0}
            placeholder={t('addRecipeForm.prepTimePlaceholder')}
            {...form.register('prep_time_minutes')}
          />
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">{t('addRecipeForm.nutritionPerServing')}</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="space-y-1">
            <Label htmlFor="cal" className="text-xs">
              {t('addRecipeForm.calories')}
            </Label>
            <Input id="cal" type="number" min={0} {...form.register('calories_per_serving')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="prot" className="text-xs">
              {t('addRecipeForm.proteinG')}
            </Label>
            <Input id="prot" type="number" min={0} {...form.register('protein_per_serving')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="fat" className="text-xs">
              {t('addRecipeForm.fatG')}
            </Label>
            <Input id="fat" type="number" min={0} {...form.register('fat_per_serving')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="carbs" className="text-xs">
              {t('addRecipeForm.carbsG')}
            </Label>
            <Input id="carbs" type="number" min={0} {...form.register('carbs_per_serving')} />
          </div>
        </div>
      </fieldset>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>{t('addRecipeForm.ingredients')}</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => ingredientsField.append({ name: '', amount: '', unit: '' })}
          >
            <Plus className="h-4 w-4" />
            {t('addRecipeForm.addIngredient')}
          </Button>
        </div>
        <div className="space-y-2">
          {ingredientsField.fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input
                className="flex-1"
                placeholder={t('addRecipeForm.ingredientPlaceholder')}
                {...form.register(`ingredients.${index}.name` as const)}
              />
              <Input
                type="number"
                step="any"
                min={0}
                className="w-24"
                placeholder={t('addRecipeForm.amountPlaceholder')}
                {...form.register(`ingredients.${index}.amount` as const)}
              />
              <Input
                className="w-20"
                placeholder={t('units.g')}
                {...form.register(`ingredients.${index}.unit` as const)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => ingredientsField.remove(index)}
                aria-label="Remove ingredient"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">{t('addRecipeForm.instructions')}</Label>
        <Textarea
          id="instructions"
          rows={5}
          placeholder={t('addRecipeForm.instructionsPlaceholder')}
          {...form.register('instructionsText')}
        />
        <p className="text-xs text-muted-foreground">{t('addRecipeForm.instructionsHint')}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t('addRecipeForm.notes')}</Label>
        <Textarea
          id="notes"
          rows={2}
          placeholder={t('addRecipeForm.notesPlaceholder')}
          {...form.register('notes')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">{t('addRecipeForm.tags')}</Label>
        <Input id="tags" placeholder="dessert, vegan" {...form.register('tagsText')} />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving
            ? t(isEditMode ? 'addRecipeForm.updatingRecipe' : 'addRecipeForm.savingRecipe')
            : t(isEditMode ? 'addRecipeForm.updateRecipe' : 'addRecipeForm.saveRecipe')}
        </Button>
      </div>
    </form>
  );
}
