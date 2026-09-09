type QueuedItem<TRequest> = {
    item: TRequest;
    index: number;
};

/**
 * Fixed-size Bun/Web Worker pool. One request is in flight per worker; a dead
 * worker falls back for its in-flight item and leaves the rest of the queue
 * for surviving workers. Leftover items also use the fallback so a total
 * pool crash cannot drop work on the floor.
 */
class WorkerPool<TRequest, TResponse> {
    private readonly workerURL: URL;

    private readonly concurrency: number;

    constructor(workerURL: URL, concurrency = 4) {
        this.workerURL = workerURL;
        this.concurrency = concurrency;
    }

    async map(items: readonly TRequest[], fallback: (item: TRequest) => TResponse): Promise<TResponse[]> {
        if (items.length === 0) {
            return [];
        }

        const results = new Map<number, TResponse>();
        const queue: Array<QueuedItem<TRequest>> = items.map((item, index) => ({item, index}));
        const poolSize = Math.max(1, Math.min(this.concurrency, items.length));
        const workers = Array.from({length: poolSize}, () => new Worker(this.workerURL));

        try {
            await Promise.all(workers.map((worker) => this.drain(worker, queue, results, fallback)));
        } finally {
            for (const worker of workers) {
                worker.terminate();
            }
        }

        for (const leftover of queue) {
            results.set(leftover.index, fallback(leftover.item));
        }

        return items.map((item, index) => results.get(index) ?? fallback(item));
    }

    private drain(worker: Worker, queue: Array<QueuedItem<TRequest>>, results: Map<number, TResponse>, fallback: (item: TRequest) => TResponse): Promise<void> {
        return new Promise((resolve) => {
            let inFlight: QueuedItem<TRequest> | undefined;
            let settled = false;

            const pump = () => {
                if (settled) {
                    return;
                }
                const next = queue.pop();
                if (!next) {
                    settled = true;
                    resolve();
                    return;
                }
                inFlight = next;
                worker.postMessage(next.item);
            };

            const fail = () => {
                if (settled) {
                    return;
                }
                settled = true;
                if (inFlight) {
                    results.set(inFlight.index, fallback(inFlight.item));
                    inFlight = undefined;
                }
                resolve();
            };

            worker.addEventListener('message', (event: MessageEvent<TResponse>) => {
                if (settled) {
                    return;
                }
                if (inFlight) {
                    results.set(inFlight.index, event.data);
                    inFlight = undefined;
                }
                pump();
            });

            worker.addEventListener('error', fail);
            worker.addEventListener('messageerror', fail);
            worker.addEventListener('close', fail);

            pump();
        });
    }
}

export default WorkerPool;
