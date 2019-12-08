import { HistorySnapshot, UniqueHistorySnapshot } from '../src';

describe('UniqueHistorySnapshot', () => {
  test('toSnapshot', () => {
    const snapshot: HistorySnapshot = {
      mutation: 'test',
      stateData: { sum: 2 },
    };
    const uniqueSnapshot = new UniqueHistorySnapshot(1, snapshot);
    expect(uniqueSnapshot.toSnapshot()).toEqual(snapshot);
  });

  test('mutation', () => {
    const snapshot: HistorySnapshot = {
      mutation: 'test',
      stateData: { sum: 2 },
    };
    const uniqueSnapshot = new UniqueHistorySnapshot(1, snapshot);
    expect(uniqueSnapshot.mutation).toBe('test');
  });

  describe('stateData', () => {
    test('stateData is object', () => {
      const stateData = { sum: 2 };
      const snapshot: HistorySnapshot = {
        mutation: 'test',
        stateData,
      };
      const uniqueSnapshot = new UniqueHistorySnapshot(1, snapshot);
      expect(uniqueSnapshot.stateData).toEqual({ sum: 2 });
      expect(uniqueSnapshot.stateData).not.toBe(stateData);
    });

    test('stateData is array', () => {
      const stateData = [2];
      const snapshot: HistorySnapshot = {
        mutation: 'test',
        stateData,
      };
      const uniqueSnapshot = new UniqueHistorySnapshot(1, snapshot);
      expect(uniqueSnapshot.stateData).toEqual([2]);
      expect(uniqueSnapshot.stateData).not.toBe(stateData);
    });

    test('stateData is not object or array', () => {
      const snapshot: HistorySnapshot = {
        mutation: 'test',
        stateData: 2,
      };
      const uniqueSnapshot = new UniqueHistorySnapshot(1, snapshot);
      expect(uniqueSnapshot.stateData).toEqual(2);
    });
  });
});
