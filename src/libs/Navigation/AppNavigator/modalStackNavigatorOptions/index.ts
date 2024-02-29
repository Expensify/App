import type {StackNavigationOptions} from '@react-navigation/stack';
import {CardStyleInterpolators} from '@react-navigation/stack';

const defaultSubRouteOptions: StackNavigationOptions = {
    headerShown: false,
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
};

export default defaultSubRouteOptions;
