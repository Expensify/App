import type GetUpdatedSyncSelection from './types';

const noop = () => undefined;

// This is a no-op function for non-iOS platforms
const getUpdatedSyncSelection: GetUpdatedSyncSelection = noop;

export default getUpdatedSyncSelection;
