import type {ParamListBase, StackActionHelpers, StackNavigationState} from '@react-navigation/native';
import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/native';
import {NativeStackView} from '@react-navigation/native-stack';
import type {NativeStackNavigationEventMap, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import CustomFullScreenRouter from './CustomFullScreenRouter';
import type {FullScreenNativeNavigatorProps, FullScreenNavigatorRouterOptions} from './types';

function CustomFullScreenNavigator(props: FullScreenNativeNavigatorProps) {
    const {navigation, state, descriptors, NavigationContent} = useNavigationBuilder<
        StackNavigationState<ParamListBase>,
        FullScreenNavigatorRouterOptions,
        StackActionHelpers<ParamListBase>,
        NativeStackNavigationOptions,
        NativeStackNavigationEventMap
    >(CustomFullScreenRouter, {
        children: props.children,
        screenOptions: props.screenOptions,
        initialRouteName: props.initialRouteName,
    });

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

export default createNavigatorFactory<StackNavigationState<ParamListBase>, NativeStackNavigationOptions, NativeStackNavigationEventMap, typeof CustomFullScreenNavigator>(
    CustomFullScreenNavigator,
);
