import { emptyFunction } from "../utils/emptyFunction";
import Transaction, { TransactionWrapper } from "./Transaction";

const EMPTY_WRAPPER: TransactionWrapper = {
    initialize: emptyFunction,
    close: emptyFunction
}

const TRANSACTION_WRAPPERS = [EMPTY_WRAPPER];

class ReconcileTransaction extends Transaction {

    /** @override */
    getTransactionWrappers() {
        return TRANSACTION_WRAPPERS;
    }
}

export default ReconcileTransaction;
