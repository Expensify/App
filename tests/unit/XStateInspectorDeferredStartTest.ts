import type {InspectionEvent, Observer} from 'xstate';
import createDeferredStart from '@libs/XStateInspector/createDeferredStart';
import type {LoadedInspector} from '@libs/XStateInspector/types';

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

function createRecordingInspector() {
    let startCount = 0;
    const inspect: Observer<InspectionEvent> = {
        next: () => {},
        error: () => {},
        complete: () => {},
    };
    const inspector: LoadedInspector = {
        inspect,
        start: () => {
            startCount += 1;
        },
    };
    return {getStartCount: () => startCount, inspector};
}

describe('createDeferredStart', () => {
    it('opens the window straight away when pressed after the inspector has loaded', () => {
        const deferred = createDeferred<LoadedInspector>();
        const {getStartCount, inspector} = createRecordingInspector();
        const start = createDeferredStart(deferred.promise);

        deferred.resolve(inspector);

        return deferred.promise.then(() => {
            start();
            expect(getStartCount()).toBe(1);
        });
    });

    it('remembers a press made before the inspector loads and replays it on load', () => {
        const deferred = createDeferred<LoadedInspector>();
        const {getStartCount, inspector} = createRecordingInspector();
        const start = createDeferredStart(deferred.promise);

        start();
        expect(getStartCount()).toBe(0);

        deferred.resolve(inspector);

        return deferred.promise.then(() => {
            expect(getStartCount()).toBe(1);
        });
    });

    it('replays only once no matter how many presses are made before the inspector loads', () => {
        const deferred = createDeferred<LoadedInspector>();
        const {getStartCount, inspector} = createRecordingInspector();
        const start = createDeferredStart(deferred.promise);

        start();
        start();
        start();

        deferred.resolve(inspector);

        return deferred.promise.then(() => {
            expect(getStartCount()).toBe(1);
        });
    });

    it('forwards every later press straight through once the inspector is live, after replaying the early one', () => {
        const deferred = createDeferred<LoadedInspector>();
        const {getStartCount, inspector} = createRecordingInspector();
        const start = createDeferredStart(deferred.promise);

        start();
        deferred.resolve(inspector);

        return deferred.promise.then(() => {
            expect(getStartCount()).toBe(1);
            start();
            start();
            expect(getStartCount()).toBe(3);
        });
    });

    it('stays a no-op when the inspector chunk fails to load, both before and after the failure', () => {
        const deferred = createDeferred<LoadedInspector>();
        const {getStartCount} = createRecordingInspector();
        const start = createDeferredStart(deferred.promise);

        start();
        deferred.reject(new Error('chunk failed to load'));

        return deferred.promise.then(
            () => {
                throw new Error('promise should have rejected');
            },
            () => {
                start();
                expect(getStartCount()).toBe(0);
            },
        );
    });
});
