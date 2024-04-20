import type {ParamListBase, StackActionHelpers} from '@react-navigation/native';
import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/native';
import {NativeStackView} from '@react-navigation/native-stack';
import type {NativeStackNavigationEventMap, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import withNativeNavigationOptions from '@libs/Navigation/PlatformStackNavigation/platformOptions/withNativeNavigationOptions';
import type {
    PlatformStackNavigationEventMap,
    PlatformStackNavigationOptions,
    PlatformStackNavigationState,
    PlatformStackScreenOptionsWithoutNavigation,
} from '@libs/Navigation/PlatformStackNavigation/types';
import CustomFullScreenRouter from './CustomFullScreenRouter';
import type {FullScreenNavigatorProps, FullScreenNavigatorRouterOptions} from './types';

function createCustomFullScreenNavigator<TStackParams extends ParamListBase>() {
    function CustomFullScreenNavigator(props: FullScreenNavigatorProps<ParamListBase>) {
        const nativeScreenOptions = withNativeNavigationOptions(props.screenOptions);

        const transformScreenProps = <TStackParams2 extends ParamListBase, RouteName extends keyof TStackParams2>(
            options: PlatformStackScreenOptionsWithoutNavigation<TStackParams2, RouteName>,
        ) => withNativeNavigationOptions<TStackParams2, RouteName>(options);

        const {navigation, state, descriptors, NavigationContent} = useNavigationBuilder<
            PlatformStackNavigationState<ParamListBase>,
            FullScreenNavigatorRouterOptions,
            StackActionHelpers<ParamListBase>,
            PlatformStackNavigationOptions,
            NativeStackNavigationEventMap,
            NativeStackNavigationOptions
        >(
            CustomFullScreenRouter,
            {
                children: props.children,
                screenOptions: nativeScreenOptions,
                initialRouteName: props.initialRouteName,
            },
            transformScreenProps,
        );

        return (
            <NavigationContent>
                <NativeStackView
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    state={state}
                    descriptors={descriptors}
                    navigation={navigation}
                />
            </NavigationContent>
        );
    }
    CustomFullScreenNavigator.displayName = 'CustomFullScreenNavigator';

    return createNavigatorFactory<PlatformStackNavigationState<TStackParams>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof CustomFullScreenNavigator>(
        CustomFullScreenNavigator,
    )<TStackParams>();
}

export default createCustomFullScreenNavigator;
