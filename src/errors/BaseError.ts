export abstract class BaseError extends Error {
  protected constructor(relatedClass: any) {
    super();
    Object.setPrototypeOf(this, relatedClass.prototype);
    this.name = this.constructor.name;
  }
}
