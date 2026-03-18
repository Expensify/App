import type {NavigationState} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import willRouteNavigateToRHP from './willRouteNavigateToRHP';

const RHP_REPORT_SCREENS_TO_PRESERVE = new Set<string>([
    SCREENS.RIGHT_MODAL.EXPENSE_REPORT,
    SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT,
    SCREENS.RIGHT_MODAL.SEARCH_REPORT,
]);

type ShouldPreserveWideRHPReportOriginForInternalLinkParams = {
    currentState: NavigationState | undefined;
    targetPath: Route;
    isNarrowLayout: boolean;
};

export default function shouldPreserveWideRHPReportOriginForInternalLink({
    currentState,
    targetPath,
    isNarrowLayout,
}: ShouldPreserveWideRHPReportOriginForInternalLinkParams): boolean {
    if (getPlatform() !== CONST.PLATFORM.WEB || isNarrowLayout || !targetPath || willRouteNavigateToRHP(targetPath)) {
        return false;
    }

    const topmostRoute = currentState?.routes.at(-1);
    if (topmostRoute?.name !== NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
        return false;
    }

    const currentFocusedRoute = currentState ? findFocusedRoute(currentState) : undefined;
    return currentFocusedRoute !== undefined && RHP_REPORT_SCREENS_TO_PRESERVE.has(currentFocusedRoute.name);
}
