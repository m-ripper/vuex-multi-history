import Vue from 'vue';
import Vuex, { Store } from 'vuex';

import { DEFAULT_KEY, VuexMultiHistory } from '../src';
import { VuexHistory } from '../src/VuexHistory';

import { initMockupSingleStore, INITIAL_SINGLE_STATE_SUM, MockupSingleState } from './mock/util';

Vue.use(Vuex);

describe('VuexHistory', () => {
  let plugin!: VuexMultiHistory;
  let store!: Store<MockupSingleState>;
  let history!: VuexHistory;

  beforeEach(() => {
    plugin = new VuexMultiHistory();
    store = initMockupSingleStore(plugin);
    history = new VuexHistory(plugin, 'test');
  });

  describe('addSnapshot', () => {
    beforeEach(() => {
      plugin = new VuexMultiHistory();
      store = initMockupSingleStore(plugin);
      history = new VuexHistory(plugin, 'test').init(store);
    });

    test('no override, because max-size is not reached', () => {
      history.addSnapshot({
        mutation: 'add',
        stateData: { sum: 2 },
      });
      expect(history.length).toBe(1);
      expect(history.index).toBe(0);
    });

    test('override, because max-size is reached', () => {
      plugin.options.size = 1;
      history.addSnapshot({
        mutation: 'add',
        stateData: { sum: 2 },
      });
      history.addSnapshot({
        mutation: 'add',
        stateData: { sum: 4 },
      });
      expect(history.length).toBe(1);
      expect(history.getSnapshot(0)!.stateData.sum).toBe(4);
    });

    test('latest snapshots will be removed when adding after undoing', () => {
      history.addSnapshot({
        mutation: 'add',
        stateData: { sum: 2 },
      });
      history.addSnapshot({
        mutation: 'add',
        stateData: { sum: 4 },
      });
      history.undo();
      history.addSnapshot({
        mutation: 'add',
        stateData: { sum: 8 },
      });
      expect(history.length).toBe(2);
      expect(history.getSnapshot(0)!.stateData.sum).toBe(2);
      expect(history.getSnapshot(1)!.stateData.sum).toBe(8);
    });
  });

  describe('methods', () => {
    beforeEach(() => {
      plugin = new VuexMultiHistory();
      store = initMockupSingleStore(plugin);
      history = new VuexHistory(plugin, 'test').init(store);
    });

    test('getSnapshot - index in range', () => {
      history.addSnapshot({
        mutation: 'add',
        stateData: { sum: 2 },
      });
      expect(history.getSnapshot(0)!.stateData.sum).toBe(2);
    });

    test('getSnapshot - index not in range', () => {
      history.addSnapshot({
        mutation: 'add',
        stateData: { sum: 2 },
      });
      expect(history.getSnapshot(1)).toBeUndefined();
    });

    test('removeSnapshot - index in range', () => {
      history.addSnapshot({
        mutation: 'add',
        stateData: { sum: 2 },
      });
      history.addSnapshot({
        mutation: 'add',
        stateData: { sum: 4 },
      });
      const removed = history.removeSnapshot(1);
      expect(removed!.stateData.sum).toBe(4);
      expect(history.length).toBe(1);
      expect(history.getSnapshot(0)!.stateData.sum).toBe(2);
    });

    test('removeSnapshot - index not in range', () => {
      history.addSnapshot({
        mutation: 'add',
        stateData: { sum: 2 },
      });
      const removed = history.removeSnapshot(1);
      expect(removed).toBeUndefined();
    });

    test('updateSnapshot - index in range', () => {
      history.addSnapshot({
        mutation: 'add',
        stateData: { sum: 2 },
      });
      history.updateSnapshot(0, {
        mutation: 'add',
        stateData: { sum: 1 },
      });
      expect(history.getSnapshot(0)!.stateData.sum).toBe(1);
    });

    test('updateSnapshot - index not in range', () => {
      history.addSnapshot({
        mutation: 'add',
        stateData: { sum: 2 },
      });
      history.updateSnapshot(1, {
        mutation: 'add',
        stateData: { sum: 1 },
      });
      expect(history.getSnapshot(0)!.stateData.sum).toBe(2);
    });

    test('canUndo', () => {
      expect(history.canUndo()).toBeFalsy();
      history.addSnapshot({
        mutation: 'add',
        stateData: { sum: 2 },
      });
      expect(history.canUndo()).toBeTruthy();
      history.undo();
      expect(history.canUndo()).toBeFalsy();
    });

    test('canRedo', () => {
      expect(history.canRedo()).toBeFalsy();
      history.addSnapshot({
        mutation: 'add',
        stateData: { sum: 2 },
      });
      history.undo();
      expect(history.canRedo()).toBeTruthy();
    });

    test('clearHistory - override initial stateData', () => {
      store.commit('add', 2);
      history.addSnapshot({
        mutation: 'add',
        stateData: { sum: 2 },
      });
      history.clearHistory();
      expect(history.length).toBe(0);
      expect(history.initialState.sum).toBe(2);
    });

    test('clearHistory - not overriding', () => {
      history.addSnapshot({
        mutation: 'add',
        stateData: { sum: 2 },
      });
      history.clearHistory(false);
      expect(history.length).toBe(0);
      expect(history.initialState.sum).toBe(INITIAL_SINGLE_STATE_SUM);
    });

    test('hasChanges', () => {
      history.addSnapshot({
        mutation: 'add',
        stateData: { sum: 2 },
      });
      expect(history.hasChanges()).toBeTruthy();
      history.addSnapshot({
        mutation: 'add',
        stateData: { sum: 0 },
      });
      expect(history.hasChanges()).toBeTruthy();
    });

    test('overrideInitialState', () => {
      const state = {
        sum: 10,
      };
      history.overrideInitialState(state);
      history.reset();
      expect(store.state.sum).toBe(10);
    });

    test('redo', () => {
      history.addSnapshot({
        mutation: 'add',
        stateData: { sum: 2 },
      });
      history.undo().redo();
      expect(store.state.sum).toBe(2);
    });

    test('reset', () => {
      history.addSnapshot({
        mutation: 'add',
        stateData: { sum: 2 },
      });
      history.reset();
      expect(plugin.data.historyMap[DEFAULT_KEY].length).toBe(0);
      expect(store.state.sum).toBe(INITIAL_SINGLE_STATE_SUM);
    });

    test('undo', () => {
      history.addSnapshot({
        mutation: 'add',
        stateData: { sum: 2 },
      });
      history.undo();
      expect(store.state.sum).toBe(INITIAL_SINGLE_STATE_SUM);
    });
  });
});
