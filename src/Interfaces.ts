import { MutationPayload, Store } from 'vuex';

import { VuexHistoryPlugin } from './VuexHistoryPlugin';

export type VuexPlugin<T = any> = (state: Store<T>) => void;

export type DefaultKey = 'default';

export type AllocateFunction<K extends string = string, T extends MutationPayload = MutationPayload> = (
  this: VuexHistoryPlugin,
  mutation: T,
) => K[];
export type FilterFunction<T extends MutationPayload = MutationPayload> = (
  this: VuexHistoryPlugin,
  mutation: T,
) => boolean;
export type SerializeFunction<K extends string = string> = (this: VuexHistoryPlugin, historyKey: K, state: any) => any;
export type DeserializeFunction<K extends string = string> = (this: VuexHistoryPlugin, historyKey: K, data: any) => any;
