import DefaultBatchingStrategy from "../reconciler/DefaultBatchingStrategy";
import ReactUpdates from "../reconciler/ReactUpdates";
import { emptyFunction } from "../utils/emptyFunction";
import Transaction, { TransactionWrapper } from "./Transaction";

const RESET_BATCHED_UPDATES: TransactionWrapper = {
    initialize: emptyFunction,
    close: function () {
        DefaultBatchingStrategy.isBatchingUpdates = false;
    },
};

const FLUSH_BATCHED_UPDATES: TransactionWrapper = {
    initialize: emptyFunction,
    close: ReactUpdates.flushBatchedUpdates.bind(ReactUpdates),
};

const TRANSACTION_WRAPPERS = [FLUSH_BATCHED_UPDATES, RESET_BATCHED_UPDATES];

class DefaultBatchingStrategyTransaction extends Transaction {

    /** @override */
    getTransactionWrappers() {
        return TRANSACTION_WRAPPERS;
    }
}

export default DefaultBatchingStrategyTransaction;
