import { Store } from 'vuex';

import { VuexMultiHistory } from './VuexMultiHistory';

export interface HistoryEntry {
  mutation: string;
  state: any;
}

export interface HistoryInterface {
  readonly length: number;
  readonly index: number;
  readonly initialState: any;

  addEntry(entry: HistoryEntry): HistoryInterface;
  getEntry(index: number): HistoryEntry | undefined;
  removeEntry(index: number): HistoryEntry | undefined;
  updateEntry(index: number, newEntry: HistoryEntry): HistoryInterface;
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
  private currentIndex: number;
  private readonly entries: HistoryEntry[];
  private initialStateData: any;
  private hasInitialized: boolean;

  private store!: Store<any>;

  constructor(private readonly plugin: VuexMultiHistory, private readonly historyKey: string) {
    this.currentIndex = -1;
    this.entries = [];
    this.initialStateData = null;
    this.hasInitialized = false;
  }

  get length(): number {
    return this.entries.length;
  }

  get index(): number {
    return this.currentIndex;
  }

  get initialState(): any {
    return this.deserialize(this.initialStateData);
  }

  init(store: Store<any>): VuexHistory {
    if (!this.hasInitialized) {
      this.store = store;
      this.overrideInitialState(store.state);
      this.hasInitialized = true;
    }
    return this;
  }

  addEntry(entry: HistoryEntry): VuexHistory {
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
    return this;
  }

  removeEntry(index: number): HistoryEntry | undefined {
    return this.length > index ? this.entries.splice(index, 1)[0] : undefined;
  }

  getEntry(index: number): HistoryEntry | undefined {
    return { ...this.entries[index] };
  }

  updateEntry(index: number, newEntry: HistoryEntry): VuexHistory {
    this.entries.splice(index, 1, newEntry);
    return this;
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
    this.entries.splice(0);
    this.currentIndex = -1;
    if (overrideInitialState) {
      this.overrideInitialState(this.store.state);
    }
  }

  hasChanges(): boolean {
    return this.entries.length > 0;
  }

  overrideInitialState(state: any): VuexHistory {
    this.initialStateData = this.serialize(state);
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
    this.store.replaceState(this.initialStateData);
  }

  undo(): VuexHistory {
    const prevIndex = this.currentIndex - 1;
    if (this.canUndo()) {
      const prevState = prevIndex === -1 ? this.initialStateData : this.entries[prevIndex].state;
      this.replaceState(prevState);
      this.currentIndex--;
    }
    return this;
  }

  serialize(state: any): any {
    return this.plugin.serialize(this.historyKey, state);
  }

  deserialize(data: any): any {
    return this.plugin.deserialize(this.historyKey, data);
  }

  private replaceState(state: any) {
    this.store.replaceState(this.deserialize(state));
  }
}
