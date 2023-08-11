import React from 'react';
import PropTypes from 'prop-types';
import MobileBackgroundImage from '../../../../../assets/images/home-background--mobile.svg';
import DesktopBackgroundImage from '../../../../../assets/images/home-background--desktop.svg';
import styles from '../../../../styles/styles';

const defaultProps = {
    isSmallScreen: false,
};

const propTypes = {
    isSmallScreen: PropTypes.bool,
    pointerEvents: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
};
function BackgroundImage(props) {
    return props.isSmallScreen ? (
        <MobileBackgroundImage
            pointerEvents={props.pointerEvents}
            width={props.width}
            style={styles.signInBackground}
        />
    ) : (
        <DesktopBackgroundImage
            pointerEvents={props.pointerEvents}
            width={props.width}
            style={styles.signInBackground}
        />
    );
}

BackgroundImage.displayName = 'BackgroundImage';
BackgroundImage.propTypes = propTypes;
BackgroundImage.defaultProps = defaultProps;

export default BackgroundImage;
