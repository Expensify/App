import type {DefaultNavigatorOptions, ParamListBase, StackNavigationState, StackRouterOptions} from '@react-navigation/native';
import type {NativeStackNavigationEventMap, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';

type ResponsiveStackNavigatorConfig = {
    isSmallScreenWidth: boolean;
};

type ResponsiveStackNavigatorRouterOptions = StackRouterOptions;

type ResponsiveStackNavigatorProps = DefaultNavigatorOptions<ParamListBase, StackNavigationState<ParamListBase>, StackNavigationOptions, StackNavigationEventMap> &
    ResponsiveStackNavigatorConfig;
type ResponsiveNativeStackNavigatorProps = DefaultNavigatorOptions<ParamListBase, StackNavigationState<ParamListBase>, NativeStackNavigationOptions, NativeStackNavigationEventMap> &
    ResponsiveStackNavigatorConfig;

export type {ResponsiveStackNavigatorRouterOptions, ResponsiveStackNavigatorProps, ResponsiveStackNavigatorConfig, ResponsiveNativeStackNavigatorProps};
