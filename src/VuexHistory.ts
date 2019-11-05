import { Store } from 'vuex';
import { VuexHistoryPlugin } from './VuexHistoryPlugin';

export interface HistoryEntry {
  mutation: string;
  state: any;
}

export interface HistoryInterface {
  entries: HistoryEntry[];
  initialState: any;
  currentIndex: number;

  init(store: Store<any>): HistoryInterface;
  addEntry(entry: HistoryEntry): void;
  hasChanges(): boolean;
  canUndo(): boolean;
  canRedo(): boolean;
  undo(): HistoryInterface;
  redo(): HistoryInterface;
  clearHistory(overrideInitialState?: boolean): void;
  reset(): void;
  overrideInitialState(state: any): HistoryInterface;
}

export class VuexHistory implements HistoryInterface {
  currentIndex: number;
  entries: HistoryEntry[];
  initialState: any;

  store!: Store<any>;

  constructor(private readonly plugin: VuexHistoryPlugin, private readonly historyKey: string) {
    this.currentIndex = -1;
    this.entries = [];
    this.initialState = null;
  }

  init(store: Store<any>): VuexHistory {
    this.store = store;
    this.overrideInitialState(store.state);
    return this;
  }

  addEntry(entry: HistoryEntry): void {
    // needed because everything after the currentIndex will be removed if something was undone and then added
    const isLatestEntry = this.currentIndex + 1 < this.entries.length;

    this.currentIndex++;

    if (this.currentIndex === this.plugin.options.size) {
      this.entries.splice(0, 1);
      this.currentIndex--;
    }

    this.entries.splice(this.currentIndex, 1, entry);

    if (isLatestEntry) {
      this.entries.splice(this.currentIndex + 1);
    }
  }

  canRedo(): boolean {
    const nextIndex = this.currentIndex + 1;
    return nextIndex >= 0 && nextIndex < this.entries.length;
  }

  canUndo(): boolean {
    const prevIndex = this.currentIndex - 1;
    return prevIndex >= -1 && this.entries.length > prevIndex;
  }

  clearHistory(overrideInitialState = true): void {
    this.entries = [];
    this.currentIndex = -1;
    if (overrideInitialState) {
      this.initialState = this.serialize(this.store.state);
    }
  }

  hasChanges(): boolean {
    return this.entries.length > 0;
  }

  overrideInitialState(state: any): VuexHistory {
    this.initialState = this.deserialize(state);
    return this;
  }

  redo(): VuexHistory {
    const nextIndex = this.currentIndex + 1;
    if (this.canRedo()) {
      const nextState = this.entries[nextIndex].state;
      this.replaceState(nextState);
      this.currentIndex++;
    }
    return this;
  }

  reset(): void {
    this.clearHistory(false);
    this.store.replaceState(this.deserialize(this.initialState));
  }

  undo(): VuexHistory {
    const prevIndex = this.currentIndex - 1;
    if (this.canUndo()) {
      const prevState = prevIndex === -1 ? this.initialState : this.entries[prevIndex].state;
      this.replaceState(prevState);
      this.currentIndex--;
    }
    return this;
  }

  deserialize(data: any): any {
    return this.plugin.serialize(this.historyKey, data);
  }

  serialize(state: any): any {
    return this.plugin.deserialize(this.historyKey, state);
  }

  private replaceState(state: any) {
    this.store.replaceState(this.deserialize(state));
  }
}
