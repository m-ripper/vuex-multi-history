<template>
  <div class="history-undo-button">
    <el-input-number :controls="false" v-model="amount" :min="1" :max="max"></el-input-number>
    <el-button icon="el-icon-refresh-left" :disabled="disabled" @click="handleClick">Undo</el-button>
  </div>
</template>

<script lang="ts">
import { HistoryMixin } from '@/mixins/HistoryMixin';
import { mixins } from 'vue-class-component';
import { Component } from 'vue-property-decorator';

@Component({
  name: 'history-undo-button',
})
export default class HistoryUndoButton extends mixins(HistoryMixin) {
  amount = 1;

  get disabled(): boolean {
    return !this.history.canUndo(this.amount);
  }

  get max(): number {
    return this.history.length - (this.history.length - this.history.index) + 1;
  }

  handleClick() {
    this.history.undo(this.amount);
    this.amount = 1;
  }
}
</script>

<style lang="scss">
.history-undo-button {
  & > .el-input-number {
    margin-right: 5px;
    width: 40px;
    & > .el-input > input {
      padding-left: 5px;
      padding-right: 5px;
    }
  }
}
</style>
