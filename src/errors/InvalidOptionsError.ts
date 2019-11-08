export class InvalidOptionsError extends Error {
  constructor(...errors: Error[]) {
    super();
    let text = `The following errors occurred when validating the options of 'VuexMultiHistory':\n`;
    for (const error of errors) {
      text += `• ${error.message}\n`;
    }
    this.message = text;
  }
}
