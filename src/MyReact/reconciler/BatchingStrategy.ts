
export interface BatchingStrategy {
    isBatchingUpdates: boolean;
    batchedUpdates: (callback: Function, ...args: any[]) => any;
}
