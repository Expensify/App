/* eslint-disable react/no-unused-state */
import React, {forwardRef} from 'react';
import PropTypes from 'prop-types';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import {WindowDimensionsContext} from '../providers/WindowDimensionsProvider';

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
    windowDimensionsPropTypes,
};
