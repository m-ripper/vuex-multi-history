import Vue from 'vue';
import { MutationPayload, Plugin, Store } from 'vuex';

import {
  DefaultKey,
  DeserializeFunction,
  FilterFunction,
  HistorySnapshot,
  InvalidOptionsError,
  InvalidTypeError,
  InvalidValueError,
  ResolveFunction,
  SerializeFunction,
} from './';
import { VuexHistory } from './VuexHistory';

// tslint:disable-next-line
const DEFAULT_FILTER: FilterFunction = function(mutation: MutationPayload) {
  return true;
};
// tslint:disable-next-line
const DEFAULT_RESOLVE: ResolveFunction = function(mutation: MutationPayload) {
  return [this.options.histories.keys[0]];
};
// tslint:disable-next-line
const DEFAULT_SERIALIZE: SerializeFunction = function(historyKey: string, state: any) {
  return state;
};
// tslint:disable-next-line
const DEFAULT_DESERIALIZE: DeserializeFunction = function(historyKey: string, stateData: any, state: any) {
  return stateData;
};
export const DEFAULT_KEY: DefaultKey = 'default';

type HistoryMap = Record<string, VuexHistory>;

interface Data {
  historyMap: HistoryMap;
}

export interface HistoriesOptions {
  keys: string[];
  resolve: ResolveFunction;
}

export interface TransformOptions {
  serialize: SerializeFunction;
  deserialize: DeserializeFunction;
}

export interface VuexMultiHistoryOptions {
  debug?: boolean;
  size?: number;
  filter?: FilterFunction;
  histories?: HistoriesOptions;
  transform?: TransformOptions;
}

const generateDefaultOptions: () => Required<VuexMultiHistoryOptions> = () => {
  return {
    debug: false,
    size: 50,
    filter: DEFAULT_FILTER,
    histories: {
      resolve: DEFAULT_RESOLVE,
      keys: [DEFAULT_KEY],
    },
    transform: {
      serialize: DEFAULT_SERIALIZE,
      deserialize: DEFAULT_DESERIALIZE,
    },
  };
};

export class VuexMultiHistory<STATE = any> {
  readonly plugin: Plugin<any>;
  readonly data: Data;
  readonly options: Required<VuexMultiHistoryOptions>;
  store!: Store<STATE>;
  private hasInstalled: boolean = false;

  constructor(options?: Partial<VuexMultiHistoryOptions>) {
    this.options = Object.assign(generateDefaultOptions(), options);

    this.validateOptions();

    const dataObj: Data = {
      historyMap: {},
    };

    for (const key of this.options.histories.keys) {
      dataObj.historyMap[key] = new VuexHistory(this, key);
    }

    this.data = Vue.observable<Data>(dataObj);

    this.plugin = (store: Store<any>) => {
      this.store = store;
      this.validateOptions();

      for (const key in this.data.historyMap) {
        if (this.data.historyMap.hasOwnProperty(key)) {
          this.data.historyMap[key].init();
        }
      }

      store.subscribe((mutation, state) => {
        if (this.options.filter && !this.options.filter.call(this, mutation)) {
          return;
        }

        const resolvedHistoryKeys = this.options.histories.resolve.call(this, mutation);
        const localHistoryKeys = Object.keys(this.data.historyMap);

        for (const resolvedHistoryKey of resolvedHistoryKeys) {
          if (!this.data.historyMap[resolvedHistoryKey]) {
            const keysString = localHistoryKeys.join(', ');
            throw new Error(`'${resolvedHistoryKey}' is not a valid key! Valid keys are: [${keysString}]}`);
          }
          const history = this.getHistory(resolvedHistoryKey);
          const snapshot: HistorySnapshot = {
            mutation: mutation.type,
            stateData: this.serialize(resolvedHistoryKey, state),
          };
          history.addSnapshot(snapshot);
        }
      });

      store.addHistory = this.addHistory.bind(this);
      store.hasHistory = this.hasHistory.bind(this);
      store.history = this.getHistory.bind(this);
      store.listHistoryKeys = this.listHistoryKeys.bind(this);
      store.removeHistory = this.removeHistory.bind(this);

      this.hasInstalled = true;
    };
  }

  addHistory(historyKey: string): VuexHistory | undefined {
    if (this.data.historyMap[historyKey]) {
      return;
    }
    const history = new VuexHistory(this, historyKey);

    if (this.hasInstalled) {
      history.init();
    }

    Vue.set(this.data.historyMap, historyKey, history);
    return history;
  }

  hasHistory(historyKey: string): boolean {
    return !!this.data.historyMap[historyKey];
  }

  getHistory(historyKey?: string): VuexHistory {
    const key = historyKey || this.options.histories.keys[0];
    if (!this.data.historyMap[key]) {
      throw new Error(`Cannot retrieve history for key '${key}'`);
    }
    return this.data.historyMap[key];
  }

  listHistoryKeys(): string[] {
    return Object.keys(this.data.historyMap);
  }

  removeHistory(historyKey: string): VuexHistory | undefined {
    if (!this.data.historyMap[historyKey]) {
      return;
    }
    const history = this.data.historyMap[historyKey];

    Vue.delete(this.data.historyMap, historyKey);
    return history;
  }

  serialize(historyKey: string, state: STATE): any {
    return this.removeObservers(this.options.transform.serialize.call(this, historyKey, state));
  }

  deserialize(historyKey: string, stateData: any): any {
    return this.removeObservers(this.options.transform.deserialize.call(this, historyKey, stateData, this.store.state));
  }

  private validateOptions() {
    const errors: Error[] = [];

    const size = this.options.size;
    if (typeof size !== 'number') {
      errors.push(new InvalidTypeError('size', 'number'));
    } else if (size <= 0) {
      errors.push(new InvalidValueError('size', 'has to be greater than zero'));
    }

    const filter = this.options.filter;
    if (typeof filter !== 'function') {
      errors.push(new InvalidTypeError('filter', 'function'));
    }

    const { resolve, keys } = this.options.histories;
    if (typeof resolve !== 'function') {
      errors.push(new InvalidTypeError('resolve', 'function'));
    }

    if (typeof keys !== 'object' || !Array.isArray(keys)) {
      errors.push(new InvalidTypeError('keys', 'array'));
    }

    const { serialize, deserialize } = this.options.transform;
    if (typeof serialize !== 'function') {
      errors.push(new InvalidTypeError('serialize', 'function'));
    }

    if (typeof deserialize !== 'function') {
      errors.push(new InvalidTypeError('deserialize', 'function'));
    }

    if (errors.length > 0) {
      const introLine = `The following errors occurred when validating the options of 'VuexMultiHistory':`;
      throw new InvalidOptionsError(introLine, ...errors);
    }
  }

  private removeObservers<T = any>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
  }
}
