<template>
  <div class="localized-text-input">
    <el-input type="textarea" v-model="editText" @change="handleChange"></el-input>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
  name: 'localized-text-input',
})
export default class LocalizedTextInput extends Vue {
  @Prop({ required: true, type: String })
  locale!: string;

  @Prop({ required: true, type: String })
  text!: string;

  editText: string = '';

  handleChange(text: string) {
    this.$store.commit('updateLocalizedText', {
      locale: this.locale,
      text,
    });
  }

  @Watch('text', { immediate: true })
  onTextChange(text: string) {
    this.editText = text;
  }
}
</script>

<style scoped lang="scss">
.localized-text-input {
}
</style>
