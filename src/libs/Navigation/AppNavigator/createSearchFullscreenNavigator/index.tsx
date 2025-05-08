import type {ParamListBase} from '@react-navigation/native';
import {createNavigatorFactory} from '@react-navigation/native';
import usePreserveNavigatorState from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import useNavigationResetOnLayoutChange from '@libs/Navigation/AppNavigator/useNavigationResetOnLayoutChange';
import createPlatformStackNavigatorComponent from '@navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent';
import defaultPlatformStackScreenOptions from '@navigation/PlatformStackNavigation/defaultPlatformStackScreenOptions';
import type {CustomEffectsHookProps, PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState} from '@navigation/PlatformStackNavigation/types';
import SearchFullscreenRouter from './SearchFullscreenRouter';

function useCustomEffects(props: CustomEffectsHookProps) {
    useNavigationResetOnLayoutChange(props);
    usePreserveNavigatorState(props.state, props.parentRoute);
}

const SearchFullscreenNavigatorComponent = createPlatformStackNavigatorComponent('SearchFullscreenNavigator', {
    createRouter: SearchFullscreenRouter,
    defaultScreenOptions: defaultPlatformStackScreenOptions,
    useCustomEffects,
});

function createSearchFullscreenNavigator<ParamList extends ParamListBase>() {
    return createNavigatorFactory<PlatformStackNavigationState<ParamList>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof SearchFullscreenNavigatorComponent>(
        SearchFullscreenNavigatorComponent,
    )<ParamList>();
}

export default createSearchFullscreenNavigator;
