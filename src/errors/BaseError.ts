export abstract class BaseError extends Error {
  constructor(relatedClass: any) {
    super();
    Object.setPrototypeOf(this, relatedClass.prototype);
    this.name = this.constructor.name;
  }
}
