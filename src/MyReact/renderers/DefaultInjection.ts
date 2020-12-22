import DefaultBatchingStrategy from "../reconciler/DefaultBatchingStrategy";
import HostComponent from "../reconciler/HostComponent";
import ReactUpdates from "../reconciler/ReactUpdates";
import ReconcileTransaction from "../transactions/ReconcileTransaction";
import { DOMComponent } from "./DOMComponent";



export function doDefaultInjection() {
    // Do the injection here
    HostComponent.inject(DOMComponent);

    ReactUpdates.injection.injectBatchingStrategy(DefaultBatchingStrategy);
    ReactUpdates.injection.injectReconcileTransaction(ReconcileTransaction);
}
