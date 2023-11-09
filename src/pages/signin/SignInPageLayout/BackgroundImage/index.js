import PropTypes from 'prop-types';
import React from 'react';
import DesktopBackgroundImage from '@assets/images/home-background--desktop.svg';
import MobileBackgroundImage from '@assets/images/home-background--mobile.svg';
import styles from '@styles/styles';
import defaultPropTypes from './propTypes';

const defaultProps = {
    isSmallScreen: false,
};

const propTypes = {
    /** Is the window width narrow, like on a mobile device */
    isSmallScreen: PropTypes.bool,

    ...defaultPropTypes,
};
function BackgroundImage(props) {
    return props.isSmallScreen ? (
        <MobileBackgroundImage
            width={props.width}
            style={styles.signInBackground}
        />
    ) : (
        <DesktopBackgroundImage
            width={props.width}
            style={styles.signInBackground}
        />
    );
}

BackgroundImage.displayName = 'BackgroundImage';
BackgroundImage.propTypes = propTypes;
BackgroundImage.defaultProps = defaultProps;

export default BackgroundImage;
