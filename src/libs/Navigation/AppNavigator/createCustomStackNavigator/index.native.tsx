import type {ParamListBase, StackActionHelpers, StackNavigationState} from '@react-navigation/native';
import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/native';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import {StackView} from '@react-navigation/stack';
import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';
import useWindowDimensions from '@hooks/useWindowDimensions';
import getTopmostCentralPaneRoute from '@libs/Navigation/getTopmostCentralPaneRoute';
import type {RootStackParamList, State} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import CustomRouter from './CustomRouter';
import type {ResponsiveStackNavigatorProps, ResponsiveStackNavigatorRouterOptions} from './types';

function ResponsiveStackNavigator(props: ResponsiveStackNavigatorProps) {
    const {isSmallScreenWidth} = useWindowDimensions();

    const isSmallScreenWidthRef = useRef(isSmallScreenWidth);

    isSmallScreenWidthRef.current = isSmallScreenWidth;

    const {navigation, state, descriptors, NavigationContent} = useNavigationBuilder<
        StackNavigationState<ParamListBase>,
        ResponsiveStackNavigatorRouterOptions,
        StackActionHelpers<ParamListBase>,
        StackNavigationOptions,
        StackNavigationEventMap
    >(CustomRouter, {
        children: props.children,
        screenOptions: props.screenOptions,
        initialRouteName: props.initialRouteName,
    });

    const {stateToRender, searchRoute} = useMemo(() => {
        const routes = state.routes;

        const lastRoute = routes[routes.length - 1];
        const isLastRouteSearchRoute = getTopmostCentralPaneRoute({routes: [lastRoute]} as State<RootStackParamList>)?.name === SCREENS.SEARCH.CENTRAL_PANE;

        const firstRoute = routes[0];

        if (isLastRouteSearchRoute) {
            return {
                stateToRender: {
                    ...state,
                    index: 0,
                    routes: [firstRoute],
                },
                searchRoute: lastRoute,
            };
        }

        return {
            stateToRender: {
                ...state,
                index: routes.length - 1,
                routes: [...routes],
            },
            searchRoute: undefined,
        };
    }, [state]);

    return (
        <NavigationContent>
            <StackView
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                state={stateToRender}
                descriptors={descriptors}
                navigation={navigation}
            />
            {searchRoute && <View style={{display: 'none'}}>{descriptors[searchRoute.key].render()}</View>}
        </NavigationContent>
    );
}

ResponsiveStackNavigator.displayName = 'ResponsiveStackNavigator';

export default createNavigatorFactory<StackNavigationState<ParamListBase>, StackNavigationOptions, StackNavigationEventMap, typeof ResponsiveStackNavigator>(ResponsiveStackNavigator);
