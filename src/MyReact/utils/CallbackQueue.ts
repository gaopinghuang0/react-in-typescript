import { assert } from "./assert";

/**
 * A specialized pseudo-event module to help keep track of components waiting to
 * be notified when their DOM representations are available for use.
 *
 */
class CallbackQueue<T> {
    _callbacks: Function[] | null;
    _contexts: T[] | null;
    _arg: any;

    constructor(arg?: any) {
        this._callbacks = null;
        this._contexts = null;
        this._arg = arg;
    }

    /**
     * Enqueues a callback to be invoked when `notifyAll` is invoked.
     */
    enqueue(callback: Function, context: T) {
        this._callbacks = this._callbacks || [];
        this._callbacks.push(callback);
        this._contexts = this._contexts || [];
        this._contexts.push(context);
    }

    /**
     * Invokes all enqueued callbacks and clears the queue. This is invoked after
     * the DOM representation of a component has been created or updated.
     */
    notifyAll() {
        var callbacks = this._callbacks;
        var contexts = this._contexts;
        var arg = this._arg;
        if (callbacks && contexts) {
            assert(
                callbacks.length === contexts.length,
                'Mismatched list of contexts in callback queue',
            );
            this._callbacks = null;
            this._contexts = null;
            for (var i = 0; i < callbacks.length; i++) {
                callbacks[i].call(contexts[i], arg);
            }
            callbacks.length = 0;
            contexts.length = 0;
        }
    }

    checkpoint() {
        return this._callbacks ? this._callbacks.length : 0;
    }

    rollback(len: number) {
        if (this._callbacks && this._contexts) {
            this._callbacks.length = len;
            this._contexts.length = len;
        }
    }

    /**
     * Resets the internal queue.
     *
     * @internal
     */
    reset() {
        this._callbacks = null;
        this._contexts = null;
    }
}

export default CallbackQueue;