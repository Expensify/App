import type {ParamListBase} from '@react-navigation/native';
import {createNavigatorFactory} from '@react-navigation/native';
import useNavigationResetOnLayoutChange from '@libs/Navigation/AppNavigator/useNavigationResetOnLayoutChange';
import createPlatformStackNavigatorComponent from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent';
import defaultPlatformStackScreenOptions from '@libs/Navigation/PlatformStackNavigation/defaultPlatformStackScreenOptions';
import type {PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import CustomFullScreenRouter from './CustomFullScreenRouter';

const CustomFullScreenNavigatorComponent = createPlatformStackNavigatorComponent('CustomFullScreenNavigator', {
    createRouter: CustomFullScreenRouter,
    useCustomEffects: useNavigationResetOnLayoutChange,
    defaultScreenOptions: defaultPlatformStackScreenOptions,
});

function createCustomFullScreenNavigator<ParamList extends ParamListBase>() {
    return createNavigatorFactory<PlatformStackNavigationState<ParamList>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof CustomFullScreenNavigatorComponent>(
        CustomFullScreenNavigatorComponent,
    )<ParamList>();
}

export default createCustomFullScreenNavigator;
