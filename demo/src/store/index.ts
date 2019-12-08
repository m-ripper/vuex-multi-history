import Vue from 'vue';
import Vuex, { MutationPayload } from 'vuex';
import { VuexMultiHistory } from 'vuex-multi-history';

Vue.use(Vuex);

const vuexMultiHistory = new VuexMultiHistory({
  histories: {
    resolve: (mutation: MutationPayload) => {
      return [mutation.payload.locale];
    },
    keys: [],
  },
  transform: {
    serialize(historyKey: string, state: RootState) {
      return state.localizedTexts[historyKey];
    },
    deserialize(historyKey: string, stateData: any, state: RootState) {
      const localizedTexts = {...state.localizedTexts};
      localizedTexts[historyKey] = stateData;
      return {...state, localizedTexts};
    },
  },
});

interface RootState {
  localizedTexts: Record<string, string>;
}

export default new Vuex.Store<RootState>({
  state: {
    localizedTexts: {
      'en-US': 'Some English text',
      'de-DE': 'Text in Deutsch',
    },
  },
  mutations: {
    updateLocalizedText(state: RootState, payload) {
      state.localizedTexts[payload.locale] = payload.text;
    },
  },
  actions: {},
  plugins: [vuexMultiHistory.plugin],
});
