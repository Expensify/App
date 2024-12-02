import type {ParamListBase} from '@react-navigation/native';
import {createNavigatorFactory} from '@react-navigation/native';
import useNavigationResetOnLayoutChange from '@libs/Navigation/AppNavigator/useNavigationResetOnLayoutChange';
import createPlatformStackNavigatorComponent from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent';
import defaultPlatformStackScreenOptions from '@libs/Navigation/PlatformStackNavigation/defaultPlatformStackScreenOptions';
import type {CustomStateHookProps, PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import {isFullScreenName} from '@libs/NavigationUtils';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

const loadCustomRouter = require<ReactComponentModule>('@libs/Navigation/AppNavigator/createCustomStackNavigator/CustomRouter').default;

function useCustomRouterState({state}: CustomStateHookProps) {
    const lastSplitIndex = state.routes.findLastIndex((route) => isFullScreenName(route.name));
    const routesToRender = state.routes.slice(Math.max(0, lastSplitIndex - 1), state.routes.length);

    return {stateToRender: {...state, routes: routesToRender, index: routesToRender.length - 1}};
}

const ResponsiveStackNavigatorComponent = createPlatformStackNavigatorComponent('ResponsiveStackNavigator', {
    createRouter: loadCustomRouter,
    defaultScreenOptions: defaultPlatformStackScreenOptions,
    useCustomEffects: useNavigationResetOnLayoutChange,
    useCustomState: useCustomRouterState,
});

function createResponsiveStackNavigator<ParamList extends ParamListBase>() {
    return createNavigatorFactory<PlatformStackNavigationState<ParamList>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof ResponsiveStackNavigatorComponent>(
        ResponsiveStackNavigatorComponent,
    )<ParamList>();
}

export default createResponsiveStackNavigator;
