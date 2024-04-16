import type ClearCache from './types';

const clearStorage: ClearCache = () =>
    new Promise<void>((resolve) => {
        resolve();
    });

export default clearStorage;
