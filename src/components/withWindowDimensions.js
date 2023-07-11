import React, {forwardRef, createContext} from 'react';
import PropTypes from 'prop-types';
import {Dimensions} from 'react-native';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import variables from '../styles/variables';
import getWindowHeightAdjustment from '../libs/getWindowHeightAdjustment';

const WindowDimensionsContext = createContext(null);
const windowDimensionsPropTypes = {
    // Width of the window
    windowWidth: PropTypes.number.isRequired,

    // Height of the window
    windowHeight: PropTypes.number.isRequired,

    // Is the window width extra narrow, like on a Fold mobile device?
    isExtraSmallScreenWidth: PropTypes.bool.isRequired,

    // Is the window width narrow, like on a mobile device?
    isSmallScreenWidth: PropTypes.bool.isRequired,

    // Is the window width medium sized, like on a tablet device?
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

        this.dimensionsEventListener = null;

        this.state = {
            windowHeight: initialDimensions.height,
            windowWidth: initialDimensions.width,
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

        this.setState({
            windowHeight: window.height,
            windowWidth: window.width,
        });
    }

    render() {
        return (
            <SafeAreaInsetsContext.Consumer>
                {(insets) => {
                    const isExtraSmallScreenWidth = this.state.windowWidth <= variables.extraSmallMobileResponsiveWidthBreakpoint;
                    const isSmallScreenWidth = this.state.windowWidth <= variables.mobileResponsiveWidthBreakpoint;
                    const isMediumScreenWidth = !isSmallScreenWidth && this.state.windowWidth <= variables.tabletResponsiveWidthBreakpoint;
                    const isLargeScreenWidth = !isSmallScreenWidth && !isMediumScreenWidth;
                    return (
                        <WindowDimensionsContext.Provider
                            value={{
                                windowHeight: this.state.windowHeight + getWindowHeightAdjustment(insets),
                                windowWidth: this.state.windowWidth,
                                isExtraSmallScreenWidth,
                                isSmallScreenWidth,
                                isMediumScreenWidth,
                                isLargeScreenWidth,
                            }}
                        >
                            {this.props.children}
                        </WindowDimensionsContext.Provider>
                    );
                }}
            </SafeAreaInsetsContext.Consumer>
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
            {(windowDimensionsProps) => (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...windowDimensionsProps}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    ref={ref}
                />
            )}
        </WindowDimensionsContext.Consumer>
    ));

    WithWindowDimensions.displayName = `withWindowDimensions(${getComponentDisplayName(WrappedComponent)})`;
    return WithWindowDimensions;
}

export {WindowDimensionsProvider, windowDimensionsPropTypes};
