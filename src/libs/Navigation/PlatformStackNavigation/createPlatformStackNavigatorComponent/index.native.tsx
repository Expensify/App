import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

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
import {View} from 'react-native';

import getNativeSplitRenderState from './getNativeSplitRenderState';
import wrapDescriptorsWithNonTopScreensBehavior from './wrapDescriptorsWithNonTopScreensBehavior';

type PlatformNavigatorImplProps<RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions> = PlatformStackNavigatorProps<ParamListBase, RouterOptions> & {
    createRouter: NonNullable<CreatePlatformStackNavigatorComponentOptions<RouterOptions>['createRouter']>;
    getCustomState?: CreatePlatformStackNavigatorComponentOptions<RouterOptions>['getCustomState'];
    defaultScreenOptions?: CreatePlatformStackNavigatorComponentOptions<RouterOptions>['defaultScreenOptions'];
    ExtraContent?: CreatePlatformStackNavigatorComponentOptions<RouterOptions>['ExtraContent'];
    NavigationContentWrapper?: CreatePlatformStackNavigatorComponentOptions<RouterOptions>['NavigationContentWrapper'];
    Effects?: CreatePlatformStackNavigatorComponentOptions<RouterOptions>['Effects'];
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
    persistentScreens,
    createRouter,
    getCustomState,
    defaultScreenOptions,
    ExtraContent,
    NavigationContentWrapper,
    Effects,
    displayName,
    ...props
}: PlatformNavigatorImplProps<RouterOptions>) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
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

    // The sidebar is a sibling of the native stack, so keep the router's full central history.
    const isSplit = !shouldUseNarrowLayout && !!sidebarScreen;
    const state = isSplit ? originalState : (getCustomState?.({...customCodeProps, shouldUseNarrowLayout}) ?? originalState);
    const customCodePropsWithCustomState: CustomCodeProps<NativeStackNavigationOptions, NativeStackNavigationEventMap, ParamListBase, StackActionHelpers<ParamListBase>> = {
        ...customCodeProps,
        state,
    };

    const wrappedDescriptors = wrapDescriptorsWithNonTopScreensBehavior(descriptors, state, isSplit ? persistentScreens : undefined);
    const split = isSplit ? getNativeSplitRenderState(state, sidebarScreen) : undefined;

    const stack = (
        <NativeStackView
            {...props}
            state={split?.centralState ?? state}
            descriptors={wrappedDescriptors}
            navigation={navigation}
            describe={describe}
        />
    );

    const content = (
        <NavigationContent>
            {split ? (
                <View style={[styles.flex1, styles.flexRow]}>
                    <View style={[styles.nativeSplitSidebar, styles.borderRight, styles.overflowHidden]}>{wrappedDescriptors[split.sidebarRoute.key]?.render()}</View>
                    <View style={[styles.flex1, styles.mnw0, styles.overflowHidden]}>{stack}</View>
                </View>
            ) : (
                stack
            )}
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
                displayName={displayName}
                {...props}
            />
        );
    }

    PlatformNavigator.displayName = displayName;

    return PlatformNavigator;
}

export default createPlatformStackNavigatorComponent;
