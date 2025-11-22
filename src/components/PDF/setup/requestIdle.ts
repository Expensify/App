const requestIdle =
    window.requestIdleCallback ||
    function (cb: IdleRequestCallback) {
        return setTimeout(() => {
            const start = Date.now();
            cb({
                didTimeout: false,
                timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
            } as IdleDeadline);
        }, 1);
    };

const cancelIdle =
    window.cancelIdleCallback ||
    function (id: number) {
        clearTimeout(id);
    };

export {requestIdle, cancelIdle};
