import { BaseError } from './BaseError';

export class InvalidOptionsError extends BaseError {
  constructor(introLine: string, ...errors: Error[]) {
    super(InvalidOptionsError);
    let text = introLine + '\n';
    for (const error of errors) {
      text += `• ${error.message}\n`;
    }
    this.message = text;
  }
}
