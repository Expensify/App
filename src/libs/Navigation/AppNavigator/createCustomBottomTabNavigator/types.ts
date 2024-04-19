import type {DefaultNavigatorOptions, ParamListBase} from '@react-navigation/native';
import type {PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';

type CustomBottomTabNavigatorProps = DefaultNavigatorOptions<ParamListBase, PlatformStackNavigationState<ParamListBase>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap> & {
    initialRouteName: string;
};

export default CustomBottomTabNavigatorProps;
