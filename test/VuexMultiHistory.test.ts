import Vue from 'vue';
import Vuex, { MutationPayload, Store } from 'vuex';

import { DEFAULT_KEY, VuexMultiHistory } from '../src';
import { VuexHistory } from '../src/VuexHistory';

import {
  initMockupMultiStore,
  initMockupSingleStore,
  INITIAL_SINGLE_STATE_SUM,
  MockupMultiHistoryKeys,
  MockupMultiState,
  MockupSingleState,
} from './mock/util';

Vue.use(Vuex);

describe('VuexHistoryPlugin', () => {
  describe('single history (default)', () => {
    let plugin!: VuexMultiHistory;
    let store!: Store<MockupSingleState>;

    beforeEach(() => {
      plugin = new VuexMultiHistory();
      store = initMockupSingleStore(plugin);
    });

    test('hasChanges', () => {
      store.commit('add', 2);
      expect(store.history().hasChanges()).toBeTruthy();
      store.commit('add', -2);
      expect(store.history().hasChanges()).toBeTruthy();
    });

    test('undo', () => {
      store.commit('add', 2);
      store.history().undo();
      expect(store.state.sum).toBe(INITIAL_SINGLE_STATE_SUM);
    });

    test('canUndo', () => {
      expect(store.history().canUndo()).toBeFalsy();
      store.commit('add', 2);
      expect(store.history().canUndo()).toBeTruthy();
      store.history().undo();
      expect(store.history().canUndo()).toBeFalsy();
    });

    test('redo', () => {
      store.commit('add', 2);
      store
        .history()
        .undo()
        .redo();
      expect(store.state.sum).toBe(2);
    });

    test('canRedo', () => {
      expect(store.history().canRedo()).toBeFalsy();
      store.commit('add', 2);
      store.history().undo();
      expect(store.history().canRedo()).toBeTruthy();
    });

    test('clearHistory - override initial state', () => {
      store.commit('add', 2);
      store.history().clearHistory();
      expect(plugin.data.historyMap[DEFAULT_KEY].length).toBe(0);
      expect(plugin.data.historyMap[DEFAULT_KEY].initialState.sum).toBe(2);
    });

    test('clearHistory - not overriding', () => {
      store.commit('add', 2);
      store.history().clearHistory(false);
      expect(plugin.data.historyMap[DEFAULT_KEY].length).toBe(0);
      expect(plugin.data.historyMap[DEFAULT_KEY].initialState.sum).toBe(INITIAL_SINGLE_STATE_SUM);
    });

    test('reset', () => {
      store.commit('add', 2);
      store.history().reset();
      expect(plugin.data.historyMap[DEFAULT_KEY].length).toBe(0);
      expect(store.state.sum).toBe(INITIAL_SINGLE_STATE_SUM);
    });

    test('overrideInitialState', () => {
      const state = {
        sum: 10,
      };
      store.history().overrideInitialState(state);
      store.history().reset();
      expect(store.state.sum).toBe(10);
    });
  });

  describe('multiple histories', () => {
    let plugin!: VuexMultiHistory;
    let store!: Store<MockupMultiState>;

    beforeEach(() => {
      plugin = new VuexMultiHistory<MockupMultiHistoryKeys>({
        histories: {
          allocate: (mutation: MutationPayload) => {
            return mutation.type === 'updateEditorEntity' ? ['editor'] : ['entities'];
          },
          keys: ['editor', 'entities'],
        },
      });
      store = initMockupMultiStore(plugin);
    });

    test('\'allocate\' returns invalid key', () => {
      plugin.options.histories.allocate = (mutation: MutationPayload) => {
        return ['doesNotExist'];
      };
      expect(() => {
        store.commit('updateEditorEntity', { id: '1', value: 'one' });
      }).toThrow(Error);
    });

    test('history is accessible via it\'s related key', () => {
      expect(store.history('editor') instanceof VuexHistory).toBeTruthy();
    });

    test('error is thrown because there is no history that is related to the given key', () => {
      expect(() => {
        store.history('doesNotExist');
      }).toThrow(Error);
    });
  });

  describe('options', () => {
    let plugin!: VuexMultiHistory;
    let store!: Store<MockupSingleState>;

    beforeEach(() => {
      plugin = new VuexMultiHistory();
      store = initMockupSingleStore(plugin);
    });

    test('filter given', () => {
      plugin.options.filter = (mutation: MutationPayload) => {
        return mutation.type === 'add';
      };
      store.commit('add', 2);
      store.commit('sub', 2);
      expect(store.history().length).toBe(1);
    });
  });
});
