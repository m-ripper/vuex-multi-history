import { Store } from 'vuex';

import { VuexHistory } from './VuexHistory';

declare module 'vuex' {
  interface Store<S> {
    addHistory(historyKey: string): VuexHistory | undefined;
    hasHistory(historyKey: string): boolean;
    history<K extends string = string>(historyKey?: K): VuexHistory;
    listHistoryKeys(): string[];
    removeHistory(historyKey: string): VuexHistory | undefined;
  }
}

Store.prototype.history = (historyKey?: string) => {
  throw new Error('The plugin has to be installed to be used!');
};

export * from './Interfaces';
export * from './HistorySnapshot';
export * from './VuexHistory';
export * from './VuexMultiHistory';
export * from './errors/BaseError';
export * from './errors/InvalidTypeError';
export * from './errors/InvalidValueError';
export * from './errors/InvalidOptionsError';
