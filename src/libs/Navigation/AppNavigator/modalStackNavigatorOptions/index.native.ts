import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import transition from '@libs/Navigation/AppNavigator/transition';

const defaultSubRouteOptions: NativeStackNavigationOptions = {
    headerShown: false,
    animation: transition,
};

export default defaultSubRouteOptions;
