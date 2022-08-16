import {render} from '../render.js';
import InfoView from '../view/popup/info-view.js';
import PopupContainerView from '../view/popup/popup-container-view';
import CommentsView from '../view/popup/comments-view';

export default class PopupPresenter {
  constructor(mainElement, movie, comments) {
    this.mainElement = mainElement;
    this.movie = movie;
    this.comments = comments;

    this.popupContainerView = new PopupContainerView();
    this.infoView = new InfoView(movie);
    this.commentsView = new CommentsView(comments);
  }

  init = () => {
    const closeKeydownHandler = (evt) => {
      if (evt.key === 'Escape') {
        this.popupContainerView.removeElement();
        this.mainElement.querySelector('.film-details').remove();
      }
    };
    const closeClickHandler = () => {
      this.popupContainerView.removeElement();
      this.mainElement.querySelector('.film-details').remove();
      document.removeEventListener('keydown', closeKeydownHandler);
    };

    this.infoView.element.querySelector('.film-details__close-btn')
      .addEventListener('click', closeClickHandler, {once: true});
    document
      .addEventListener('keydown', closeKeydownHandler, {once: true});

    render(this.popupContainerView, this.mainElement);
    render(this.infoView, this.popupContainerView.element);
    render(this.commentsView, this.popupContainerView.element);
  };
}
