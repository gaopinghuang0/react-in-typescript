import DefaultBatchingStrategyTransaction from "../transactions/DefaultBatchingStrategyTransaction";
import { BatchingStrategy } from "./BatchingStrategy";


const transaction = new DefaultBatchingStrategyTransaction();

const DefaultBatchingStrategy: BatchingStrategy = {
    isBatchingUpdates: false,

    /**
     * Call the provided function in a context within which calls to `setState`
     * and friends are batched such that components aren't updated unnecessarily.
     */
    batchedUpdates: function (callback: Function, ...args: any[]) {
        var alreadyBatchingUpdates = DefaultBatchingStrategy.isBatchingUpdates;

        DefaultBatchingStrategy.isBatchingUpdates = true;

        // The code is written this way to avoid extra allocations
        if (alreadyBatchingUpdates) {
            return callback(...args);
        } else {
            return transaction.perform(callback, null, ...args);
        }
    },
};

export default DefaultBatchingStrategy;
