import {createNavigatorFactory} from '@react-navigation/native';
import type {ParamListBase} from '@react-navigation/native';
import useNavigationResetOnLayoutChange from '@libs/Navigation/AppNavigator/useNavigationResetOnLayoutChange';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import createPlatformStackNavigatorComponent from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent';
import defaultPlatformStackScreenOptions from '@libs/Navigation/PlatformStackNavigation/defaultPlatformStackScreenOptions';
import type {CustomStateHookProps, PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import RootStackRouter from './RootStackRouter';
import TopLevelBottomTabBar from './TopLevelBottomTabBar';

// This is an optimization to keep mounted only last few screens in the stack.
function useCustomRootStackNavigatorState({state}: CustomStateHookProps) {
    const lastSplitIndex = state.routes.findLastIndex((route) => isFullScreenName(route.name));
    const routesToRender = state.routes.slice(Math.max(0, lastSplitIndex - 1), state.routes.length);

    return {...state, routes: routesToRender, index: routesToRender.length - 1};
}

const RootStackNavigatorComponent = createPlatformStackNavigatorComponent('ResponsiveStackNavigator', {
    createRouter: RootStackRouter,
    defaultScreenOptions: defaultPlatformStackScreenOptions,
    useCustomEffects: useNavigationResetOnLayoutChange,
    useCustomState: useCustomRootStackNavigatorState,
    ExtraContent: TopLevelBottomTabBar,
});

function createRootStackNavigator<ParamList extends ParamListBase>() {
    return createNavigatorFactory<PlatformStackNavigationState<ParamList>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof RootStackNavigatorComponent>(
        RootStackNavigatorComponent,
    )<ParamList>();
}

export default createRootStackNavigator;
