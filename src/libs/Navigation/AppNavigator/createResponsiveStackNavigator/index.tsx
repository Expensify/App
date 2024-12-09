import type {ParamListBase} from '@react-navigation/native';
import {createNavigatorFactory} from '@react-navigation/native';
import useNavigationResetOnLayoutChange from '@libs/Navigation/AppNavigator/useNavigationResetOnLayoutChange';
import createPlatformStackNavigatorComponent from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent';
import defaultPlatformStackScreenOptions from '@libs/Navigation/PlatformStackNavigation/defaultPlatformStackScreenOptions';
import type {PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import CustomRouter from './CustomRouter';
import RenderSearchRoute from './SearchRoute';
import useStateWithSearch from './useStateWithSearch';

const ResponsiveStackNavigatorComponent = createPlatformStackNavigatorComponent('ResponsiveStackNavigator', {
    createRouter: CustomRouter,
    defaultScreenOptions: defaultPlatformStackScreenOptions,
    useCustomState: useStateWithSearch,
    useCustomEffects: useNavigationResetOnLayoutChange,
    ExtraContent: RenderSearchRoute,
});

function createResponsiveStackNavigator<ParamList extends ParamListBase>() {
    return createNavigatorFactory<PlatformStackNavigationState<ParamList>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof ResponsiveStackNavigatorComponent>(
        ResponsiveStackNavigatorComponent,
    )<ParamList>();
}

export default createResponsiveStackNavigator;
