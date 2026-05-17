/**
 * Polyfill for requestIdleCallback / cancelIdleCallback.
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback
 *
 * Falls back to setTimeout/clearTimeout where the API is unavailable (e.g. Safari < 16.4).
 * The fallback runs the callback on the next tick rather than during true idle time —
 * not perfect, but good enough to keep work off the synchronous render path on platforms
 * that lack native idle scheduling.
 */
type GlobalWithIdleCallback = typeof globalThis & {
    requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
    cancelIdleCallback?: (handle: number) => void;
};

const g = globalThis as GlobalWithIdleCallback;

if (typeof g.requestIdleCallback !== 'function') {
    Object.defineProperty(g, 'requestIdleCallback', {
        value(callback: IdleRequestCallback): number {
            return setTimeout(() => {
                callback({
                    didTimeout: false,
                    timeRemaining: () => 0,
                });
            }, 1) as unknown as number;
        },
        configurable: true,
        writable: true,
    });
}

if (typeof g.cancelIdleCallback !== 'function') {
    Object.defineProperty(g, 'cancelIdleCallback', {
        value(handle: number) {
            clearTimeout(handle as unknown as ReturnType<typeof setTimeout>);
        },
        configurable: true,
        writable: true,
    });
}
