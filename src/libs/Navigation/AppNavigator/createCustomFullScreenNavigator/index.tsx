import type {ParamListBase} from '@react-navigation/native';
import {createNavigatorFactory} from '@react-navigation/native';
import createPlatformStackNavigatorComponent from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent';
import type {PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import CustomFullScreenRouter from './CustomFullScreenRouter';

const CustomFullScreenNavigatorComponent = createPlatformStackNavigatorComponent('CustomFullScreenNavigator', {
    createRouter: CustomFullScreenRouter,
});

function createCustomFullScreenNavigator<ParamList extends ParamListBase>() {
    return createNavigatorFactory<PlatformStackNavigationState<ParamList>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof CustomFullScreenNavigatorComponent>(
        CustomFullScreenNavigatorComponent,
    )<ParamList>();
}

export default createCustomFullScreenNavigator;
