import PrefetchQueries from '@libs/Prefetch/PrefetchQueries';

import type PreparePrefetchRequest from './types';

const preparePrefetchRequest: PreparePrefetchRequest = (command) => {
    // Prefetch the request on next app start if the prefetch key is present in the headers
    // This allows to fetch the request natively before the JS bundle is loaded. Once the request with this prefetch key is made, it will already be cached and served from the cache.
    const prefetchKey = command && PrefetchQueries.has(command) ? command : undefined;

    const prefetchHeaders = prefetchKey
        ? {
              prefetchKey,
          }
        : undefined;

    return {
        prefetchKey,
        prefetchHeaders,
    };
};

export default preparePrefetchRequest;
