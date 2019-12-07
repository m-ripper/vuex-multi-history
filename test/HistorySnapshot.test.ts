import { HistorySnapshot, UniqueHistorySnapshot } from '../src';

describe('HistorySnapshot', () => {
  test('HistorySnapshot', () => {
    const snapshot: HistorySnapshot = {
      mutation: 'test',
      stateData: { sum: 2 },
    };
    const referencableSnapshot = new UniqueHistorySnapshot(1, snapshot);
    expect(referencableSnapshot.mutation).toBe('test');
    expect(referencableSnapshot.toSnapshot()).toEqual(snapshot);
  });
});
