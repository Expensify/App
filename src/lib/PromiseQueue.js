/**
 * Simple queue for Promises that need to fire sequentially,
 * but we have no idea when they will be triggered and we don't
 * care if they resolve or not.
 */
export default class PromiseQueue {
    constructor() {
        this.queue = [];
    }

    /**
     * @param {Function} queuedPromise - function that when called returns a promise
     */
    add(queuedPromise) {
        this.queue.push(queuedPromise);

        // Don't process the queue if it's greater than 1
        // since this means we already have one Promise that
        // we are waiting to resolve. Once it finishes it will
        // run the next Promise.
        if (this.queue.length !== 1) {
            return;
        }

        this.run();
    }

    /**
     * Process the items in the queue one by one
     */
    run() {
        const next = this.queue[0];

        if (!next) {
            return;
        }

        next().finally(() => {
            // Only remove the Promise until after it resolves
            this.queue.shift();
            this.run();
        });
    }
}
