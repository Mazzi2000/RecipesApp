import {
    fetchRecipes,
    fetchRecipe,
    addMealToPlan,
    removeMeal,
    getStatistics,
    fetchMealPlan
} from './api.js';

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
    const ingredientsList = recipe.ingredients.map(
        ing => {
            const amount =  ing.amount > 0 ? `${ing.amount} ${ing.unit}` : ing.unit;
            const notes = ing.notes ? ` (${ing.notes})` : '';
            return `<li class="py-1">${amount} ${ing.name}${notes}</li>`;
        }
    ).join('');

    const instructions = JSON.parse(recipe.instructions || '[]');
    const instructionsList = instructions.map((step, index) => `
        <li class="py-2">
            <span class="font-bold text-blue-400">${index +1}.</span>${step}
        </li>
    `)
    .join('');

    recipeDetailEl.innerHTML = `
        <div class="max-w-2xl mx-auto">
            <button data-action="back-to-list" class="mb-4 text-xl text-blue-400 cursor-pointer hover:text-blue-300">
                ← Powrót do listy
            </button>

            <h2 class="text-2xl font-bold text-orange-300 mb-4">${recipe.name}</h2>

            <div class="grid grid-cols-4 gap-4 mb-6 text-center">
                <div class="bg gray-800 p-3 rounded">
                    <div class="text-2xl">🔥</div>
                    <div class="font-bold">${recipe.calories_per_serving}</div>
                    <div class="text-xs text-gray-400">kcal</div>
                </div>
                <div class="bg gray-800 p-3 rounded">
                    <div class="text-2xl">💪</div>
                    <div class="font-bold">${recipe.protein_per_serving}g</div>
                    <div class="text-xs text-gray-400">białko</div>
                </div>
                <div class="bg gray-800 p-3 rounded">
                    <div class="text-2xl">🧈</div>
                    <div class="font-bold">${recipe.fat_per_serving}g</div>
                    <div class="text-xs text-gray-400">tłuszcz</div>
                </div>
                <div class="bg gray-800 p-3 rounded">
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
        </div>

    `;
}

function renderFilters() {
    const html = CATEGORIES.map(cat => `
        <button class="px-4 py-2 rounded transition-colors
            ${cat.value === currentCategory
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600'}"
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
    const mealTypes = [
        { key: 'breakfast', label: '🌅 Śniadanie' },
        { key: 'lunch', label: '🍽️ Obiad' },
        { key: 'dinner', label: '🌙 Kolacja' },
        { key: 'snack', label: '🥨 Przekąska' }
    ];
    const html = mealTypes.map(type => {
        const meals = plan.filter(m => m.meal_type === type.key);

        return `
            <div class="bg-gray-800 rounded-lg p-4 mb-4">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="font-semibold">${type.label}</h3>
                    <button data-action="add-meal" data-meal-type="${type.key}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
                        +Dodaj
                    </button>
                </div>
                <div class="">
                    ${meals.length > 0
                        ? meals.map(m=> renderMealItem(m)).join('')
                        : '<p class="text-gray-500 text-sm">Brak posiłków</p>'
                    }
                </div>
            </div>
            `;
    }).join('');

    document.getElementById('meal-plan').innerHTML = html;

    let totals = plan[plan.length - 1];
    renderDailyTotals(totals);

    updateDateDisplay();

}

function renderMealItem(meal) {
    return `
        <div class="flex justify-between items-center py-2 border-b border-gray-700">
            <div>
                <span>${meal.recipe_name}</span>
                <span class="text-gray-400 text-sm ml-2">(${meal.calories_per_serving} kcal)</span>
            </div>
            <button data-action="remove-meal" data-meal-id="${meal.id}" class="text-slate-400 bg-pink-500 font-semibold cursor-pointer rounded-lg p-1 hover:text-red-300">Usuń 🗑️</button>
        </div>
    `
}

function renderDailyTotals(totals) {
    document.getElementById('daily-totals').innerHTML = `
        <div class="bg-gray-800 rounded-lg p-4 mt-6">
            <h3 class="font-semibold mb-3">📊 Podsumowanie dnia</h3>
            <div class="grid grid-cols-4 gap-4 text=center">
                <div>
                    <div class="text-2xl">🔥</div>
                    <div class="font-bold">${totals.calories}</div>
                    <div class="text-xs text-gray-400">kcal</div>
                </div>
            </div>
        </div>
    `;
}

// EVENT HANDLERS

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

    recipeDetailEl.innerHTML = '<p class="col-span-full text-center">Ładowanie...</p>';

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

async function addMealPrompt(mealType) {
    const recipeId = prompt('Podaj ID przepisu:');
    if (recipeId) {
        try {
            await addMealToPlan(formatDate(currentDate), mealType, parseInt(recipeId));
            loadMealPlan();
        } catch (error) {
            alert(error.message);
        }
    }
}

async function handleRemoveMeal(mealId) {
    if (!confirm('Usunąć posiłek z planu?')) return;

    try {
        await removeMeal(mealId);
        loadMealPlan();
    } catch (error) {
        alert(error.message);
    }
}

// UI STATE MANAGEMENT

/**
 * @param {number} recipeId
 */
async function showRecipeDetail(recipedId){
    try {
        recipeDetailEl.classList.remove('hidden');
        recipeDetailEl.innerHTML = '<p class="text-center">Ładowanie...</p>';

        recipesListEl.classList.add('hidden');
        filtersEl.classList.add('hidden');

        const recipe = await fetchRecipe(recipedId);

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
}

function showPlannerView() {
    document.getElementById('planner-view').classList.remove('hidden');
    document.getElementById('recipes-view').classList.add('hidden');
    loadMealPlan()
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
            navigateDate(-1)
            break;
        case 'next-day':
            navigateDate(1)
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
