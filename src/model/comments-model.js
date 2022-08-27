import {generateComment} from '../mock/comment';
import Observable from '../framework/observable';


export default class CommentsModel extends Observable {
  #comments = Array.from({length: 25}, generateComment);

  get comments() {
    return this.#comments;
  }

  addComment = (updateType, update) => {
    update.id = Math.max(...this.#comments.slice().map((comment) => parseInt(comment.id, 10))) + 1;

    this.#comments = [
      update,
      ...this.#comments,
    ];

    this._notify(updateType, update);
  };

  deleteComment = (updateType, update) => {
    const index = this.#comments.findIndex((comment) => comment.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t delete unexisting comment');
    }

    this.#comments = [
      ...this.#comments.slice(0, index),
      ...this.#comments.slice(index + 1),
    ];

    this._notify(updateType, update); //?
  };
}
