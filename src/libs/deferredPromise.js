export default function deferredPromise() {
    const task = {};
    task.promise = new Promise(((resolve, reject) => {
        task.resolve = resolve;
        task.reject = reject;
    }));

    return task;
}
