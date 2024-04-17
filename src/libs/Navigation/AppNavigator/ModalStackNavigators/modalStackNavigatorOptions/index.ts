import {CardStyleInterpolators} from '@react-navigation/stack';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/createPlatformStackNavigator/types';

const defaultSubRouteOptions: PlatformStackNavigationOptions = {
    headerShown: false,
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
};

export default defaultSubRouteOptions;
