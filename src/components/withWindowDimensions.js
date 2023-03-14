import React, {forwardRef, createContext, useMemo} from 'react';
import {Platform, useWindowDimensions} from 'react-native';
import PropTypes from 'prop-types';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import variables from '../styles/variables';

const WindowDimensionsContext = createContext(null);
const windowDimensionsPropTypes = {
    // Width of the window
    windowWidth: PropTypes.number.isRequired,

    // Height of the window
    windowHeight: PropTypes.number.isRequired,

    // Is the window width narrow, like on a mobile device?
    isSmallScreenWidth: PropTypes.bool.isRequired,

    // Is the window width narrow, like on a tablet device?
    isMediumScreenWidth: PropTypes.bool.isRequired,

    // Is the window width wide, like on a browser or desktop?
    isLargeScreenWidth: PropTypes.bool.isRequired,
};

const windowDimensionsProviderPropTypes = {
    /* Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

function WindowDimensionsProvider(props) {
    const window = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const dimensions = useMemo(() => {
        // On Android the window height does not include the status bar height, so we need to add it manually.
        const windowHeight = Platform.OS === 'android'
            ? window.height + insets.top
            : window.height;
        const isSmallScreenWidth = window.width <= variables.mobileResponsiveWidthBreakpoint;
        const isMediumScreenWidth = window.width > variables.mobileResponsiveWidthBreakpoint
            && window.width <= variables.tabletResponsiveWidthBreakpoint;
        const isLargeScreenWidth = !isSmallScreenWidth && !isMediumScreenWidth;
        return {
            windowHeight,
            windowWidth: window.width,
            isSmallScreenWidth,
            isMediumScreenWidth,
            isLargeScreenWidth,
        };
    }, [window.width, window.height, insets.top]);

    return (
        <WindowDimensionsContext.Provider value={dimensions}>
            {props.children}
        </WindowDimensionsContext.Provider>
    );
}

WindowDimensionsProvider.propTypes = windowDimensionsProviderPropTypes;

/**
 * @param {React.Component} WrappedComponent
 * @returns {React.Component}
 */
export default function withWindowDimensions(WrappedComponent) {
    const WithWindowDimensions = forwardRef((props, ref) => (
        <WindowDimensionsContext.Consumer>
            {windowDimensionsProps => (
                // eslint-disable-next-line react/jsx-props-no-spreading
                <WrappedComponent {...windowDimensionsProps} {...props} ref={ref} />
            )}
        </WindowDimensionsContext.Consumer>
    ));

    WithWindowDimensions.displayName = `withWindowDimensions(${getComponentDisplayName(
        WrappedComponent,
    )})`;
    return WithWindowDimensions;
}

export {WindowDimensionsProvider, windowDimensionsPropTypes};
