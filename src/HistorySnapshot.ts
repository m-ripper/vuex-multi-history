export type HistorySnapshotId = number;

export const HISTORY_SNAPSHOT_ID_TYPE = 'number';

export interface HistorySnapshot {
  mutation: string;
  stateData: any;
}

export class ReferencableHistorySnapshot implements HistorySnapshot {
  private readonly $mutation: string;
  private readonly $stateData: any;

  constructor(private readonly $id: HistorySnapshotId, snapshot: HistorySnapshot) {
    this.$mutation = snapshot.mutation;
    this.$stateData = snapshot.stateData;
  }

  get id(): HistorySnapshotId {
    return this.$id;
  }

  get mutation(): string {
    return this.$mutation;
  }

  get stateData(): any {
    return { ...this.$stateData };
  }

  toSnapshot(): HistorySnapshot {
    return { mutation: this.$mutation, stateData: this.$stateData };
  }
}
