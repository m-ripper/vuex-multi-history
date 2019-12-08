<template>
  <div class="history-reset-button">
    <el-button icon="el-icon-close" :disabled="disabled" @click="handleClick">Reset</el-button>
  </div>
</template>

<script lang="ts">
import { HistoryMixin } from '@/mixins/HistoryMixin';
import { mixins } from 'vue-class-component';
import { Component } from 'vue-property-decorator';

@Component({
  name: 'history-reset-button',
})
export default class HistoryResetButton extends mixins(HistoryMixin) {

  get disabled(): boolean {
    return this.history.length === 0;
  }

  handleClick() {
    this.history.reset();
  }
}
</script>

<style scoped></style>
