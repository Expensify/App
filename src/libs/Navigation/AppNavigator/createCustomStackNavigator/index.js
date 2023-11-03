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
};

const defaultProps = {
    initialRouteName: undefined,
    screenOptions: undefined,
};

function splitRoutes(routes) {
    const reportRoutes = [];
    const rhpRoutes = [];
    const otherRoutes = [];

    routes.forEach((route) => {
        if (route.name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR) {
            reportRoutes.push(route);
        } else if (route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
            rhpRoutes.push(route);
        } else {
            otherRoutes.push(route);
        }
    });

    return {reportRoutes, rhpRoutes, otherRoutes};
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
    });

    const stateToRender = useMemo(() => {
        const {reportRoutes, rhpRoutes, otherRoutes} = splitRoutes(state.routes);

        // Remove all report routes except the last 3. This will improve performance.
        const limitedReportRoutes = reportRoutes.slice(-3);

        return {
            ...state,
            index: otherRoutes.length + limitedReportRoutes.length + rhpRoutes.length - 1,
            routes: [...otherRoutes, ...limitedReportRoutes, ...rhpRoutes],
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

ResponsiveStackNavigator.defaultProps = defaultProps;
ResponsiveStackNavigator.propTypes = propTypes;
ResponsiveStackNavigator.displayName = 'ResponsiveStackNavigator';

export default createNavigatorFactory(ResponsiveStackNavigator);
