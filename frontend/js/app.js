const API_URL = '/api';

/** Fetch all recipes (optional category filter)
 * @param {string|null} /category
 * @returns {Promise<Array>}
 */
async function fetchRecipes(category=null){
    let url = `${API_URL}/recipes`;
    if(category){
        url += `?category=${category}`
    }

    const response = await fetch(url);

    if (!response.ok){
        throw new Error(`HTTP error! status ${response.status}`);
    }

    const data = await response.json()

    return data
}

/** Fetch one recipe with ingredients
 * @param {number} recipeId
 * @returns {Promise<Object>}
 */
async function fetchRecipe(recipeId){
    let url = `${API_URL}/recipes/${recipeId}`

    const response = await fetch(url);

    if (!response.ok){
        throw new Error(`Http error! status ${response.status}`);
    }

    const data = await response.json();
    
    return data;
}

const recipesListEl = document.getElementById('recipes-list');
const recipeDetailEl = document.getElementById('recipe-detail');
const filtersEl = document.getElementById('filters');

/**
 * @param {Object} recipe 
 * @returns {string} HTML
 */
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
 * 
 */
function addRecipeCardListeners(){
    const cards = recipesListEl.querySelectorAll('[data-recipe-id]');

    cards.forEach(card => {
        card.addEventListener('click', () =>{
            const recipeId = card.dataset.recipeId
            showRecipeDetail(recipeId);
        });
    });
}

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
            <button onclick="showRecipesList()"
                class="mt-4 bg-blue-600 px-4 py-2 rounded">
                <- Powrót
            </button>
        `;
    }

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
            <button onclick="showRecipesList()" class="mb-4 text-xl text-blue-400 cursor-pointer hover:text-blue-300">
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
                <h3 class="text-lg font-semibold mb-2 text-blue-400>Przygotowanie</h3>
                <ol class="bg-gray-800 rounded p-4">
                    ${instructionsList || '<li class="text-gray-500">Brak instrukcji</li>'}
                </ol>
            </div>
        </div>

    `;
}

const CATEGORIES = [
    { value: null, label: 'Wszystkie' },
    { value: 'breakfast', label: '🌅 Śniadanie' },
    { value: 'lunch', label: '🍽️ Obiad' },
    { value: 'dinner', label: '🌙 Kolacja' },
    { value: 'snack', label: '🥨 Przekąska' }
];

let currentCategory = null;

/**
 * 
 */
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

function showRecipesList(){
    recipeDetailEl.classList.add('hidden');
    recipeDetailEl.innerHTML = '';

    recipesListEl.classList.remove('hidden');
    filtersEl.classList.remove
}

async function init() {
    renderFilters();
    try {
        const recipes = await fetchRecipes();
        renderRecipesList(recipes);
    } catch (error){
        recipesListEl.innerHTML = `<p class="text-red-500 col-span-full text-center py-8">Błąd ładowania: ${error.message}</p>`;
    }
}
document.addEventListener('DOMContentLoaded', init);