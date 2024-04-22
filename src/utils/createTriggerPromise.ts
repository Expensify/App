const createTriggerPromise = () => {
    let trigger: () => void = () => undefined;
    const resetPromise = () =>
        new Promise<void>((resolve) => {
            trigger = resolve;
        });
    const promise = resetPromise();

    return {promise, trigger, resetPromise};
};

export default createTriggerPromise;
