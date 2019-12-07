import Vue from 'vue';
import Vuex, { MutationPayload, Store } from 'vuex';

import { DEFAULT_KEY, VuexHistory, VuexMultiHistory, VuexMultiHistoryOptions } from '../src';

import {
  INITIAL_SINGLE_STATE,
  INITIAL_SINGLE_STATE_SUM,
  initMockupMultiStore,
  initMockupSingleStore,
  MockupMultiHistoryKeys,
  MockupMultiState,
  MockupSingleState,
} from './mock/util.mock';

Vue.use(Vuex);

describe('VuexHistoryPlugin', () => {
  let plugin!: VuexMultiHistory;

  test('error is thrown because the plugin was not added to plugins', async () => {
    const store = new Store({
      state: { ...INITIAL_SINGLE_STATE },
      mutations: {
        add(state, value) {
          state.sum += value;
        },
        sub(state, value) {
          state.sum -= value;
        },
      },
    });

    let errorMessage = '';
    try {
      await store.history();
    } catch (e) {
      errorMessage = e.message;
    }

    expect(errorMessage).toBe('The plugin has to be installed to be used!');
  });

  describe('single history (default)', () => {
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

    test('clearHistory', () => {
      store.commit('add', 2);
      store.history().clearHistory();
      expect(plugin.data.historyMap[DEFAULT_KEY].length).toBe(0);
      expect(plugin.data.historyMap[DEFAULT_KEY].initialState.sum).toBe(2);
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
    let store!: Store<MockupMultiState>;

    beforeEach(() => {
      plugin = new VuexMultiHistory<MockupMultiHistoryKeys>({
        histories: {
          resolve: (mutation: MutationPayload) => {
            return mutation.type === 'updateEditorEntity' ? ['editor'] : ['entities'];
          },
          keys: ['editor', 'entities'],
        },
      });
      store = initMockupMultiStore(plugin);
    });

    test("'resolve' returns invalid key", () => {
      plugin.options.histories.resolve = (mutation: MutationPayload) => {
        return ['doesNotExist'];
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

  describe('addHistory', () => {
    let store!: Store<MockupSingleState>;

    beforeEach(() => {
      plugin = new VuexMultiHistory();
      store = initMockupSingleStore(plugin);
    });

    test('history was added - key not in use', () => {
      expect(plugin.addHistory('someKey')).toBeInstanceOf(VuexHistory);
    });

    test('history was not added - key in use', () => {
      expect(plugin.addHistory(DEFAULT_KEY)).toBeUndefined();
    });
  });

  describe('hasHistory', () => {
    let store!: Store<MockupSingleState>;

    beforeEach(() => {
      plugin = new VuexMultiHistory();
      store = initMockupSingleStore(plugin);
    });

    test('history was not found - key not in use', () => {
      expect(plugin.hasHistory('someKey')).toBe(false);
    });

    test('history was found - key in use', () => {
      expect(plugin.hasHistory(DEFAULT_KEY)).toBe(true);
    });
  });

  describe('listHistoryKeys', () => {
    let store!: Store<MockupSingleState>;

    beforeEach(() => {
      plugin = new VuexMultiHistory();
      store = initMockupSingleStore(plugin);
    });

    test('history keys returned', () => {
      expect(plugin.listHistoryKeys()).toEqual([DEFAULT_KEY]);
    });
  });

  describe('getHistory', () => {
    let store!: Store<MockupSingleState>;

    beforeEach(() => {
      plugin = new VuexMultiHistory();
      store = initMockupSingleStore(plugin);
    });

    test('history was not found - key not in use', () => {
      expect(() => plugin.getHistory('someKey')).toThrowError();
    });

    test('history was found - key in use', () => {
      expect(plugin.getHistory()).toBeInstanceOf(VuexHistory);
    });
  });

  describe('removeHistory', () => {
    let store!: Store<MockupSingleState>;

    beforeEach(() => {
      plugin = new VuexMultiHistory();
      store = initMockupSingleStore(plugin);
    });
    test('history was not removed - key not in use', () => {
      expect(plugin.removeHistory('someKey')).toBeUndefined();
    });

    test('history was removed - key in use', () => {
      expect(plugin.removeHistory(DEFAULT_KEY)).toBeInstanceOf(VuexHistory);
    });
  });

  describe('options', () => {
    let store!: Store<MockupSingleState>;

    beforeEach(() => {
      plugin = new VuexMultiHistory();
      store = initMockupSingleStore(plugin);
    });

    test(`'filter' given`, () => {
      plugin.options.filter = (mutation: MutationPayload) => {
        return mutation.type === 'add';
      };
      store.commit('add', 2);
      store.commit('sub', 2);
      expect(store.history().length).toBe(1);
    });

    describe(`'histories' given`, () => {
      test(`passed via constructor - works`, () => {
        plugin = new VuexMultiHistory({
          histories: {
            resolve(mutation: MutationPayload) {
              return mutation.type === 'add' ? ['one'] : ['two'];
            },
            keys: ['one', 'two'],
          },
        });
        store = initMockupSingleStore(plugin);

        store.commit('add', 2);
        expect(plugin.data.historyMap.one.length).toBe(1);
        expect(plugin.data.historyMap.two.length).toBe(0);
      });

      test(`passed manually - does not work, has to be provided in constructor`, () => {
        plugin = new VuexMultiHistory();
        store = initMockupSingleStore(plugin);

        plugin.options.histories = {
          resolve(mutation: MutationPayload) {
            return mutation.type === 'add' ? ['one'] : ['two'];
          },
          keys: ['one', 'two'],
        };

        expect(plugin.data.historyMap.one).toBeUndefined();
        expect(plugin.data.historyMap.two).toBeUndefined();
      });
    });

    test(`'transform' given`, () => {
      plugin.options.transform = {
        serialize(historyKey: string, state: any) {
          return state.sum;
        },
        deserialize(historyKey: string, stateData: any) {
          return {
            sum: stateData,
          };
        },
      };

      const serialized = plugin.serialize(DEFAULT_KEY, { sum: 2 });
      expect(serialized).toBe(2);
      const deserialized = plugin.deserialize(DEFAULT_KEY, serialized);
      expect(deserialized).toEqual({ sum: 2 });
    });

    describe('validateOptions', () => {
      test('`size` wrong type or undefined', () => {
        const options: any = {
          size: {},
        };

        expect(() => {
          return new VuexMultiHistory(options);
        }).toThrowError();
      });

      test('`size` less than or equal to zero', () => {
        const options: any = {
          size: 0,
        };

        expect(() => {
          return new VuexMultiHistory(options);
        }).toThrowError();
      });

      test('`filter` wrong type or undefined', () => {
        const options: any = {
          filter: {},
        };

        expect(() => {
          return new VuexMultiHistory(options);
        }).toThrowError();
      });

      test('`histories.keys` wrong type or undefined', () => {
        const options: any = {
          histories: {
            resolve: (mutation: MutationPayload) => {
              return [''];
            },
            keys: undefined,
          },
        };

        expect(() => {
          return new VuexMultiHistory(options);
        }).toThrowError();
      });

      test('`histories.keys` wrong type or undefined', () => {
        const options: any = {
          histories: {
            resolve: (mutation: MutationPayload) => {
              return [''];
            },
            keys: undefined,
          },
        };

        expect(() => {
          return new VuexMultiHistory(options);
        }).toThrowError();
      });

      test('`histories.resolve` wrong type or undefined', () => {
        const options: any = {
          histories: {
            resolve: 1,
            keys: ['test'],
          },
        };
        expect(() => {
          return new VuexMultiHistory(options);
        }).toThrowError();
      });
      test('`transform.serialize` wrong type or undefined', () => {
        const options: any = {
          transform: {
            serialize: {},
            deserialize: (historyKey: string, stateData: any) => {
              return stateData;
            },
          },
        };
        expect(() => {
          return new VuexMultiHistory(options);
        }).toThrowError();
      });
      test('`transform.deserialize` wrong type or undefined', () => {
        const options: any = {
          transform: {
            serialize: (historyKey: string, state: any) => {
              return state;
            },
            deserialize: {},
          },
        };
        expect(() => {
          return new VuexMultiHistory(options);
        }).toThrowError();
      });
    });
  });
});
