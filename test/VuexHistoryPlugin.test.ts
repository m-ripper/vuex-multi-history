import Vuex, { MutationPayload, Store } from 'vuex';
import Vue from 'vue';
import { DEFAULT_KEY, VuexHistoryPlugin } from '../src';
import {
  INITIAL_SINGLE_STATE_SUM,
  initMockupMultiStore,
  initMockupSingleStore,
  MockupMultiHistoryKeys,
  MockupMultiState,
  MockupSingleState,
} from './mock/util';
import { VuexHistory } from '../src/VuexHistory';

Vue.use(Vuex);

describe('VuexHistoryPlugin', () => {
  describe('single history (default)', () => {
    let plugin!: VuexHistoryPlugin;
    let store!: Store<MockupSingleState>;

    beforeEach(() => {
      plugin = new VuexHistoryPlugin();
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
      expect(plugin.data.historyMap[DEFAULT_KEY].entries.length).toBe(0);
      expect(plugin.data.historyMap[DEFAULT_KEY].initialState.sum).toBe(2);
    });

    test('clearHistory - not overriding', () => {
      store.commit('add', 2);
      store.history().clearHistory(false);
      expect(plugin.data.historyMap[DEFAULT_KEY].entries.length).toBe(0);
      expect(plugin.data.historyMap[DEFAULT_KEY].initialState.sum).toBe(INITIAL_SINGLE_STATE_SUM);
    });

    test('reset', () => {
      store.commit('add', 2);
      store.history().reset();
      expect(plugin.data.historyMap[DEFAULT_KEY].entries.length).toBe(0);
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
    let plugin!: VuexHistoryPlugin;
    let store!: Store<MockupMultiState>;

    beforeEach(() => {
      plugin = new VuexHistoryPlugin<MockupMultiHistoryKeys>({
        histories: {
          allocate: (mutation: MutationPayload) => {
            if (mutation.type === 'updateEditorEntity') {
              return 'editor';
            } else {
              return 'entities';
            }
          },
          keys: ['editor', 'entities'],
        },
      });
      store = initMockupMultiStore(plugin);
    });

    test("'allocate' returns invalid key", () => {
      plugin.options.histories.allocate = (mutation: MutationPayload) => {
        return 'doesNotExist';
      };
      expect(() => {
        store.commit('updateEditorEntity', { id: '1', value: 'one' });
      }).toThrow(Error);
    });

    test("history is accessible via it's related key", () => {
      expect(store.history('editor') instanceof VuexHistory).toBeTruthy();
    });

    test('error is thrown because there is no history that is related to the given key', () => {
      expect(() => {
        store.history('doesNotExist');
      }).toThrow(Error);
    });
  });

  describe('options', () => {
    let plugin!: VuexHistoryPlugin;
    let store!: Store<MockupSingleState>;

    beforeEach(() => {
      plugin = new VuexHistoryPlugin();
      store = initMockupSingleStore(plugin);
    });

    test('filter given', () => {
      plugin.options.filter = (mutation: MutationPayload) => {
        return mutation.type === 'add';
      };
      store.commit('add', 2);
      store.commit('sub', 2);
      expect(store.history().entries.length).toBe(1);
    });
  });
});
