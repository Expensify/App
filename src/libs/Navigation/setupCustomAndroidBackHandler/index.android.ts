import {findFocusedRoute, StackActions} from '@react-navigation/native';
import {BackHandler, NativeModules} from 'react-native';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import getTopmostCentralPaneRoute from '@navigation/getTopmostCentralPaneRoute';
import navigationRef from '@navigation/navigationRef';
import type {BottomTabNavigatorParamList, RootStackParamList, State} from '@navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

type SearchPageProps = PlatformStackScreenProps<BottomTabNavigatorParamList, typeof SCREENS.SEARCH.BOTTOM_TAB>;

// We need to do some custom handling for the back button on Android for actions related to the search page.
function setupCustomAndroidBackHandler() {
    const onBackPress = () => {
        const rootState = navigationRef.getRootState();
        const bottomTabRoute = rootState?.routes?.find((route) => route.name === NAVIGATORS.BOTTOM_TAB_NAVIGATOR);
        const bottomTabRoutes = bottomTabRoute?.state?.routes;
        const focusedRoute = findFocusedRoute(rootState);

        // Shouldn't happen but for type safety.
        if (!bottomTabRoutes) {
            return false;
        }

        const isLastScreenOnStack = bottomTabRoutes.length === 1 && rootState?.routes?.length === 1;

        if (NativeModules.HybridAppModule && isLastScreenOnStack) {
            NativeModules.HybridAppModule.exitApp();
        }

        // Handle back press on the search page.
        // We need to pop two screens, from the central pane and from the bottom tab.
        if (bottomTabRoutes[bottomTabRoutes.length - 1].name === SCREENS.SEARCH.BOTTOM_TAB && focusedRoute?.name === SCREENS.SEARCH.CENTRAL_PANE) {
            navigationRef.dispatch({...StackActions.pop(), target: bottomTabRoute?.state?.key});
            navigationRef.dispatch({...StackActions.pop()});

            const centralPaneRouteAfterPop = getTopmostCentralPaneRoute({routes: [rootState?.routes?.at(-2)]} as State<RootStackParamList>);
            const bottomTabRouteAfterPop = bottomTabRoutes.at(-2);

            // It's possible that central pane search is desynchronized with the bottom tab search.
            // e.g. opening a tab different from search will wipe out central pane screens.
            // In that case we have to push the proper one.
            if (
                bottomTabRouteAfterPop &&
                bottomTabRouteAfterPop.name === SCREENS.SEARCH.BOTTOM_TAB &&
                (!centralPaneRouteAfterPop || centralPaneRouteAfterPop.name !== SCREENS.SEARCH.CENTRAL_PANE)
            ) {
                const searchParams = bottomTabRoutes[bottomTabRoutes.length - 2].params as SearchPageProps['route']['params'];
                navigationRef.dispatch({...StackActions.push(SCREENS.SEARCH.CENTRAL_PANE, searchParams)});
            }

            return true;
        }

        // Handle back press to go back to the search page.
        // It's possible that central pane search is desynchronized with the bottom tab search.
        // e.g. opening a tab different from search will wipe out central pane screens.
        // In that case we have to push the proper one.
        if (bottomTabRoutes && bottomTabRoutes?.length >= 2 && bottomTabRoutes[bottomTabRoutes.length - 2].name === SCREENS.SEARCH.BOTTOM_TAB && rootState?.routes?.length === 1) {
            const searchParams = bottomTabRoutes[bottomTabRoutes.length - 2].params as SearchPageProps['route']['params'];
            navigationRef.dispatch({...StackActions.push(SCREENS.SEARCH.CENTRAL_PANE, searchParams)});
            navigationRef.dispatch({...StackActions.pop(), target: bottomTabRoute?.state?.key});
            return true;
        }

        // Handle all other cases with default handler.
        return false;
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);
}

export default setupCustomAndroidBackHandler;
