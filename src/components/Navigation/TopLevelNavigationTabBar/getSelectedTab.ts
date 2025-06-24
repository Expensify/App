import type {NavigationState} from '@react-navigation/native';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import {FULLSCREEN_TO_TAB} from '@libs/Navigation/linkingConfig/RELATIONS';
import type {FullScreenName} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';

function getSelectedTab(state: NavigationState) {
    const topmostFullScreenRoute = state?.routes.findLast((route) => isFullScreenName(route.name));
    return FULLSCREEN_TO_TAB[(topmostFullScreenRoute?.name as FullScreenName) ?? NAVIGATORS.REPORTS_SPLIT_NAVIGATOR];
}

export default getSelectedTab;
