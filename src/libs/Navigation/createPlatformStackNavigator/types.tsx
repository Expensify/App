import type {DefaultNavigatorOptions, ParamListBase, StackNavigationState, StackRouterOptions} from '@react-navigation/native';
import type {NativeStackNavigationEventMap, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import type {StackNavigationConfig} from '@react-navigation/stack/lib/typescript/src/types';

type CommonNavigationOptions = StackNavigationOptions & NativeStackNavigationOptions;
type CommonNavigationEventMap = StackNavigationEventMap & NativeStackNavigationEventMap;

type PlatformStackNavigationOptions = CommonNavigationOptions & {
    platformAnimation: 'slide_from_left' | 'slide_from_right';
};
type PlatformStackNavigationEventMap = CommonNavigationEventMap;

type PlatformStackNavigatorProps<TStackParams extends ParamListBase> = DefaultNavigatorOptions<
    TStackParams,
    StackNavigationState<TStackParams>,
    PlatformStackNavigationOptions,
    PlatformStackNavigationEventMap
> &
    StackRouterOptions &
    StackNavigationConfig;

type PlatformStackNavigator<TStackParams extends ParamListBase> = (props: PlatformStackNavigatorProps<TStackParams>) => React.ReactElement;

export type {PlatformStackNavigationOptions, PlatformStackNavigationEventMap, PlatformStackNavigatorProps, PlatformStackNavigator};
