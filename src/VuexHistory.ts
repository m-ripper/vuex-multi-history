import { Store } from 'vuex';

import { InvalidOptionsError } from './errors/InvalidOptionsError';
import { InvalidTypeError } from './errors/InvalidTypeError';
import { InvalidValueError } from './errors/InvalidValueError';
import {
  HistorySnapshot,
  HistorySnapshotId,
  HISTORY_SNAPSHOT_ID_TYPE,
  ReferencableHistorySnapshot,
} from './HistorySnapshot';
import { VuexMultiHistory } from './VuexMultiHistory';

export interface BaseFindSnapshotOptions {}

export interface FindSnapshotByIdOptions extends BaseFindSnapshotOptions {
  id: HistorySnapshotId;
}

export interface FindSnapshotByIndexOptions extends BaseFindSnapshotOptions {
  index: number;
}

export interface FindSnapshotByInstanceOptions extends BaseFindSnapshotOptions {
  instance: ReferencableHistorySnapshot;
}

export type FindSnapshotOptions = FindSnapshotByIdOptions | FindSnapshotByIndexOptions | FindSnapshotByInstanceOptions;

export type GetSnapshotOptions = Exclude<FindSnapshotOptions, FindSnapshotByInstanceOptions>;
export type GetSnapshotIndexOptions = Exclude<FindSnapshotOptions, FindSnapshotByIndexOptions>;

export interface HistoryInterface {
  readonly length: number;
  readonly index: number;
  readonly initialState: any;
  readonly idCount: number;

  addSnapshot(snapshot: HistorySnapshot): HistoryInterface;

  getSnapshot(options: GetSnapshotOptions): ReferencableHistorySnapshot | undefined;

  getSnapshotIndex(options: GetSnapshotIndexOptions): number;

  removeSnapshot(options: FindSnapshotOptions): HistorySnapshot | undefined;

  updateSnapshot(id: FindSnapshotOptions, snapshot: HistorySnapshot): HistoryInterface;

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
  private readonly snapshots: ReferencableHistorySnapshot[];
  private initialStateData: any;
  private hasInitialized: boolean;
  private idCounter: number;

  private store!: Store<any>;

  constructor(private readonly plugin: VuexMultiHistory, private readonly historyKey: string) {
    this.currentIndex = -1;
    this.idCounter = 0;
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

  get idCount(): number {
    return this.idCounter;
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
    this.idCounter++;

    const referencableSnapshot = new ReferencableHistorySnapshot(this.idCounter, snapshot);

    // needed because everything after the currentIndex will be removed if something was undone and then added
    const isLatestSnapshot = this.currentIndex + 1 < this.snapshots.length;

    this.currentIndex++;

    if (this.currentIndex === this.plugin.options.size) {
      this.snapshots.splice(0, 1);
      this.currentIndex--;
    }

    this.snapshots.splice(this.currentIndex, 1, referencableSnapshot);

    if (isLatestSnapshot) {
      this.snapshots.splice(this.currentIndex + 1);
    }
    return this;
  }

  getSnapshot(options: GetSnapshotOptions): ReferencableHistorySnapshot | undefined {
    return this.findSnapshot(options);
  }

  getSnapshotIndex(options: GetSnapshotIndexOptions): number {
    return this.findSnapshotIndex(options);
  }

  removeSnapshot(options: FindSnapshotOptions): HistorySnapshot | undefined {
    const index = this.findSnapshotIndex(options);
    return index >= 0 && this.length > index ? this.snapshots.splice(index, 1)[0] : undefined;
  }

  updateSnapshot(options: FindSnapshotOptions, snapshot: HistorySnapshot): VuexHistory {
    const index = this.findSnapshotIndex(options);
    if (index < 0 || index >= this.length) {
      return this;
    }
    const referencableSnapshot = new ReferencableHistorySnapshot(this.snapshots[index].id, snapshot);
    this.snapshots.splice(index, 1, referencableSnapshot);
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

  deserialize(stateData: any): any {
    return this.plugin.deserialize(this.historyKey, stateData);
  }

  private findSnapshot(options: FindSnapshotOptions): ReferencableHistorySnapshot | undefined {
    try {
      this.validateSnapshotOptions(options);
      return this.snapshots.find(this.findSnapshotClosure.bind(null, options));
    } catch (e) {
      if (this.plugin.options.debug) {
        const errorText = e.stack || e.message;
        console.error(errorText);
      }
      return undefined;
    }
  }

  private findSnapshotIndex(options: FindSnapshotOptions): number {
    try {
      this.validateSnapshotOptions(options);
      return this.snapshots.findIndex(this.findSnapshotClosure.bind(null, options));
    } catch (e) {
      if (this.plugin.options.debug) {
        const errorText = e.stack || e.message;
        console.error(errorText);
      }
      return -1;
    }
  }

  private findSnapshotClosure(
    options: FindSnapshotOptions,
    snapshot: ReferencableHistorySnapshot,
    snapshotIndex: number,
  ): boolean {
    const id = (options as FindSnapshotByIdOptions).id;
    const index = (options as FindSnapshotByIndexOptions).index;
    const instance = (options as FindSnapshotByInstanceOptions).instance;

    if (!isNaN(id)) {
      return snapshot.id === id;
    }
    if (!isNaN(index)) {
      return snapshotIndex === index;
    }
    if (instance) {
      return instance.id === snapshot.id;
    }
    return false;
  }

  private validateSnapshotOptions(options: FindSnapshotOptions) {
    const errors: Error[] = [];
    let hasOptionProvided = false;
    let attemptedToProvideMoreOptions = false;
    const id = (options as FindSnapshotByIdOptions).id;
    const index = (options as FindSnapshotByIndexOptions).index;
    const instance = (options as FindSnapshotByInstanceOptions).instance;

    if (typeof id !== 'undefined') {
      if (typeof id !== HISTORY_SNAPSHOT_ID_TYPE) {
        errors.push(new InvalidTypeError('id', HISTORY_SNAPSHOT_ID_TYPE));
      } else if (id <= 0) {
        errors.push(new InvalidValueError('id', 'has to be greater than zero'));
      }
      hasOptionProvided = true;
    }
    if (typeof index !== 'undefined') {
      if (!hasOptionProvided) {
        if (typeof index !== 'number') {
          errors.push(new InvalidTypeError('index', 'number'));
        } else if (index < 0) {
          errors.push(new InvalidValueError('index', 'has to be greater than or equal to zero'));
        } else if (index >= this.length) {
          errors.push(new InvalidValueError('index', 'has to be less than the length of the history'));
        }
        hasOptionProvided = true;
      } else {
        attemptedToProvideMoreOptions = true;
      }
    }
    if (typeof instance !== 'undefined') {
      if (!hasOptionProvided) {
        if (!(instance instanceof ReferencableHistorySnapshot)) {
          throw new InvalidValueError('instance', `has to be an instance of 'ReferencableHistorySnapshot'`);
        }
      } else {
        attemptedToProvideMoreOptions = true;
      }
    }

    if (attemptedToProvideMoreOptions) {
      errors.push(new Error(`Either 'id', 'index' or 'instance' has to be set, but only one of them.`));
    }

    if (errors.length > 0) {
      const introText = ``;
      throw new InvalidOptionsError(introText, ...errors);
    }
  }

  private replaceState(stateData: any) {
    this.store.replaceState(this.deserialize(stateData));
  }
}
