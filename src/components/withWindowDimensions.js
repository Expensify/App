import React, {Component} from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {Dimensions} from 'react-native';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import variables from '../styles/variables';

const windowDimensionsPropTypes = {
    // Width of the window
    windowWidth: PropTypes.number.isRequired,

    // Height of the window
    windowHeight: PropTypes.number.isRequired,

    // Is the window width narrow, like on a mobile device?
    isSmallScreenWidth: PropTypes.bool.isRequired,

    // Is the window width narrow, like on a tablet device?
    isMediumScreenWidth: PropTypes.bool.isRequired,

    // Is device in landscape mode,
    isLandscape: PropTypes.bool.isRequired,
};

export default function (WrappedComponent) {
    const propTypes = {
        forwardedRef: PropTypes.func,
    };

    const defaultProps = {
        forwardedRef: () => {},
    };

    class WithWindowDimensions extends Component {
        constructor(props) {
            super(props);

            // Using debounce here as a temporary fix for a bug in react-native
            // https://github.com/facebook/react-native/issues/29290
            // When the app is sent to background on iPads, onDimensionChange callback is called with
            // swapped window dimensions before it was called with correct dimensions within miliseconds, then
            // drawer is being positioned incorrectly due to animation issues in react-navigation.
            // Adding debounce here slows down window dimension changes to let
            // react-navigation to complete the positioning of elements properly.
            this.onDimensionChange = _.debounce(this.onDimensionChange.bind(this), 100);

            const initialDimensions = Dimensions.get('window');
            const isSmallScreenWidth = initialDimensions.width <= variables.mobileResponsiveWidthBreakpoint;
            const isMediumScreenWidth = initialDimensions.width > variables.mobileResponsiveWidthBreakpoint
              && initialDimensions.width <= variables.tabletResponsiveWidthBreakpoint;

            const isLandscape = (isMediumScreenWidth || isSmallScreenWidth) && initialDimensions.width >= initialDimensions.height;

            this.state = {
                windowHeight: initialDimensions.height,
                windowWidth: initialDimensions.width,
                isSmallScreenWidth,
                isMediumScreenWidth,
                isLandscape,
            };
        }

        componentDidMount() {
            Dimensions.addEventListener('change', this.onDimensionChange);
        }

        componentWillUnmount() {
            Dimensions.removeEventListener('change', this.onDimensionChange);
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
            const isMediumScreenWidth = !isSmallScreenWidth && window.width <= variables.mediumScreenResponsiveWidthBreakpoint;
            const isLandscape = (isMediumScreenWidth || isSmallScreenWidth) && window.width >= window.height;

            this.setState({
                windowHeight: window.height,
                windowWidth: window.width,
                isSmallScreenWidth,
                isMediumScreenWidth,
                isLandscape,
            });
        }

        render() {
            const {forwardedRef, ...rest} = this.props;
            return (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rest}
                    ref={forwardedRef}
                    windowHeight={this.state.windowHeight}
                    windowWidth={this.state.windowWidth}
                    isSmallScreenWidth={this.state.isSmallScreenWidth}
                    isMediumScreenWidth={this.state.isMediumScreenWidth}
                    isLandscape={this.state.isLandscape}
                />
            );
        }
    }

    WithWindowDimensions.propTypes = propTypes;
    WithWindowDimensions.defaultProps = defaultProps;
    WithWindowDimensions.displayName = `withWindowDimensions(${getComponentDisplayName(WrappedComponent)})`;
    return React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithWindowDimensions {...props} forwardedRef={ref} />
    ));
}

export {
    windowDimensionsPropTypes,
};
