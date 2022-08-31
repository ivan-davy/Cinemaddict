import {generateMovie} from '../mock/movie';
import Observable from '../framework/observable';


export default class MoviesModel extends Observable {
  #movies = Array.from({length: 16}, generateMovie);
  #moviesApiService = null;

  constructor(moviesApiService) {
    super();
    this.#moviesApiService = moviesApiService;
    this.#moviesApiService.movies.then((movies) => {
      console.log(movies);
    });
  }

  get movies() {
    return this.#movies;
  }

  updateMovie = (updateType, update) => {
    const {movieData} = update;
    const index = this.#movies.findIndex((movie) => movie.id === movieData.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting movie');
    }

    this.#movies = [
      ...this.#movies.slice(0, index),
      movieData,
      ...this.#movies.slice(index + 1),
    ];

    this._notify(updateType, update);
  };

  addMovie = (updateType, update) => {
    const {movieData} = update;

    this.#movies = [
      movieData,
      ...this.#movies,
    ];

    this._notify(updateType, update);
  };

  deleteMovie = (updateType, update) => {
    const index = this.#movies.findIndex((movie) => movie.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t delete unexisting movie');
    }

    this.#movies = [
      ...this.#movies.slice(0, index),
      ...this.#movies.slice(index + 1),
    ];

    this._notify(updateType, update);
  };
}
