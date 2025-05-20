import View from "./View";
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
    _parentElement = document.querySelector('.pagination');

    _generateMarkup() {
        const page = this._data.page;
        const numPages = Math.ceil(this._data.results.length / this._data.resultsPerPage);
        if (page === 1 && numPages > 1)
            return this._btnNext();
        if (page === numPages && numPages > 1)
            return this._btnPrev();
        if (page > 1 && page < numPages)
            return this._btnPrev().concat(this._btnNext());

        return '';
    }

    _btnPrev() {
        return `
        <button class="btn--inline pagination__btn--prev" data-id="${this._data.page - 1}">
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Page ${this._data.page - 1}</span>
        </button>
        `
    }

    _btnNext() {
        return `
        <button class="btn--inline pagination__btn--next" data-id="${this._data.page + 1}">
            <span>Page ${this._data.page + 1}</span>
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-right"></use>
            </svg>
        </button>
        `
    }

    addHandlerPagination(handler) {
        this._parentElement.addEventListener('click', function (e) {
            const btn = e.target.closest('.btn--inline');
            if (!btn) return;
            const id = +btn.dataset.id;
            handler(id);
        })
    }
}

export default new PaginationView();