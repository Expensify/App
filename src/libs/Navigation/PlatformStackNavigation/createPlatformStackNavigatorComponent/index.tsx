import type {ParamListBase, StackActionHelpers} from '@react-navigation/native';
import {StackRouter, useNavigationBuilder} from '@react-navigation/native';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import {StackView} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {addCustomHistoryRouterExtension} from '@libs/Navigation/AppNavigator/customHistory';
import convertToWebNavigationOptions from '@libs/Navigation/PlatformStackNavigation/navigationOptions/convertToWebNavigationOptions';
import type {
    CreatePlatformStackNavigatorComponentOptions,
    CustomCodeProps,
    PlatformStackNavigationOptions,
    PlatformStackNavigationState,
    PlatformStackNavigatorProps,
    PlatformStackRouterOptions,
} from '@libs/Navigation/PlatformStackNavigation/types';

function createPlatformStackNavigatorComponent<RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions>(
    displayName: string,
    options?: CreatePlatformStackNavigatorComponentOptions<RouterOptions>,
) {
    const createRouter = addCustomHistoryRouterExtension(options?.createRouter ?? StackRouter);
    const useCustomState = options?.useCustomState ?? (() => undefined);
    const defaultScreenOptions = options?.defaultScreenOptions;
    const ExtraContent = options?.ExtraContent;
    const NavigationContentWrapper = options?.NavigationContentWrapper;
    const useCustomEffects = options?.useCustomEffects ?? (() => undefined);

    function PlatformNavigator({
        id,
        initialRouteName,
        screenOptions,
        screenListeners,
        children,
        sidebarScreen,
        defaultCentralScreen,
        parentRoute,
        persistentScreens,
        ...props
    }: PlatformStackNavigatorProps<ParamListBase>) {
        const {
            navigation,
            state: originalState,
            descriptors,
            describe,
            NavigationContent,
        } = useNavigationBuilder<
            PlatformStackNavigationState<ParamListBase>,
            RouterOptions,
            StackActionHelpers<ParamListBase>,
            StackNavigationOptions,
            StackNavigationEventMap,
            PlatformStackNavigationOptions
        >(
            createRouter,
            {
                id,
                children,
                screenOptions: {...defaultScreenOptions, ...screenOptions},
                screenListeners,
                initialRouteName,
                defaultCentralScreen,
                sidebarScreen,
                parentRoute,
                persistentScreens,
            },
            convertToWebNavigationOptions,
        );

        const customCodeProps = useMemo<CustomCodeProps<StackNavigationOptions, StackNavigationEventMap, ParamListBase, StackActionHelpers<ParamListBase>>>(
            () => ({
                state: originalState,
                navigation,
                descriptors,
                displayName,
                parentRoute,
            }),
            [originalState, navigation, descriptors, parentRoute],
        );

        const stateToRender = useCustomState(customCodeProps);
        const state = useMemo(() => stateToRender ?? originalState, [originalState, stateToRender]);
        const customCodePropsWithCustomState = useMemo<CustomCodeProps<StackNavigationOptions, StackNavigationEventMap, ParamListBase, StackActionHelpers<ParamListBase>>>(
            () => ({
                ...customCodeProps,
                state,
            }),
            [customCodeProps, state],
        );
        // Executes custom effects defined in "useCustomEffects" navigator option.
        useCustomEffects(customCodePropsWithCustomState);

        const mappedState = useMemo(() => {
            return {
                ...state,
                routes: state.routes.map((route) => {
                    // eslint-disable-next-line rulesdir/no-negated-variables
                    const dontDetachScreen = persistentScreens?.includes(route.name) ? {dontDetachScreen: true} : {};
                    return {...route, ...dontDetachScreen};
                }),
            };
        }, [persistentScreens, state]);

        const Content = useMemo(
            () => (
                <NavigationContent>
                    <StackView
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...props}
                        direction="ltr"
                        state={mappedState}
                        descriptors={descriptors}
                        navigation={navigation}
                        describe={describe}
                    />

                    {!!ExtraContent && (
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        <ExtraContent {...customCodePropsWithCustomState} />
                    )}
                </NavigationContent>
            ),
            [NavigationContent, customCodePropsWithCustomState, describe, descriptors, mappedState, navigation, props],
        );

        // eslint-disable-next-line react/jsx-props-no-spreading
        return NavigationContentWrapper === undefined ? Content : <NavigationContentWrapper {...customCodePropsWithCustomState}>{Content}</NavigationContentWrapper>;
    }
    PlatformNavigator.displayName = displayName;

    return PlatformNavigator;
}

export default createPlatformStackNavigatorComponent;
