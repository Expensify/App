import {getShareActionHandlerNitroModule} from '@expensify/nitro-utils';

import type ShareActionHandlerModule from './types';

const shareActionHandlerModule: ShareActionHandlerModule = {
    // This is async so that failing to create the hybrid object rejects the promise instead of throwing at the call site.
    processFiles: async () => getShareActionHandlerNitroModule().processFiles(),
};

export default shareActionHandlerModule;
