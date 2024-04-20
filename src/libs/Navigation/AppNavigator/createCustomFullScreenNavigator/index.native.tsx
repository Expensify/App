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

function createCustomFullScreenNavigator<ParamList extends ParamListBase>() {
    function CustomFullScreenNavigator({id, initialRouteName, children, screenOptions, screenListeners, ...props}: FullScreenNavigatorProps<ParamListBase>) {
        const nativeScreenOptions = withNativeNavigationOptions(screenOptions);

        const transformScreenProps = <ParamList2 extends ParamListBase, RouteName extends keyof ParamList2>(options: PlatformStackScreenOptionsWithoutNavigation<ParamList2, RouteName>) =>
            withNativeNavigationOptions<ParamList2, RouteName>(options);

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
                id,
                children,
                screenOptions: nativeScreenOptions,
                screenListeners,
                initialRouteName,
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

    return createNavigatorFactory<PlatformStackNavigationState<ParamList>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap, typeof CustomFullScreenNavigator>(
        CustomFullScreenNavigator,
    )<ParamList>();
}

export default createCustomFullScreenNavigator;
