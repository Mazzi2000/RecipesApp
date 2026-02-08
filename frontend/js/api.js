import { t } from './i18n.js';

const API_URL = '/api';

/**
 * Fetch all recipes with optional category filter
 * @param {string|null} category - Filter by category (e.g., 'breakfast', 'lunch') or null for all
 * @returns {Promise<Array>} Array of recipe objects
 * @throws {Error} If HTTP request fails
 */
export async function fetchRecipes(category = null) {
    let url = `${API_URL}/recipes`;
    if (category) {
        url += `?category=${category}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status ${response.status}`);
    }

    return await response.json();
}

/**
 * Fetch a single recipe with ingredients
 * @param {number} recipeId - The recipe ID
 * @returns {Promise<Object>} Recipe object with ingredients
 * @throws {Error} If HTTP request fails
 */
export async function fetchRecipe(recipeId) {
    const url = `${API_URL}/recipes/${recipeId}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status ${response.status}`);
    }

    return await response.json();
}

/**
 * Add a meal to the meal plan
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} mealType - Type of meal (breakfast, lunch, dinner, snack)
 * @param {number} recipeId - ID of the recipe to add
 * @param {number} servings - Number of servings (default: 1)
 * @returns {Promise<Object>} Response data from API
 * @throws {Error} If the request fails
 */
export async function addMealToPlan(date, mealType, recipeId, servings = 1) {
    const response = await fetch('/api/meal-plans', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            date: date,
            meal_type: mealType,
            recipe_id: recipeId,
            servings: servings
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || t('errors.addingError'));
    }

    return await response.json();
}

/**
 * Remove a meal from the meal plan
 * @param {number} mealId - The meal plan entry ID to remove
 * @returns {Promise<void>}
 * @throws {Error} If the request fails
 */
export async function removeMeal(mealId) {
    const response = await fetch(`/api/meal-plans/${mealId}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        throw new Error(t('errors.deletingMeal'));
    }
}

export async function removeRecipe(recipeId) {
    const response = await fetch(`/api/recipes/${recipeId}`,{
        method: 'DELETE'
    });

    if (!response.ok) {
        throw new Error(t('errors.deletingRecipe'));
    }

}

/**
 * Get recipe statistics
 * @returns {Promise<number>} Total number of recipes
 * @throws {Error} If the request fails
 */
export async function getStatistics() {
    const response = await fetch(`${API_URL}/statistics`);

    if (!response.ok) {
        throw new Error(t('errors.gettingStatistics'));
    }

    return await response.json();
}

/**
 * Fetch meal plan for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} Array of meal plan items
 * @throws {Error} If the request fails
 */
export async function fetchMealPlan(date) {
    const response = await fetch(`/api/meal-plans?date=${date}`);

    if (!response.ok) {
        throw new Error(t('errors.gettingMealPlan'));
    }

    return await response.json();
}

/**
 * Get recipes with optional search and category filter
 * @param {Object} filters - Filter options
 * @param {string} filters.category - Category filter
 * @param {string} filters.search - Search term
 * @returns {Promise<Array>} Filtered recipes
 */
export async function searchRecipes({ category = null, search = null } = {}) {
    let url = `${API_URL}/recipes`;
    const params = [];

    if (category) params.push(`category=${category}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);

    if (params.length > 0) {
        url += '?' + params.join('&');
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status ${response.status}`);
    }

    return await response.json();
}

/**
 * Update servings for a meal plan entry
 * @param {number} mealId
 * @param {servings} servings
 * @returns {Promise<Object>}
 */
export async function updateMealServings(mealId, servings) {
    const response = await fetch(`/api/meal-plans/${mealId}`,{
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            servings: servings
        })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t('errors.updatingServings'));
    }

    return await response.json();
}

/**
 * Create a new recipe
 * @param {Object}
 * @returns {Promise<Object>}
 */
export async function createRecipe(recipeData) {
    const response = await fetch("/api/recipes", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(recipeData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t('errors.creatingRecipe'));
    }

    return await response.json();
}

/**
 * Check current authentication status
 * @returns {Promise<Object>} { authenticated: boolean, user?: {id, username}}
 */
export async function checkAuth() {
    const response = await fetch(`${API_URL}/auth/me`);

    if (!response.ok) {
        throw new Error(t('errors.authCheck'));
    }

    return await response.json();
}

/**
 * Login with username and password
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Object>} User data on success
 * @throws {Error} If credentials are invalid
 */
export async function login(username, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });
 
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t('errors.loginFailed'));
    }
 
    return await response.json();
}
 
/**
 * Logout the current user
 * @returns {Promise<Object>}
 */
export async function logout() {
    const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST'
    });
 
    if (!response.ok) {
        throw new Error(t('errors.logoutFailed'));
    }
 
    return await response.json();
}
