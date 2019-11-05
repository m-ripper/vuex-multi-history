import { MutationPayload, Store } from 'vuex';
import Vue from 'vue';
import {
  AllocationFunction,
  DefaultKey,
  DeserializeFunction,
  FilterFunction,
  SerializeFunction,
  VuexPlugin,
} from './Interfaces';
import { HistoryEntry, VuexHistory } from './VuexHistory';

const DEFAULT_FILTER: FilterFunction = (mutation: MutationPayload) => {
  return true;
};
const DEFAULT_ALLOCATION: AllocationFunction = (mutation: MutationPayload) => {
  return 'default';
};
const DEFAULT_SERIALIZER: SerializeFunction = (historyKey: string, state: any) => {
  return state;
};
const DEFAULT_DESERIALIZER: DeserializeFunction = (historyKey: string, data: any) => {
  return data;
};
export const DEFAULT_KEY: DefaultKey = 'default';

const DEFAULT_OPTIONS: () => Required<HistoryPluginOptions> = () => {
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

export interface HistoryPluginOptions<K extends string = string> {
  size: number;
  filter?: FilterFunction;
  histories?: {
    allocate: AllocationFunction<K>;
    keys: K[];
  };
  transform?: {
    serialize: SerializeFunction;
    deserialize: DeserializeFunction;
  };
}

export class VuexHistoryPlugin<K extends string = string> {
  plugin: VuexPlugin;
  data: Data;
  options: Required<HistoryPluginOptions<K>>;

  constructor(options?: Partial<HistoryPluginOptions<K>>) {
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
      for (const key in this.data.historyMap) {
        if (this.data.historyMap.hasOwnProperty(key)) {
          this.data.historyMap[key].init(store);
        }
      }

      store.subscribe((mutation, state) => {
        if (this.options.filter && !this.options.filter(mutation)) {
          return;
        }

        const historyKey = this.options.histories.allocate(mutation);
        if (!this.options.histories.keys.includes(historyKey)) {
          let keysString = this.options.histories.keys.join(', ');
          keysString = keysString.substr(0, keysString.length - 2);
          throw new Error(`'${historyKey}' is not a valid key! Valid keys are: [${keysString}]}`);
        }
        const history = this.getHistory(historyKey);

        const newEntry: HistoryEntry = {
          mutation: mutation.type,
          state: this.serialize(historyKey, state),
        };
        history.addEntry(newEntry);
      });

      Store.prototype.history = this.getHistory.bind(this);
    };
  }

  getHistory(historyKey?: string): VuexHistory {
    const key = historyKey || DEFAULT_KEY;
    if (!this.data.historyMap[key]) {
      throw new Error(`Cannot retrieve history for key '${key}'`);
    }
    return this.data.historyMap[key];
  }

  deserialize(historyKey: string, data: any): any {
    return this.removeObservers(this.options.transform.deserialize(historyKey, data));
  }

  serialize(historyKey: string, state: any): any {
    return this.removeObservers(this.options.transform.serialize(historyKey, state));
  }

  private validateOptions() {
    if (this.options.histories.keys.length === 0) {
      throw new Error('At least one key has to be provided!');
    }
  }

  private removeObservers<T = any>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
  }
}
