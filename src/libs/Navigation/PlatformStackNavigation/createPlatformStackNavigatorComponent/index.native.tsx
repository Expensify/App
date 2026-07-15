import convertToNativeNavigationOptions from '@libs/Navigation/PlatformStackNavigation/navigationOptions/convertToNativeNavigationOptions';
import screenLayout from '@libs/Navigation/PlatformStackNavigation/ScreenLayout';
import type {
    CreatePlatformStackNavigatorComponentOptions,
    CustomCodeProps,
    PlatformStackNavigationOptions,
    PlatformStackNavigationState,
    PlatformStackNavigatorProps,
    PlatformStackRouterOptions,
} from '@libs/Navigation/PlatformStackNavigation/types';

import type {ParamListBase, StackActionHelpers} from '@react-navigation/native';
import type {NativeStackNavigationEventMap, NativeStackNavigationOptions} from '@react-navigation/native-stack';

import {StackRouter, useNavigationBuilder} from '@react-navigation/native';
import {NativeStackView} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';

import wrapDescriptorsWithFreeze from './wrapDescriptorsWithFreeze';

type PlatformNavigatorBindings<RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions> = {
    createRouter: NonNullable<CreatePlatformStackNavigatorComponentOptions<RouterOptions>['createRouter']>;
    useCustomState: NonNullable<CreatePlatformStackNavigatorComponentOptions<RouterOptions>['useCustomState']>;
    defaultScreenOptions?: CreatePlatformStackNavigatorComponentOptions<RouterOptions>['defaultScreenOptions'];
    ExtraContent?: CreatePlatformStackNavigatorComponentOptions<RouterOptions>['ExtraContent'];
    NavigationContentWrapper?: CreatePlatformStackNavigatorComponentOptions<RouterOptions>['NavigationContentWrapper'];
    useCustomEffects: NonNullable<CreatePlatformStackNavigatorComponentOptions<RouterOptions>['useCustomEffects']>;
    freezeNonTopScreens?: boolean;
    displayName: string;
};

function createPlatformNavigatorImpl<RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions>({
    createRouter,
    useCustomState,
    defaultScreenOptions,
    ExtraContent,
    NavigationContentWrapper,
    useCustomEffects,
    freezeNonTopScreens,
    displayName,
}: PlatformNavigatorBindings<RouterOptions>) {
    function PlatformNavigatorImpl({
        id,
        initialRouteName,
        screenOptions,
        screenListeners,
        children,
        sidebarScreen,
        defaultCentralScreen,
        parentRoute,
        ...props
    }: PlatformStackNavigatorProps<ParamListBase, RouterOptions>) {
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
                screenLayout,
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

        const wrappedDescriptors = freezeNonTopScreens ? wrapDescriptorsWithFreeze(descriptors, state) : descriptors;

        const Content = useMemo(
            () => (
                <NavigationContent>
                    <NativeStackView
                        {...props}
                        state={state}
                        descriptors={wrappedDescriptors}
                        navigation={navigation}
                        describe={describe}
                    />
                    {!!ExtraContent && <ExtraContent {...customCodePropsWithCustomState} />}
                </NavigationContent>
            ),
            [NavigationContent, customCodePropsWithCustomState, describe, wrappedDescriptors, navigation, props, state],
        );

        return NavigationContentWrapper === undefined ? Content : <NavigationContentWrapper {...customCodePropsWithCustomState}>{Content}</NavigationContentWrapper>;
    }

    return PlatformNavigatorImpl;
}

function createPlatformStackNavigatorComponent<RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions>(
    displayName: string,
    options?: CreatePlatformStackNavigatorComponentOptions<RouterOptions>,
) {
    const PlatformNavigatorImpl = createPlatformNavigatorImpl<RouterOptions>({
        createRouter: options?.createRouter ?? StackRouter,
        useCustomState: (options?.useCustomState ?? (() => undefined)) as NonNullable<CreatePlatformStackNavigatorComponentOptions<RouterOptions>['useCustomState']>,
        defaultScreenOptions: options?.defaultScreenOptions,
        ExtraContent: options?.ExtraContent,
        NavigationContentWrapper: options?.NavigationContentWrapper,
        useCustomEffects: options?.useCustomEffects ?? (() => undefined),
        freezeNonTopScreens: options?.freezeNonTopScreens,
        displayName,
    });

    function PlatformNavigator(props: PlatformStackNavigatorProps<ParamListBase>) {
        return <PlatformNavigatorImpl {...props} />;
    }

    // OXC's React Compiler does not memoize this generated navigator on web; memoize it explicitly.
    const MemoizedPlatformNavigator = React.memo(PlatformNavigator);
    MemoizedPlatformNavigator.displayName = displayName;

    return MemoizedPlatformNavigator;
}

export default createPlatformStackNavigatorComponent;
