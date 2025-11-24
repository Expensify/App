const requestIdle: typeof window.requestIdleCallback =
    window.requestIdleCallback ||
    function (cb: IdleRequestCallback): number {
        return setTimeout(() => {
            const start = Date.now();
            cb({
                didTimeout: false,
                timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
            } as IdleDeadline);
        }, 1) as unknown as number;
    };

const cancelIdle =
    window.cancelIdleCallback ||
    function (id: number) {
        clearTimeout(id);
    };

export {requestIdle, cancelIdle};
