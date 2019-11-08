import Vue from 'vue';
import Vuex, { Store } from 'vuex';

import { DEFAULT_KEY, VuexMultiHistory } from '../src';
import { VuexHistory } from '../src/VuexHistory';

import { initMockupSingleStore, INITIAL_SINGLE_STATE_SUM, MockupSingleState } from './mock/util.mock';

Vue.use(Vuex);

function addTestSnapshot(history: VuexHistory, sum: number) {
  history.addSnapshot({
    mutation: 'test',
    stateData: { sum },
  });
}

describe('VuexHistory', () => {
  let plugin!: VuexMultiHistory;
  let store!: Store<MockupSingleState>;
  let history!: VuexHistory;

  beforeEach(() => {
    plugin = new VuexMultiHistory();
    store = initMockupSingleStore(plugin);
    history = new VuexHistory(plugin, 'test').init(store);
  });

  describe('validateFindOptions', () => {
    beforeEach(() => {
      plugin = new VuexMultiHistory();
      store = initMockupSingleStore(plugin);
      history = new VuexHistory(plugin, 'test').init(store);
      addTestSnapshot(history, 2);
    });

    test('print validation errors when debug enabled', () => {
      const BACKUP_ERROR = console.error;
      // tslint:disable-next-line
      console.error = () => {};
      const spy = jest.spyOn(console, 'error');
      plugin.options.debug = true;
      history.getSnapshot({ id: 0 });
      history.getSnapshotIndex({ id: 0 });
      expect(spy).toHaveBeenCalledTimes(2);
      console.error = BACKUP_ERROR;
    });

    describe(`'id' provided`, () => {
      beforeEach(() => {
        plugin = new VuexMultiHistory();
        store = initMockupSingleStore(plugin);
        history = new VuexHistory(plugin, 'test').init(store);
        addTestSnapshot(history, 2);
      });

      test('wrong type or undefined', () => {
        expect(history.getSnapshot({ id: {} } as any)).toBeUndefined();
      });

      test('less than or equal to zero', () => {
        expect(history.getSnapshot({ id: 0 })).toBeUndefined();
      });
    });

    describe(`'index' provided`, () => {
      beforeEach(() => {
        plugin = new VuexMultiHistory();
        store = initMockupSingleStore(plugin);
        history = new VuexHistory(plugin, 'test').init(store);
        addTestSnapshot(history, 2);
      });

      test('wrong type or undefined', () => {
        expect(history.getSnapshot({ index: {} } as any)).toBeUndefined();
      });

      test('less than or equal to zero', () => {
        expect(history.getSnapshot({ index: -1 })).toBeUndefined();
      });

      test(`has 'id' set already`, () => {
        expect(history.getSnapshot({ id: 1, index: 0 })).toBeUndefined();
      });
    });

    describe(`'instance' provided`, () => {
      beforeEach(() => {
        plugin = new VuexMultiHistory();
        store = initMockupSingleStore(plugin);
        history = new VuexHistory(plugin, 'test').init(store);
        addTestSnapshot(history, 2);
        addTestSnapshot(history, 4);
      });

      test('wrong type or undefined', () => {
        expect(history.getSnapshot({ instance: {} } as any)).toBeUndefined();
      });

      test(`has set 'id' or 'index' already`, () => {
        const snapshot = history.getSnapshot({ index: 0 });
        expect(history.getSnapshot({ id: 1, index: 0, instance: snapshot } as any)).toBeUndefined();
      });
    });

    test('none of the above provided', () => {
      expect(history.getSnapshot({} as any)).toBeUndefined();
    });
  });

  describe('addSnapshot', () => {
    beforeEach(() => {
      plugin = new VuexMultiHistory();
      store = initMockupSingleStore(plugin);
      history = new VuexHistory(plugin, 'test').init(store);
    });

    test('increment idCount', () => {
      addTestSnapshot(history, 2);
      expect(history.idCount).toBe(1);
    });

    test('no override, because max-size is not reached', () => {
      plugin.options.size = 1;

      addTestSnapshot(history, 2);

      expect(history.length).toBe(1);
      expect(history.index).toBe(0);
    });

    test('override, because max-size is reached', () => {
      plugin.options.size = 1;

      addTestSnapshot(history, 2);
      addTestSnapshot(history, 4);

      expect(history.length).toBe(1);
      expect(history.getSnapshot({ index: 0 })!.stateData.sum).toBe(4);
    });

    test('latest snapshots will be removed when not sync with latest snapshot', () => {
      addTestSnapshot(history, 2);
      addTestSnapshot(history, 4);
      history.undo();
      addTestSnapshot(history, 8);

      expect(history.length).toBe(2);
      expect(history.getSnapshot({ index: 0 })!.stateData.sum).toBe(2);
      expect(history.getSnapshot({ index: 1 })!.stateData.sum).toBe(8);
    });
  });

  describe('getSnapshot', () => {
    beforeEach(() => {
      plugin = new VuexMultiHistory();
      store = initMockupSingleStore(plugin);
      history = new VuexHistory(plugin, 'test').init(store);
      addTestSnapshot(history, 2);
    });

    test(`valid 'id'`, () => {
      expect(history.getSnapshot({ id: 1 })).toBeDefined();
    });

    test(`invalid 'id'`, () => {
      expect(history.getSnapshot({ id: 0 })).toBeUndefined();
    });

    test(`valid 'index'`, () => {
      expect(history.getSnapshot({ index: 0 })).toBeDefined();
    });

    test(`invalid 'index'`, () => {
      expect(history.getSnapshot({ index: 1 })).toBeUndefined();
    });
  });

  describe('getSnapshotIndex', () => {
    beforeEach(() => {
      plugin = new VuexMultiHistory();
      store = initMockupSingleStore(plugin);
      history = new VuexHistory(plugin, 'test').init(store);
      addTestSnapshot(history, 2);
    });

    test(`valid 'id'`, () => {
      expect(history.getSnapshotIndex({ id: 1 })).toBe(0);
    });

    test(`invalid 'id'`, () => {
      expect(history.getSnapshotIndex({ id: 0 })).toBe(-1);
    });

    test(`valid 'instance'`, () => {
      const snapshot = history.getSnapshot({ index: 0 })!;
      expect(history.getSnapshotIndex({ instance: snapshot })).toBe(0);
    });

    test(`invalid 'instance'`, () => {
      expect(history.getSnapshotIndex({ instance: { mutation: 'test', stateData: {} } as any })).toBe(-1);
    });
  });

  describe('removeSnapshot', () => {
    beforeEach(() => {
      plugin = new VuexMultiHistory();
      store = initMockupSingleStore(plugin);
      history = new VuexHistory(plugin, 'test').init(store);
      addTestSnapshot(history, 2);
    });

    test('success', () => {
      const removed = history.removeSnapshot({ index: 0 })!;

      expect(removed.stateData.sum).toBe(2);
    });

    test('failure', () => {
      const removed = history.removeSnapshot({ index: 1 });

      expect(removed).toBeUndefined();
    });
  });

  describe('updateSnapshot', () => {
    beforeEach(() => {
      plugin = new VuexMultiHistory();
      store = initMockupSingleStore(plugin);
      history = new VuexHistory(plugin, 'test').init(store);
      addTestSnapshot(history, 2);
    });

    test('success', () => {
      history.updateSnapshot({ index: 0 }, { mutation: 'test', stateData: { sum: 4 } });
      expect(history.getSnapshot({ index: 0 })!.stateData.sum).toBe(4);
    });

    test('failure', () => {
      history.updateSnapshot({ index: 1 }, { mutation: 'test', stateData: { sum: 4 } });
      expect(history.getSnapshot({ index: 0 })!.stateData.sum).toBe(2);
    });
  });

  describe('clearHistory', () => {
    beforeEach(() => {
      plugin = new VuexMultiHistory();
      store = initMockupSingleStore(plugin);
      history = new VuexHistory(plugin, 'test').init(store);
      store.commit('add', 2);
    });

    test('override initial state', () => {
      history.clearHistory();
      expect(history.initialState.sum).toBe(2);
    });

    test('does not override initial state', () => {
      history.clearHistory(false);
      expect(history.initialState.sum).toBe(0);
    });
  });

  describe('goto', () => {
    beforeEach(() => {
      plugin = new VuexMultiHistory();
      store = initMockupSingleStore(plugin);
      history = new VuexHistory(plugin, 'test').init(store);
      addTestSnapshot(history, 2);
      addTestSnapshot(history, 4);
      addTestSnapshot(history, 8);
    });

    test(`'index' in options`, () => {
      history.goto({ index: 0 });
      expect(history.index).toBe(0);
    });

    test(`not 'index' in options`, () => {
      history.goto({ id: 2 });
      expect(history.index).toBe(1);
    });

    test('resulting index of options is the same as the current index > nothing happens', () => {
      history.goto({ id: 3 });
      expect(history.index).toBe(2);
    });
  });

  describe('canUndo', () => {
    beforeEach(() => {
      plugin = new VuexMultiHistory();
      store = initMockupSingleStore(plugin);
      history = new VuexHistory(plugin, 'test').init(store);
    });

    test('no argument passed', () => {
      expect(history.canUndo()).toBeFalsy();
      addTestSnapshot(history, 2);
      expect(history.canUndo()).toBeTruthy();
    });

    test(`'amount' passed but invalid`, () => {
      addTestSnapshot(history, 2);
      expect(history.canUndo(0)).toBeFalsy();
    });

    test('cannot undo after undo', () => {
      addTestSnapshot(history, 2);
      history.undo();
      expect(history.canUndo()).toBeFalsy();
    });

    test(`'amount' passed and valid`, () => {
      addTestSnapshot(history, 2);
      addTestSnapshot(history, 4);
      expect(history.canUndo(2)).toBeTruthy();
    });
  });

  describe('canRedo', () => {
    beforeEach(() => {
      plugin = new VuexMultiHistory();
      store = initMockupSingleStore(plugin);
      history = new VuexHistory(plugin, 'test').init(store);
    });

    test('no argument passed', () => {
      expect(history.canRedo()).toBeFalsy();
      addTestSnapshot(history, 2);
      history.undo();
      expect(history.canRedo()).toBeTruthy();
    });

    test(`'amount' passed but invalid`, () => {
      addTestSnapshot(history, 2);
      history.undo();
      expect(history.canRedo(0)).toBeFalsy();
    });

    test('cannot redo after redo', () => {
      addTestSnapshot(history, 2);
      history.undo();
      history.redo();
      expect(history.canUndo()).toBeTruthy();
      expect(history.canRedo()).toBeFalsy();
    });

    test(`'amount' passed and valid`, () => {
      addTestSnapshot(history, 2);
      addTestSnapshot(history, 4);
      history.undo(2);
      expect(history.canRedo(2)).toBeTruthy();
    });
  });

  describe('undo', () => {
    beforeEach(() => {
      plugin = new VuexMultiHistory();
      store = initMockupSingleStore(plugin);
      history = new VuexHistory(plugin, 'test').init(store);
    });

    test('no argument passed', () => {
      addTestSnapshot(history, 2);
      history.undo();
      expect(history.index).toBe(-1);
    });

    test(`'amount' passed but invalid`, () => {
      addTestSnapshot(history, 2);
      history.undo(0);
      expect(history.index).toBe(0);
    });

    test(`'amount' passed and valid`, () => {
      addTestSnapshot(history, 2);
      addTestSnapshot(history, 4);
      history.undo(2);
      expect(history.index).toBe(-1);
    });
  });

  describe('redo', () => {
    beforeEach(() => {
      plugin = new VuexMultiHistory();
      store = initMockupSingleStore(plugin);
      history = new VuexHistory(plugin, 'test').init(store);
    });

    test('no argument passed', () => {
      addTestSnapshot(history, 2);
      history.undo();
      history.redo();
      expect(history.index).toBe(0);
    });

    test(`'amount' passed but invalid`, () => {
      addTestSnapshot(history, 2);
      history.undo();
      history.redo(0);
      expect(history.index).toBe(-1);
    });

    test(`'amount' passed and valid`, () => {
      addTestSnapshot(history, 2);
      addTestSnapshot(history, 4);
      history.undo(2);
      history.redo(2);
      expect(history.index).toBe(1);
    });
  });

  test('hasChanges', () => {
    addTestSnapshot(history, 2);
    expect(history.hasChanges()).toBeTruthy();
    history.clearHistory(false);
    expect(history.hasChanges()).toBeFalsy();
  });

  test('overrideInitialState', () => {
    const state = {
      sum: 10,
    };
    history.overrideInitialState(state);
    history.reset();

    expect(store.state.sum).toBe(10);
  });

  test('reset', () => {
    addTestSnapshot(history, 2);
    history.reset();

    expect(plugin.data.historyMap[DEFAULT_KEY].length).toBe(0);
    expect(store.state.sum).toBe(INITIAL_SINGLE_STATE_SUM);
  });
});
