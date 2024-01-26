import {CardStyleInterpolators, StackNavigationOptions} from '@react-navigation/stack';

const defaultSubRouteOptions: StackNavigationOptions = {
    headerShown: false,
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
};

export default defaultSubRouteOptions;
