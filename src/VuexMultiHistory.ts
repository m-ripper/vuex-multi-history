import Vue from 'vue';
import { MutationPayload, Store } from 'vuex';

import { InvalidOptionsError } from './errors/InvalidOptionsError';
import { InvalidTypeError } from './errors/InvalidTypeError';
import {
  AllocateFunction,
  DefaultKey,
  DeserializeFunction,
  FilterFunction,
  SerializeFunction,
  VuexPlugin,
} from './Interfaces';
import { HistorySnapshot, VuexHistory } from './VuexHistory';

// tslint:disable-next-line
const DEFAULT_FILTER: FilterFunction = function(mutation: MutationPayload) {
  return true;
};
// tslint:disable-next-line
const DEFAULT_ALLOCATION: AllocateFunction = function(mutation: MutationPayload) {
  return [this.options.histories.keys[0]];
};
// tslint:disable-next-line
const DEFAULT_SERIALIZER: SerializeFunction = function(historyKey: string, state: any) {
  return state;
};
// tslint:disable-next-line
const DEFAULT_DESERIALIZER: DeserializeFunction = function(historyKey: string, data: any) {
  return data;
};
export const DEFAULT_KEY: DefaultKey = 'default';

const DEFAULT_OPTIONS: () => Required<VuexMultiHistoryOptions> = () => {
  return {
    size: 50,
    filter: DEFAULT_FILTER,
    histories: {
      allocate: DEFAULT_ALLOCATION,
      keys: [DEFAULT_KEY],
    },
    transform: {
      serialize: DEFAULT_SERIALIZER,
      deserialize: DEFAULT_DESERIALIZER,
    },
  };
};

type HistoryMap = Record<string, VuexHistory>;

interface Data {
  historyMap: HistoryMap;
}

export interface VuexMultiHistoryOptions<K extends string = string> {
  size?: number;
  filter?: FilterFunction;
  histories?: {
    allocate: AllocateFunction<K>;
    keys: K[];
  };
  transform?: {
    serialize: SerializeFunction;
    deserialize: DeserializeFunction;
  };
}

export class VuexMultiHistory<K extends string = string> {
  readonly plugin: VuexPlugin;
  readonly data: Data;
  readonly options: Required<VuexMultiHistoryOptions<K>>;

  constructor(options?: Partial<VuexMultiHistoryOptions<K>>) {
    this.options = Object.assign(DEFAULT_OPTIONS(), options);

    this.validateOptions();

    const dataObj: Data = {
      historyMap: {},
    };

    for (const key of this.options.histories.keys) {
      dataObj.historyMap[key] = new VuexHistory(this, key);
    }

    this.data = Vue.observable<Data>(dataObj);

    this.plugin = (store: Store<any>) => {
      this.validateOptions();

      for (const key in this.data.historyMap) {
        if (this.data.historyMap.hasOwnProperty(key)) {
          this.data.historyMap[key].init(store);
        }
      }

      store.subscribe((mutation, state) => {
        if (this.options.filter && !this.options.filter.call(this, mutation)) {
          return;
        }

        const historyKeys = this.options.histories.allocate.call(this, mutation);
        for (const historyKey of historyKeys) {
          if (!this.options.histories.keys.includes(historyKey)) {
            const keysString = this.options.histories.keys.join(', ');
            throw new Error(`'${historyKey}' is not a valid key! Valid keys are: [${keysString}]}`);
          }
          const history = this.getHistory(historyKey);

          const snapshot: HistorySnapshot = {
            mutation: mutation.type,
            stateData: this.serialize(historyKey, state),
          };
          history.addSnapshot(snapshot);
        }
      });

      Store.prototype.history = this.getHistory.bind(this);
    };
  }

  getHistory(historyKey?: string): VuexHistory {
    const key = historyKey || this.options.histories.keys[0];
    if (!this.data.historyMap[key]) {
      throw new Error(`Cannot retrieve history for key '${key}'`);
    }
    return this.data.historyMap[key];
  }

  serialize(historyKey: string, state: any): any {
    return this.removeObservers(this.options.transform.serialize.call(this, historyKey, state));
  }

  deserialize(historyKey: string, data: any): any {
    return this.removeObservers(this.options.transform.deserialize.call(this, historyKey, data));
  }

  private validateOptions() {
    const errors: Error[] = [];

    const size = this.options.size;
    if (typeof size !== 'number') {
      errors.push(new InvalidTypeError('size', 'number'));
    }

    const filter = this.options.filter;
    if (typeof filter !== 'function') {
      errors.push(new InvalidTypeError('filter', 'function'));
    }

    const { allocate, keys } = this.options.histories;
    if (typeof allocate !== 'function') {
      errors.push(new InvalidTypeError('allocate', 'function'));
    }

    if (typeof keys !== 'object' || !Array.isArray(keys)) {
      errors.push(new InvalidTypeError('keys', 'array'));
    } else if (keys.length === 0) {
      errors.push(new Error(`'${keys}' cannot be empty!`));
    }

    const { serialize, deserialize } = this.options.transform;
    if (typeof serialize !== 'function') {
      errors.push(new InvalidTypeError('serialize', 'function'));
    }

    if (typeof deserialize !== 'function') {
      errors.push(new InvalidTypeError('deserialize', 'function'));
    }

    if (errors.length > 0) {
      throw new InvalidOptionsError(...errors);
    }
  }

  private removeObservers<T = any>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
  }
}
