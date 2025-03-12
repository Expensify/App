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
import SidebarSpacerWrapper from './SidebarSpacerWrapper';
import SplitRouter from './SplitRouter';
import usePreserveNavigatorState from './usePreserveNavigatorState';

function useCustomEffects(props: CustomEffectsHookProps) {
    useNavigationResetOnLayoutChange(props);
    usePreserveNavigatorState(props.state, props.parentRoute);
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

const SplitNavigatorComponent = createPlatformStackNavigatorComponent('SplitNavigator', {
    createRouter: SplitRouter,
    useCustomEffects,
    defaultScreenOptions: defaultPlatformStackScreenOptions,
    useCustomState: useCustomSplitNavigatorState,
    NavigationContentWrapper: SidebarSpacerWrapper,
});

function createSplitNavigator<ParamList extends ParamListBase>() {
    return createNavigatorFactory<PlatformStackNavigationState<ParamList>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof SplitNavigatorComponent>(
        SplitNavigatorComponent,
    )<ParamList>();
}

export default createSplitNavigator;
