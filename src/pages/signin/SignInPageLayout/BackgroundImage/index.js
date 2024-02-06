import PropTypes from 'prop-types';
import React from 'react';
import * as Animatable from 'react-native-animatable';
import DesktopBackgroundImage from '@assets/images/home-background--desktop.svg';
import MobileBackgroundImage from '@assets/images/home-background--mobile.svg';
import useThemeStyles from '@hooks/useThemeStyles';
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
    const styles = useThemeStyles();
    const fadeIn = {
        from: {
            opacity: 0,
        },
        to: {
            opacity: 1,
        },
    };

    return (
        <Animatable.View
            style={styles.signInBackground}
            animation={fadeIn}
            duration={props.transitionDuration}
        >
            {props.isSmallScreen ? (
                <MobileBackgroundImage
                    width={props.width}
                    style={styles.signInBackground}
                />
            ) : (
                <DesktopBackgroundImage
                    width={props.width}
                    style={styles.signInBackground}
                />
            )}
        </Animatable.View>
    );
}

BackgroundImage.displayName = 'BackgroundImage';
BackgroundImage.propTypes = propTypes;
BackgroundImage.defaultProps = defaultProps;

export default BackgroundImage;
