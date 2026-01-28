// These sets contain the names of wide and super wide right modals.
import SCREENS from '@src/SCREENS';

// Wide right modals: modals that can be either wide or regular RHP size
// Super wide right modals: modals that can be super wide size
// All wide right modals: all modals that can be wide size (combination of wide and super wide)

const WIDE_RIGHT_MODALS = new Set<string>([SCREENS.RIGHT_MODAL.SEARCH_REPORT]);
const SUPER_WIDE_RIGHT_MODALS = new Set<string>([SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT, SCREENS.RIGHT_MODAL.EXPENSE_REPORT]);
const ALL_WIDE_RIGHT_MODALS = new Set<string>([...WIDE_RIGHT_MODALS, ...SUPER_WIDE_RIGHT_MODALS]);

export {WIDE_RIGHT_MODALS, SUPER_WIDE_RIGHT_MODALS, ALL_WIDE_RIGHT_MODALS};
