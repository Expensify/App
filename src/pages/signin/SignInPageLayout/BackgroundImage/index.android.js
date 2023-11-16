import {Image} from 'expo-image';
import React from 'react';
import AndroidBackgroundImage from '@assets/images/home-background--android.svg';
import useThemeStyles from '@styles/useThemeStyles';
import defaultPropTypes from './propTypes';

function BackgroundImage(props) {
    const styles = useThemeStyles();
    return (
        <Image
            source={AndroidBackgroundImage}
            pointerEvents={props.pointerEvents}
            style={[styles.signInBackground, {width: props.width}]}
        />
    );
}

BackgroundImage.displayName = 'BackgroundImage';
BackgroundImage.propTypes = defaultPropTypes;

export default BackgroundImage;
