import type {createNavigatorFactory} from '@react-navigation/core';
import type {DefaultNavigatorOptions, ParamListBase, StackNavigationState, StackRouterOptions} from '@react-navigation/native';
import type {createNativeStackNavigator, NativeStackNavigationEventMap, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {createStackNavigator, StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import type {StackNavigationConfig} from '@react-navigation/stack/lib/typescript/src/types';

type CommonNavigationOptions = StackNavigationOptions & NativeStackNavigationOptions;
type CommonNavigationEventMap = StackNavigationEventMap & NativeStackNavigationEventMap;

type CreateStackNavigatorResult<TStackParams extends ParamListBase> = ReturnType<typeof createStackNavigator<TStackParams>>;
type CreateNativeStackNavigatorResult<TStackParams extends ParamListBase> = ReturnType<typeof createNativeStackNavigator<TStackParams>>;

type CommonStack<TStackParams extends ParamListBase> = CreateStackNavigatorResult<TStackParams> | CreateNativeStackNavigatorResult<TStackParams>;

type CommonStackRouterOptions<TStackParams extends ParamListBase> = Omit<StackRouterOptions, 'initialRouteName'> & {
    initialRouteName: keyof TStackParams;
};

type CommonNavigatorProps<TStackParams extends ParamListBase> = DefaultNavigatorOptions<TStackParams, StackNavigationState<TStackParams>, CommonNavigationOptions, CommonNavigationEventMap> &
    CommonStackRouterOptions<TStackParams> &
    StackNavigationConfig;

// type PlatformStackNavigatorProps<TStackParams extends ParamListBase> = {
//     initialRouteName: keyof TStackParams;
//     screenOptions?: CommonNavigatorOptions;
// };

type CommonNavigator<TStackParams extends ParamListBase> = (props: CommonNavigatorProps<TStackParams>) => React.ReactElement;

type CreatePlatformNavigatorFactory<TStackParams extends ParamListBase> = typeof createNavigatorFactory<
    StackNavigationState<TStackParams>,
    CommonNavigationOptions,
    CommonNavigationEventMap,
    CommonNavigator<TStackParams>
>;
type CreatePlatformNavigatorFactoryResult<TStackParams extends ParamListBase> = ReturnType<CreatePlatformNavigatorFactory<TStackParams>>;
type CreatePlatformStackNavigatorResult<TStackParams extends ParamListBase> = ReturnType<CreatePlatformNavigatorFactoryResult<TStackParams>>;

export default CreatePlatformStackNavigatorResult;
export type {CommonNavigationOptions, CommonNavigationEventMap, CommonStack, CommonNavigatorProps, CommonNavigator};
