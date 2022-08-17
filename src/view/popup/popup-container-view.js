import AbstractView from '../../framework/view/abstract-view';


const createPopupContainerTemplate = () =>
  `<section class="film-details">
    <div class="film-details__inner"></div>
  </section>`;

export default class PopupContainerView extends AbstractView {
  get template() {
    return createPopupContainerTemplate();
  }
}
