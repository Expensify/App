function clearAsync() {
    const cacheAPIWorker = new Worker('./worker.ts');

    cacheAPIWorker.postMessage('clear');
}

// eslint-disable-next-line import/prefer-default-export
export {clearAsync};
