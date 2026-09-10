import {describe, expect, it} from 'bun:test';

import WorkerPool from '../../scripts/utils/WorkerPool';

type EchoRequest = {
    n: number;
};

type EchoResponse = {
    n: number;
};

describe('WorkerPool', () => {
    it('maps items across workers in input order', async () => {
        const pool = new WorkerPool<EchoRequest, EchoResponse>(new URL('./workerPoolEchoWorker.ts', import.meta.url), 2);
        const result = await pool.map([{n: 1}, {n: 2}, {n: 3}, {n: 4}], (item) => ({n: item.n}));
        expect(result).toEqual([{n: 2}, {n: 4}, {n: 6}, {n: 8}]);
    });

    it('uses the fallback when a worker dies', async () => {
        const pool = new WorkerPool<EchoRequest, EchoResponse>(new URL('./workerPoolCrashWorker.ts', import.meta.url), 2);
        const result = await pool.map([{n: 1}, {n: 2}], (item) => ({n: -item.n}));
        expect(result).toEqual([{n: -1}, {n: -2}]);
    });

    it('uses the fallback for work left after all workers die', async () => {
        const pool = new WorkerPool<EchoRequest, EchoResponse>(new URL('./workerPoolCrashWorker.ts', import.meta.url), 2);
        const result = await pool.map([{n: 1}, {n: 2}, {n: 3}, {n: 4}], (item) => ({n: -item.n}));
        expect(result).toEqual([{n: -1}, {n: -2}, {n: -3}, {n: -4}]);
    });

    it('continues processing queued work when one worker dies', async () => {
        const pool = new WorkerPool<EchoRequest, EchoResponse>(new URL('./workerPoolSelectiveCrashWorker.ts', import.meta.url), 2);
        const result = await pool.map([{n: 1}, {n: 2}, {n: 3}, {n: 4}], (item) => ({n: -item.n}));
        expect(result).toEqual([{n: 2}, {n: 4}, {n: -3}, {n: 8}]);
    });

    it('uses the fallback when a worker exits without an error event', async () => {
        const pool = new WorkerPool<EchoRequest, EchoResponse>(new URL('./workerPoolExitWorker.ts', import.meta.url), 1);
        const result = await Promise.race([
            pool.map([{n: 1}, {n: 2}], (item) => ({n: -item.n})),
            new Promise<EchoResponse[]>((_, reject) => {
                setTimeout(() => reject(new Error('WorkerPool hung after worker exit')), 5_000);
            }),
        ]);
        expect(result).toEqual([{n: -1}, {n: -2}]);
    });

    it('returns an empty array for no items', async () => {
        const pool = new WorkerPool<EchoRequest, EchoResponse>(new URL('./workerPoolEchoWorker.ts', import.meta.url), 2);
        expect(await pool.map([], (item) => ({n: item.n}))).toEqual([]);
    });
});
