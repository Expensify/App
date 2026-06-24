import type {NavigationState, PartialState, RouteProp} from '@react-navigation/native';
import {ALL_WIDE_RIGHT_MODALS} from '@components/WideRHPContextProvider/WIDE_RIGHT_MODALS';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import type NAVIGATORS from '@src/NAVIGATORS';

type RightModalNavigatorRoute = RouteProp<AuthScreensParamList, typeof NAVIGATORS.RIGHT_MODAL_NAVIGATOR> & {
    state?: NavigationState | PartialState<NavigationState>;
};

/**
 * Whether the RHP stack currently contains a wide/super-wide expense or report pane.
 * Reads the route directly (no WideRHPContextProvider), so it can be used above that provider — e.g. when
 * choosing the RightModalNavigator's root entrance animation. Wide panes keep sliding; everything else can fade.
 */
function doesRHPStackHaveWidePane(route: RightModalNavigatorRoute): boolean {
    if (route.state?.routes?.length) {
        return route.state.routes.some((nestedRoute) => ALL_WIDE_RIGHT_MODALS.has(nestedRoute.name));
    }
    // Before the nested state hydrates (initial mount), the focused screen comes through params.
    const screen = route.params?.screen;
    return !!screen && ALL_WIDE_RIGHT_MODALS.has(screen);
}

export default doesRHPStackHaveWidePane;
