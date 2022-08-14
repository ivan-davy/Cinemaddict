import {createElement} from '../framework/render';
import AbstractView from '../framework/view/abstract-view';

const createSortTemplate = () => `<ul class="sort">
    <li><a href="#" class="sort__button sort__button--active">Sort by default</a></li>
    <li><a href="#" class="sort__button">Sort by date</a></li>
    <li><a href="#" class="sort__button">Sort by rating</a></li>
  </ul>`;

export default class SortView extends AbstractView {
  #element = null;

  get template() {
    return createSortTemplate();
  }
}
