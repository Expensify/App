import type ShareActionHandlerModule from './types';

// Other apps can only share into the iOS and Android apps, so a share is never pending on web.
const shareActionHandlerModule: ShareActionHandlerModule = {
    processFiles: () => Promise.resolve([]),
};

export default shareActionHandlerModule;
