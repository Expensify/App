import type UseSyncModalWithHistory from './types';

// Modal back-guard synchronization with the browser history is only supported for web.
const useSyncModalWithHistory: UseSyncModalWithHistory = () => {};

export default useSyncModalWithHistory;
