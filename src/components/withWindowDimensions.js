/* eslint-disable react/no-unused-state */
import React, {forwardRef, createContext, useMemo} from 'react';
import PropTypes from 'prop-types';
import {useSafeAreaFrame} from 'react-native-safe-area-context';
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
    const frame = useSafeAreaFrame();

    const dimensions = useMemo(() => {
        const isSmallScreenWidth = frame.width <= variables.mobileResponsiveWidthBreakpoint;
        const isMediumScreenWidth = frame.width > variables.mobileResponsiveWidthBreakpoint
      && frame.width <= variables.tabletResponsiveWidthBreakpoint;
        const isLargeScreenWidth = !isSmallScreenWidth && !isMediumScreenWidth;
        return {
            windowHeight: frame.height,
            windowWidth: frame.width,
            isSmallScreenWidth,
            isMediumScreenWidth,
            isLargeScreenWidth,
        };
    }, [frame.width, frame.height]);

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

    WithWindowDimensions.displayName = `withWindowDimensions(${getComponentDisplayName(WrappedComponent)})`;
    return WithWindowDimensions;
}

export {
    WindowDimensionsProvider,
    windowDimensionsPropTypes,
};
