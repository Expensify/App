import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import {useNavigationBuilder, createNavigatorFactory} from '@react-navigation/native';
import {StackView} from '@react-navigation/stack';
import CustomRouter from './CustomRouter';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import getTopMostCentralPaneRouteName from '../../getTopMostCentralPaneRouteName';
import SCREENS from '../../../../SCREENS';
import NAVIGATORS from '../../../../NAVIGATORS';
import IFrame from '../../../../components/IFrame';

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

    const {iframeRoutes, rhpRoutes, otherRoutes} = splitRoutes(state.routes);

    let newState = {...state};
    let newDescriptors = {...descriptors};

    const isIframeTopRoute = getTopMostCentralPaneRouteName(state) !== SCREENS.REPORT;

    // TODO: It's probably better to use useMemo for newState and newDescriptors
    if (iframeRoutes.length > 0) {
        // If there is at least one iframeRoutes we will use it to render iframe
        const lastIframe = iframeRoutes[iframeRoutes.length - 1];
        const stableIframeRoute = {...lastIframe, key: IFRAME_CONSTANT_KEY};

        if (isIframeTopRoute) {
            newState = {
                ...state,
                // It is actually otherRoutes.length + rhpRoutes.length -1 + 2,
                // because we are rendering two additional routes for iframe
                // The lastIframe descriptor.render() needs to be called to set proper url in the adress bar. This won't render any screen.
                // The stableIframeRoute with constant key is used to render actual iframe.
                // We need to replace render method for it's decriptor.
                index: otherRoutes.length + rhpRoutes.length + 1,
                routes: [...otherRoutes, lastIframe, stableIframeRoute, ...rhpRoutes],
            };
        } else {
            newState = {
                ...state,
                index: otherRoutes.length + rhpRoutes.length,
                // To avoid unmounting of the iframe route we will move it to the bottom of stack to hide it.
                routes: [stableIframeRoute, ...otherRoutes, ...rhpRoutes],
            };
        }

        newDescriptors = {
            ...descriptors,
            [IFRAME_CONSTANT_KEY]: {
                ...descriptors[lastIframe.key],
                render: renderIFrame,
                route: stableIframeRoute,
            },
        };
    }

    return (
        <NavigationContent>
            <StackView
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                state={newState}
                descriptors={newDescriptors}
                navigation={navigation}
            />
        </NavigationContent>
    );
}

ResponsiveStackNavigator.defaultProps = defaultProps;
ResponsiveStackNavigator.propTypes = propTypes;
ResponsiveStackNavigator.displayName = 'ResponsiveStackNavigator';

export default createNavigatorFactory(ResponsiveStackNavigator);
