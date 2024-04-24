import type {ParamListBase} from '@react-navigation/native';
import {createNavigatorFactory} from '@react-navigation/native';
import createPlatformStackNavigatorComponent from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/index.native';
import type {PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import getStateWithSearch from './getStateWithSearch';
import RenderSearchRoute from './RenderSearchRoute';

const ResponsiveStackNavigator = createPlatformStackNavigatorComponent('ResponsiveStackNavigator', {
    transformState: getStateWithSearch,
    renderExtraContent: RenderSearchRoute,
});

function createResponsiveStackNavigator<ParamList extends ParamListBase>() {
    return createNavigatorFactory<PlatformStackNavigationState<ParamList>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof ResponsiveStackNavigator>(
        ResponsiveStackNavigator,
    )<ParamList>();
}

export default createResponsiveStackNavigator;
