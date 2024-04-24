import type {DefaultNavigatorOptions, ParamListBase} from '@react-navigation/native';
import type {StackNavigationConfig} from '@react-navigation/stack/lib/typescript/src/types';
import type {PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState, PlatformStackRouterOptions} from '.';

// Props to configure the the PlatformStackNavigator
type PlatformStackNavigatorProps<
    ParamList extends ParamListBase,
    RouteName extends keyof ParamList = keyof ParamList,
    RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions,
> = DefaultNavigatorOptions<ParamList, PlatformStackNavigationState<ParamList>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, RouteName> &
    RouterOptions &
    StackNavigationConfig;

export default PlatformStackNavigatorProps;
