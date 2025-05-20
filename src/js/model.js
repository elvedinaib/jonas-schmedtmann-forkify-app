import { AJAX } from './helpers.js';
import { API_URL, RESULTS_PER_PAGE, KEY } from './config.js';

export const state = {
    recipe: {},
    search: {
        results: [],
        query: '',
        resultsPerPage: RESULTS_PER_PAGE,
        page: 1,
    },
    bookmarks: []
}

const createRecipeObject = function (res) {
    const { recipe } = res.data;
    return {
        cookingTime: recipe.cooking_time,
        id: recipe.id,
        image: recipe.image_url,
        ingredients: recipe.ingredients,
        publisher: recipe.publisher,
        servings: recipe.servings,
        sourceUrl: recipe.source_url,
        title: recipe.title,
        ... (recipe.key && { key: recipe.key })
    }
}

export const loadRecipe = async function (id) {
    try {
        const res = await AJAX(`${API_URL}${id}?key=${KEY}`);
        state.recipe = createRecipeObject(res);

        if (state.bookmarks.some(bookmark => bookmark.id === id)) state.recipe.bookmarked = true;
        else state.recipe.bookmarked = false;
    } catch (err) {
        throw err;
    }
}

export const loadSearchResults = async function (query) {
    try {
        state.search.query = query;
        const res = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
        state.search.results = res.data.recipes.map(recipe => {
            return {
                id: recipe.id,
                image: recipe.image_url,
                publisher: recipe.publisher,
                title: recipe.title,
                ...(recipe.key && { key: recipe.key })
            }
        });
        state.search.page = 1;
    } catch (err) {
        throw err;
    }
}

export const updateServings = function (newServings) {
    state.recipe.ingredients.map(ing => ing.quantity = ing.quantity * newServings / state.recipe.servings);
    state.recipe.servings = newServings;
}

export const getSearchResultsPage = function (page = state.search.page) {
    state.search.page = page;
    const start = (page - 1) * state.search.resultsPerPage;
    const end = page * state.search.resultsPerPage;
    return state.search.results.slice(start, end);
}

const persistBookmarks = function () {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

export const addBookmark = function (recipe) {
    state.bookmarks.push(recipe);
    state.recipe.bookmarked = true;
    persistBookmarks();
}

export const deleteBookmark = function (id) {
    const index = state.bookmarks.findIndex(el => el.id === id);
    state.bookmarks.splice(index, 1);
    state.recipe.bookmarked = false;
    persistBookmarks();
}

export const uploadRecipe = async function (newRecipe) {
    try {
        const ingredients = Object.entries(newRecipe).filter(el => el[0].includes('ingredient') && el[1] != '').map(el => {
            const ingArr = el[1].split(',').map(el => el.trim());
            if (ingArr.length !== 3) throw new Error('Wrong ingredient format');
            const [quantity, unit, description] = ingArr;
            return { quantity: quantity ? +quantity : null, unit, description };
        });

        const recipe = {
            cooking_time: +newRecipe.cookingTime,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            servings: +newRecipe.servings,
            source_url: newRecipe.sourceUrl,
            title: newRecipe.title,
            ingredients
        }

        const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
        state.recipe = createRecipeObject(data);
        addBookmark(state.recipe);
    } catch (err) {
        throw err;
    }
}

const init = function () {
    const storage = localStorage.getItem('bookmarks');
    if (storage) state.bookmarks = JSON.parse(storage);
}

init();