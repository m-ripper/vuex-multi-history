import { BaseError } from '../src';

class TestError extends BaseError {
  constructor(message: string) {
    super(TestError);
    this.message = message;
  }
}

describe('BaseError', () => {
  let error!: TestError;
  beforeAll(() => {
    error = new TestError('test message');
  });

  test(`'name' should be the name of the class`, () => {
    expect(error.name).toBe('TestError');
  });

  test(`'message' should be 'test message'`, () => {
    expect(error.message).toBe('test message');
  });
});
