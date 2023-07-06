import React from 'react';
import PropTypes from 'prop-types';
import MobileBackgroundImage from '../../../../../assets/images/home-background--mobile.svg';
import DesktopBackgroundImage from '../../../../../assets/images/home-background--desktop.svg';

const defaultProps = {
    isSmallScreen: false,
    style: [],
};

const propTypes = {
    isSmallScreen: PropTypes.bool,
    pointerEvents: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.object)]),
};
function BackgroundImage(props) {
    return props.isSmallScreen ? (
        <MobileBackgroundImage
            pointerEvents={props.pointerEvents}
            width={props.width}
            style={props.style}
        />
    ) : (
        <DesktopBackgroundImage
            pointerEvents={props.pointerEvents}
            width={props.width}
        />
    );
}

BackgroundImage.displayName = 'BackgroundImage';
BackgroundImage.propTypes = propTypes;
BackgroundImage.defaultProps = defaultProps;

export default BackgroundImage;
