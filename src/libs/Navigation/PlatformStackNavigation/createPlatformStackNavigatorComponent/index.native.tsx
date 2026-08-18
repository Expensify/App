import useResponsiveLayout from '@hooks/useResponsiveLayout';

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
import React from 'react';

import wrapDescriptorsWithFreeze from './wrapDescriptorsWithFreeze';

type PlatformNavigatorImplProps<RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions> = PlatformStackNavigatorProps<ParamListBase, RouterOptions> & {
    createRouter: NonNullable<CreatePlatformStackNavigatorComponentOptions<RouterOptions>['createRouter']>;
    getCustomState?: CreatePlatformStackNavigatorComponentOptions<RouterOptions>['getCustomState'];
    defaultScreenOptions?: CreatePlatformStackNavigatorComponentOptions<RouterOptions>['defaultScreenOptions'];
    ExtraContent?: CreatePlatformStackNavigatorComponentOptions<RouterOptions>['ExtraContent'];
    NavigationContentWrapper?: CreatePlatformStackNavigatorComponentOptions<RouterOptions>['NavigationContentWrapper'];
    Effects?: CreatePlatformStackNavigatorComponentOptions<RouterOptions>['Effects'];
    freezeNonTopScreens?: boolean;
    displayName: string;
};

function PlatformNavigatorImpl<RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions>({
    id,
    initialRouteName,
    screenOptions,
    screenListeners,
    children,
    sidebarScreen,
    defaultCentralScreen,
    parentRoute,
    createRouter,
    getCustomState,
    defaultScreenOptions,
    ExtraContent,
    NavigationContentWrapper,
    Effects,
    freezeNonTopScreens,
    displayName,
    ...props
}: PlatformNavigatorImplProps<RouterOptions>) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
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

    const customCodeProps: CustomCodeProps<NativeStackNavigationOptions, NativeStackNavigationEventMap, ParamListBase, StackActionHelpers<ParamListBase>> = {
        state: originalState,
        navigation,
        descriptors,
        displayName,
        parentRoute,
    };

    const state = getCustomState?.({...customCodeProps, shouldUseNarrowLayout}) ?? originalState;
    const customCodePropsWithCustomState: CustomCodeProps<NativeStackNavigationOptions, NativeStackNavigationEventMap, ParamListBase, StackActionHelpers<ParamListBase>> = {
        ...customCodeProps,
        state,
    };

    const wrappedDescriptors = freezeNonTopScreens ? wrapDescriptorsWithFreeze(descriptors, state) : descriptors;

    const content = (
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
    );

    return (
        <>
            {!!Effects && <Effects {...customCodePropsWithCustomState} />}
            {NavigationContentWrapper === undefined ? content : <NavigationContentWrapper {...customCodePropsWithCustomState}>{content}</NavigationContentWrapper>}
        </>
    );
}

function createPlatformStackNavigatorComponent<RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions>(
    displayName: string,
    options?: CreatePlatformStackNavigatorComponentOptions<RouterOptions>,
) {
    function PlatformNavigator(props: PlatformStackNavigatorProps<ParamListBase>) {
        return (
            <PlatformNavigatorImpl
                createRouter={options?.createRouter ?? StackRouter}
                getCustomState={options?.getCustomState}
                defaultScreenOptions={options?.defaultScreenOptions}
                ExtraContent={options?.ExtraContent}
                NavigationContentWrapper={options?.NavigationContentWrapper}
                Effects={options?.Effects}
                freezeNonTopScreens={options?.freezeNonTopScreens}
                displayName={displayName}
                {...props}
            />
        );
    }

    PlatformNavigator.displayName = displayName;

    return PlatformNavigator;
}

export default createPlatformStackNavigatorComponent;
