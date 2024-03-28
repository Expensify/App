import type {DefaultNavigatorOptions, ParamListBase, StackNavigationState, StackRouterOptions} from '@react-navigation/native';
import type {NativeStackNavigationEventMap, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';

type FullScreenNavigatorRouterOptions = StackRouterOptions;

type FullScreenNavigatorProps = DefaultNavigatorOptions<ParamListBase, StackNavigationState<ParamListBase>, StackNavigationOptions, StackNavigationEventMap>;
type FullScreenNativeNavigatorProps = DefaultNavigatorOptions<ParamListBase, StackNavigationState<ParamListBase>, NativeStackNavigationOptions, NativeStackNavigationEventMap>;

export type {FullScreenNavigatorProps, FullScreenNativeNavigatorProps, FullScreenNavigatorRouterOptions};
