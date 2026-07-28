import type GetCurrentSelection from './types';

// This is a no-op function for native devices because they wouldn't be able to support Selection API like a website.
const getCurrentSelection: GetCurrentSelection = () => '';

export default {
    getCurrentSelection,
};
