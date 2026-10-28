import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

/**
 * The native bar shows at most five of the six tabs. With the Insights beta, Insights takes the Account tab's place
 * and Account moves to the top bar; without it, Insights has no item.
 */
function getTabWithoutBarItem(isInsightsBetaEnabled: boolean) {
    return isInsightsBetaEnabled ? NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR : SCREENS.INSIGHTS;
}

export default getTabWithoutBarItem;
