/* eslint-disable react/no-unused-state */
import React, {forwardRef, createContext} from 'react';
import PropTypes from 'prop-types';
import {Dimensions} from 'react-native';
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

class WindowDimensionsProvider extends React.Component {
    constructor(props) {
        super(props);

        this.onDimensionChange = this.onDimensionChange.bind(this);

        const initialDimensions = Dimensions.get('window');
        const isSmallScreenWidth = initialDimensions.width <= variables.mobileResponsiveWidthBreakpoint;
        const isMediumScreenWidth = initialDimensions.width > variables.mobileResponsiveWidthBreakpoint
          && initialDimensions.width <= variables.tabletResponsiveWidthBreakpoint;
        const isLargeScreenWidth = !isSmallScreenWidth && !isMediumScreenWidth;

        this.dimensionsEventListener = null;

        this.state = {
            windowHeight: initialDimensions.height,
            windowWidth: initialDimensions.width,
            isSmallScreenWidth,
            isMediumScreenWidth,
            isLargeScreenWidth,
        };
    }

    componentDidMount() {
        this.dimensionsEventListener = Dimensions.addEventListener('change', this.onDimensionChange);
    }

    componentWillUnmount() {
        if (!this.dimensionsEventListener) {
            return;
        }
        this.dimensionsEventListener.remove();
    }

    /**
     * Stores the application window's width and height in a component state variable.
     * Called each time the application's window dimensions or screen dimensions change.
     * @link https://reactnative.dev/docs/dimensions
     * @param {Object} newDimensions Dimension object containing updated window and screen dimensions
     */
    onDimensionChange(newDimensions) {
        const {window} = newDimensions;
        const isSmallScreenWidth = window.width <= variables.mobileResponsiveWidthBreakpoint;
        const isMediumScreenWidth = !isSmallScreenWidth && window.width <= variables.tabletResponsiveWidthBreakpoint;
        const isLargeScreenWidth = !isSmallScreenWidth && !isMediumScreenWidth;
        this.setState({
            windowHeight: window.height,
            windowWidth: window.width,
            isSmallScreenWidth,
            isMediumScreenWidth,
            isLargeScreenWidth,
        });
    }

    render() {
        return (
            <WindowDimensionsContext.Provider value={this.state}>
                {this.props.children}
            </WindowDimensionsContext.Provider>
        );
    }
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
