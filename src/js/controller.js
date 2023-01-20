import * as model from "./model.js";
import { MODAL_CLOSE_SEC } from "./config.js";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import bookmarksView from "./views/bookmarksView.js";
import paginationView from "./views/paginationView.js";
import addRecipeView from "./views/addRecipeView.js";
import * as search from "./searchSuggestions.js";

import "core-js/stable";
import "regenerator-runtime/runtime";

if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();

    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    await model.loadRecipe(id);

    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    const query = searchView.getQuery();
    if (!query) return;

    await model.loadSearchResults(query);

    resultsView.render(model.getSearchResultsPage());

    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

const controlPagination = function (goToPage) {
  resultsView.render(model.getSearchResultsPage(goToPage));

  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  model.updateServings(newServings);

  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  recipeView.update(model.state.recipe);

  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlClearAllBookmarks = function () {
  model.clearBookmarks();
  if (!model.state.recipe.id) return;
  model.deleteBookmark(model.state.recipe.id);
  recipeView.update(model.state.recipe);
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  // console.log(newRecipe);
  try {
    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage();

    bookmarksView.render(model.state.bookmarks);

    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error("🤦", err);
    addRecipeView.renderError(err.message);
  }
};

search.searchInput.addEventListener("keyup", function (e) {
  let results = [];
  let input = search.searchInput.value;
  if (input.length) {
    results = search.searchSuggestionsData.filter((item) => {
      return item.toLowerCase().startsWith(input.toLowerCase());
    });
  }

  renderSearchResults(results);
});

function renderSearchResults(results) {
  if (!results.length) {
    return search.searchSuggestions.classList.add("hidden");
  }
  let content = results
    .map((item) => {
      return `<li class="search__suggestions-list--item">${item}</li>`;
    })
    .join("");

  search.searchSuggestions.classList.remove("hidden");
  search.searchResults.innerHTML = content;

  let allList = search.searchResults.querySelectorAll("li");

  Object.values(allList).map((i) => {
    i.addEventListener("click", (el) => {
      let selectedData = el.target.textContent;
      search.searchInput.value = selectedData;
      search.searchSuggestions.classList.add("hidden");
      search.searchForm.requestSubmit();
    });
  });

  // for (let i = 0; i < allList.length; i++) {
  //   allList[i].addEventListener("click", (el) => {
  //     let selectedData = el.target.textContent;
  //     search.searchInput.value = selectedData;
  //     search.searchSuggestions.classList.add("hidden");
  //     search.searchForm.requestSubmit();
  //   });
  // }
}

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  bookmarksView.addHandlerDelete(controlClearAllBookmarks);
};
init();
