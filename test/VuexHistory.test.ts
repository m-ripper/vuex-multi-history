import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { DEFAULT_KEY, VuexHistoryPlugin } from '../src';
import {
  INITIAL_SINGLE_STATE,
  INITIAL_SINGLE_STATE_SUM,
  initMockupMultiStore,
  initMockupSingleStore,
  MockupSingleState,
} from './mock/util';
import { VuexHistory } from '../src/VuexHistory';

Vue.use(Vuex);

describe('VuexHistory', () => {
  let plugin!: VuexHistoryPlugin;
  let store!: Store<MockupSingleState>;
  let history!: VuexHistory;

  beforeEach(() => {
    plugin = new VuexHistoryPlugin();
    store = initMockupSingleStore(plugin);
    history = new VuexHistory(plugin, 'test');
  });

  test('init', () => {
    history.init(store);
    expect(history.store).toBeDefined();
    expect(history.store.state).toEqual(INITIAL_SINGLE_STATE);
  });

  describe('addEntry', () => {
    beforeEach(() => {
      plugin = new VuexHistoryPlugin();
      store = initMockupSingleStore(plugin);
      history = new VuexHistory(plugin, 'test').init(store);
    });

    test('no override, because max-size is not reached', () => {
      history.addEntry({
        mutation: 'add',
        state: { sum: 2 },
      });
      expect(history.entries.length).toBe(1);
      expect(history.currentIndex).toBe(0);
    });

    test('override, because max-size is reached', () => {
      plugin.options.size = 1;
      history.addEntry({
        mutation: 'add',
        state: { sum: 2 },
      });
      history.addEntry({
        mutation: 'add',
        state: { sum: 4 },
      });
      expect(history.entries.length).toBe(1);
      expect(history.entries[0].state.sum).toBe(4);
    });

    test('latest entries will be removed when adding after undoing', () => {
      history.addEntry({
        mutation: 'add',
        state: { sum: 2 },
      });
      history.addEntry({
        mutation: 'add',
        state: { sum: 4 },
      });
      history.undo();
      history.addEntry({
        mutation: 'add',
        state: { sum: 8 },
      });
      expect(history.entries.length).toBe(2);
      expect(history.entries[0].state.sum).toBe(2);
      expect(history.entries[1].state.sum).toBe(8);
    });
  });

  describe('methods', () => {
    beforeEach(() => {
      plugin = new VuexHistoryPlugin();
      store = initMockupSingleStore(plugin);
      history = new VuexHistory(plugin, 'test').init(store);
    });

    test('canUndo', () => {
      expect(history.canUndo()).toBeFalsy();
      history.addEntry({
        mutation: 'add',
        state: { sum: 2 },
      });
      expect(history.canUndo()).toBeTruthy();
      history.undo();
      expect(history.canUndo()).toBeFalsy();
    });

    test('canRedo', () => {
      expect(history.canRedo()).toBeFalsy();
      history.addEntry({
        mutation: 'add',
        state: { sum: 2 },
      });
      history.undo();
      expect(history.canRedo()).toBeTruthy();
    });

    test('clearHistory - override initial state', () => {
      store.commit('add', 2);
      history.addEntry({
        mutation: 'add',
        state: { sum: 2 },
      });
      history.clearHistory();
      expect(history.entries.length).toBe(0);
      expect(history.initialState.sum).toBe(2);
    });

    test('clearHistory - not overriding', () => {
      history.addEntry({
        mutation: 'add',
        state: { sum: 2 },
      });
      history.clearHistory(false);
      expect(history.entries.length).toBe(0);
      expect(history.initialState.sum).toBe(INITIAL_SINGLE_STATE_SUM);
    });

    test('hasChanges', () => {
      history.addEntry({
        mutation: 'add',
        state: { sum: 2 },
      });
      expect(history.hasChanges()).toBeTruthy();
      history.addEntry({
        mutation: 'add',
        state: { sum: 0 },
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
      history.addEntry({
        mutation: 'add',
        state: { sum: 2 },
      });
      history.undo().redo();
      expect(store.state.sum).toBe(2);
    });

    test('reset', () => {
      history.addEntry({
        mutation: 'add',
        state: { sum: 2 },
      });
      history.reset();
      expect(plugin.data.historyMap[DEFAULT_KEY].entries.length).toBe(0);
      expect(store.state.sum).toBe(INITIAL_SINGLE_STATE_SUM);
    });

    test('undo', () => {
      history.addEntry({
        mutation: 'add',
        state: { sum: 2 },
      });
      history.undo();
      expect(store.state.sum).toBe(INITIAL_SINGLE_STATE_SUM);
    });
  });
});