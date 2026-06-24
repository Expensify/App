import type {Observer} from 'xstate';
import createBufferedObserver from '@libs/XStateInspector/createBufferedObserver';

type Deferred<T> = {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (reason?: unknown) => void;
};

function createDeferred<T>(): Deferred<T> {
    let resolve: (value: T) => void = () => {};
    let reject: (reason?: unknown) => void = () => {};
    const promise = new Promise<T>((resolveFn, rejectFn) => {
        resolve = resolveFn;
        reject = rejectFn;
    });
    return {promise, resolve, reject};
}

function createRecordingObserver() {
    const received: number[] = [];
    const errors: unknown[] = [];
    let completedCount = 0;
    const observer: Observer<number> = {
        next: (value) => received.push(value),
        error: (error) => errors.push(error),
        complete: () => {
            completedCount += 1;
        },
    };
    return {received, errors, getCompletedCount: () => completedCount, observer};
}

describe('createBufferedObserver', () => {
    it('buffers next() values until the downstream observer is ready, then drains them in order', () => {
        const deferred = createDeferred<Observer<number>>();
        const {received, observer} = createRecordingObserver();
        const buffered = createBufferedObserver(deferred.promise);

        buffered.next?.(1);
        buffered.next?.(2);
        buffered.next?.(3);
        expect(received).toEqual([]);

        deferred.resolve(observer);

        return deferred.promise.then(() => {
            expect(received).toEqual([1, 2, 3]);
        });
    });

    it('forwards values straight through once the downstream observer is live, after the buffered ones', () => {
        const deferred = createDeferred<Observer<number>>();
        const {received, observer} = createRecordingObserver();
        const buffered = createBufferedObserver(deferred.promise);

        buffered.next?.(1);
        deferred.resolve(observer);

        return deferred.promise.then(() => {
            buffered.next?.(2);
            buffered.next?.(3);
            expect(received).toEqual([1, 2, 3]);
        });
    });

    it('releases the buffer and drops values when the downstream observer fails to load, so it cannot grow without bound', () => {
        const deferred = createDeferred<Observer<number>>();
        const {received} = createRecordingObserver();
        const buffered = createBufferedObserver(deferred.promise);

        buffered.next?.(1);
        deferred.reject(new Error('chunk failed to load'));

        return deferred.promise.then(
            () => {
                throw new Error('promise should have rejected');
            },
            () => {
                buffered.next?.(2);
                expect(received).toEqual([]);
            },
        );
    });

    it('treats error and complete as no-ops before the downstream observer is live, and forwards them after', () => {
        const deferred = createDeferred<Observer<number>>();
        const {errors, getCompletedCount, observer} = createRecordingObserver();
        const buffered = createBufferedObserver(deferred.promise);

        buffered.error?.(new Error('early'));
        buffered.complete?.();
        expect(errors).toEqual([]);
        expect(getCompletedCount()).toBe(0);

        deferred.resolve(observer);

        return deferred.promise.then(() => {
            const lateError = new Error('late');
            buffered.error?.(lateError);
            buffered.complete?.();
            expect(errors).toEqual([lateError]);
            expect(getCompletedCount()).toBe(1);
        });
    });
});
