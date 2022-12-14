import AbstractView from '../framework/view/abstract-view';


const createMostCommentedTemplate = () => `<section class="films-list films-list--extra" id="most-commented">
    <h2 class="films-list__title">Most Commented</h2>

    <div class="films-list__container"></div>
  </section>`;

export default class MostCommentedView extends AbstractView {
  get template() {
    return createMostCommentedTemplate();
  }

  get listElement() {
    return this.element;
  }

  get containerElement() {
    return this.listElement.querySelector('.films-list__container');
  }
}
