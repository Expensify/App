export default function getPromiseWithResolve<T>(): [Promise<T | undefined>, (value?: T) => void] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let resolveFn = (_value?: T) => {};
    const promise = new Promise<T | undefined>((resolve) => {
        resolveFn = resolve;
    });

    return [promise, resolveFn];
}
