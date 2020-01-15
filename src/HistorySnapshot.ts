export type HistorySnapshotId = number;

export const HISTORY_SNAPSHOT_ID_TYPE = 'number';

export interface HistorySnapshot {
  mutation: string;
  stateData: any;
}

export class UniqueHistorySnapshot implements HistorySnapshot {
  private readonly $mutation: string;
  private readonly $stateData: any;

  constructor(readonly id: HistorySnapshotId, snapshot: HistorySnapshot) {
    this.$mutation = snapshot.mutation;
    this.$stateData = snapshot.stateData;
  }

  get mutation(): string {
    return this.$mutation;
  }

  get stateData(): any {
    return typeof this.$stateData === 'object'
      ? Array.isArray(this.$stateData)
        ? [...this.$stateData]
        : { ...this.$stateData }
      : this.$stateData;
  }

  toSnapshot(): HistorySnapshot {
    return { mutation: this.$mutation, stateData: this.$stateData };
  }
}
