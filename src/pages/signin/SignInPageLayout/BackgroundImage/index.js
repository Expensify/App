import React from 'react';
import PropTypes from 'prop-types';
import MobileBackgroundImage from '../../../../../assets/images/home-background--mobile.svg';
import DesktopBackgroundImage from '../../../../../assets/images/home-background--desktop.svg';
import styles from '../../../../styles/styles';

const defaultProps = {
    isSmallScreen: false,
    style: {},
};

const propTypes = {
    isSmallScreen: PropTypes.bool,
    width: PropTypes.number.isRequired,

    /** General styles to apply to MobileBackgroundImage */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,
};
function BackgroundImage(props) {
    return props.isSmallScreen ? (
        <MobileBackgroundImage
            width={props.width}
            style={{...styles.signInBackground, ...props.style}}
        />
    ) : (
        <DesktopBackgroundImage
            width={props.width}
            style={{...styles.signInBackground, ...props.style}}
        />
    );
}

BackgroundImage.displayName = 'BackgroundImage';
BackgroundImage.propTypes = propTypes;
BackgroundImage.defaultProps = defaultProps;

export default BackgroundImage;
