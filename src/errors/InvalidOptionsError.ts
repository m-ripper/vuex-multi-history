export class InvalidOptionsError extends Error {
  constructor(introLine: string, ...errors: Error[]) {
    super();
    let text = introLine + '\n';
    for (const error of errors) {
      text += `• ${error.message}\n`;
    }
    this.message = text;
  }
}
