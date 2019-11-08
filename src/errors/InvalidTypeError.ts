export class InvalidTypeError extends Error {
  constructor(key: string, requiredType: string) {
    super();
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
