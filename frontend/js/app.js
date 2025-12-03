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