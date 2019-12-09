import { MutationPayload } from 'vuex';

import { VuexMultiHistory } from './VuexMultiHistory';

export type DefaultKey = 'default';

export type FilterFunction<T extends MutationPayload = MutationPayload> = (
  this: VuexMultiHistory,
  mutation: T,
) => boolean;
export type ResolveFunction<T extends MutationPayload = MutationPayload> = (
  this: VuexMultiHistory,
  mutation: T,
) => string[];
export type SerializeFunction = (this: VuexMultiHistory, historyKey: string, state: any) => any;
export type DeserializeFunction = (this: VuexMultiHistory, historyKey: string, stateData: any, state: any) => any;
