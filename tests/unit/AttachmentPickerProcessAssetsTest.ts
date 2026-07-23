import processAssetsConcurrent from '@components/AttachmentPicker/processAssets/concurrent';
import processAssetsSequential from '@components/AttachmentPicker/processAssets/sequential';

/** Lets every already-scheduled microtask run, so in-flight `processAsset` calls reach their parked state. */
async function flushMicrotasks() {
    for (let i = 0; i < 10; i++) {
        await Promise.resolve();
    }
}

function createDeferred() {
    let resolve: () => void = () => {};
    const promise = new Promise<void>((res) => {
        resolve = res;
    });
    return {promise, resolve};
}

/**
 * Tracks how many `processAsset` calls are in flight at once. Every call parks on a shared gate, so the peak
 * concurrency is observable before the gate is released: a concurrent strategy reaches `items.length`, a
 * sequential one never exceeds 1.
 */
function createConcurrencyTracker() {
    const gate = createDeferred();
    let running = 0;
    let maxRunning = 0;
    const processAsset = async (): Promise<void> => {
        running += 1;
        maxRunning = Math.max(maxRunning, running);
        await gate.promise;
        running -= 1;
    };
    return {processAsset, release: gate.resolve, getMaxRunning: () => maxRunning};
}

describe('AttachmentPicker processAssets', () => {
    const items = ['a', 'b', 'c'];

    describe('default (concurrent)', () => {
        it('runs every asset at the same time', async () => {
            const tracker = createConcurrencyTracker();

            const done = processAssetsConcurrent(items, tracker.processAsset);
            await flushMicrotasks();
            expect(tracker.getMaxRunning()).toBe(items.length);

            tracker.release();
            await done;
        });

        it('processes every asset', async () => {
            const processed: string[] = [];

            await processAssetsConcurrent(items, async (item: string) => {
                processed.push(item);
            });

            expect(processed).toEqual(items);
        });
    });

    describe('iOS (sequential)', () => {
        it('runs at most one asset at a time', async () => {
            const tracker = createConcurrencyTracker();

            const done = processAssetsSequential(items, tracker.processAsset);
            await flushMicrotasks();
            expect(tracker.getMaxRunning()).toBe(1);

            tracker.release();
            await done;
        });

        it('processes the assets in order', async () => {
            const processed: string[] = [];

            await processAssetsSequential(items, async (item: string) => {
                processed.push(item);
            });

            expect(processed).toEqual(items);
        });
    });
});
