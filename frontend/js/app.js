import {
    fetchRecipes,
    fetchRecipe,
    addMealToPlan,
    removeMeal,
    getStatistics,
    fetchMealPlan,
    updateMealServings
} from './api.js';
import modal  from './modal.js';

const CATEGORIES = [
    { value: null, label: 'Wszystkie' },
    { value: 'breakfast', label: '🌅 Śniadanie' },
    { value: 'lunch', label: '🍽️ Obiad' },
    { value: 'dinner', label: '🌙 Kolacja' },
    { value: 'snack', label: '🥨 Przekąska' }
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

function createRecipeCard(recipe) {
    const categoryLabels = {
        'breakfast': 'Śniadanie',
        'lunch': 'Obiad',
        'dinner': 'Kolacja',
        'snack': 'Przekąska'
    };

    return `
        <article class ="bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" data-recipe-id="${recipe.id}">

            <h3 class="text-lg font-semibold mb-2 text-teal-500">${recipe.name}</h3>

            <div class="flex gap-2 mb-3">
                <span class="text-xs bg-blue-600 px-2 py-1 rounded">${categoryLabels[recipe.category] || recipe.category}</span>
                <span class="text-xs bg-gray-700 px-2 py-1 rounded">⏱️ ${recipe.prep_time_minutes || '?'} min</span>
            </div>

            <div class="text-sm text-gray-400">
                <span>🔥 ${recipe.calories_per_serving} kcal </span>
                <span>💪 ${recipe.protein_per_serving}g białka </span>
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
                Brak przepisów w tej kategorii
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
            <button data-action="back-to-list" class="mb-4 text-xl text-blue-400 cursor-pointer hover:text-blue-300">
                ← Powrót do listy
            </button>

            <h2 class="text-2xl font-bold text-orange-300 mb-4">${recipe.name}</h2>

            ${detailHTML}
        </div>
    `;
}

async function showRecipeDetailInModal(recipeId) {
    try {
        // Show loading modal
        modal.open({
            title: 'Ładowanie przepisu...',
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
        alert('Błąd ładowania przepisu: ' + error.message);
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
                <div class="text-xs text-gray-400">białko</div>
            </div>
            <div class="bg-gray-800 p-3 rounded">
                <div class="text-2xl">🧈</div>
                <div class="font-bold">${recipe.fat_per_serving}g</div>
                <div class="text-xs text-gray-400">tłuszcz</div>
            </div>
            <div class="bg-gray-800 p-3 rounded">
                <div class="text-2xl">🍞</div>
                <div class="font-bold">${recipe.carbs_per_serving}g</div>
                <div class="text-xs text-gray-400">węgle</div>
            </div>
        </div>

        <div class="mb-6">
            <h3 class="text-lg font-semibold mb-2 text-blue-400">Składniki</h3>
            <ul class="bg-gray-800 rounded p-4">
                ${ingredientsList}
            </ul>
        </div>

        <div class="mb-6">
            <h3 class="text-lg font-semibold mb-2 text-blue-400">Przygotowanie</h3>
            <ol class="bg-gray-800 rounded p-4">
                ${instructionsList || '<li class="text-gray-500">Brak instrukcji</li>'}
            </ol>
        </div>
    `;
}


function renderFilters() {
    const html = CATEGORIES.map(cat => `
        <button class="px-4 py-2 rounded transition-colors
            ${cat.value === currentCategory
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 cursor-pointer'}"
            data-category="${cat.value}">${cat.label}
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
                    Liczba przepisów: ${numberOfRecipes}
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
        { key: 'breakfast', label: '🌅 Śniadanie' },
        { key: 'lunch', label: '🍽️ Obiad' },
        { key: 'dinner', label: '🌙 Kolacja' },
        { key: 'snack', label: '🥨 Przekąska' }
    ];
    const html = mealTypes.map(type => {
        const mealsOfType = meals.filter(m => m.meal_type === type.key);

        return `
            <div class="bg-gray-800 rounded-lg p-4 mb-4">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="font-semibold">${type.label}</h3>
                    <button data-action="add-meal" data-meal-type="${type.key}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
                        +Dodaj
                    </button>
                </div>
                <div class="">
                    ${mealsOfType.length > 0
                        ? mealsOfType.map(m=> renderMealItem(m)).join('')
                        : '<p class="text-gray-500 text-sm">Brak posiłków</p>'
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
                    Usuń 🗑️
            </button>
        </div>
    `;
}

function renderDailyTotals(totals) {
    document.getElementById('daily-totals').innerHTML = `
        <div class="bg-gray-800 rounded-lg p-4 mt-6">
            <h3 class="font-semibold mb-3">📊 Podsumowanie dnia</h3>
            <div class="grid grid-cols-4 gap-4 text-center">
                <div>
                    <div class="text-2xl">🔥</div>
                    <div class="font-bold text-xl">${Math.round(totals.calories)}</div>
                    <div class="text-xs text-gray-400">kcal</div>
                </div>
                <div>
                    <div class="text-2xl">💪</div>
                    <div class="font-bold text-xl">${Math.round(totals.protein)}g</div>
                    <div class="text-xs text-gray-400">białko</div>
                </div>
                <div>
                    <div class="text-2xl">🧈</div>
                    <div class="font-bold text-xl">${Math.round(totals.fat)}g</div>
                    <div class="text-xs text-gray-400">tłuszcz</div>
                </div>
                <div>
                    <div class="text-2xl">🍞</div>
                    <div class="font-bold text-xl">${Math.round(totals.carbs)}g</div>
                    <div class="text-xs text-gray-400">węgle</div>
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

    recipesListEl.innerHTML = '<p class="col-span-full text-center">Ładowanie...</p>';

    try {
        const recipes = await fetchRecipes(category);
        renderRecipesList(recipes);
    } catch (error) {
        recipesListEl.innerHTML = `<p class="text-red-500 col-span-full text-center">Błąd: ${error.message}</p>`;
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

async function handleRemoveMeal(mealId) {
    // Get meal name for the modal
    const mealButton = document.querySelector(`[data-meal-id="${mealId}"]`);
    if (!mealButton) {
        console.error('Meal not found');
        return;
    }
    const mealElement = mealButton.closest('.flex');
    const mealName = mealElement?.querySelector('span')?.textContent || 'Ten posiłek';

    // Clean, simple body (no buttons needed!)
    const bodyHTML = `
        <div class="text-center">
            <div class="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-500/10 mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-6 text-red-400">
                    <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">Usunąć posiłek?</h3>
            <p class="text-sm text-gray-400">${mealName} zostanie usunięty z Twojego planu.</p>
        </div>
    `;

    modal.open({
        title: 'Usuń posiłek',
        body: bodyHTML,
        confirmText: 'Usuń',
        cancelText: 'Anuluj', 
        onConfirm: async () => {    
            try {
                // Show loading
                modal.container.innerHTML = `
                    <div class="p-8 text-center">
                        <div class="text-4xl mb-4">⏳</div>
                        <p class="text-gray-400">Usuwanie...</p>
                    </div>
                `;
                
                await removeMeal(mealId);
                modal.close();
                await loadMealPlan();
                showToast('✅ Posiłek usunięty!');
            } catch (error) {
                modal.close();
                alert('Błąd: ' + error.message);
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
        recipeDetailEl.innerHTML = '<p class="text-center">Ładowanie...</p>';

        recipesListEl.classList.add('hidden');
        filtersEl.classList.add('hidden');

        const recipe = await fetchRecipe(recipeId);

        renderRecipeDetail(recipe);
    } catch (error) {
        recipeDetailEl.innerHTML = `
            <p class="text-red-500">Błąd: ${error.message}</p>
            <button data-action="back-to-list"
                class="mt-4 bg-blue-600 px-4 py-2 rounded">
                <- Powrót
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
        alert('Nie udało się załadować planu posiłków');
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
        'breakfast': '🌅 Śniadanie',
        'lunch': '🍽️ Obiad',
        'dinner': '🌙 Kolacja',
        'snack': '🥨 Przekąska'
    };
    
    // Load recipes if not cached
    if (!recipesCache) {
        try {
            recipesCache = await fetchRecipes();
        } catch (error) {
            alert('Błąd ładowania przepisów');
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
                placeholder="Szukaj przepisu..."
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
            />
        </div>
        <div id="recipe-list" class="space-y-2">
            ${renderRecipeOptions(recipesToShow)}
        </div>
    `;
    
    modal.open({
        title: `Dodaj posiłek: ${mealTypeLabels[mealType]}`,
        body: bodyHTML,
        onClose: () => {
            console.log('Modal closed');
        }
    });
    
    // Add search functionality
    setupRecipeSearch(recipesToShow, mealType);
}

/**
 * Render recipe options for modal
 * @param {Array} recipes - Array of recipes
 * @returns {string} HTML string
 */
function renderRecipeOptions(recipes) {
    if (recipes.length === 0) {
        return '<p class="text-gray-400 text-center py-4">Brak przepisów</p>';
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
                    💪 ${recipe.protein_per_serving}g białka
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
                <p>Dodawanie posiłku...</p>
            </div>
        `;
        
        // Add meal to plan
        await addMealToPlan(formatDate(currentDate), mealType, recipeId, 1);
        
        // Close modal
        modal.close();
        
        // Reload meal plan
        await loadMealPlan();
        
        // Show success message (optional)
        showToast('✅ Posiłek dodany do planu!');
        
    } catch (error) {
        console.error('Error adding meal:', error);
        alert('Błąd dodawania posiłku: ' + error.message);
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
        showToast('❌ Błąd zmiany porcji');       
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
    }
}

// INITIALIZATION

async function init() {
    renderFilters();

    // One global click handler for all actions
    document.addEventListener('click', handleGlobalClick);

    try {
        const recipes = await fetchRecipes();
        renderRecipesList(recipes);
    } catch (error){
        recipesListEl.innerHTML = `<p class="text-red-500 col-span-full text-center py-8">Błąd ładowania: ${error.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', init);
export { showAddMealModal };
