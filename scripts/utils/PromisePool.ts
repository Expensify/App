class PromisePool<T> {
    /**
     * The maximum number of concurrent async operations.
     */
    private readonly concurrency: number;

    /**
     * The set of currently-executing async operations.
     */
    private executing = new Set<Promise<T>>();

    constructor(concurrency = 8) {
        this.concurrency = concurrency;
    }

    /**
     * Execute an async task and return a promise with the result.
     * If there are more async operations in the pool than allowed when this function is called,
     * wait for one to finish before starting another.
     */
    public async add(task: () => Promise<T>): Promise<T> {
        if (this.executing.size >= this.concurrency) {
            await Promise.race(this.executing);
        }
        const p = task();
        this.executing.add(p);
        return p.finally(() => {
            this.executing.delete(p);
        });
    }
}

export default PromisePool;
