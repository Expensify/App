import {createNavigatorFactory, useNavigationBuilder} from '@react-navigation/native';
import {StackView} from '@react-navigation/stack';
import PropTypes from 'prop-types';
import React, {useMemo, useRef} from 'react';
import IFrame from '@components/IFrame';
import useWindowDimensions from '@hooks/useWindowDimensions';
import getTopMostCentralPaneRouteName from '@libs/Navigation/getTopMostCentralPaneRouteName';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
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

const IFRAME_CONSTANT_KEY = 'iframe-constant-key';

function splitRoutes(routes) {
    const iframeRoutes = [];
    const rhpRoutes = [];
    const otherRoutes = [];

    routes.forEach((route) => {
        const topMostRouteName = getTopMostCentralPaneRouteName({routes: [route]});

        if (route.name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR && topMostRouteName !== SCREENS.REPORT) {
            iframeRoutes.push(route);
        } else if (route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
            rhpRoutes.push(route);
        } else {
            otherRoutes.push(route);
        }
    });

    return {iframeRoutes, rhpRoutes, otherRoutes};
}

// We can't pass a component directly to the render method of the descriptor.
const renderIFrame = () => <IFrame />;

function reduceReportRoutes(routes) {
    const result = [];
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

    const stackViewProps = useMemo(() => {
        const {iframeRoutes, rhpRoutes, otherRoutes} = splitRoutes(state.routes);
        // If there is no iframe routes, don't modify the state and descriptors.
        if (iframeRoutes.length === 0) {
            return {newState: state, newDescriptors: descriptors};
        }

        // If there is at least one iframeRoutes we will reuse it with changed key to render stable iframe.
        const lastIframe = iframeRoutes[iframeRoutes.length - 1];
        const stableIframeRoute = {...lastIframe, key: IFRAME_CONSTANT_KEY};
        const newDescriptors = {
            ...descriptors,
            [IFRAME_CONSTANT_KEY]: {
                ...descriptors[lastIframe.key],
                render: renderIFrame,
                route: stableIframeRoute,
            },
        };

        // If the top most central pane route is an iframe route, we will include it in the state.
        // It won't render any screen because screens for iframe routes are null but it will set a proper url in the adress bar.
        // We will also use modified version of this route with stable key to render stable iframe.
        const isIframeTopRoute = getTopMostCentralPaneRouteName(state) !== SCREENS.REPORT;
        if (isIframeTopRoute) {
            const newState = {
                ...state,
                index: otherRoutes.length + rhpRoutes.length + 1,
                routes: [...otherRoutes, lastIframe, stableIframeRoute, ...rhpRoutes],
            };
            return {newState, newDescriptors};
        }

        const newState = {
            ...state,
            index: otherRoutes.length + rhpRoutes.length,
            // To avoid unmounting of the iframe route, we will move it to the bottom of stack to hide it.
            routes: [stableIframeRoute, ...otherRoutes, ...rhpRoutes],
        };
        return {newState, newDescriptors};
    }, [state, descriptors]);
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
                state={stackViewProps.newState}
                descriptors={stackViewProps.newDescriptors}
                navigation={navigation}
            />
        </NavigationContent>
    );
}

ResponsiveStackNavigator.defaultProps = defaultProps;
ResponsiveStackNavigator.propTypes = propTypes;
ResponsiveStackNavigator.displayName = 'ResponsiveStackNavigator';

export default createNavigatorFactory(ResponsiveStackNavigator);
