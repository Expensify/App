import type {ParamListBase, StackActionHelpers} from '@react-navigation/native';
import {StackRouter, useNavigationBuilder} from '@react-navigation/native';
import {NativeStackView} from '@react-navigation/native-stack';
import type {NativeStackNavigationEventMap, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';
import {addCustomHistoryRouterExtension} from '@libs/Navigation/AppNavigator/customHistory';
import convertToNativeNavigationOptions from '@libs/Navigation/PlatformStackNavigation/navigationOptions/convertToNativeNavigationOptions';
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
    const defaultScreenOptions = options?.defaultScreenOptions;
    const useCustomState = options?.useCustomState ?? (() => undefined);
    const useCustomEffects = options?.useCustomEffects ?? (() => undefined);
    const ExtraContent = options?.ExtraContent;
    const NavigationContentWrapper = options?.NavigationContentWrapper;

    function PlatformNavigator({
        id,
        initialRouteName,
        screenOptions,
        screenListeners,
        children,
        sidebarScreen,
        defaultCentralScreen,
        parentRoute,
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
            NativeStackNavigationOptions,
            NativeStackNavigationEventMap,
            PlatformStackNavigationOptions
        >(
            createRouter,
            {
                id,
                children,
                screenOptions: {...defaultScreenOptions, ...screenOptions},
                screenListeners,
                initialRouteName,
                sidebarScreen,
                defaultCentralScreen,
                parentRoute,
            },
            convertToNativeNavigationOptions,
        );

        const customCodeProps = useMemo<CustomCodeProps<NativeStackNavigationOptions, NativeStackNavigationEventMap, ParamListBase, StackActionHelpers<ParamListBase>>>(
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
        const customCodePropsWithCustomState = useMemo<CustomCodeProps<NativeStackNavigationOptions, NativeStackNavigationEventMap, ParamListBase, StackActionHelpers<ParamListBase>>>(
            () => ({
                ...customCodeProps,
                state,
            }),
            [customCodeProps, state],
        );

        // Executes custom effects defined in "useCustomEffects" navigator option.
        useCustomEffects(customCodePropsWithCustomState);

        const Content = useMemo(
            () => (
                <NavigationContent>
                    <NativeStackView
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...props}
                        state={state}
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
            [NavigationContent, customCodePropsWithCustomState, describe, descriptors, navigation, props, state],
        );

        // eslint-disable-next-line react/jsx-props-no-spreading
        return NavigationContentWrapper === undefined ? Content : <NavigationContentWrapper {...customCodePropsWithCustomState}>{Content}</NavigationContentWrapper>;
    }
    PlatformNavigator.displayName = displayName;

    return PlatformNavigator;
}

export default createPlatformStackNavigatorComponent;
