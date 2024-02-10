import type {ParamListBase, StackActionHelpers, StackNavigationState} from '@react-navigation/native';
import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/native';
import type {StackNavigationEventMap, StackNavigationOptions} from '@react-navigation/stack';
import {StackView} from '@react-navigation/stack';
import React, {useEffect, useMemo} from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import navigationRef from '@libs/Navigation/navigationRef';
import SCREENS from '@src/SCREENS';
import CustomFullScreenRouter from './CustomFullScreenRouter';
import type {FullScreenNavigatorProps, FullScreenNavigatorRouterOptions} from './types';

type Routes = StackNavigationState<ParamListBase>['routes'];
function reduceReportRoutes(routes: Routes): Routes {
    const result: Routes = [];
    let count = 0;
    const reverseRoutes = [...routes].reverse();

    reverseRoutes.forEach((route) => {
        if (route.name === SCREENS.SETTINGS_CENTRAL_PANE) {
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

function CustomFullScreenNavigator(props: FullScreenNavigatorProps) {
    const {navigation, state, descriptors, NavigationContent} = useNavigationBuilder<
        StackNavigationState<ParamListBase>,
        FullScreenNavigatorRouterOptions,
        StackActionHelpers<ParamListBase>,
        StackNavigationOptions,
        StackNavigationEventMap
    >(CustomFullScreenRouter, {
        children: props.children,
        screenOptions: props.screenOptions,
        initialRouteName: props.initialRouteName,
    });

    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const stateToRender = useMemo(() => {
        const result = reduceReportRoutes(state.routes);

        return {
            ...state,
            index: result.length - 1,
            routes: [...result],
        };
    }, [state]);

    useEffect(() => {
        if (!navigationRef.isReady()) {
            return;
        }
        // We need to separately reset state of this navigator to trigger getRehydratedState.
        navigation.reset(navigation.getState());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldUseNarrowLayout]);

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

CustomFullScreenNavigator.displayName = 'CustomFullScreenNavigator';

export default createNavigatorFactory<StackNavigationState<ParamListBase>, StackNavigationOptions, StackNavigationEventMap, typeof CustomFullScreenNavigator>(CustomFullScreenNavigator);
