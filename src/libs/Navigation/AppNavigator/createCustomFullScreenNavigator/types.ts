import type {DefaultNavigatorOptions, ParamListBase, StackNavigationState, StackRouterOptions} from '@react-navigation/native';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';

type FullScreenNavigatorRouterOptions = StackRouterOptions;

type FullScreenNavigatorProps = DefaultNavigatorOptions<ParamListBase, StackNavigationState<ParamListBase>, StackNavigationOptions, StackNavigationEventMap>;

export type {FullScreenNavigatorProps, FullScreenNavigatorRouterOptions};
