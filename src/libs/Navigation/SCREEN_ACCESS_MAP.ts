import type {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';
import SCREENS from '@src/SCREENS';

type ScreenAccessMap = Record<keyof typeof DYNAMIC_ROUTES, Screen[]>;

/**
 * Maps scenarios to the allowed screen names that can access another screen.
 * Used for dynamic navigation permission validation and routing decisions.
 * Example:
 *   - VERIFY_ACCOUNT: [SCREENS.REPORT, SCREENS.SEARCH.REPORT_RHP]
 *   this means that you can access VERIFY_ACCOUNT screen only from SCREENS.REPORT and SCREENS.SEARCH.REPORT_RHP
 */
const SCREEN_ACCESS_MAP: ScreenAccessMap = {
    VERIFY_ACCOUNT: [SCREENS.REPORT, SCREENS.SEARCH.REPORT_RHP, SCREENS.SEARCH.MONEY_REQUEST_REPORT],
    CONFIRM_WORKSPACE: [SCREENS.WORKSPACES_LIST],
};

export default SCREEN_ACCESS_MAP;
