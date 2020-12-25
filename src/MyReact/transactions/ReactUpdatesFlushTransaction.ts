import ReactUpdates from "../reconciler/ReactUpdates";
import CallbackQueue from "../utils/CallbackQueue";
import ReconcileTransaction from "./ReconcileTransaction";
import Transaction from "./Transaction";


class ReactUpdatesFlushTransaction extends Transaction {
    dirtyComponentsLength: number | null;
    callbackQueue: CallbackQueue<any>;
    reconcileTransaction: ReconcileTransaction;

    constructor() {
        super();
        this.dirtyComponentsLength = null;
        this.reconcileTransaction = new ReactUpdates.ReconcileTransaction!()
        this.callbackQueue = new CallbackQueue();
    }

    /** @override */
    getTransactionWrappers() {
        // FIXME: Make sure `this` is actually ReactUpdatesFlushTransaction.
        const that = this;
        var NESTED_UPDATES = {
            initialize: function () {
                that.dirtyComponentsLength = ReactUpdates.dirtyComponents.length;
            },
            close: function () {
                if (that.dirtyComponentsLength !== ReactUpdates.dirtyComponents.length) {
                    // Additional updates were enqueued by componentDidUpdate handlers or
                    // similar; before our own UPDATE_QUEUEING wrapper closes, we want to run
                    // these new updates so that if A's componentDidUpdate calls setState on
                    // B, B will update before the callback A's updater provided when calling
                    // setState.
                    ReactUpdates.dirtyComponents.splice(0, that.dirtyComponentsLength as number);
                    ReactUpdates.flushBatchedUpdates();
                } else {
                    ReactUpdates.dirtyComponents.length = 0;
                }
            },
        };

        var UPDATE_QUEUEING = {
            initialize: function () {
                that.callbackQueue.reset();
            },
            close: function () {
                that.callbackQueue.notifyAll();
            },
        };
        return [NESTED_UPDATES, UPDATE_QUEUEING];
    }

    /** @override */
    perform(method: Function, scope: any, a: any) {
        // Essentially calls `this.reconcileTransaction.perform(method, scope, a)`
        // with this transaction's wrappers around it.
        return (new Transaction()).perform.call(
            this,
            this.reconcileTransaction.perform,
            this.reconcileTransaction,
            method,
            scope,
            a,
        );
    }
}

export default ReactUpdatesFlushTransaction;
