import { BaseError } from './BaseError';

export class InvalidTypeError extends BaseError {
  constructor(key: string, requiredType: string) {
    super(InvalidTypeError);
    let article = 'a';
    switch (requiredType.charAt(0)) {
      case 'a':
      case 'e':
      case 'i':
      case 'o':
      case 'u':
        article += 'n';
    }

    this.message = `'${key}' has to be ${article} '${requiredType}'`;
  }
}
