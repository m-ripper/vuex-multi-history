<template>
  <div class="app">
    <el-row type="flex" :gutter="10">
      <el-col v-for="locale in localeKeys" :key="locale">
        <h2>{{ locale }}</h2>
        <history-buttons :history-key="locale"></history-buttons>
        <localized-text-input :locale="locale" :text="localizedTexts[locale]"></localized-text-input>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import HistoryButtons from '@/components/history/HistoryButtons.vue';
import LocalizedTextInput from '@/components/LocalizedTextInput.vue';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'app',
  components: { HistoryButtons, LocalizedTextInput },
})
export default class App extends Vue {
  created() {
    for (const locale of this.localeKeys) {
      this.$store.addHistory(locale);
    }
  }

  get localeKeys(): string[] {
    return Object.keys(this.localizedTexts);
  }

  get localizedTexts(): Record<string, string> {
    return this.$store.state.localizedTexts;
  }
}
</script>

<style scoped lang="scss">
.app {
  & > .el-row {
    & > .el-col {
      & > h2 {
        margin-top: 0;
        margin-bottom: 15px;
      }
    }
  }
}
</style>
