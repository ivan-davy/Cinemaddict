import {remove, render, replace} from '../framework/render';
import InfoView from '../view/popup/info-view.js';
import ContainerView from '../view/popup/container-view';
import CommentsView from '../view/popup/comments-view';
import {UpdateType, UserAction} from '../utility/actions-updates-methods';

export default class PopupPresenter {
  #movie = null;
  #mainElement = null;
  #comments = null;
  #moviesModel = null;
  #commentsModel = null;
  #updateMovieDataHandler = null;
  #updateCommentDataHandler = null;
  #containerComponent = null;
  #infoComponent = null;
  #commentsComponent = null;

  constructor(mainElement, movie, moviesModel, commentsModel, updateMovieDataHandler, updateCommentDataHandler) {
    this.#mainElement = mainElement;
    this.#movie = movie;
    this.#updateMovieDataHandler = updateMovieDataHandler;
    this.#updateCommentDataHandler = updateCommentDataHandler;

    this.#moviesModel = moviesModel;
    this.#commentsModel = commentsModel;
    this.#moviesModel.addObserver(updateMovieDataHandler);
    this.#commentsModel.addObserver(updateCommentDataHandler);
    this.#comments = null;

    this.#containerComponent = new ContainerView();
    this.#commentsComponent = new CommentsView([]);
    this.#infoComponent = new InfoView(this.#movie);
  }

  async init(movie, offsetY = 0) {
    this.#movie = movie;
    this.#comments = await this.#commentsModel.init(this.#movie.id);
    if (this.#containerComponent.getIsPopupOpen()) {
      this.purgeGlobalListeners();
      this.#containerComponent.closeAllPopups();
      this.#containerComponent.allowOverflow(this.#mainElement);
    }
    const prevInfoComponent = this.#infoComponent;
    const prevCommentsComponent = this.#commentsComponent;
    this.#infoComponent = new InfoView(this.#movie);
    this.#commentsComponent = new CommentsView(this.#comments);

    if (this.#infoComponent !== prevInfoComponent || this.#commentsComponent !== prevCommentsComponent) {
      this.#containerComponent.restrictOverflow(this.#mainElement);
      remove(prevInfoComponent);
      remove(prevCommentsComponent);

      render(this.#containerComponent, document.querySelector('footer'), 'afterend');
      render(this.#infoComponent, this.#containerComponent.element);
      render(this.#commentsComponent, this.#containerComponent.element);

      this.#commentsComponent.setFormSubmitHandler(this.#formSubmitHandler);
      this.#containerComponent.setCloseKeydownHandler(this.#closeKeydownHandler);
      this.#commentsComponent.setCommentDeleteHandler(this.#deleteCommentHandler);
      this.#containerComponent.setCloseClickHandler(this.#closeClickHandler);
      this.#infoComponent.setWatchlistClickHandler(this.#watchlistClickHandler);
      this.#infoComponent.setHistoryClickHandler(this.#historyClickHandler);
      this.#infoComponent.setFavoriteClickHandler(this.#favoriteClickHandler);

      this.#containerComponent.element.scrollTo(0, offsetY);
      return;
    }

    if (this.#containerComponent.element.contains(this.#infoComponent.element)) {
      replace(this.#infoComponent, prevInfoComponent);
    }
    if (this.#containerComponent.element.contains(this.#commentsComponent.element)) {
      replace(this.#commentsComponent, prevCommentsComponent);
    }

  }

  destroy = () => {
    this.purgeGlobalListeners();
    remove(this.#containerComponent);
  };

  getIsPopupOpen = () => this.#containerComponent.getIsPopupOpen();

  getPopupOffsetY = () => this.#containerComponent.element.scrollTop;

  purgeGlobalListeners = () => {
    this.#containerComponent.unsetCloseKeydownHandler();
    this.#commentsComponent.unsetFormSubmitHandler();
  };

  restoreGlobalListeners = () => {
    this.#containerComponent.setCloseKeydownHandler(this.#closeKeydownHandler);
    this.#commentsComponent.setFormSubmitHandler(this.#formSubmitHandler);
  };

  #closeKeydownHandler = (evt) => {
    if (evt.key === 'Escape') {
      this.#commentsComponent.reset();
      this.#containerComponent.allowOverflow(this.#mainElement);
      this.destroy();
    }
  };

  #closeClickHandler = () => {
    this.#commentsComponent.reset();
    this.#containerComponent.allowOverflow(this.#mainElement);
    this.destroy();
  };

  #watchlistClickHandler = () => {
    this.#updateMovieDataHandler(
      UserAction.UPDATE,
      UpdateType.MINOR,
      {
        movieData: {...this.#movie, userDetails: {...this.#movie.userDetails, watchlist: !this.#movie.userDetails.watchlist}},
        popupOffsetY: this.#containerComponent.element.scrollTop
      }
    );
    this.purgeGlobalListeners();
  };

  #historyClickHandler = () => {
    this.#updateMovieDataHandler(
      UserAction.UPDATE,
      UpdateType.MINOR,
      {
        movieData: {...this.#movie, userDetails: {...this.#movie.userDetails, alreadyWatched: !this.#movie.userDetails.alreadyWatched}},
        popupOffsetY: this.#containerComponent.element.scrollTop
      }
    );
    this.purgeGlobalListeners();
  };

  #favoriteClickHandler = () => {
    this.#updateMovieDataHandler(
      UserAction.UPDATE,
      UpdateType.MINOR,
      {
        movieData: {...this.#movie, userDetails: {...this.#movie.userDetails, favorite: !this.#movie.userDetails.favorite}},
        popupOffsetY: this.#containerComponent.element.scrollTop
      }
    );
    this.purgeGlobalListeners();
  };

  #formSubmitHandler = (comment) => {
    this.#updateCommentDataHandler(
      UserAction.ADD,
      UpdateType.MINOR,
      {
        movieData: this.#movie,
        commentData: comment,
        popupOffsetY: this.#containerComponent.element.scrollTop
      },
    );
    this.purgeGlobalListeners();
  };

  #deleteCommentHandler = (comment) => {
    this.#updateCommentDataHandler(
      UserAction.DELETE,
      UpdateType.MINOR,
      {
        movieData: this.#movie,
        commentData: comment,
        popupOffsetY: this.#containerComponent.element.scrollTop
      },
    );
    this.purgeGlobalListeners();
  };

  resetSubmittingState = () => {
    const reset = () => {
      this.#commentsComponent.resetAllStates();
    };
    this.#commentsComponent.shakeInput(reset);
    this.restoreGlobalListeners();
  };

  resetDeletingState = (commentId) => {
    const reset = () => {
      this.#commentsComponent.resetAllStates();
    };
    this.#commentsComponent.shakeComment(reset, commentId);
    this.restoreGlobalListeners();
  };

  resetControls = () => {
    this.#infoComponent.shakeControls();
    this.restoreGlobalListeners();
  };
}

