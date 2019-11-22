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

  canUndo(amount?: number): boolean;

  canRedo(amount?: number): boolean;

  undo(amount?: number): HistoryInterface;

  redo(amount?: number): HistoryInterface;

  goto(options: FindSnapshotOptions): HistoryInterface;

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

  init(): VuexHistory {
    if (!this.hasInitialized) {
      this.overrideInitialState(this.plugin.store.state);
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

  canRedo(amount = 1): boolean {
    if (amount <= 0) {
      return false;
    }
    const nextIndex = this.currentIndex + amount;
    return nextIndex >= 0 && nextIndex < this.snapshots.length;
  }

  canUndo(amount = 1): boolean {
    if (amount <= 0) {
      return false;
    }
    const prevIndex = this.currentIndex - amount;
    return prevIndex >= -1 && prevIndex < this.snapshots.length;
  }

  clearHistory(overrideInitialState = true): void {
    this.snapshots.splice(0);
    this.currentIndex = -1;
    if (overrideInitialState) {
      this.overrideInitialState(this.plugin.store.state);
    }
  }

  hasChanges(): boolean {
    return this.snapshots.length > 0;
  }

  goto(options: FindSnapshotOptions): HistoryInterface {
    let index = (options as FindSnapshotByIndexOptions).index;
    if (typeof index !== 'number') {
      index = this.getSnapshotIndex(options as GetSnapshotIndexOptions);
    }

    if (index >= 0) {
      const difference = index - this.currentIndex;
      if (difference === 0) {
        return this;
      }
      const total = Math.abs(difference);
      const funcKey: keyof VuexHistory = difference > 0 ? 'redo' : 'undo';

      this[funcKey](total);
    }

    return this;
  }

  overrideInitialState(state: any): VuexHistory {
    this.initialStateData = this.serialize(state);
    return this;
  }

  redo(amount = 1): VuexHistory {
    if (amount <= 0) {
      return this;
    }
    const nextIndex = this.currentIndex + amount;
    if (this.canRedo(amount)) {
      const nextStateData = this.snapshots[nextIndex].stateData;
      this.replaceState(nextStateData);
      this.currentIndex += amount;
    }
    return this;
  }

  reset(): void {
    this.clearHistory(false);
    this.plugin.store.replaceState(this.initialStateData);
  }

  undo(amount = 1): VuexHistory {
    if (amount <= 0) {
      return this;
    }
    const prevIndex = this.currentIndex - amount;
    if (this.canUndo(amount)) {
      const prevStateData = prevIndex < 0 ? this.initialStateData : this.snapshots[prevIndex].stateData;
      this.replaceState(prevStateData);
      this.currentIndex -= amount;
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
    this.plugin.store.replaceState(this.deserialize(stateData));
  }
}
