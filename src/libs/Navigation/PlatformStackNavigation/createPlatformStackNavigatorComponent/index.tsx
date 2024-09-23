import type {ParamListBase, StackActionHelpers} from '@react-navigation/native';
import {StackRouter, useNavigationBuilder} from '@react-navigation/native';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import {StackView} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import convertToWebNavigationOptions from '@libs/Navigation/PlatformStackNavigation/navigationOptions/convertToWebNavigationOptions';
import type {
    CreatePlatformStackNavigatorComponentOptions,
    CustomCodeProps,
    PlatformNavigationBuilderOptions,
    PlatformStackNavigationOptions,
    PlatformStackNavigationState,
    PlatformStackNavigatorProps,
    PlatformStackRouterOptions,
} from '@libs/Navigation/PlatformStackNavigation/types';

function createPlatformStackNavigatorComponent<RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions>(
    displayName: string,
    options?: CreatePlatformStackNavigatorComponentOptions<RouterOptions>,
) {
    const createRouter = options?.createRouter ?? StackRouter;
    const useCustomState = options?.useCustomState ?? (() => ({stateToRender: undefined, searchRoute: undefined}));
    const defaultScreenOptions = options?.defaultScreenOptions;
    const ExtraContent = options?.ExtraContent;
    const NavigationContentWrapper = options?.NavigationContentWrapper;
    const useCustomEffects = options?.useCustomEffects ?? (() => undefined);

    function PlatformNavigator({id, initialRouteName, screenOptions, screenListeners, children, ...props}: PlatformStackNavigatorProps<ParamListBase>) {
        const {
            navigation,
            state: originalState,
            descriptors,
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
                screenOptions,
                defaultScreenOptions,
                screenListeners,
                initialRouteName,
            } as PlatformNavigationBuilderOptions<PlatformStackNavigationOptions, StackNavigationEventMap, ParamListBase, RouterOptions>,
            convertToWebNavigationOptions,
        );

        const customCodeProps = useMemo<CustomCodeProps<StackNavigationOptions, StackNavigationEventMap, ParamListBase, StackActionHelpers<ParamListBase>>>(
            () => ({
                state: originalState,
                navigation,
                descriptors,
                displayName,
            }),
            [originalState, navigation, descriptors],
        );

        const {stateToRender, searchRoute} = useCustomState(customCodeProps);
        const state = useMemo(() => stateToRender ?? originalState, [originalState, stateToRender]);
        const customCodePropsWithCustomState = useMemo<CustomCodeProps<StackNavigationOptions, StackNavigationEventMap, ParamListBase, StackActionHelpers<ParamListBase>>>(
            () => ({
                ...customCodeProps,
                state,
                searchRoute,
            }),
            [customCodeProps, state, searchRoute],
        );

        // Executes custom effects defined in "useCustomEffects" navigator option.
        useCustomEffects(customCodePropsWithCustomState);

        const Content = useMemo(
            () => (
                <NavigationContent>
                    <StackView
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...props}
                        state={state}
                        descriptors={descriptors}
                        navigation={navigation}
                    />

                    {ExtraContent && (
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        <ExtraContent {...customCodePropsWithCustomState} />
                    )}
                </NavigationContent>
            ),
            [NavigationContent, customCodePropsWithCustomState, descriptors, navigation, props, state],
        );

        // eslint-disable-next-line react/jsx-props-no-spreading
        return NavigationContentWrapper === undefined ? Content : <NavigationContentWrapper {...customCodePropsWithCustomState}>{Content}</NavigationContentWrapper>;
    }
    PlatformNavigator.displayName = displayName;

    return PlatformNavigator;
}

export default createPlatformStackNavigatorComponent;
