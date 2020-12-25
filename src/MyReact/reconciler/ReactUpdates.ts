import ReactUpdatesFlushTransaction from "../transactions/ReactUpdatesFlushTransaction";
import ReconcileTransaction from "../transactions/ReconcileTransaction";
import { TransactionType } from "../transactions/Transaction";
import { assert } from "../utils/assert";
import { BatchingStrategy } from "./BatchingStrategy";
import { CompositeComponent } from "./CompositeComponent";
import Reconciler from "./Reconciler";

let batchingStrategy: BatchingStrategy | null = null;
let updateBatchNumber = 0;

/**
 * Array comparator for ReactComponents by mount ordering.
 *
 * @param {ReactComponent} c1 first component you're comparing
 * @param {ReactComponent} c2 second component you're comparing
 * @return {number} Return value usable by Array.prototype.sort().
 */
function mountOrderComparator(c1: CompositeComponent, c2: CompositeComponent) {
    return c1._mountOrder - c2._mountOrder;
}

function runBatchedUpdates(transaction: ReactUpdatesFlushTransaction) {
    const len = transaction.dirtyComponentsLength || 0;

    // Since reconciling a component higher in the owner hierarchy usually (not
    // always -- see shouldComponentUpdate()) will reconcile children, reconcile
    // them before their children by sorting the array.
    const dirtyComponents = ReactUpdates.dirtyComponents;
    dirtyComponents.sort(mountOrderComparator);

    // Any updates enqueued while reconciling must be performed after this entire
    // batch. Otherwise, if dirtyComponents is [A, B] where A has children B and
    // C, B could update twice in a single batch if C's render enqueues an update
    // to B (since B would have already updated, we should skip it, and the only
    // way we can know to do so is by checking the batch counter).
    updateBatchNumber++;

    for (let i = 0; i < len; i++) {
        const component = dirtyComponents[i];

        // If performUpdateIfNecessary happens to enqueue any new updates, we
        // shouldn't execute the callbacks until the next render happens, so
        // stash the callbacks first
        const callbacks = component._pendingCallbacks;
        component._pendingCallbacks = null;

        Reconciler.performUpdateIfNecessary(
            component,
            transaction.reconcileTransaction,
            updateBatchNumber
        );

        if (callbacks) {
            callbacks.forEach(callback => {
                transaction.callbackQueue.enqueue(callback, component.getPublicInstance());
            })
        }
    }
}

function ensureInjected() {
    assert(
        ReactUpdates.ReconcileTransaction && batchingStrategy,
        'ReactUpdates: must inject a reconcile transaction class and batching ' +
        'strategy',
    );
}

const ReactUpdates = {
    // Needs injection.
    ReconcileTransaction: null as null | typeof ReconcileTransaction,

    dirtyComponents: [] as CompositeComponent[],

    enqueueUpdate(internalInstance: CompositeComponent) {
        ensureInjected();

        if (!batchingStrategy!.isBatchingUpdates) {
            batchingStrategy!.batchedUpdates(ReactUpdates.enqueueUpdate, internalInstance);
            return;
        }

        ReactUpdates.dirtyComponents.push(internalInstance);
        if (internalInstance._updateBatchNumber == null) {
            internalInstance._updateBatchNumber = updateBatchNumber + 1;
        }
    },

    batchedUpdates(callback: Function, ...args: any[]) {
        ensureInjected();
        return batchingStrategy!.batchedUpdates(callback, ...args);
    },

    flushBatchedUpdates() {
        while (ReactUpdates.dirtyComponents.length) {
            const transaction = new ReactUpdatesFlushTransaction();
            transaction.perform(runBatchedUpdates, null, transaction);
        }
    },

    injection: {
        injectReconcileTransaction(_ReconcileTransaction: typeof ReconcileTransaction) {
            ReactUpdates.ReconcileTransaction = _ReconcileTransaction;
        },
        injectBatchingStrategy(_batchingStrategy: BatchingStrategy) {
            batchingStrategy = _batchingStrategy;
        }
    },
}


export default ReactUpdates;
