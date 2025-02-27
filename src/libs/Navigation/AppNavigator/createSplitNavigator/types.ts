import type {DefaultNavigatorOptions, ParamListBase, RouteProp, StackNavigationState, StackRouterOptions} from '@react-navigation/native';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';

type SplitNavigatorRouterOptions = StackRouterOptions & {defaultCentralScreen: string; sidebarScreen: string; parentRoute: RouteProp<ParamListBase>};

type SplitNavigatorProps<ParamList extends ParamListBase> = DefaultNavigatorOptions<ParamListBase, StackNavigationState<ParamListBase>, StackNavigationOptions, StackNavigationEventMap> & {
    persistentScreens?: Array<Extract<keyof ParamList, string>>;
    defaultCentralScreen: Extract<keyof ParamList, string>;
    sidebarScreen: Extract<keyof ParamList, string>;
};

export type {SplitNavigatorProps, SplitNavigatorRouterOptions};
