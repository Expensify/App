import type {ParamListBase, StackActionHelpers} from '@react-navigation/native';
import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/native';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import {StackView} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import useWindowDimensions from '@hooks/useWindowDimensions';
import navigationRef from '@libs/Navigation/navigationRef';
import withWebNavigationOptions from '@libs/Navigation/PlatformStackNavigation/platformOptions/withWebNavigationOptions';
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
        const webScreenOptions = withWebNavigationOptions(screenOptions);

        const transformScreenProps = <ParamList2 extends ParamListBase, RouteName extends keyof ParamList2>(options: PlatformStackScreenOptionsWithoutNavigation<ParamList2, RouteName>) =>
            withWebNavigationOptions<ParamList2, RouteName>(options);

        const {navigation, state, descriptors, NavigationContent} = useNavigationBuilder<
            PlatformStackNavigationState<ParamListBase>,
            FullScreenNavigatorRouterOptions,
            StackActionHelpers<ParamListBase>,
            PlatformStackNavigationOptions,
            StackNavigationEventMap,
            StackNavigationOptions
        >(
            CustomFullScreenRouter,
            {
                id,
                children,
                screenOptions: webScreenOptions,
                screenListeners,
                initialRouteName,
            },
            transformScreenProps,
        );

        const {isSmallScreenWidth} = useWindowDimensions();

        useEffect(() => {
            if (!navigationRef.isReady()) {
                return;
            }
            // We need to separately reset state of this navigator to trigger getRehydratedState.
            navigation.reset(navigation.getState());
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isSmallScreenWidth]);

        return (
            <NavigationContent>
                <StackView
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
