import type {NavigationState} from '@react-navigation/native';
import type {ValueOf} from 'type-fest';
import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import {getExpensifyTabState} from '@libs/Navigation/helpers/expensifyTabNavigatorUtils';
import NAVIGATORS from '@src/NAVIGATORS';
import type {Screen} from '@src/SCREENS';

function getLastRoute(rootState: NavigationState, navigator: ValueOf<typeof NAVIGATORS>, screen: Screen) {
    // Navigators can be at root level or nested inside ExpensifyTabNavigator
    let lastNavigator = rootState.routes.findLast((route) => route.name === navigator);

    if (!lastNavigator) {
        const rootTabRoute = rootState.routes.findLast((route) => route.name === NAVIGATORS.EXPENSIFY_TAB_NAVIGATOR);
        const tabState = getExpensifyTabState(rootTabRoute);
        lastNavigator = tabState?.routes?.findLast((route) => route.name === navigator);
    }

    const lastNavigatorState = lastNavigator?.key ? getPreservedNavigatorState(lastNavigator.key) : undefined;
    const lastRoute = lastNavigatorState?.routes?.findLast((route) => route.name === screen);
    return lastRoute;
}

export default getLastRoute;
