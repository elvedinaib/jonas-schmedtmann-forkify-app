import 'core-js/stable';
import 'regenerator-runtime/runtime';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import * as model from './model.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

if (module.hot)
  module.hot.accept();

const controlRecipe = async function () {
  try {
    // Get hash ID
    const id = window.location.hash.slice(1);
    if (!id) return;

    // Render spinner
    recipeView.renderSpinner();

    // Update selected element in search list (if open)
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    // Load data in model.js, in state, so that we can use model.state
    await model.loadRecipe(id);

    // Render recipe after 2s
    recipeView.render(model.state.recipe);
  } catch (err) {
    console.error(err);
    recipeView.renderError();
  }
}

const controlSearchResults = async function () {
  try {
    // Render spinner
    resultsView.renderSpinner();

    // Load an array of recipes from API and update state
    const query = searchView.getQuery();
    await model.loadSearchResults(query);

    // Render in list on page
    resultsView.render(model.getSearchResultsPage());
    paginationView.render(model.state.search);

  } catch (err) {
    console.error(err);
  }
}

const controlPagination = function (goTo) {
  resultsView.update(model.getSearchResultsPage(goTo));
  paginationView.render(model.state.search);
}

const controlServings = function (newServings) {
  model.updateServings(newServings);
  recipeView.update(model.state.recipe);
}

const controlAddBookmark = function () {
  if (model.state.recipe.bookmarked) model.deleteBookmark(model.state.recipe.id);
  else model.addBookmark(model.state.recipe);
  recipeView.update(model.state.recipe);
  bookmarksView.render(model.state.bookmarks);
}

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);
    recipeView.render(model.state.recipe);
    addRecipeView.renderMessage();
    bookmarksView.render(model.state.bookmarks);
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
}

const init = function () {
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerRenderSearch(controlSearchResults);
  paginationView.addHandlerPagination(controlPagination);
  bookmarksView.addHandlerRender(controlBookmarks);
  addRecipeView.addHandlerUpload(controlAddRecipe);
}
init();

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
}