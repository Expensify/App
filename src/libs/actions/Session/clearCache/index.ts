import {clearAuthImagesCache} from '@hooks/useCachedImageSource';
import type ClearCache from './types';

const clearStorage: ClearCache = async () => {
    await clearAuthImagesCache();

    // Clear the service worker's user-media cache so receipts and attachments
    // from one user's session cannot be served to a subsequent user on the
    // same browser (shared device / account switching). Must match the
    // `cacheName` string in `config/webpack/webpack.common.ts` (GenerateSW).
    if (typeof caches !== 'undefined') {
        await caches.delete('user-media');
    }
};

export default clearStorage;
