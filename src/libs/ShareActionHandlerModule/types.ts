import type {ShareActionHandler} from '@expensify/nitro-utils';

type ShareActionHandlerModule = Pick<ShareActionHandler, 'processFiles'>;

export default ShareActionHandlerModule;
