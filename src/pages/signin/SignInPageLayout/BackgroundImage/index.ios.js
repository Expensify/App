import React from 'react';
import PropTypes from 'prop-types';
import {Image} from 'expo-image';
import MobileBackgroundImage from '../../../../../assets/images/home-background--mobile.svg';
import DesktopBackgroundImage from '../../../../../assets/images/home-background--desktop.svg';
import styles from '../../../../styles/styles';
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
    console.log('PRINT', props.isSmallScreen, props.width);
    return props.isSmallScreen ? (
        <Image
            // contentFit="fill"
            source={MobileBackgroundImage}
            // pointerEvents={props.pointerEvents}
            style={[styles.signInBackground, {width: props.width}]}
        />
    ) : (
        <Image
            source={DesktopBackgroundImage}
            // pointerEvents={props.pointerEvents}
            style={[styles.signInBackground, {width: props.width}]}
        />
    );
}

BackgroundImage.displayName = 'BackgroundImage';
BackgroundImage.propTypes = propTypes;
BackgroundImage.defaultProps = defaultProps;

export default BackgroundImage;
