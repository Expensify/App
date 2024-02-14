import React from 'react';
import * as Animatable from 'react-native-animatable';
import DesktopBackgroundImage from '@assets/images/home-background--desktop.svg';
import MobileBackgroundImage from '@assets/images/home-background--mobile.svg';
import useThemeStyles from '@hooks/useThemeStyles';
import type BackgroundImageProps from './types';

function BackgroundImage({width, transitionDuration, isSmallScreen = false}: BackgroundImageProps) {
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
            duration={transitionDuration}
        >
            {isSmallScreen ? (
                <MobileBackgroundImage
                    width={width}
                    style={styles.signInBackground}
                />
            ) : (
                <DesktopBackgroundImage
                    width={width}
                    style={styles.signInBackground}
                />
            )}
        </Animatable.View>
    );
}

BackgroundImage.displayName = 'BackgroundImage';

export default BackgroundImage;
