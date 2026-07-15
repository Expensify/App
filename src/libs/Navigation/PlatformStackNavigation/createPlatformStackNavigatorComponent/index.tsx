import convertToWebNavigationOptions from '@libs/Navigation/PlatformStackNavigation/navigationOptions/convertToWebNavigationOptions';
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
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';

import {StackRouter, useNavigationBuilder} from '@react-navigation/native';
import {StackView} from '@react-navigation/stack';
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
        persistentScreens,
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
                screenLayout,
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

        const wrappedDescriptors = freezeNonTopScreens ? wrapDescriptorsWithFreeze(descriptors, state, persistentScreens) : descriptors;

        const Content = useMemo(
            () => (
                <NavigationContent>
                    <StackView
                        {...props}
                        direction="ltr"
                        state={mappedState}
                        descriptors={wrappedDescriptors}
                        navigation={navigation}
                        describe={describe}
                    />

                    {!!ExtraContent && <ExtraContent {...customCodePropsWithCustomState} />}
                </NavigationContent>
            ),
            [NavigationContent, customCodePropsWithCustomState, describe, wrappedDescriptors, mappedState, navigation, props],
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
        createRouter: (options?.createRouter ?? StackRouter) as NonNullable<CreatePlatformStackNavigatorComponentOptions<RouterOptions>['createRouter']>,
        useCustomState: (options?.useCustomState ?? (() => undefined)) as NonNullable<CreatePlatformStackNavigatorComponentOptions<RouterOptions>['useCustomState']>,
        defaultScreenOptions: options?.defaultScreenOptions,
        ExtraContent: options?.ExtraContent,
        NavigationContentWrapper: options?.NavigationContentWrapper,
        useCustomEffects: (options?.useCustomEffects ?? (() => undefined)) as NonNullable<CreatePlatformStackNavigatorComponentOptions<RouterOptions>['useCustomEffects']>,
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
