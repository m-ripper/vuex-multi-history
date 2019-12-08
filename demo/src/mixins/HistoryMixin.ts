import Component from 'vue-class-component';
import { Prop, Vue } from 'vue-property-decorator';
import { VuexHistory } from 'vuex-multi-history';

@Component({})
export class HistoryMixin extends Vue {
  @Prop({ required: true, type: String })
  historyKey!: string;

  get history(): VuexHistory {
    return this.$store.history(this.historyKey);
  }
}
