<template>
  <div class="history-goto-button">
    <el-input-number :controls="false" v-model="index" :min="-1" :max="max"></el-input-number>
    <el-button icon="el-icon-rank" :disabled="disabled" @click="handleClick">Goto</el-button>
  </div>
</template>

<script lang="ts">
import { HistoryMixin } from '@/mixins/HistoryMixin';
import { mixins } from 'vue-class-component';
import { Component } from 'vue-property-decorator';

@Component({
  name: 'history-goto-button',
})
export default class HistoryGotoButton extends mixins(HistoryMixin) {
  index = -1;

  get disabled(): boolean {
    return this.index >= this.history.length || this.index === this.history.index;
  }

  get max(): number {
    return this.history.length - 1;
  }

  handleClick() {
    this.history.goto({index: this.index});
    this.index = -1;
  }
}
</script>

<style lang="scss">
.history-goto-button {
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
