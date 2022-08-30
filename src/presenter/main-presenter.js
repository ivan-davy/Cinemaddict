import {remove, render} from '../framework/render';
import SortView from '../view/sort-view.js';
import ShowMoreButtonView from '../view/show-more-button-view.js';
import MovieListView from '../view/movie-list-view.js';
import TopRatedView from '../view/top-rated-view.js';
import MostCommentedView from '../view/most-commented-view.js';
import MovieListEmptyView from '../view/movie-list-empty-view';
import MoviePresenter from './movie-presenter';
import PopupPresenter from './popup-presenter';
import {SORT_TYPES, sortCommentsDown, sortDateDown, sortRatingDown} from '../utility/sort-logic';
import RankView from '../view/rank-view';
import MovieDatabaseStatsView from '../view/movie-database-stats-view';
import {UPDATE_TYPES, USER_ACTIONS} from '../utility/actions-updates';
import {FILTER_TYPES, movieFilters} from '../utility/filter-logic';

const MOVIES_SHOWN_STEP = 5;

export default class MainPresenter {
  constructor(siteElements, moviesModel, commentsModel, filtersModel) {
    this.headerElement = siteElements.siteHeaderElement;
    this.mainElement = siteElements.siteMainElement;
    this.footerElement = siteElements.siteFooterElement;

    this.moviesModel = moviesModel;
    this.commentsModel = commentsModel;
    this.filtersModel = filtersModel;
    this.moviesModel.addObserver(this.#modelMovieEventHandler);
    this.commentsModel.addObserver(this.#modelCommentEventHandler);
    this.filtersModel.addObserver(this.#modelMovieEventHandler);

    this.topRatedMovies = null;
    this.mostCommentedMovies = null;
    this.moviesShown = Math.min(this.movies.length, MOVIES_SHOWN_STEP);
    this.selectedSortType = SORT_TYPES.DEFAULT;
    this.selectedFilterType = FILTER_TYPES.ALL;

    this.movieListComponent = new MovieListView();
    this.movieListEmptyComponent = null;
    this.sortComponent = null;
    this.showMoreButtonComponent = null;
    this.topRatedComponent = null;
    this.mostCommentedComponent = null;

    this.mainMovieCardPresenters = new Map();
    this.topRatedMovieCardsPresenters = new Map();
    this.mostCommentedMovieCardsPresenters = new Map();
    this.popupPresenters = new Map();
  }

  init() {
    const moviesWatched = movieFilters[FILTER_TYPES.WATCHED](this.moviesModel.movies).length;
    const rankComponent = new RankView(moviesWatched);
    render(rankComponent, this.headerElement);

    this.#renderMainMovieList();
    this.#renderTopRatedList();
    this.#renderMostCommentedList();
    render(new MovieDatabaseStatsView(this.movies.length), this.footerElement.querySelector('.footer__statistics'));
  }

  get movies() {
    this.selectedFilterType = this.filtersModel.filter;
    const filterType = this.filtersModel.filter;
    const movies = this.moviesModel.movies;
    const filteredMovies = movieFilters[filterType](movies);

    switch (this.selectedSortType) {
      case SORT_TYPES.DATE_DOWN:
        return filteredMovies.sort(sortDateDown);
      case SORT_TYPES.RATING_DOWN:
        return filteredMovies.sort(sortRatingDown);
    }

    return filteredMovies;
  }

  get comments() {
    return this.commentsModel.comments;
  }

  #viewMovieActionHandler = (actionType, updateType, update) => {
    switch (actionType) {
      case USER_ACTIONS.UPDATE:
        this.moviesModel.updateMovie(updateType, update);
        break;
      case USER_ACTIONS.ADD:
        this.moviesModel.addMovie(updateType, update);
        break;
      case USER_ACTIONS.DELETE:
        this.moviesModel.deleteMovie(updateType, update);
        break;
    }
  };

  #viewCommentActionHandler = (actionType, updateType, update) => {
    switch (actionType) {
      case USER_ACTIONS.ADD:
        return this.commentsModel.addComment(updateType, update);
      case USER_ACTIONS.DELETE:
        this.commentsModel.deleteComment(updateType, update);
        break;
    }
  };

  #modelMovieEventHandler = (updateType, movieData) => {
    switch (updateType) {
      case UPDATE_TYPES.MINOR:
        this.mainMovieCardPresenters.get(movieData.id).init(movieData);
        if (this.popupPresenters.get(movieData.id).isPopupOpen()){
          this.popupPresenters.get(movieData.id).init();
        }
        this.#clearMovieLists();
        this.#renderMainMovieList();
        this.#renderTopRatedList();
        this.#renderMostCommentedList();
        break;
      case UPDATE_TYPES.MAJOR:
        this.mainMovieCardPresenters.get(movieData.id).init(movieData);
        if (this.popupPresenters.get(movieData.id).isPopupOpen()){
          this.popupPresenters.get(movieData.id).init();
        }
        this.#clearMovieLists({resetMoviesShownCount: true, resetSortType: true});
        this.#renderMainMovieList();
        this.#renderTopRatedList();
        this.#renderMostCommentedList();
        break;
    }
  };

  #modelCommentEventHandler = (updateType, data) => {
    const {movieData} = data;
    switch (updateType) {
      case UPDATE_TYPES.MINOR:
        this.mainMovieCardPresenters.get(movieData.id).init(movieData);
        this.popupPresenters.get(movieData.id).init();
        this.#clearMovieLists();
        this.#renderMainMovieList();
        this.#renderTopRatedList();
        this.#renderMostCommentedList();
        break;
    }
  };

  #sortTypeChangeHandler = (sortType) => {
    if (this.selectedSortType === sortType) {
      return;
    }
    this.selectedSortType = sortType;
    this.#clearMovieLists({resetMoviesShownCount: true});
    this.#renderMainMovieList();
    this.#renderTopRatedList();
    this.#renderMostCommentedList();
  };

  #renderSort = () => {
    this.sortComponent = new SortView(this.selectedSortType);
    render(this.sortComponent, this.mainElement);
    this.sortComponent.setSortTypeChangeHandler(this.#sortTypeChangeHandler);
  };

  #renderMainMovieList = () => {
    this.#renderSort();
    render(this.movieListComponent, this.mainElement);
    if (this.movies.length === 0) {
      this.#renderEmptyList();
    } else {
      const movies = this.movies.slice(0, Math.min(this.movies.length, this.moviesShown));
      this.#renderMovies(movies);
      if (this.moviesShown < this.movies.length) {
        this.#renderShowMoreButton();
      }
    }
  };

  #renderMovieCard = (movie, targetElement, cardPresentersGroup = this.mainMovieCardPresenters) => {
    const movieComments = this.comments.slice().filter((comment) => movie.comments.includes(comment.id));
    const popupPresenter = new PopupPresenter(this.mainElement, movie, movieComments, this.commentsModel, this.#viewMovieActionHandler, this.#viewCommentActionHandler, this.commentsModel.getNewId);
    const moviePresenter = new MoviePresenter(targetElement, popupPresenter, this.#viewMovieActionHandler);
    cardPresentersGroup.set(movie.id, moviePresenter);
    this.popupPresenters.set(movie.id, popupPresenter);
    moviePresenter.init(movie);
  };

  #renderMovies = (movies = this.movies.slice(0, MOVIES_SHOWN_STEP)) => {
    movies.forEach((movie) => this.#renderMovieCard(movie, this.movieListComponent.containerElement));
  };

  #renderShowMoreButton = () => {
    this.showMoreButtonComponent = new ShowMoreButtonView();
    render(this.showMoreButtonComponent, this.movieListComponent.listElement);
    this.showMoreButtonComponent.setClickHandler(this.#showMoreClickHandler);
  };

  #showMoreClickHandler = () => {
    const movies = this.movies.slice(this.moviesShown, Math.min(this.moviesShown + MOVIES_SHOWN_STEP, this.movies.length));
    this.#renderMovies(movies);
    this.moviesShown += MOVIES_SHOWN_STEP;
    if (this.moviesShown >= this.movies.length) {
      remove(this.showMoreButtonComponent);
    }
  };

  #clearMovieLists = ({resetMoviesShownCount = false, resetSortType = false} = {}) => {
    const moviesCount = this.movies.length;

    this.mainMovieCardPresenters.forEach((presenter) => presenter.destroy());
    this.mainMovieCardPresenters.clear();


    remove(this.sortComponent);
    remove(this.movieListEmptyComponent);
    remove(this.showMoreButtonComponent);

    if (this.topRatedComponent) {
      remove(this.topRatedComponent);
    }
    if (this.mostCommentedComponent) {
      remove(this.mostCommentedComponent);
    }

    if (resetMoviesShownCount) {
      this.moviesShown = MOVIES_SHOWN_STEP;
    } else {
      this.moviesShown = Math.min(moviesCount, this.moviesShown);
    }

    if (resetSortType) {
      this.selectedSortType = SORT_TYPES.DEFAULT;
    }

    if (this.movieListEmptyComponent) {
      remove(this.movieListEmptyComponent);
    }
  };

  #renderEmptyList = () => {
    this.movieListEmptyComponent = new MovieListEmptyView(this.selectedFilterType);
    render(this.movieListEmptyComponent, this.movieListComponent.listElement);
  };

  #renderTopRatedList = () => {
    this.topRatedMovies = this.moviesModel.movies.slice().sort(sortRatingDown).slice(0, 2);
    if (this.topRatedMovies.length) {
      this.topRatedComponent = new TopRatedView();
      render(this.topRatedComponent, this.movieListComponent.filmsElement);
      for (const movie of this.topRatedMovies) {
        this.#renderMovieCard(movie, this.topRatedComponent.containerElement, this.topRatedMovieCardsPresenters);
      }
    }
  };

  #renderMostCommentedList = () => {
    this.mostCommentedMovies = this.moviesModel.movies.slice().sort(sortCommentsDown).slice(0, 2);
    if (this.mostCommentedMovies.length) {
      this.mostCommentedComponent = new MostCommentedView();
      render(this.mostCommentedComponent, this.movieListComponent.filmsElement);
      for (const movie of this.mostCommentedMovies) {
        this.#renderMovieCard(movie, this.mostCommentedComponent.containerElement, this.mostCommentedMovieCardsPresenters);
      }
    }
  };
}
