import noop from 'lodash/noop';

import type {AddBlockedBrowserBackListener, RecordBlockedNavigation} from './types';

// Native apps have no browser back button.
const recordBlockedNavigation: RecordBlockedNavigation = noop;

const addBlockedBrowserBackListener: AddBlockedBrowserBackListener = () => noop;

export default recordBlockedNavigation;
export {addBlockedBrowserBackListener};
