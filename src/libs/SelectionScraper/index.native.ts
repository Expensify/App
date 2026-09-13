import CONST from '@src/CONST';

import type GetCurrentSelection from './types';

const COPYABLE_TEXT_DATA_SET = {[CONST.COPYABLE_TEXT_ELEMENT]: true} as const;
const COPYABLE_ROW_DATA_SET = {[CONST.COPYABLE_ROW_ELEMENT]: true} as const;

// This is a no-op function for native devices because they wouldn't be able to support Selection API like a website.
const getCurrentSelection: GetCurrentSelection = () => '';

export {COPYABLE_ROW_DATA_SET, COPYABLE_TEXT_DATA_SET};

export default {
    getCurrentSelection,
};
