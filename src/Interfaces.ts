import { MutationPayload, Store } from 'vuex';

import { VuexMultiHistory } from './VuexMultiHistory';

export type DefaultKey = 'default';

export type ResolveFunction<K extends string = string, T extends MutationPayload = MutationPayload> = (
  this: VuexMultiHistory,
  mutation: T,
) => K[];
export type FilterFunction<T extends MutationPayload = MutationPayload> = (
  this: VuexMultiHistory,
  mutation: T,
) => boolean;
export type SerializeFunction<K extends string = string> = (this: VuexMultiHistory, historyKey: K, state: any) => any;
export type DeserializeFunction<K extends string = string> = (
  this: VuexMultiHistory,
  historyKey: K,
  stateData: any,
  state: any,
) => any;
