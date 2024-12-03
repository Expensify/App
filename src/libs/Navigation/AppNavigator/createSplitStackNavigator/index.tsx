import type {ParamListBase} from '@react-navigation/native';
import {createNavigatorFactory} from '@react-navigation/native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useNavigationResetOnLayoutChange from '@libs/Navigation/AppNavigator/useNavigationResetOnLayoutChange';
import createPlatformStackNavigatorComponent from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent';
import defaultPlatformStackScreenOptions from '@libs/Navigation/PlatformStackNavigation/defaultPlatformStackScreenOptions';
import type {
    CustomEffectsHookProps,
    CustomStateHookProps,
    PlatformStackNavigationEventMap,
    PlatformStackNavigationOptions,
    PlatformStackNavigationState,
} from '@libs/Navigation/PlatformStackNavigation/types';
import SplitStackRouter from './SplitStackRouter';
import usePreserveSplitNavigatorState from './usePreserveSplitNavigatorState';

function useCustomEffects(props: CustomEffectsHookProps, route) {
    useNavigationResetOnLayoutChange(props);
    usePreserveSplitNavigatorState(route, props.navigation.getState());
}

function useCustomSplitNavigatorState({state}: CustomStateHookProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const sidebarScreenRoute = state.routes.at(0);

    if (!sidebarScreenRoute) {
        return state;
    }

    const centralScreenRoutes = state.routes.slice(1);
    const routesToRender = shouldUseNarrowLayout ? state.routes.slice(-2) : [sidebarScreenRoute, ...centralScreenRoutes.slice(-2)];

    return {...state, routes: routesToRender, index: routesToRender.length - 1};
}

const CustomFullScreenNavigatorComponent = createPlatformStackNavigatorComponent('CustomFullScreenNavigator', {
    createRouter: SplitStackRouter,
    useCustomEffects,
    defaultScreenOptions: defaultPlatformStackScreenOptions,
    useCustomState: useCustomSplitNavigatorState,
});

function createCustomFullScreenNavigator<ParamList extends ParamListBase>() {
    return createNavigatorFactory<PlatformStackNavigationState<ParamList>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof CustomFullScreenNavigatorComponent>(
        CustomFullScreenNavigatorComponent,
    )<ParamList>();
}

export default createCustomFullScreenNavigator;
