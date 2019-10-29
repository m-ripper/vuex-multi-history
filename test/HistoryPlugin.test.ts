import { HistoryPlugin } from '../src/HistoryPlugin';
import Vuex, { Store } from 'vuex';
import Vue from 'vue';

Vue.use(Vuex);

describe('HistoryPlugin - construct', () => {
  test('without options', () => {
    const plugin = new HistoryPlugin();
    expect(plugin.options.size).toBe(50);
  });

  test('with options', () => {
    const plugin = new HistoryPlugin({
      size: 20,
    });
    expect(plugin.options.size).toBe(20);
  });
});

describe('HistoryPlugin - methods & sequences', () => {});

describe('HistoryPlugin - methods', () => {
  let plugin!: HistoryPlugin;
  let store!: Store<{ sum: number }>;

  const initialSum = 0;
  const initialState = { sum: initialSum };

  beforeEach(() => {
    plugin = new HistoryPlugin();
    store = new Store({
      state: { ...initialState },
      mutations: {
        add(state, value) {
          state.sum += value;
        },
      },
      plugins: [plugin.plugin],
    });
  });

  test('hasChanges', () => {
    store.commit('add', 2);
    expect(store.hasChanges()).toBeTruthy();
    store.commit('add', -2);
    expect(store.hasChanges()).toBeTruthy();
  });

  test('undo', () => {
    store.commit('add', 2);
    store.undo();
    expect(store.state.sum).toBe(initialSum);
  });

  test('canUndo', () => {
    expect(store.canUndo()).toBeFalsy();
    store.commit('add', 2);
    expect(store.canUndo()).toBeTruthy();
    store.undo();
    expect(store.canUndo()).toBeFalsy();
  });

  test('redo', () => {
    store.commit('add', 2);
    store.undo();
    store.redo();
    expect(store.state.sum).toBe(2);
  });

  test('canRedo', () => {
    expect(store.canRedo()).toBeFalsy();
    store.commit('add', 2);
    store.undo();
    expect(store.canRedo()).toBeTruthy();
  });

  test('clearHistory - override initial state', () => {
    store.commit('add', 2);
    store.clearHistory();
    expect(plugin.data.entries.length).toBe(0);
    expect(plugin.data.initialState.sum).toBe(2);
  });

  test('clearHistory - not overriding', () => {
    store.commit('add', 2);
    store.clearHistory(false);
    expect(plugin.data.entries.length).toBe(0);
    expect(plugin.data.initialState.sum).toBe(initialSum);
  });

  test('reset', () => {
    store.commit('add', 2);
    store.reset();
    expect(plugin.data.entries.length).toBe(0);
    expect(store.state.sum).toBe(initialSum);
  });

  test('overrideInitialState', () => {
    const state = {
      sum: 10,
    };
    store.overrideInitialState(state);
    store.reset();
    expect(store.state.sum).toBe(10);
  });
});

describe('HistoryPlugin - sequences', () => {
  const initialSum = 0;
  const initialState = { sum: initialSum };

  const plugin: HistoryPlugin = new HistoryPlugin();
  const store: Store<{ sum: number }> = new Store({
    state: { ...initialState },
    mutations: {
      add(state, value) {
        state.sum += value;
      },
    },
    plugins: [plugin.plugin],
  });

  afterEach(() => {
    store.reset();
  });

  // m = mutation, r = redo, u = undo
  test('m - m - u - r - u - u', () => {
    store.commit('add', 2);
    store.commit('add', 4);
    store.undo();
    expect(store.state.sum).toBe(2);
    store.redo();
    expect(store.state.sum).toBe(6);
    store.undo();
    expect(store.state.sum).toBe(2);
    store.undo();
    expect(store.state.sum).toBe(initialSum);
  });
});
