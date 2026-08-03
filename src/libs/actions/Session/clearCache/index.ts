import type ClearCache from './types';

const clearStorage: ClearCache = async () => {
    // Clear the service worker's user-media cache so receipts and attachments
    // from one user's session cannot be served to a subsequent user on the
    // same browser (shared device / account switching). Must match the
    // `cacheName` string in `config/rsbuild/rsbuild.common.ts` (GenerateSW).
    if (typeof caches === 'undefined') {
        return;
    }
    await caches.delete('user-media');
};

export default clearStorage;
