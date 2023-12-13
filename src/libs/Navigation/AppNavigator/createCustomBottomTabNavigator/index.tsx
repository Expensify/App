import {
    createNavigatorFactory,
    DefaultNavigatorOptions,
    ParamListBase,
    StackActionHelpers,
    StackNavigationState,
    StackRouter,
    StackRouterOptions,
    useNavigationBuilder,
} from '@react-navigation/native';
import {StackNavigationEventMap, StackNavigationOptions, StackView} from '@react-navigation/stack';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {NavigationStateRoute} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import BottomTabBar from './BottomTabBar';

type CustomNavigatorProps = DefaultNavigatorOptions<ParamListBase, StackNavigationState<ParamListBase>, StackNavigationOptions, StackNavigationEventMap> & {
    initialRouteName: string;
};

const propTypes = {
    /* Children for the useNavigationBuilder hook */
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,

    /* initialRouteName for this navigator */
    initialRouteName: PropTypes.oneOf([PropTypes.string, undefined]),

    /* Screen options defined for this navigator */
    // eslint-disable-next-line react/forbid-prop-types
    screenOptions: PropTypes.object,
};

const defaultProps = {
    initialRouteName: undefined,
    screenOptions: undefined,
};

function getStateToRender(state: StackNavigationState<ParamListBase>): StackNavigationState<ParamListBase> {
    const routesToRender = [state.routes.at(-1)] as NavigationStateRoute[];
    // We need to render at least one HOME screen to make sure everything load properly.
    if (routesToRender[0].name !== SCREENS.HOME) {
        const routeToRender = state.routes.find((route) => route.name === SCREENS.HOME);
        if (routeToRender) {
            routesToRender.unshift(routeToRender);
        }
    }

    return {...state, routes: routesToRender, index: routesToRender.length - 1};
}

function CustomBottomTabNavigator({initialRouteName, children, screenOptions, ...props}: CustomNavigatorProps) {
    const {state, navigation, descriptors, NavigationContent} = useNavigationBuilder<
        StackNavigationState<ParamListBase>,
        StackRouterOptions,
        StackActionHelpers<ParamListBase>,
        StackNavigationOptions,
        StackNavigationEventMap
    >(StackRouter, {
        children,
        screenOptions,
        initialRouteName,
    });

    const stateToRender = getStateToRender(state);

    return (
        <View style={{flex: 1}}>
            <NavigationContent>
                <StackView
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    state={stateToRender}
                    descriptors={descriptors}
                    navigation={navigation}
                />
            </NavigationContent>
            <BottomTabBar />
        </View>
    );
}

CustomBottomTabNavigator.defaultProps = defaultProps;
CustomBottomTabNavigator.propTypes = propTypes;
CustomBottomTabNavigator.displayName = 'CustomBottomTabNavigator';

export default createNavigatorFactory(CustomBottomTabNavigator);
