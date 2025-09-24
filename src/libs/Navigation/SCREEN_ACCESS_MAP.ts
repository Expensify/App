import SCREENS from '@src/SCREENS';

/**
 * Maps scenarios to the allowed screen names that can access another screen.
 * Used for dynamic navigation permission validation and routing decisions.
 * Example:
 *   - VERIFY_ACCOUNT: [SCREENS.REPORT, SCREENS.SEARCH.REPORT_RHP]
 *   this means that you can access VERIFY_ACCOUNT screen only from SCREENS.REPORT and SCREENS.SEARCH.REPORT_RHP
 */
const SCREEN_ACCESS_MAP = {
    VERIFY_ACCOUNT: [SCREENS.REPORT, SCREENS.SEARCH.REPORT_RHP],
};

export default SCREEN_ACCESS_MAP;
