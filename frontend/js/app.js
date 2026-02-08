import {
    fetchRecipes,
    fetchRecipe,
    addMealToPlan,
    removeMeal,
    removeRecipe,
    getStatistics,
    fetchMealPlan,
    updateMealServings,
    createRecipe
} from './api.js';
import modal  from './modal.js';
import { t, getLanguage, setLanguage, onLanguageChange } from './i18n.js';

const CATEGORIES = [
    { value: null, labelKey: 'categories.all' },
    { value: 'breakfast', labelKey: 'categories.breakfast', emoji: '🌅' },
    { value: 'lunch', labelKey: 'categories.lunch', emoji: '🍽️' },
    { value: 'dinner', labelKey: 'categories.dinner', emoji: '🌙' },
    { value: 'snack', labelKey: 'categories.snack', emoji: '🥨' }
];

// State
let currentDate = new Date();
let currentCategory = null;
let recipesCache = null;

// DOM REFERENCES
const recipesListEl = document.getElementById('recipes-list');
const recipeDetailEl = document.getElementById('recipe-detail');
const filtersEl = document.getElementById('filters');

// RENDER FUNCTIONS

function getCategoryLabel(categoryValue) {
    const cat = CATEGORIES.find(c => c.value === categoryValue);
    if (cat) {
        return cat.emoji ? `${cat.emoji} ${t(cat.labelKey)}` : t(cat.labelKey);
    }
    return categoryValue;
}

function getCategoryLabelNoEmoji(categoryValue) {
    const cat = CATEGORIES.find(c => c.value === categoryValue);
    if (cat) {
        return t(cat.labelKey);
    }
    return categoryValue;
}

function createRecipeCard(recipe) {
    return `
        <article class ="bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" data-recipe-id="${recipe.id}">

            <h3 class="text-lg font-semibold mb-2 text-teal-500">${recipe.name}</h3>

            <div class="flex gap-2 mb-3">
                <span class="text-xs bg-blue-600 px-2 py-1 rounded">${getCategoryLabelNoEmoji(recipe.category)}</span>
                <span class="text-xs bg-gray-700 px-2 py-1 rounded">⏱️ ${recipe.prep_time_minutes || '?'} min</span>
            </div>

            <div class="text-sm text-gray-400">
                <span>🔥 ${recipe.calories_per_serving} kcal </span>
                <span>💪 ${recipe.protein_per_serving}g ${t('recipes.protein')} </span>
            </div>
        </article>
    `;
}

/**
 * @param {Array} recipes
 */
function renderRecipesList(recipes) {
    if (recipes.length === 0) {
        recipesListEl.innerHTML = `
            <p class="text-gray-500 col-span-full text-center py-8">
                ${t('recipes.noRecipes')}
            </p>
        `;
        return;
    }

    const html = recipes.map(recipe => createRecipeCard(recipe)).join('');

    recipesListEl.innerHTML = html;

    addRecipeCardListeners();

}

/**
 * @param {Object} recipe
 */
async function renderRecipeDetail(recipe) {
    const detailHTML = createRecipeDetailHTML(recipe);

    recipeDetailEl.innerHTML = `
        <div class="max-w-2xl mx-auto">
            <div class="flex justify-between">
                <button data-action="back-to-list" class="mb-4 text-xl text-blue-400 cursor-pointer hover:text-blue-300">
                    ← ${t('recipes.backToList')}
                </button>
                <button
                    data-action="remove-recipe"
                    data-recipe-id="${recipe.id}"
                    class="rounded-md bg-pink-500 px-2.5 py-1.5 text-sm font-semibold text-white hover:bg-pink-600 transition-colors cursor-pointer">
                        ${t('recipes.delete')} 🗑️
                </button>
            </div>

            <h2 class="text-2xl font-bold text-orange-300 mb-4">${recipe.name}</h2>

            ${detailHTML}
        </div>
    `;
}

async function showRecipeDetailInModal(recipeId) {
    try {
        // Show loading modal
        modal.open({
            title: t('recipes.loadingRecipe'),
            body: '<div class="p-8 text-center"><div class="text-4xl mb-4">⏳</div></div>'
        });

        // Fetch recipe
        const recipe = await fetchRecipe(recipeId);

        // Create recipe detail HTML (reuse your existing template)
        const bodyHTML = createRecipeDetailHTML(recipe);

        // Show in modal
        modal.open({
            title: recipe.name,
            body: bodyHTML,
            onClose: () => {
                console.log('Recipe modal closed');
            }
        });

    } catch (error) {
        modal.close();
        alert(t('recipes.errorLoading') + ': ' + error.message);
    }
}

/**
 * Create recipe detail HTML (reusable for both page and modal)
 * @param {Object} recipe - Recipe object with ingredients
 * @returns {string} HTML string
 */
function createRecipeDetailHTML(recipe) {
    const ingredientsList = recipe.ingredients.map(
        ing => {
            const amount = ing.amount > 0 ? `${ing.amount} ${ing.unit}` : ing.unit;
            const notes = ing.notes ? ` (${ing.notes})` : '';
            return `<li class="py-1">${amount} ${ing.name}${notes}</li>`;
        }
    ).join('');

    let instructions = [];
    try {
        instructions = JSON.parse(recipe.instructions || '[]');
    } catch (e) {
        console.error('Invalid instructions JSON:', e);
    }

    const instructionsList = instructions.map((step, index) => `
        <li class="py-2">
            <span class="font-bold text-blue-400">${index + 1}.</span> ${step}
        </li>
    `).join('');

    return `
        <div class="grid grid-cols-4 gap-4 mb-6 text-center">
            <div class="bg-gray-800 p-3 rounded">
                <div class="text-2xl">🔥</div>
                <div class="font-bold">${recipe.calories_per_serving}</div>
                <div class="text-xs text-gray-400">kcal</div>
            </div>
            <div class="bg-gray-800 p-3 rounded">
                <div class="text-2xl">💪</div>
                <div class="font-bold">${recipe.protein_per_serving}g</div>
                <div class="text-xs text-gray-400">${t('nutrition.protein')}</div>
            </div>
            <div class="bg-gray-800 p-3 rounded">
                <div class="text-2xl">🧈</div>
                <div class="font-bold">${recipe.fat_per_serving}g</div>
                <div class="text-xs text-gray-400">${t('nutrition.fat')}</div>
            </div>
            <div class="bg-gray-800 p-3 rounded">
                <div class="text-2xl">🍞</div>
                <div class="font-bold">${recipe.carbs_per_serving}g</div>
                <div class="text-xs text-gray-400">${t('nutrition.carbs')}</div>
            </div>
        </div>

        <div class="mb-6">
            <h3 class="text-lg font-semibold mb-2 text-blue-400">${t('recipeDetail.ingredients')}</h3>
            <ul class="bg-gray-800 rounded p-4">
                ${ingredientsList}
            </ul>
        </div>

        <div class="mb-6">
            <h3 class="text-lg font-semibold mb-2 text-blue-400">${t('recipeDetail.instructions')}</h3>
            <ol class="bg-gray-800 rounded p-4">
                ${instructionsList || `<li class="text-gray-500">${t('recipeDetail.noInstructions')}</li>`}
            </ol>
        </div>
        <div class="mb-6">
            <h3 class="text-lg font-semibold mb-2 text-blue-400">Notes</h3>
            <p>${recipe.notes}</p>
        </div>
        <div class="mb-6">
            <h3 class="text-lg font-semibold mb-2 text-pink-400 text-center">#${recipe.source}</h3>
        </div>
    `;
}


function renderFilters() {
    const html = CATEGORIES.map(cat => `
        <button class="px-4 py-2 rounded transition-colors
            ${cat.value === currentCategory
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 cursor-pointer'}"
            data-category="${cat.value}">${cat.emoji ? cat.emoji + ' ' : ''}${t(cat.labelKey)}
        </button>
    `).join('');

    filtersEl.innerHTML = html;

    filtersEl.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            filterByCategory(category === 'null' ? null : category);
        });
    });

    // Display statistics
    getStatistics()
        .then(numberOfRecipes => {
            filtersEl.insertAdjacentHTML('beforeend', `
                <span class="ml-auto text-violet-300 font-sans font-semibold">
                    ${t('recipes.recipeCount')}: ${numberOfRecipes}
                </span>
            `);
        })
        .catch(error => {
            console.error('Failed to load statistics:', error);
        });

}

function renderMealPlan(plan) {
    const meals = plan.meals || [];
    const totals = plan.totals || {calories: 0, protein: 0, fat: 0, carbs: 0};

    const mealTypes = [
        { key: 'breakfast', labelKey: 'categories.breakfast', emoji: '🌅' },
        { key: 'lunch', labelKey: 'categories.lunch', emoji: '🍽️' },
        { key: 'dinner', labelKey: 'categories.dinner', emoji: '🌙' },
        { key: 'snack', labelKey: 'categories.snack', emoji: '🥨' }
    ];
    const html = mealTypes.map(type => {
        const mealsOfType = meals.filter(m => m.meal_type === type.key);

        return `
            <div class="bg-gray-800 rounded-lg p-4 mb-4">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="font-semibold">${type.emoji} ${t(type.labelKey)}</h3>
                    <button data-action="add-meal" data-meal-type="${type.key}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
                        +${t('mealPlan.addMeal')}
                    </button>
                </div>
                <div class="">
                    ${mealsOfType.length > 0
                        ? mealsOfType.map(m=> renderMealItem(m)).join('')
                        : `<p class="text-gray-500 text-sm">${t('mealPlan.noMeals')}</p>`
                    }
                </div>
            </div>
            `;
    }).join('');

    document.getElementById('meal-plan').innerHTML = html;

    addMealCardListeners()
    renderDailyTotals(totals);
    updateDateDisplay();
}

function renderMealItem(meal) {
    const totalCalories = Math.round(meal.calories_per_serving * meal.servings);
    return `
        <div class="flex justify-between items-center py-2 border-b border-gray-700">
            <div class="flex-1">
                <span data-recipe-id="${meal.recipe_id}" class="cursor-pointer hover:underline hover:text-blue-500 transition-all duration-200">
                    ${meal.recipe_name}
                </span>
                <span class="text-gray-400 text-sm ml-2">
                    (${totalCalories} kcal)
                </span>
            </div>

            <!-- Servings controls -->
            <div class="flex items-center gap-2 mx-4">
                <button
                    data-action="decrease-servings"
                    data-meal-id="${meal.id}"
                    data-current-servings="${meal.servings}"
                    class="w-8 h-8 rounded bg-gray-700 hover:bg-gray-600 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    ${meal.servings <= 0.5 ? 'disabled' : ''}>
                    -
                </button>
                <span class="w-12 text-center font-semibold">
                    ${meal.servings}
                </span>
                <button
                    data-action="increase-servings"
                    data-meal-id="${meal.id}"
                    data-current-servings="${meal.servings}"
                    class="w-8 h-8 rounded bg-gray-700 hover:bg-gray-600 text-lg font-bold">
                    +
                </button>
            </div>
            <button
                data-action="remove-meal"
                data-meal-id="${meal.id}"
                class="rounded-md bg-pink-500 px-2.5 py-1.5 text-sm font-semibold text-white hover:bg-pink-600 transition-colors">
                    ${t('recipes.delete')} 🗑️
            </button>
        </div>
    `;
}

function renderDailyTotals(totals) {
    document.getElementById('daily-totals').innerHTML = `
        <div class="bg-gray-800 rounded-lg p-4 mt-6">
            <h3 class="font-semibold mb-3">📊 ${t('mealPlan.dailySummary')}</h3>
            <div class="grid grid-cols-4 gap-4 text-center">
                <div>
                    <div class="text-2xl">🔥</div>
                    <div class="font-bold text-xl">${Math.round(totals.calories)}</div>
                    <div class="text-xs text-gray-400">kcal</div>
                </div>
                <div>
                    <div class="text-2xl">💪</div>
                    <div class="font-bold text-xl">${Math.round(totals.protein)}g</div>
                    <div class="text-xs text-gray-400">${t('nutrition.protein')}</div>
                </div>
                <div>
                    <div class="text-2xl">🧈</div>
                    <div class="font-bold text-xl">${Math.round(totals.fat)}g</div>
                    <div class="text-xs text-gray-400">${t('nutrition.fat')}</div>
                </div>
                <div>
                    <div class="text-2xl">🍞</div>
                    <div class="font-bold text-xl">${Math.round(totals.carbs)}g</div>
                    <div class="text-xs text-gray-400">${t('nutrition.carbs')}</div>
                </div>
            </div>
        </div>
    `;
}

// EVENT HANDLERS

function addMealCardListeners() {
    const cards = document.getElementById('meal-plan').querySelectorAll('[data-recipe-id]');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const recipeId = card.dataset.recipeId;
            showRecipeDetailInModal(recipeId);
        });
    });
}

function addRecipeCardListeners(){
    const cards = recipesListEl.querySelectorAll('[data-recipe-id]');

    cards.forEach(card => {
        card.addEventListener('click', () =>{
            const recipeId = card.dataset.recipeId
            showRecipeDetail(recipeId);
        });
    });
}

async function filterByCategory(category) {
    currentCategory = category;

    renderFilters();

    recipesListEl.innerHTML = `<p class="col-span-full text-center">${t('app.loading')}</p>`;

    try {
        const recipes = await fetchRecipes(category);
        renderRecipesList(recipes);
    } catch (error) {
        recipesListEl.innerHTML = `<p class="text-red-500 col-span-full text-center">${t('app.error')}: ${error.message}</p>`;
    }
}

function updateDateDisplay() {
    document.getElementById('current-date').textContent = formatDate(currentDate);
}

// Navigates to a different date
function navigateDate(days) {
    currentDate.setDate(currentDate.getDate() + days);
    updateDateDisplay();
    loadMealPlan();
}

function formatDate(date) {
    // Use local date, not UTC
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function addMealPrompt(mealType) {
    showAddMealModal(mealType);
}

async function handleRemoveRecipe(recipeId) {
    // Get meal name for the modal
    const recipeButton = document.querySelector(`[data-recipe-id="${recipeId}"]`);
    if (!recipeButton) {
        console.error('Recipe not found');
        return;
    }
    const recipeElement = recipeButton.closest('.flex');
    const recipeName = recipeElement?.querySelector('span')?.textContent || 'This recipe';

    // Clean, simple body (no buttons needed!)
    const bodyHTML = `
        <div class="text-center">
            <div class="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-500/10 mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-6 text-red-400">
                    <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">${t('deleteModal.deleteRecipeConfirm')}</h3>
            <p class="text-sm text-gray-400">${recipeName} ${t('deleteModal.recipeWillBeDeleted')}</p>
        </div>
    `;

    modal.open({
        title: t('deleteModal.deleteRecipe'),
        body: bodyHTML,
        confirmText: t('recipes.delete'),
        cancelText: t('buttons.cancel'),
        onConfirm: async () => {
            try {
                modal.container.innerHTML = `
                    <div class="p-8 text-center">
                        <div class="text-4xl mb-4">⏳</div>
                        <p class="text-gray-400">${t('deleteModal.deleting')}</p>
                    </div>
                `;

                await removeRecipe(recipeId);
                modal.close();
                recipesCache = null;
                const recipes = await fetchRecipes(currentCategory)
                renderRecipesList(recipes)
                await showRecipesView();
                showToast('✅ ' + t('toast.recipeDeleted'));
            } catch (error) {
                modal.close();
                alert(t('app.error') + ': ' + error.message);
            }
        }
    });
}

async function handleRemoveMeal(mealId) {
    // Get meal name for the modal
    const mealButton = document.querySelector(`[data-meal-id="${mealId}"]`);
    if (!mealButton) {
        console.error('Meal not found');
        return;
    }
    const mealElement = mealButton.closest('.flex');
    const mealName = mealElement?.querySelector('span')?.textContent || 'This meal';

    // Clean, simple body (no buttons needed!)
    const bodyHTML = `
        <div class="text-center">
            <div class="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-500/10 mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-6 text-red-400">
                    <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">${t('deleteModal.deleteMealConfirm')}</h3>
            <p class="text-sm text-gray-400">${mealName} ${t('deleteModal.mealWillBeDeleted')}</p>
        </div>
    `;

    modal.open({
        title: t('deleteModal.deleteMeal'),
        body: bodyHTML,
        confirmText: t('recipes.delete'),
        cancelText: t('buttons.cancel'),
        onConfirm: async () => {
            try {
                // Show loading
                modal.container.innerHTML = `
                    <div class="p-8 text-center">
                        <div class="text-4xl mb-4">⏳</div>
                        <p class="text-gray-400">${t('deleteModal.deleting')}</p>
                    </div>
                `;

                await removeMeal(mealId);
                modal.close();
                await loadMealPlan();
                showToast('✅ ' + t('toast.mealDeleted'));
            } catch (error) {
                modal.close();
                alert(t('app.error') + ': ' + error.message);
            }
        }
    });
}
// UI STATE MANAGEMENT

/**
 * @param {number} recipeId
 */
async function showRecipeDetail(recipeId){
    try {
        recipeDetailEl.classList.remove('hidden');
        recipeDetailEl.innerHTML = `<p class="text-center">${t('app.loading')}</p>`;

        recipesListEl.classList.add('hidden');
        filtersEl.classList.add('hidden');

        const recipe = await fetchRecipe(recipeId);

        renderRecipeDetail(recipe);
    } catch (error) {
        recipeDetailEl.innerHTML = `
            <p class="text-red-500">${t('app.error')}: ${error.message}</p>
            <button data-action="back-to-list"
                class="mt-4 bg-blue-600 px-4 py-2 rounded">
                <- ${t('buttons.back')}
            </button>
        `;
    }
}

function showRecipesList(){
    recipeDetailEl.classList.add('hidden');

    recipesListEl.classList.remove('hidden');
    filtersEl.classList.remove('hidden');
}

async function loadMealPlan() {
    try {
        const date = formatDate(currentDate);
        const plan = await fetchMealPlan(date);
        renderMealPlan(plan);
    } catch (error) {
        console.error('Failed to load meal plan:', error);
        alert(t('errors.loadingMealPlan'));
    }
}

function showRecipesView() {
    document.getElementById('recipes-view').classList.remove('hidden');
    document.getElementById('planner-view').classList.add('hidden');
    showRecipesList();
}

function showPlannerView() {
    document.getElementById('planner-view').classList.remove('hidden');
    document.getElementById('recipes-view').classList.add('hidden');
    document.getElementById('recipe-detail').classList.add('hidden');
    loadMealPlan()
}

/**
 * Show modal to add meal to plan
 * @param {string} mealType - Type of meal (breakfast, lunch, dinner, snack)
 */
async function showAddMealModal(mealType) {
    const mealTypeLabels = {
        'breakfast': '🌅 ' + t('categories.breakfast'),
        'lunch': '🍽️ ' + t('categories.lunch'),
        'dinner': '🌙 ' + t('categories.dinner'),
        'snack': '🥨 ' + t('categories.snack')
    };

    // Load recipes if not cached
    if (!recipesCache) {
        try {
            recipesCache = await fetchRecipes();
        } catch (error) {
            alert(t('errors.loadingRecipes'));
            return;
        }
    }

    // Filter recipes by meal type (optional)
    const filteredRecipes = recipesCache.filter(r => r.category === mealType);
    const recipesToShow = filteredRecipes.length > 0 ? filteredRecipes : recipesCache;

    // Create modal body
    const bodyHTML = `
        <div class="mb-4">
            <input
                type="text"
                id="recipe-search"
                placeholder="${t('recipes.searchPlaceholder')}"
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
            />
        </div>
        <div id="recipe-list" class="space-y-2">
            ${renderRecipeOptions(recipesToShow)}
        </div>
    `;

    modal.open({
        title: `${t('mealPlan.addMealTo')}: ${mealTypeLabels[mealType]}`,
        body: bodyHTML,
        onClose: () => {
            console.log('Modal closed');
        }
    });

    setupRecipeSearch(recipesToShow, mealType);
}

/**
 * Show add recipe form in modal
 */
function showAddRecipeForm() {
    const bodyHTML = `
        <form id="add-recipe-form" class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-1">
                    ${t('addRecipeForm.recipeName')} *
                </label>
                <input
                    type="text"
                    name="name"
                    required
                    class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                           focus:outline-none focus:border-blue-500"
                    placeholder="${t('addRecipeForm.recipeNamePlaceholder')}"
                />
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium mb-1">
                        ${t('addRecipeForm.category')} *
                    </label>
                    <select
                        name="category"
                        required
                        class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                               focus:outline-none focus:border-blue-500">
                        <option value="">${t('addRecipeForm.chooseCategory')}</option>
                        <option value="breakfast">🌅 ${t('categories.breakfast')}</option>
                        <option value="lunch">🍽️ ${t('categories.lunch')}</option>
                        <option value="dinner">🌙 ${t('categories.dinner')}</option>
                        <option value="snack">🥨 ${t('categories.snack')}</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium mb-1">
                        ${t('addRecipeForm.prepTime')}
                    </label>
                    <input
                        type="number"
                        name="prep_time_minutes"
                        min="1"
                        class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                               focus:outline-none focus:border-blue-500"
                        placeholder="${t('addRecipeForm.prepTimePlaceholder')}"
                    />
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium mb-2">
                    ${t('addRecipeForm.nutritionPerServing')}
                </label>
                <div class="grid grid-cols-4 gap-2">
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">${t('addRecipeForm.calories')}</label>
                        <input
                            type="number"
                            name="calories_per_serving"
                            min="0"
                            class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                            placeholder="kcal"
                        />
                    </div>
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">${t('addRecipeForm.proteinG')}</label>
                        <input
                            type="number"
                            name="protein_per_serving"
                            min="0"
                            step="0.1"
                            class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                            placeholder="g"
                        />
                    </div>
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">${t('addRecipeForm.fatG')}</label>
                        <input
                            type="number"
                            name="fat_per_serving"
                            min="0"
                            step="0.1"
                            class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                            placeholder="g"
                        />
                    </div>
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">${t('addRecipeForm.carbsG')}</label>
                        <input
                            type="number"
                            name="carbs_per_serving"
                            min="0"
                            step="0.1"
                            class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                            placeholder="g"
                        />
                    </div>
                </div>
            </div>

            <div>
                <div class="flex justify-between items-center mb-2">
                    <label class="block text-sm font-medium">${t('addRecipeForm.ingredients')}</label>
                    <button
                        type="button"
                        id="add-ingredient-btn"
                        class="text-sm text-blue-400 hover:text-blue-300">
                        + ${t('addRecipeForm.addIngredient')}
                    </button>
                </div>
                <div id="ingredients-container" class="space-y-2">
                    <!-- Ingredients will be added here -->
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium mb-1">
                    ${t('addRecipeForm.instructions')}
                </label>
                <textarea
                    name="instructions"
                    rows="4"
                    class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                           focus:outline-none focus:border-blue-500"
                    placeholder="${t('addRecipeForm.instructionsPlaceholder')}"
                ></textarea>
                <p class="text-xs text-gray-400 mt-1">
                    ${t('addRecipeForm.instructionsHint')}
                </p>
            </div>

            <div>
                <label class="block text-sm font-medium mb-1">
                    ${t('addRecipeForm.notes')}
                </label>
                <textarea
                    name="notes"
                    rows="2"
                    class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                           focus:outline-none focus:border-blue-500"
                    placeholder="${t('addRecipeForm.notesPlaceholder')}"
                ></textarea>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">
                    ${t('addRecipeForm.tags')}
                </label>
                <textarea
                    name="tags"
                    rows="2"
                    class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                        focus:outline-none focus:border-blue-500"
                    placeholder="tags..."
                    ></textarea>
                </div>
        </form>
    `;

    modal.open({
        title: '➕ ' + t('addRecipeForm.title'),
        body: bodyHTML,
        confirmText: t('addRecipeForm.saveRecipe'),
        cancelText: t('buttons.cancel'),
        onConfirm: handleAddRecipeSubmit
    });

    // Setup dynamic ingredients
    setupIngredientsForm();
}

/**
 * Setup ingredients form functionality
 */
function setupIngredientsForm() {
    const container = document.getElementById('ingredients-container');
    const addBtn = document.getElementById('add-ingredient-btn');

    addIngredientRow(container);

    addBtn.addEventListener('click', () => {
        addIngredientRow(container);
    });
}

/**
 * Add ingredient row to form
 * @param {HTMLElement} container
 */
function addIngredientRow(container) {
    const row = document.createElement('div');
    row.className = 'flex gap-2 items-start ingredient-row';

    row.innerHTML = `
        <input
            type="text"
            name="ingredient_name[]"
            placeholder="${t('addRecipeForm.ingredientPlaceholder')}"
            class="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
        />
        <input
            type="number"
            name="ingredient_amount[]"
            placeholder="${t('addRecipeForm.amountPlaceholder')}"
            min="0"
            step="0.1"
            class="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
        />
        <select
            name="ingredient_unit[]"
            class="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm">
            <option value="g">${t('units.g')}</option>
            <option value="ml">${t('units.ml')}</option>
            <option value="szt">${t('units.pcs')}</option>
            <option value="łyżka">${t('units.tbsp')}</option>
            <option value="łyżeczka">${t('units.tsp')}</option>
            <option value="szczypta">${t('units.pinch')}</option>
            <option value="do_smaku">${t('units.toTaste')}</option>
        </select>
        <button
            type="button"
            class="text-red-400 hover:text-red-300 px-2"
            onclick="this.closest('.ingredient-row').remove()">
            ✕
        </button>
    `;

    container.appendChild(row);
}

/**
 * Handle add recipe form submission
 */
async function handleAddRecipeSubmit() {
    const form = document.getElementById('add-recipe-form');

    // Collect form data
    const formData = new FormData(form);

    // Build recipe object
    const recipeData = {
        name: formData.get('name'),
        category: formData.get('category'),
        prep_time_minutes: parseInt(formData.get('prep_time_minutes')) || null,
        servings: 1,
        calories_per_serving: parseFloat(formData.get('calories_per_serving')) || 0,
        protein_per_serving: parseFloat(formData.get('protein_per_serving')) || 0,
        fat_per_serving: parseFloat(formData.get('fat_per_serving')) || 0,
        carbs_per_serving: parseFloat(formData.get('carbs_per_serving')) || 0,
        notes: formData.get('notes') || null,
        source: 'manual',
        tags: formData.get('tags') || null,
        ingredients: [],
        instructions: []
    };

    // Collect ingredients
    const ingredientNames = formData.getAll('ingredient_name[]');
    const ingredientAmounts = formData.getAll('ingredient_amount[]');
    const ingredientUnits = formData.getAll('ingredient_unit[]');

    for (let i = 0; i < ingredientNames.length; i++) {
        if (ingredientNames[i].trim()) {  // Only non-empty
            recipeData.ingredients.push({
                name: ingredientNames[i].trim(),
                amount: parseFloat(ingredientAmounts[i]) || 0,
                unit: ingredientUnits[i],
                notes: null
            });
        }
    }

    // Collect instructions (each line = step)
    const instructionsText = formData.get('instructions') || '';
    recipeData.instructions = instructionsText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    // Validation
    if (!recipeData.name) {
        alert(t('addRecipeForm.nameRequired'));
        return;
    }
    if (!recipeData.category) {
        alert(t('addRecipeForm.categoryRequired'));
        return;
    }

    // Send to API
    try {
        modal.container.innerHTML = `
            <div class="p-8 text-center">
                <div class="text-4xl mb-4">⏳</div>
                <p>${t('addRecipeForm.savingRecipe')}</p>
            </div>
        `;

        const result = await createRecipe(recipeData);

        modal.close();
        showToast('✅ ' + t('toast.recipeAdded'));

        recipesCache = null;
        const recipes = await fetchRecipes(currentCategory);
        renderRecipesList(recipes);

    } catch (error) {
        console.error('Error creating recipe:', error);
        alert(t('app.error') + ': ' + error.message);
        modal.close();
    }
}

/**
 * Render recipe options for modal
 * @param {Array} recipes - Array of recipes
 * @returns {string} HTML string
 */
function renderRecipeOptions(recipes) {
    if (recipes.length === 0) {
        return `<p class="text-gray-400 text-center py-4">${t('recipes.noRecipesFound')}</p>`;
    }

    return recipes.map(recipe => `
        <button
            class="recipe-option w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex justify-between items-center"
            data-recipe-id="${recipe.id}"
        >
            <div>
                <div class="font-semibold text-teal-400">${recipe.name}</div>
                <div class="text-sm text-gray-400">
                    🔥 ${recipe.calories_per_serving} kcal |
                    💪 ${recipe.protein_per_serving}g ${t('recipes.protein')}
                </div>
            </div>
            <div class="text-2xl">→</div>
        </button>
    `).join('');
}

/**
 * Setup search functionality in modal
 * @param {Array} recipes - All recipes
 * @param {string} mealType - Current meal type
 */
function setupRecipeSearch(recipes, mealType) {
    const searchInput = document.getElementById('recipe-search');
    const recipeList = document.getElementById('recipe-list');

    // Search handler
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = recipes.filter(recipe =>
            recipe.name.toLowerCase().includes(searchTerm)
        );
        recipeList.innerHTML = renderRecipeOptions(filtered);
        attachRecipeClickHandlers(mealType);
    });

    // Attach click handlers
    attachRecipeClickHandlers(mealType);
}

/**
 * Attach click handlers to recipe options
 * @param {string} mealType - Current meal type
 */
function attachRecipeClickHandlers(mealType) {
    document.querySelectorAll('.recipe-option').forEach(btn => {
        btn.addEventListener('click', async () => {
            const recipeId = parseInt(btn.dataset.recipeId);
            await handleAddMeal(mealType, recipeId);
        });
    });
}

/**
 * Handle adding meal to plan
 * @param {string} mealType - Type of meal
 * @param {number} recipeId - Recipe ID
 */
async function handleAddMeal(mealType, recipeId) {
    try {
        // Show loading state (optional)
        const originalContent = modal.container.innerHTML;
        modal.container.innerHTML = `
            <div class="p-8 text-center">
                <div class="text-4xl mb-4">⏳</div>
                <p>${t('app.loading')}</p>
            </div>
        `;

        // Add meal to plan
        await addMealToPlan(formatDate(currentDate), mealType, recipeId, 1);

        // Close modal
        modal.close();

        // Reload meal plan
        await loadMealPlan();

        // Show success message (optional)
        showToast('✅ ' + t('toast.mealAdded'));

    } catch (error) {
        console.error('Error adding meal:', error);
        alert(t('errors.addingMeal') + ': ' + error.message);
        modal.close();
    }
}

/**
 * Handle servings change
 * @param {string} mealId
 * @param {number} mealServings
 */
async function handleServingsChange(mealId, newServings){
    if (newServings < 0.5){
        return;
    }

    try {
        await updateMealServings(mealId, newServings)

        await loadMealPlan();

    } catch (error) {
        console.error('Error updating servings:', error);
        showToast('❌ ' + t('toast.servingsError'));
    }
}

/**
 * Show temporary toast notification
 * @param {string} message - Message to display
 */
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('animate-fade-out');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// GLOBAL EVENT DELEGATION

function handleGlobalClick(e) {
    const action = e.target.dataset.action;

    if(!action) return;

    switch(action) {
        case 'back-to-list':
            showRecipesList();
            break;
        case 'add-meal':
            addMealPrompt(e.target.dataset.mealType);
            break;
        case 'nav-planner':
            showPlannerView();
            break;
        case 'nav-recipes':
            showRecipesView();
            break;
        case 'remove-meal':
            handleRemoveMeal(e.target.dataset.mealId);
            break;
        case 'remove-recipe':
            handleRemoveRecipe(e.target.dataset.recipeId);
            break;
        case 'prev-day':
            navigateDate(-1);
            break;
        case 'next-day':
            navigateDate(1);
            break;
        case 'increase-servings':
            handleServingsChange(
                e.target.dataset.mealId,
                parseFloat(e.target.dataset.currentServings) + 0.5
            );
            break;
        case 'decrease-servings':
            handleServingsChange(
                e.target.dataset.mealId,
                parseFloat(e.target.dataset.currentServings) - 0.5
            );
            break;
        case 'show-add-recipe-form':
            showAddRecipeForm();
            break;
        case 'set-language':
            setLanguage(e.target.dataset.lang);
            break;
    }
}

/**
 * Update all static UI elements with translations
 */
function updateStaticUI() {
    // Update header title
    document.getElementById('app-title').textContent = t('app.title');

    // Update navigation buttons
    document.getElementById('nav-recipes-btn').innerHTML = '📖 ' + t('nav.recipes');
    document.getElementById('nav-planner-btn').innerHTML = '📅 ' + t('nav.mealPlanner');

    // Update add recipe button
    document.getElementById('add-recipe-btn').innerHTML = '➕ ' + t('nav.addRecipe');

    // Update language switcher active state
    const langButtons = document.querySelectorAll('[data-action="set-language"]');
    const currentLang = getLanguage();
    langButtons.forEach(btn => {
        if (btn.dataset.lang === currentLang) {
            btn.classList.add('bg-blue-600', 'text-white');
            btn.classList.remove('bg-gray-700', 'text-gray-300');
        } else {
            btn.classList.remove('bg-blue-600', 'text-white');
            btn.classList.add('bg-gray-700', 'text-gray-300');
        }
    });
}

/**
 * Handle language change - re-render all dynamic content
 */
function handleLanguageChange() {
    updateStaticUI();
    renderFilters();

    // Re-render meal plan if visible
    if (!document.getElementById('planner-view').classList.contains('hidden')) {
        loadMealPlan();
    }

    // Re-render recipes list if visible
    if (!document.getElementById('recipes-view').classList.contains('hidden') && recipesCache) {
        const filteredRecipes = currentCategory
            ? recipesCache.filter(r => r.category === currentCategory)
            : recipesCache;
        renderRecipesList(filteredRecipes);
    }
}

// INITIALIZATION

async function init() {
    // Subscribe to language changes
    onLanguageChange(handleLanguageChange);

    // Update static UI elements
    updateStaticUI();

    renderFilters();

    // One global click handler for all actions
    document.addEventListener('click', handleGlobalClick);

    try {
        const recipes = await fetchRecipes();
        recipesCache = recipes;
        renderRecipesList(recipes);
    } catch (error){
        recipesListEl.innerHTML = `<p class="text-red-500 col-span-full text-center py-8">${t('errors.loadingRecipes')}: ${error.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', init);
export { showAddMealModal };
