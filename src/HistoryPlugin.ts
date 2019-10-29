import {Store, StoreOptions} from 'vuex';
import Vue from 'vue';

export interface HistoryEntry {
  mutation: string;
  state: any;
}

export interface HistoryPluginOptions {
  modules?: string[];
  mutations?: string[];
  size: number;
  initialState?: Record<string, any>;
}

const defaultOptions: HistoryPluginOptions = {
  size: 50,
};

declare module 'vuex' {
  interface Store<S> {
    historyLength: number;

    canUndo(): boolean;

    canRedo(): boolean;

    undo(): void;

    redo(): void;

    clearHistory(overrideInitialState?: boolean): void;

    hasChanges(): boolean;

    reset(): void;

    overrideInitialState<S>(state: S): void;
  }
}

interface Data {
  entries: HistoryEntry[];
  currentIndex: number;
  initialState: any;
}

export class HistoryPlugin {
  plugin: (state: Store<any>) => void;

  data: Data;

  options: HistoryPluginOptions;

  constructor(options?: Partial<HistoryPluginOptions>) {
    this.options = Object.assign(defaultOptions, options);

    this.data = Vue.observable<Data>({
      entries: [],
      currentIndex: -1,
      initialState: null,
    });


    this.plugin = (store: Store<any>) => {
      this.data.initialState = this.removeObservers(store.state);
      store.subscribe((mutation, state) => {
        if (!this.data.initialState && this.data.currentIndex === -1) {
          this.data.initialState = this.removeObservers(state);
        }

        const willRemoveEntries = this.data.currentIndex + 1 < this.data.entries.length;

        this.data.currentIndex++;

        if (this.data.currentIndex === this.options.size) {
          this.data.entries.splice(0, 1);
          this.data.currentIndex--;
        }

        const newEntry: HistoryEntry = {
          mutation: mutation.type,
          state: this.removeObservers(state),
        };

        this.data.entries.splice(this.data.currentIndex, 1, newEntry);

        if (willRemoveEntries) {
          this.data.entries.splice(this.data.currentIndex + 1);
        }
      });

      Store.prototype.hasChanges = this.hasChanges.bind(this);
      Store.prototype.canUndo = this.canUndo.bind(this);
      Store.prototype.canRedo = this.canRedo.bind(this);
      Store.prototype.undo = this.undo.bind(this, store);
      Store.prototype.redo = this.redo.bind(this, store);
      Store.prototype.reset = this.reset.bind(this, store);
      Store.prototype.clearHistory = this.clearHistory.bind(this, store);
      Store.prototype.overrideInitialState = this.overrideInitialState.bind(this);
      Store.prototype.historyLength = this.data.entries.length;
      // Store.prototype.historyPluginData = this.data;
    };
  }

  hasChanges(): boolean {
    return this.data.entries.length > 0;
  }

  canUndo(): boolean {
    const prevIndex = this.data.currentIndex - 1;
    return prevIndex >= -1 && this.data.entries.length > prevIndex;
  }

  canRedo(): boolean {
    const nextIndex = this.data.currentIndex + 1;
    return nextIndex >= 0 && nextIndex < this.data.entries.length;
  }

  undo(store: Store<any>) {
    const prevIndex = this.data.currentIndex - 1;
    if (this.canUndo()) {
      const prevState = prevIndex === -1 ? this.data.initialState : this.data.entries[prevIndex].state;
      store.replaceState(this.removeObservers(prevState));
      this.data.currentIndex--;
    }
  }

  redo(store: Store<any>) {
    const nextIndex = this.data.currentIndex + 1;
    if (this.canRedo()) {
      const nextState = this.data.entries[nextIndex].state;
      store.replaceState(this.removeObservers(nextState));
      this.data.currentIndex++;
    }
  }

  clearHistory(store: Store<any>, overrideInitialState: boolean = true) {
    this.data.entries = [];
    this.data.currentIndex = -1;
    if (overrideInitialState) {
      this.data.initialState = this.removeObservers(store.state);
    }
  }

  reset(store: Store<any>) {
    this.clearHistory(store, false);
    store.replaceState(this.removeObservers(this.data.initialState));
  }

  overrideInitialState<S extends Record<string, any> = {}>(state: S) {
    this.data.initialState = this.removeObservers(state);
  }

  private removeObservers<T = any>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
  }
}
