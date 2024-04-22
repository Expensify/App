const createTriggerPromise = (count = 1) => {
    let promiseIndex = 0;
    let resolves: Array<() => void> = [];
    const initialPromises = Array(count)
        .fill(0)
        .map(
            (index) =>
                new Promise<void>((resolve) => {
                    if (index !== 0) {
                        return;
                    }
                    resolves.push(resolve);
                }),
        );

    let trigger: () => void = () => undefined;

    const resetPromise = (resetPromiseCallback?: (resettedPromise: Promise<void>, index: number) => void) => {
        const newPromise = new Promise<void>((resolve) => {
            trigger = resolve;
        });

        if (resetPromiseCallback) {
            return resetPromiseCallback(newPromise, promiseIndex);
        }

        initialPromises[promiseIndex] = newPromise;
        if (promiseIndex < count - 1) {
            promiseIndex++;
        }
    };

    if (resolves.length === 0) {
        resetPromise();
    } else {
        trigger = resolves[0];
        resolves = [];
    }

    resetPromise();
    return {initialPromises, trigger, resetPromise};
};

export default createTriggerPromise;
