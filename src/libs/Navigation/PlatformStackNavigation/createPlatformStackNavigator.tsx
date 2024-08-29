import {createNavigatorFactory} from '@react-navigation/native';
import type {ParamListBase} from '@react-navigation/native';
import createPlatformStackNavigatorComponent from './createPlatformStackNavigatorComponent';
import type {PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState} from './types';

const defaultScreenOptions: PlatformStackNavigationOptions = {
    animation: 'slide_from_right',
    headerShown: false,
};

const PlatformStackNavigatorComponent = createPlatformStackNavigatorComponent('PlatformStackNavigator', {defaultScreenOptions});

function createPlatformStackNavigator<ParamList extends ParamListBase>() {
    return createNavigatorFactory<PlatformStackNavigationState<ParamList>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof PlatformStackNavigatorComponent>(
        PlatformStackNavigatorComponent,
    )<ParamList>();
}

export default createPlatformStackNavigator;
