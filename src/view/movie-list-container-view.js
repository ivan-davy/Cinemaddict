import {createElement} from '../render.js';

const createMovieListContainerTemplate = () => `<section class="films">
      <section class="films-list">
        <h2 class="films-list__title visually-hidden">All movies. Upcoming</h2>

        <div class="films-list__container"></div>
      </section>
  </section>`;

export default class MovieListContainerView {
  #element = null;

  get template() {
    return createMovieListContainerTemplate();
  }

  get element() {
    if (!this.#element) {
      this.#element = createElement(this.template);
    }
    return this.#element;
  }

  removeElement() {
    this.#element = null;
  }
}
