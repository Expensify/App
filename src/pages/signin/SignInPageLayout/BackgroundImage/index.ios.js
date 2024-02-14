import {Image} from 'expo-image';
import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import Reanimated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import DesktopBackgroundImage from '@assets/images/home-background--desktop.svg';
import MobileBackgroundImage from '@assets/images/home-background--mobile-new.svg';
import useIsSplashHidden from '@hooks/useIsSplashHidden';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
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
    const StyleUtils = useStyleUtils();
    const src = useMemo(() => (props.isSmallScreen ? MobileBackgroundImage : DesktopBackgroundImage), [props.isSmallScreen]);

    const opacity = useSharedValue(0);
    const animatedStyle = useAnimatedStyle(() => ({opacity: opacity.value}));
    // This sets the opacity animation for the background image once it has loaded.
    function setOpacityAnimation() {
        opacity.value = withTiming(1, {
            duration: CONST.MICROSECONDS_PER_MS,
            easing: Easing.ease,
        });
    }

    const isSplashHidden = useIsSplashHidden();
    // Prevent rendering the background image until the splash screen is hidden.
    // See issue: https://github.com/Expensify/App/issues/34696
    if (!isSplashHidden) {
        return;
    }

    return (
        <Reanimated.View style={[styles.signInBackground, StyleUtils.getWidthStyle(props.width), animatedStyle]}>
            <Image
                source={src}
                onLoadEnd={() => setOpacityAnimation()}
                style={[styles.signInBackground, StyleUtils.getWidthStyle(props.width)]}
                transition={props.transitionDuration}
            />
        </Reanimated.View>
    );
}

BackgroundImage.displayName = 'BackgroundImage';
BackgroundImage.propTypes = propTypes;
BackgroundImage.defaultProps = defaultProps;

export default BackgroundImage;
