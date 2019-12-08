<template>
  <div class="history-buttons">
    <el-row type="flex" align="middle">
      <component
        :is="`history-${button}-button`"
        v-for="button in buttons"
        :key="button"
        :history-key="historyKey"
      ></component>
    </el-row>
  </div>
</template>

<script lang="ts">
import HistoryClearButton from '@/components/history/buttons/HistoryClearButton.vue';
import HistoryGotoButton from '@/components/history/buttons/HistoryGotoButton.vue';
import HistoryRedoButton from '@/components/history/buttons/HistoryRedoButton.vue';
import HistoryResetButton from '@/components/history/buttons/HistoryResetButton.vue';
import HistoryUndoButton from '@/components/history/buttons/HistoryUndoButton.vue';
import { HistoryMixin } from '@/mixins/HistoryMixin';
import { mixins } from 'vue-class-component';
import { Component, Prop } from 'vue-property-decorator';

@Component({
  name: 'history-buttons',
  components: { HistoryResetButton, HistoryClearButton, HistoryGotoButton, HistoryRedoButton, HistoryUndoButton },
})
export default class HistoryButtons extends mixins(HistoryMixin) {
  @Prop({ required: false, type: Array, default: () => ['goto', 'undo', 'redo', 'clear', 'reset'] })
  buttons!: string[];
}
</script>

<style scoped lang="scss">
.history-buttons {
  & > .el-row {
    flex-flow: wrap;
    & > div {
      margin-bottom: 5px;
      margin-right: 20px;
    }
  }
}
</style>
