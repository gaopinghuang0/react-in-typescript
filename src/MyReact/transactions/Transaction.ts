import { assert } from "../utils/assert";


export interface TransactionWrapper {
    initialize: Function;
    close: Function;
}

const OBSERVED_ERROR = {};

// Credit: Comments are copied directly from React Transaction.
// The code is slightly modified based on React Transaction.
/**
 * `Transaction` creates a black box that is able to wrap any method such that
 * certain invariants are maintained before and after the method is invoked
 * (Even if an exception is thrown while invoking the wrapped method). Whoever
 * instantiates a transaction can provide enforcers of the invariants at
 * creation time. The `Transaction` class itself will supply one additional
 * automatic invariant for you - the invariant that any transaction instance
 * should not be run while it is already being run. You would typically create a
 * single instance of a `Transaction` for reuse multiple times, that potentially
 * is used to wrap several different methods. Wrappers are extremely simple -
 * they only require implementing two methods.
 *
 * <pre>
 *                       wrappers (injected at creation time)
 *                                      +        +
 *                                      |        |
 *                    +-----------------|--------|--------------+
 *                    |                 v        |              |
 *                    |      +---------------+   |              |
 *                    |   +--|    wrapper1   |---|----+         |
 *                    |   |  +---------------+   v    |         |
 *                    |   |          +-------------+  |         |
 *                    |   |     +----|   wrapper2  |--------+   |
 *                    |   |     |    +-------------+  |     |   |
 *                    |   |     |                     |     |   |
 *                    |   v     v                     v     v   | wrapper
 *                    | +---+ +---+   +---------+   +---+ +---+ | invariants
 * perform(anyMethod) | |   | |   |   |         |   |   | |   | | maintained
 * +----------------->|-|---|-|---|-->|anyMethod|---|---|-|---|-|-------->
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | +---+ +---+   +---------+   +---+ +---+ |
 *                    |  initialize                    close    |
 *                    +-----------------------------------------+
 * </pre>
 *
 * Use cases:
 * - Preserving the input selection ranges before/after reconciliation.
 *   Restoring selection even in the event of an unexpected error.
 * - Deactivating events while rearranging the DOM, preventing blurs/focuses,
 *   while guaranteeing that afterwards, the event system is reactivated.
 * - Flushing a queue of collected DOM mutations to the main UI thread after a
 *   reconciliation takes place in a worker thread.
 * - Invoking any collected `componentDidUpdate` callbacks after rendering new
 *   content.
 * - (Future use case): Wrapping particular flushes of the `ReactWorker` queue
 *   to preserve the `scrollTop` (an automatic scroll aware DOM).
 * - (Future use case): Layout calculations before and after DOM updates.
 *
 * Transactional plugin API:
 * - A module that has an `initialize` method that returns any precomputation.
 * - and a `close` method that accepts the precomputation. `close` is invoked
 *   when the wrapped process is completed, or has failed.
 *
 */
class Transaction {
    _isInTransaction: boolean;
    transactionWrappers: TransactionWrapper[];
    wrapperInitData: any[];

    constructor() {
        this._isInTransaction = false;
        this.transactionWrappers = this.getTransactionWrappers();
        this.wrapperInitData = [];
    }

    isInTransaction() {
        return !!this._isInTransaction;
    }

    getTransactionWrappers(): TransactionWrapper[] {
        return [];
    }

    perform(method: Function, scope: any, ...args: any[]) {
        assert(
            !this.isInTransaction(),
            'Transaction.perform(...): Cannot perform again when the transaction' +
            ' has not been closed.'
        );

        let errorThrown;
        let ret;
        // Use try-finally block, rather than try-catch here.
        try {
            this._isInTransaction = true;
            // Catching errors makes debugging more difficult, so we start with
            // errorThrown set to true before setting it to false after calling
            // close -- if it's still set to true in the finally block, it means
            // one of these calls threw.
            errorThrown = true;
            this.initializeAll(0);
            ret = method.call(scope, ...args);
            errorThrown = false;
        } finally {
            try {
                if (errorThrown) {
                    // If `method` throws, prefer to show that stack trace over any thrown
                    // by invoking `closeAll`.
                    try {
                        this.closeAll(0);
                    } catch (err) { }
                } else {
                    // Since `method` didn't throw, we don't want to silence the exception
                    // here.
                    this.closeAll(0);
                }
            } finally {
                this._isInTransaction = false;
            }
        }
        return ret;
    }

    initializeAll(startIndex: number) {
        const transactionWrappers = this.transactionWrappers;
        for (let i = startIndex; i < transactionWrappers.length; i++) {
            const wrapper = transactionWrappers[i];
            try {
                // Catching errors makes debugging more difficult, so we start with the
                // OBSERVED_ERROR state before overwriting it with the real return value
                // of initialize -- if it's still set to OBSERVED_ERROR in the finally
                // block, it means wrapper.initialize threw.
                this.wrapperInitData[i] = OBSERVED_ERROR;
                this.wrapperInitData[i] = wrapper.initialize
                    ? wrapper.initialize.call(this)
                    : null;
            } finally {
                if (this.wrapperInitData[i] === OBSERVED_ERROR) {
                    // The initializer for wrapper i threw an error; initialize the
                    // remaining wrappers but silence any exceptions from them to ensure
                    // that the first error is the one to bubble up.
                    try {
                        this.initializeAll(i + 1);
                    } catch (err) { }
                }
            }
        }
    }

    closeAll(startIndex: number) {
        assert(
            this.isInTransaction(),
            'Transaction.closeAll(): Cannot close transaction when none are open.',
        );

        const transactionWrappers = this.transactionWrappers;
        for (let i = startIndex; i < transactionWrappers.length; i++) {
            const wrapper = transactionWrappers[i];
            const initData = this.wrapperInitData[i];
            let errorThrown;
            try {
                // Catching errors makes debugging more difficult, so we start with
                // errorThrown set to true before setting it to false after calling
                // close -- if it's still set to true in the finally block, it means
                // wrapper.close threw.
                errorThrown = true;
                if (initData !== OBSERVED_ERROR && wrapper.close) {
                    wrapper.close.call(this, initData);
                }
                errorThrown = false;
            } finally {
                if (errorThrown) {
                    // The closer for wrapper i threw an error; close the remaining
                    // wrappers but silence any exceptions from them to ensure that the
                    // first error is the one to bubble up.
                    try {
                        this.closeAll(i + 1);
                    } catch (e) { }
                }
            }
        }
        this.wrapperInitData.length = 0;
    }
}

export type TransactionType = typeof Transaction;

export default Transaction;
