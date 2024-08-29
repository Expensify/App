import type {EventMapBase, ParamListBase} from '@react-navigation/native';
import {createNavigatorFactory} from '@react-navigation/native';
import navigationRef from '@libs/Navigation/navigationRef';
import createPlatformStackNavigatorComponent from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent';
import type {
    PlatformSpecificEventMap,
    PlatformSpecificNavigationOptions,
    PlatformStackNavigationEventMap,
    PlatformStackNavigationOptions,
    PlatformStackNavigationState,
} from '@libs/Navigation/PlatformStackNavigation/types';
import type {OnIsSmallScreenWidthChange} from '@libs/Navigation/PlatformStackNavigation/types';
import CustomRouter from './CustomRouter';
import getStateWithSearch from './getStateWithSearch';
import RenderSearchRoute from './SearchRoute';

const handleIsSmallScreenWidthChange: OnIsSmallScreenWidthChange<PlatformSpecificNavigationOptions, PlatformSpecificEventMap & EventMapBase, ParamListBase> = ({navigation}) => {
    if (!navigationRef.isReady()) {
        return;
    }
    // We need to separately reset state of this navigator to trigger getRehydratedState.
    navigation.reset(navigation.getState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
};

const ResponsiveStackNavigator = createPlatformStackNavigatorComponent('ResponsiveStackNavigator', {
    transformState: getStateWithSearch,
    ExtraContent: RenderSearchRoute,
    onIsSmallScreenWidthChange: handleIsSmallScreenWidthChange,
    createRouter: CustomRouter,
});

function createResponsiveStackNavigator<ParamList extends ParamListBase>() {
    return createNavigatorFactory<PlatformStackNavigationState<ParamList>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof ResponsiveStackNavigator>(
        ResponsiveStackNavigator,
    )<ParamList>();
}

export default createResponsiveStackNavigator;
