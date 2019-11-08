import { VuexHistory } from './VuexHistory';

declare module 'vuex' {
  interface Store<S> {
    history<K extends string = string>(historyKey?: K): VuexHistory;
  }
}

export * from './Interfaces';
export * from './HistorySnapshot';
export * from './VuexHistory';
export * from './VuexMultiHistory';
export * from './errors/InvalidTypeError';
export * from './errors/InvalidValueError';
export * from './errors/InvalidOptionsError';
