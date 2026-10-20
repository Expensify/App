/** Sharing into the app is only supported by native hosts. */
import type {ShareActionHandler} from '@expensify/nitro-utils';

const ShareActionHandlerModule: Pick<ShareActionHandler, 'processFiles'> = {
    processFiles: () => Promise.resolve([]),
};

export default ShareActionHandlerModule;
