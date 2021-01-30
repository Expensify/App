import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Dimensions} from 'react-native';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import variables from '../styles/variables';

const windowDimensionsPropTypes = {
    // via withWindowDimensions
    windowDimensions: PropTypes.shape({
        // Width of the window
        width: PropTypes.number.isRequired,

        // Height of the window
        height: PropTypes.number.isRequired,
    }).isRequired,

    // Is the window width narrow, like on a mobile device?
    isSmallScreenWidth: PropTypes.bool.isRequired,
};

export default function (WrappedComponent) {
    class withWindowDimensions extends Component {
        constructor(props) {
            super(props);

            this.onDimensionChange = this.onDimensionChange.bind(this);

            this.state = {
                windowDimensions: Dimensions.get('window'),
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
            this.setState({windowDimensions: window});
        }

        render() {
            return (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...this.props}
                    windowDimensions={this.state.windowDimensions}
                    isSmallScreenWidth={this.state.windowDimensions.width <= variables.mobileResponsiveWidthBreakpoint}
                />
            );
        }
    }

    withWindowDimensions.displayName = `withWindowDimensions(${getComponentDisplayName(WrappedComponent)})`;
    return withWindowDimensions;
}

export {
    windowDimensionsPropTypes,
};
