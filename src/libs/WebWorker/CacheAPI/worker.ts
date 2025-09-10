import CacheAPI from '@libs/CacheAPI';

self.onmessage = (event) => {
    const eventAction = event.data;
    if (eventAction === 'clear') {
        CacheAPI.clear();
    }
};
