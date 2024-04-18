import type {DefaultNavigatorOptions, ParamListBase, StackRouterOptions} from '@react-navigation/native';
import type {PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';

type FullScreenNavigatorRouterOptions = StackRouterOptions;

type FullScreenNavigatorProps<TStackParams extends ParamListBase> = DefaultNavigatorOptions<
    TStackParams,
    PlatformStackNavigationState<TStackParams>,
    PlatformStackNavigationOptions,
    PlatformStackNavigationEventMap
>;

export type {FullScreenNavigatorProps, FullScreenNavigatorRouterOptions};
