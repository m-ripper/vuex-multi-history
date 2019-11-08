import { BaseError } from './BaseError';

export class InvalidValueError extends BaseError {
  constructor(key: string, condition: string) {
    super(InvalidValueError);
    this.message = `The value of '${key}' ${condition}!`;
  }
}
