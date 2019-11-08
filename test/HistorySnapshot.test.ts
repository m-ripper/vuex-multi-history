import { HistorySnapshot, ReferencableHistorySnapshot } from '../src';

describe('HistorySnapshot', () => {
  test('HistorySnapshot', () => {
    const snapshot: HistorySnapshot = {
      mutation: 'test',
      stateData: { sum: 2 },
    };
    const referencableSnapshot = new ReferencableHistorySnapshot(1, snapshot);
    expect(referencableSnapshot.mutation).toBe('test');
    expect(referencableSnapshot.toSnapshot()).toEqual(snapshot);
  });
});
