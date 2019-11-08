/* istanbul ignore file */
import { Store } from 'vuex';

import { VuexMultiHistory } from '../../src';

export interface MockupSingleState {
  sum: number;
}

export interface MockupMultiEntity {
  id: string;
  value: string;
}

export interface MockupMultiState {
  editor: {
    entity: MockupMultiEntity | null;
  };
  entities: {
    entities: MockupMultiEntity[];
  };
}

export type MockupMultiHistoryKeys = 'editor' | 'entities';
export const INITIAL_SINGLE_STATE_SUM = 0;
export const INITIAL_SINGLE_STATE: MockupSingleState = { sum: INITIAL_SINGLE_STATE_SUM };
export const INITIAL_MULTI_STATE: MockupMultiState = {
  editor: {
    entity: null,
  },
  entities: {
    entities: [],
  },
};

export function initMockupSingleStore(
  plugin: VuexMultiHistory,
  initialState: any = INITIAL_SINGLE_STATE,
): Store<MockupSingleState> {
  return new Store({
    state: { ...initialState },
    mutations: {
      add(state, value) {
        state.sum += value;
      },
      sub(state, value) {
        state.sum -= value;
      },
    },
    plugins: [plugin.plugin],
  });
}

export function initMockupMultiStore(
  plugin: VuexMultiHistory,
  initialState: any = INITIAL_MULTI_STATE,
): Store<MockupMultiState> {
  return new Store({
    state: { ...initialState },
    mutations: {
      updateEditorEntity(state, value: MockupMultiEntity) {
        state.editor.entity = { ...value };
      },
      updateEntity(state, payload: { old: MockupMultiEntity; new: MockupMultiEntity }) {
        const index = state.entities.entities.findIndex((entity: MockupMultiEntity) => {
          return entity.id === payload.old.id;
        });
        if (index >= 0) {
          state.entities.entities.splice(index, 1, { ...payload.new });
        }
      },
      updateEntities(state, value: MockupMultiEntity[]) {
        state.entities.entities = [...value];
      },
    },
    plugins: [plugin.plugin],
  });
}
