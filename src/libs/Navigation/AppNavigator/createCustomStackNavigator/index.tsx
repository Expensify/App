import {createNavigatorFactory, ParamListBase, RouterFactory, StackActionHelpers, StackNavigationState, useNavigationBuilder} from '@react-navigation/native';
import {StackNavigationEventMap, StackNavigationOptions, StackView} from '@react-navigation/stack';
import React, {useMemo, useRef} from 'react';
import useWindowDimensions from '@hooks/useWindowDimensions';
import NAVIGATORS from '@src/NAVIGATORS';
import type {ResponsiveStackNavigatorProps, ResponsiveStackNavigatorRouterOptions} from './types';

type Routes = StackNavigationState<ParamListBase>['routes'];
function reduceReportRoutes(routes: Routes): Routes {
    const result: Routes = [];
    let count = 0;
    const reverseRoutes = [...routes].reverse();

    reverseRoutes.forEach((route) => {
        if (route.name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR) {
            // Remove all report routes except the last 3. This will improve performance.
            if (count < 3) {
                result.push(route);
                count++;
            }
        } else {
            result.push(route);
        }
    });

    return result.reverse();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CustomRouterFactory<ParamList extends ParamListBase> = RouterFactory<StackNavigationState<ParamList>, any, ResponsiveStackNavigatorRouterOptions>;

function ResponsiveStackNavigatorFactory<ParamList extends ParamListBase>(customRouter: CustomRouterFactory<ParamList>) {
    function ResponsiveStackNavigator(props: ResponsiveStackNavigatorProps) {
        const {isSmallScreenWidth} = useWindowDimensions();

        const isSmallScreenWidthRef = useRef<boolean>(isSmallScreenWidth);

        isSmallScreenWidthRef.current = isSmallScreenWidth;

        const {navigation, state, descriptors, NavigationContent} = useNavigationBuilder<
            StackNavigationState<ParamListBase>,
            ResponsiveStackNavigatorRouterOptions,
            StackActionHelpers<ParamListBase>,
            StackNavigationOptions,
            StackNavigationEventMap
        >(customRouter, {
            children: props.children,
            screenOptions: props.screenOptions,
            initialRouteName: props.initialRouteName,
        });

        const stateToRender = useMemo(() => {
            const result = reduceReportRoutes(state.routes);

            return {
                ...state,
                index: result.length - 1,
                routes: [...result],
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
            </NavigationContent>
        );
    }

    ResponsiveStackNavigator.displayName = 'ResponsiveStackNavigator';

    return ResponsiveStackNavigator;
}

export default <ParamList extends ParamListBase>(customRouter: CustomRouterFactory<ParamList>) =>
    createNavigatorFactory<StackNavigationState<ParamList>, StackNavigationOptions, StackNavigationEventMap, (props: ResponsiveStackNavigatorProps) => React.JSX.Element>(
        ResponsiveStackNavigatorFactory(customRouter),
    )();
