import { z } from 'zod';

export const CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export type Category = (typeof CATEGORIES)[number];
export const CategorySchema = z.enum(CATEGORIES);

/** Backend stores instructions/tags as JSON-stringified arrays. */
const JsonStringArray = z
  .union([z.string(), z.array(z.string()), z.null()])
  .transform<string[]>((v) => {
    if (v == null) return [];
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') {
      try {
        const parsed = JSON.parse(v);
        return Array.isArray(parsed) ? parsed.map(String) : [];
      } catch {
        return v.length > 0 ? [v] : [];
      }
    }
    return [];
  });

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const AuthMeSchema = z.union([
  z.object({ authenticated: z.literal(true), user: UserSchema }),
  z.object({ authenticated: z.literal(false) }),
]);
export type AuthMe = z.infer<typeof AuthMeSchema>;

export const LoginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = z.object({
  message: z.string(),
  user: UserSchema,
});

export const IngredientSchema = z.object({
  id: z.number().optional(),
  recipe_id: z.number().optional(),
  name: z.string(),
  amount: z.number().nullable().optional(),
  unit: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  original_text: z.string().nullable().optional(),
});
export type Ingredient = z.infer<typeof IngredientSchema>;

/** Recipe row as returned in list endpoint (without joined data). */
export const RecipeSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  category: CategorySchema.nullable().optional(),
  image_url: z.string().nullable().optional(),
  source_url: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  difficulty: z.string().nullable().optional(),
  prep_time_minutes: z.number().nullable().optional(),
  total_time_minutes: z.number().nullable().optional(),
  servings: z.number().nullable().optional(),
  instructions: JsonStringArray.optional(),
  notes: z.string().nullable().optional(),
  tags: JsonStringArray.optional(),
  calories_per_serving: z.number().nullable().optional(),
  protein_per_serving: z.number().nullable().optional(),
  fat_per_serving: z.number().nullable().optional(),
  carbs_per_serving: z.number().nullable().optional(),
  sodium_per_serving: z.number().nullable().optional(),
  fiber_per_serving: z.number().nullable().optional(),
  rating: z.number().nullable().optional(),
  rating_count: z.number().nullable().optional(),
  created_at: z.string().nullable().optional(),
});
export type Recipe = z.infer<typeof RecipeSchema>;

export const RecipeDetailSchema = RecipeSchema.extend({
  ingredients: z.array(IngredientSchema).default([]),
  recipe_categories: z.array(z.string()).default([]),
});
export type RecipeDetail = z.infer<typeof RecipeDetailSchema>;

export const RecipeListResponseSchema = z.object({
  recipes: z.array(RecipeSchema),
  page: z.number(),
  per_page: z.number(),
  total: z.number(),
  total_pages: z.number(),
});
export type RecipeListResponse = z.infer<typeof RecipeListResponseSchema>;

export const RecipeTagsSchema = z.array(z.string());
/** /api/statistics returns a bare number representing total recipe count. */
export const StatisticsSchema = z.number();

export const MealItemSchema = z.object({
  id: z.number(),
  meal_type: z.string(),
  recipe_id: z.number(),
  recipe_name: z.string(),
  servings: z.number().nullable(),
  calories_per_serving: z.number().nullable().optional(),
  protein_per_serving: z.number().nullable().optional(),
  fat_per_serving: z.number().nullable().optional(),
  carbs_per_serving: z.number().nullable().optional(),
});
export type MealItem = z.infer<typeof MealItemSchema>;

export const MealTotalsSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  fat: z.number(),
  carbs: z.number(),
});
export type MealTotals = z.infer<typeof MealTotalsSchema>;

export const MealPlanSchema = z.object({
  date: z.string(),
  meals: z.array(MealItemSchema),
  totals: MealTotalsSchema,
});
export type MealPlan = z.infer<typeof MealPlanSchema>;

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const CreateRecipeInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: CategorySchema.nullable().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  source_url: z.string().url().optional().or(z.literal('')),
  difficulty: z.string().optional(),
  prep_time_minutes: z.number().int().nonnegative().optional(),
  total_time_minutes: z.number().int().nonnegative().optional(),
  servings: z.number().int().positive().default(1),
  instructions: z.array(z.string()).default([]),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  calories_per_serving: z.number().nonnegative().default(0),
  protein_per_serving: z.number().nonnegative().default(0),
  fat_per_serving: z.number().nonnegative().default(0),
  carbs_per_serving: z.number().nonnegative().default(0),
  sodium_per_serving: z.number().nonnegative().default(0),
  fiber_per_serving: z.number().nonnegative().default(0),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1),
        amount: z.number().nonnegative().optional(),
        unit: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .default([]),
  recipe_categories: z.array(z.string()).default([]),
});
export type CreateRecipeInput = z.infer<typeof CreateRecipeInputSchema>;
