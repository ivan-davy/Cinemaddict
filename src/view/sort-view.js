import AbstractView from '../framework/view/abstract-view';
import {SORT_TYPES} from '../utility/sort-logic';


const createSortTemplate = () => `<ul class="sort">
    <li><a href="#" class="sort__button sort__button--active" data-sort-type="${SORT_TYPES.DEFAULT}">Sort by default</a></li>
    <li><a href="#" class="sort__button" data-sort-type="${SORT_TYPES.DATE_DOWN}">Sort by date</a></li>
    <li><a href="#" class="sort__button" data-sort-type="${SORT_TYPES.RATING_DOWN}">Sort by rating</a></li>
  </ul>`;

export default class SortView extends AbstractView {
  get template() {
    return createSortTemplate();
  }

  setSortTypeChangeHandler = (callback) => {
    this._callback.sortTypeChange = callback;
    this.element.addEventListener('click', this.#sortTypeChangeHandler);
  };

  #sortTypeChangeHandler = (evt) => {
    if (evt.target.tagName !== 'A') {
      return;
    }
    evt.preventDefault();
    this.element.querySelector('.sort__button--active').classList.remove('sort__button--active');
    evt.target.classList.add('sort__button--active');
    this._callback.sortTypeChange(evt.target.dataset.sortType);
  };
}
