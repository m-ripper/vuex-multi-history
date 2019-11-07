import { Store } from 'vuex';

import { VuexMultiHistory } from './VuexMultiHistory';

export interface HistorySnapshot {
  mutation: string;
  stateData: any;
}

export interface HistoryInterface {
  readonly length: number;
  readonly index: number;
  readonly initialState: any;

  addSnapshot(snapshot: HistorySnapshot): HistoryInterface;
  getSnapshot(index: number): HistorySnapshot | undefined;
  removeSnapshot(index: number): HistorySnapshot | undefined;
  updateSnapshot(index: number, snapshot: HistorySnapshot): HistoryInterface;
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
  private readonly snapshots: HistorySnapshot[];
  private initialStateData: any;
  private hasInitialized: boolean;

  private store!: Store<any>;

  constructor(private readonly plugin: VuexMultiHistory, private readonly historyKey: string) {
    this.currentIndex = -1;
    this.snapshots = [];
    this.initialStateData = null;
    this.hasInitialized = false;
  }

  get length(): number {
    return this.snapshots.length;
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

  addSnapshot(snapshot: HistorySnapshot): VuexHistory {
    // needed because everything after the currentIndex will be removed if something was undone and then added
    const isLatestSnapshot = this.currentIndex + 1 < this.snapshots.length;

    this.currentIndex++;

    if (this.currentIndex === this.plugin.options.size) {
      this.snapshots.splice(0, 1);
      this.currentIndex--;
    }

    this.snapshots.splice(this.currentIndex, 1, snapshot);

    if (isLatestSnapshot) {
      this.snapshots.splice(this.currentIndex + 1);
    }
    return this;
  }

  removeSnapshot(index: number): HistorySnapshot | undefined {
    return this.length > index ? this.snapshots.splice(index, 1)[0] : undefined;
  }

  getSnapshot(index: number): HistorySnapshot | undefined {
    return { ...this.snapshots[index] };
  }

  updateSnapshot(index: number, snapshot: HistorySnapshot): VuexHistory {
    this.snapshots.splice(index, 1, snapshot);
    return this;
  }

  canRedo(): boolean {
    const nextIndex = this.currentIndex + 1;
    return nextIndex >= 0 && nextIndex < this.snapshots.length;
  }

  canUndo(): boolean {
    const prevIndex = this.currentIndex - 1;
    return prevIndex >= -1 && this.snapshots.length > prevIndex;
  }

  clearHistory(overrideInitialState = true): void {
    this.snapshots.splice(0);
    this.currentIndex = -1;
    if (overrideInitialState) {
      this.overrideInitialState(this.store.state);
    }
  }

  hasChanges(): boolean {
    return this.snapshots.length > 0;
  }

  overrideInitialState(state: any): VuexHistory {
    this.initialStateData = this.serialize(state);
    return this;
  }

  redo(): VuexHistory {
    const nextIndex = this.currentIndex + 1;
    if (this.canRedo()) {
      const nextStateData = this.snapshots[nextIndex].stateData;
      this.replaceState(nextStateData);
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
      const prevStateData = prevIndex === -1 ? this.initialStateData : this.snapshots[prevIndex].stateData;
      this.replaceState(prevStateData);
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

  private replaceState(stateData: any) {
    this.store.replaceState(this.deserialize(stateData));
  }
}
