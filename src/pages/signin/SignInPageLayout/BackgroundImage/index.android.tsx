import {Image} from 'expo-image';
import React from 'react';
import type {ImageSourcePropType} from 'react-native';
import AndroidBackgroundImage from '@assets/images/home-background--android.svg';
import useThemeStyles from '@hooks/useThemeStyles';
import type BackgroundImageProps from './types';

function BackgroundImage({pointerEvents, width, transitionDuration}: BackgroundImageProps) {
    const styles = useThemeStyles();
    return (
        <Image
            source={AndroidBackgroundImage as ImageSourcePropType}
            pointerEvents={pointerEvents}
            style={[styles.signInBackground, {width}]}
            transition={transitionDuration}
        />
    );
}

BackgroundImage.displayName = 'BackgroundImage';

export default BackgroundImage;
