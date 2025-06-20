import type {ParamListBase} from '@react-navigation/native';
import {createNavigatorFactory} from '@react-navigation/native';
import SearchSidebar from '@components/Navigation/SearchSidebar';
import usePreserveNavigatorState from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import useNavigationResetOnLayoutChange from '@libs/Navigation/AppNavigator/useNavigationResetOnLayoutChange';
import createPlatformStackNavigatorComponent from '@navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent';
import defaultPlatformStackScreenOptions from '@navigation/PlatformStackNavigation/defaultPlatformStackScreenOptions';
import type {
    CustomEffectsHookProps,
    CustomStateHookProps,
    PlatformStackNavigationEventMap,
    PlatformStackNavigationOptions,
    PlatformStackNavigationState,
} from '@navigation/PlatformStackNavigation/types';
import SearchFullscreenRouter from './SearchFullscreenRouter';

function useCustomEffects(props: CustomEffectsHookProps) {
    useNavigationResetOnLayoutChange(props);
    usePreserveNavigatorState(props.state, props.parentRoute);
}

// This is a custom state hook that is used to render the last two routes in the stack.
// We do this to improve the performance of the search results screen.
function useCustomState({state}: CustomStateHookProps) {
    const routesToRender = [...state.routes.slice(-2)];
    return {...state, routes: routesToRender, index: routesToRender.length - 1};
}

const SearchFullscreenNavigatorComponent = createPlatformStackNavigatorComponent('SearchFullscreenNavigator', {
    createRouter: SearchFullscreenRouter,
    defaultScreenOptions: defaultPlatformStackScreenOptions,
    useCustomEffects,
    useCustomState,
    ExtraContent: SearchSidebar,
});

function createSearchFullscreenNavigator<ParamList extends ParamListBase>() {
    return createNavigatorFactory<PlatformStackNavigationState<ParamList>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof SearchFullscreenNavigatorComponent>(
        SearchFullscreenNavigatorComponent,
    )<ParamList>();
}

export default createSearchFullscreenNavigator;
