export class InvalidValueError extends Error {
  constructor(key: string, condition: string) {
    super();
    this.message = `The value of '${key}' ${condition}!`;
  }
}
