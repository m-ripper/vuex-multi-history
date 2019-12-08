<template>
  <div class="history-clear-button">
    <el-button icon="el-icon-refresh" :disabled="disabled" @click="handleClick">Clear History</el-button>
  </div>
</template>

<script lang="ts">
import { HistoryMixin } from '@/mixins/HistoryMixin';
import { mixins } from 'vue-class-component';
import { Component } from 'vue-property-decorator';

@Component({
  name: 'history-clear-button',
})
export default class HistoryClearButton extends mixins(HistoryMixin) {

  get disabled(): boolean {
    return this.history.length === 0;
  }

  handleClick() {
    this.history.clearHistory();
  }
}
</script>

<style scoped lang="scss">
.history-clear-button {
  & > .el-switch {
    margin-right: 5px;
  }
}
</style>
