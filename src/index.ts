import { VuexHistory } from './VuexHistory';

declare module 'vuex' {
  interface Store<S> {
    history<K extends string = string>(historyKey?: K): VuexHistory;
  }
}

export * from './Interfaces';
export * from './VuexHistoryPlugin';
