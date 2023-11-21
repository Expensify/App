import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/native';
import {StackView} from '@react-navigation/stack';
import PropTypes from 'prop-types';
import React, {useMemo, useRef} from 'react';
import useWindowDimensions from '@hooks/useWindowDimensions';
import NAVIGATORS from '@src/NAVIGATORS';
import CustomRouter from './CustomRouter';

const propTypes = {
    /* Determines if the navigator should render the StackView (narrow) or ThreePaneView (wide) */
    isSmallScreenWidth: PropTypes.bool.isRequired,

    /* Children for the useNavigationBuilder hook */
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,

    /* initialRouteName for this navigator */
    initialRouteName: PropTypes.oneOf([PropTypes.string, PropTypes.undefined]),

    /* Screen options defined for this navigator */
    // eslint-disable-next-line react/forbid-prop-types
    screenOptions: PropTypes.object,

    centralRoute: PropTypes.string,
};

const defaultProps = {
    initialRouteName: undefined,
    screenOptions: undefined,
    centralRoute: NAVIGATORS.CENTRAL_PANE_NAVIGATOR,
};

function reduceReportRoutes(routes, centralRoute=NAVIGATORS.CENTRAL_PANE_NAVIGATOR) {
    const result = [];
    let count = 0;
    const reverseRoutes = [...routes].reverse();

    reverseRoutes.forEach((route) => {
        if (route.name === centralRoute) {
            // Remove all report routes except the last 3. This will improve performance.
            if (count < 3) {
                result.push(route);
                count++;
            }
        } else {
            result.push(route);
        }
    });

    console.log('reduceReportRoutes', centralRoute, routes, result);

    return result.reverse();
}

function ResponsiveStackNavigator(props) {
    const {isSmallScreenWidth} = useWindowDimensions();

    const isSmallScreenWidthRef = useRef(isSmallScreenWidth);

    isSmallScreenWidthRef.current = isSmallScreenWidth;

    const {navigation, state, descriptors, NavigationContent} = useNavigationBuilder(CustomRouter, {
        children: props.children,
        screenOptions: props.screenOptions,
        initialRouteName: props.initialRouteName,
        // Options for useNavigationBuilder won't update on prop change, so we need to pass a getter for the router to have the current state of isSmallScreenWidth.
        getIsSmallScreenWidth: () => isSmallScreenWidthRef.current,
        centralRoute: props.centralRoute,
    });

    const stateToRender = useMemo(() => {
        const result = reduceReportRoutes(state.routes, props.centralRoute);

        return {
            ...state,
            index: result.length - 1,
            routes: [...result],
        };
    }, [props.centralRoute, state]);

    console.log('ResponsiveStackNavigator', props.centralRoute);

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

ResponsiveStackNavigator.defaultProps = defaultProps;
ResponsiveStackNavigator.propTypes = propTypes;
ResponsiveStackNavigator.displayName = 'ResponsiveStackNavigator';

export default createNavigatorFactory(ResponsiveStackNavigator);
