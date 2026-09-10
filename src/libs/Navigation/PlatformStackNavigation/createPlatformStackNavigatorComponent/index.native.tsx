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

import wrapDescriptorsWithNonTopScreensBehavior from './wrapDescriptorsWithNonTopScreensBehavior';

type PlatformNavigatorImplProps<RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions> = PlatformStackNavigatorProps<ParamListBase, RouterOptions> & {
    createRouter: NonNullable<CreatePlatformStackNavigatorComponentOptions<RouterOptions>['createRouter']>;
    getCustomState?: CreatePlatformStackNavigatorComponentOptions<RouterOptions>['getCustomState'];
    defaultScreenOptions?: CreatePlatformStackNavigatorComponentOptions<RouterOptions>['defaultScreenOptions'];
    ExtraContent?: CreatePlatformStackNavigatorComponentOptions<RouterOptions>['ExtraContent'];
    NavigationContentWrapper?: CreatePlatformStackNavigatorComponentOptions<RouterOptions>['NavigationContentWrapper'];
    Effects?: CreatePlatformStackNavigatorComponentOptions<RouterOptions>['Effects'];
    supportsSplitLayout?: boolean;
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
    layoutMode,
    persistentScreens,
    createRouter,
    getCustomState,
    defaultScreenOptions,
    ExtraContent,
    NavigationContentWrapper,
    Effects,
    supportsSplitLayout,
    displayName,
    ...props
}: PlatformNavigatorImplProps<RouterOptions>) {
    const styles = useThemeStyles();
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
            layoutMode,
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

    const state = getCustomState?.({...customCodeProps, shouldUseNarrowLayout}) ?? originalState;
    const customCodePropsWithCustomState: CustomCodeProps<NativeStackNavigationOptions, NativeStackNavigationEventMap, ParamListBase, StackActionHelpers<ParamListBase>> = {
        ...customCodeProps,
        state,
    };

    const persistentScreensForCurrentLayout = !shouldUseNarrowLayout && supportsSplitLayout ? persistentScreens : undefined;
    const wrappedDescriptors = wrapDescriptorsWithNonTopScreensBehavior(descriptors, state, persistentScreensForCurrentLayout);

    const sidebarRoute = !shouldUseNarrowLayout && supportsSplitLayout ? state.routes.find((stateRoute) => stateRoute.name === sidebarScreen) : undefined;
    const centralRoutes = sidebarRoute ? state.routes.filter((stateRoute) => stateRoute.key !== sidebarRoute.key) : [];
    const shouldRenderSplitLayout = !!sidebarRoute && centralRoutes.length > 0;
    const centralState = shouldRenderSplitLayout
        ? {
              ...state,
              routeNames: state.routeNames.filter((routeName) => routeName !== sidebarScreen),
              routes: centralRoutes,
              index: centralRoutes.length - 1,
              preloadedRoutes: state.preloadedRoutes.filter((preloadedRoute) => preloadedRoute.name !== sidebarScreen),
          }
        : state;
    const sidebarDescriptor = sidebarRoute ? wrappedDescriptors[sidebarRoute.key] : undefined;

    const content = (
        <NavigationContent>
            {shouldRenderSplitLayout ? (
                <View style={[styles.flex1, styles.flexRow]}>
                    <View style={styles.nativeSplitNavigatorSidebar}>{sidebarDescriptor?.render()}</View>
                    <View style={styles.flex1}>
                        <NativeStackView
                            {...props}
                            state={centralState}
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
                supportsSplitLayout={options?.supportsSplitLayout}
                displayName={displayName}
                {...props}
            />
        );
    }

    PlatformNavigator.displayName = displayName;

    return PlatformNavigator;
}

export default createPlatformStackNavigatorComponent;
