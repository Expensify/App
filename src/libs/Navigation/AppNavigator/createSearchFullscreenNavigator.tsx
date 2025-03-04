import type {ParamListBase} from '@react-navigation/native';
import {createNavigatorFactory} from '@react-navigation/native';
import createPlatformStackNavigatorComponent from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent';
import defaultPlatformStackScreenOptions from '@libs/Navigation/PlatformStackNavigation/defaultPlatformStackScreenOptions';
import type {CustomEffectsHookProps, PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import useNavigationResetOnLayoutChange from './useNavigationResetOnLayoutChange';

function useCustomEffects(props: CustomEffectsHookProps) {
    useNavigationResetOnLayoutChange(props);
}

const SearchFullscreenNavigatorComponent = createPlatformStackNavigatorComponent('SearchFullscreenNavigator', {
    defaultScreenOptions: defaultPlatformStackScreenOptions,
    useCustomEffects,
});

function createSearchFullscreenNavigator<ParamList extends ParamListBase>() {
    return createNavigatorFactory<PlatformStackNavigationState<ParamList>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof SearchFullscreenNavigatorComponent>(
        SearchFullscreenNavigatorComponent,
    )<ParamList>();
}

export default createSearchFullscreenNavigator;
