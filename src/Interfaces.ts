import { MutationPayload, Store } from 'vuex';



export type VuexPlugin<T = any> = (state: Store<T>) => void;

export type DefaultKey = 'default';

export type AllocationFunction<K extends string = string, T extends MutationPayload = MutationPayload> = (
  mutation: T,
) => K;
export type FilterFunction<T extends MutationPayload = MutationPayload> = (mutation: T) => boolean;
export type SerializeFunction<K extends string = string> = (historyKey: K, state: any) => any;
export type DeserializeFunction<K extends string = string> = (historyKey: K, data: any) => any;
