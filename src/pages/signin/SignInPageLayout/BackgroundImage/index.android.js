import {Image} from 'expo-image';
import React from 'react';
import AndroidBackgroundImage from '@assets/images/home-background--android.svg';
import styles from '@styles/styles';
import defaultPropTypes from './propTypes';

function BackgroundImage(props) {
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
