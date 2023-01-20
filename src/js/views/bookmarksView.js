import View from "./View.js";
import previewView from "./previewView.js";
import icons from "url:../../img/icons.svg";

class BookmarksView extends View {
  _parentElement = document.querySelector(".bookmarks__list");
  _btn = document.querySelector(".nav__btn--delete-bookmarks");
  _errorMessage = "No bookmarks yet. Find a nice recipe and bookmark it 😊";
  _message = "";
  btnDelete = document.querySelector(".bookmarks__delete");

  addHandlerRender(handler) {
    window.addEventListener("load", handler);
  }

  addHandlerDelete(handler) {
    this._btn.addEventListener("click", function () {
      handler();
      document.querySelector(".bookmarks__delete").classList.add("delete");
      setTimeout(() => {
        document.querySelector(".bookmarks__delete").classList.remove("delete");
      }, 1500);
    });
  }

  _generateMarkup() {
    return this._data
      .map((bookmark) => previewView.render(bookmark, false))
      .join("");
  }
}

export default new BookmarksView();
