import {CardStyleInterpolators} from '@react-navigation/stack';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

const defaultSubRouteOptions: PlatformStackNavigationOptions = {
    headerShown: false,
    webOnly: {
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    },
};

export default defaultSubRouteOptions;
