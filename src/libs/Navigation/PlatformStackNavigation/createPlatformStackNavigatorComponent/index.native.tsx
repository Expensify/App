import useStyleUtils from '@hooks/useStyleUtils';
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
import useNavigationLayoutMode from '@libs/Navigation/PlatformStackNavigation/useNavigationLayoutMode';

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
    splitRenderConfig,
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
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const layoutMode = splitRenderConfig?.mode;
    const {shouldUseNarrowLayout, getShouldUseNarrowLayout} = useNavigationLayoutMode(layoutMode);
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
            getShouldUseNarrowLayout,
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
        shouldUseNarrowLayout,
    };

    const state = !shouldUseNarrowLayout && splitRenderConfig ? originalState : (getCustomState?.({...customCodeProps, shouldUseNarrowLayout}) ?? originalState);
    const customCodePropsWithCustomState: CustomCodeProps<NativeStackNavigationOptions, NativeStackNavigationEventMap, ParamListBase, StackActionHelpers<ParamListBase>> = {
        ...customCodeProps,
        state,
    };

    const configuredPersistentScreens = splitRenderConfig?.persistentRouteNames ?? persistentScreens;
    const persistentScreensForCurrentLayout = !shouldUseNarrowLayout && splitRenderConfig ? configuredPersistentScreens : undefined;
    const wrappedDescriptors = wrapDescriptorsWithNonTopScreensBehavior(descriptors, state, persistentScreensForCurrentLayout);

    const splitRenderState = !shouldUseNarrowLayout && splitRenderConfig ? getNativeSplitRenderState(state, splitRenderConfig.sidebarRouteName) : undefined;
    const sidebarDescriptor = splitRenderState ? wrappedDescriptors[splitRenderState.sidebarRoute.key] : undefined;
    const splitSidebarWidth = splitRenderConfig?.sidebarWidth;

    const content = (
        <NavigationContent>
            {splitRenderState && splitSidebarWidth !== undefined ? (
                <View style={[styles.flex1, styles.flexRow]}>
                    <View style={[styles.nativeSplitNavigatorSidebar, StyleUtils.getWidthStyle(splitSidebarWidth)]}>{sidebarDescriptor?.render()}</View>
                    <View style={[styles.flex1, styles.mnw0, styles.overflowHidden]}>
                        <NativeStackView
                            {...props}
                            state={splitRenderState.centralState}
                            descriptors={wrappedDescriptors}
                            navigation={navigation}
                            describe={describe}
                        />
                    </View>
                </View>
            ) : (
                <NativeStackView
                    {...props}
                    state={state}
                    descriptors={wrappedDescriptors}
                    navigation={navigation}
                    describe={describe}
                />
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
