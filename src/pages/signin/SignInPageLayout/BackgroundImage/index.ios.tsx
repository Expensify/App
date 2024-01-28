import type {ImageStyle} from 'expo-image';
import {Image} from 'expo-image';
import React, {useMemo} from 'react';
import type {ImageSourcePropType} from 'react-native';
import DesktopBackgroundImage from '@assets/images/home-background--desktop.svg';
import MobileBackgroundImage from '@assets/images/home-background--mobile-new.svg';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import type BackgroundImageProps from './types';

function BackgroundImage({width, transitionDuration, isSmallScreen = false}: BackgroundImageProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const src = useMemo(() => (isSmallScreen ? MobileBackgroundImage : DesktopBackgroundImage), [isSmallScreen]);

    return (
        <Image
            source={src as ImageSourcePropType}
            style={[styles.signInBackground, StyleUtils.getWidthStyle(width) as ImageStyle]}
            transition={transitionDuration}
        />
    );
}

BackgroundImage.displayName = 'BackgroundImage';

export default BackgroundImage;
