import ReactUpdates from "../reconciler/ReactUpdates";
import UpdateQueue from "../reconciler/UpdateQueue";
import CallbackQueue from "../utils/CallbackQueue";
import { emptyFunction } from "../utils/emptyFunction";
import Transaction, { TransactionWrapper } from "./Transaction";

class ReconcileTransaction extends Transaction {
    reactMountReady: CallbackQueue<any>;

    constructor() {
        super();
        this.reactMountReady = new CallbackQueue();
    }

    getUpdateQueue() {
        return UpdateQueue;
    }

    /**
     * Return The queue to collect `onDOMReady` callbacks with.
     */
    getReactMountReady() {
        return this.reactMountReady;
    }

    /** @override */
    getTransactionWrappers() {
        const that = this;

        const ON_DOM_READY_QUEUEING = {
            initialize: function () {
                that.reactMountReady.reset();
            },
            close: function () {
                that.reactMountReady.notifyAll();
            }
        }

        const TRANSACTION_WRAPPERS = [ON_DOM_READY_QUEUEING];

        return TRANSACTION_WRAPPERS;
    }
}

export default ReconcileTransaction;
