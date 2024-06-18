import type {DefaultNavigatorOptions, ParamListBase, StackNavigationState, StackRouterOptions} from '@react-navigation/native';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';

type SplitNavigatorRouterOptions = StackRouterOptions & {initialCentralPaneScreen: string; sidebarScreen: string};

type SplitNavigatorProps<ParamList extends ParamListBase> = DefaultNavigatorOptions<ParamListBase, StackNavigationState<ParamListBase>, StackNavigationOptions, StackNavigationEventMap> & {
    initialCentralPaneScreen: Extract<keyof ParamList, string>;
    sidebarScreen: Extract<keyof ParamList, string>;
};

export type {SplitNavigatorProps, SplitNavigatorRouterOptions};
