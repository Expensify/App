import {Image} from 'expo-image';
import React, {useEffect, useState} from 'react';
import {InteractionManager} from 'react-native';
import type {ImageSourcePropType} from 'react-native';
import AndroidBackgroundImage from '@assets/images/home-background--android.svg';
import useThemeStyles from '@hooks/useThemeStyles';
import type BackgroundImageProps from './types';

function BackgroundImage({pointerEvents, width, transitionDuration}: BackgroundImageProps) {
    const styles = useThemeStyles();
    const [isInteractionComplete, setIsInteractionComplete] = useState(false);

    useEffect(() => {
        const interactionTask = InteractionManager.runAfterInteractions(() => {
            setIsInteractionComplete(true);
        });

        return () => {
            interactionTask.cancel();
        };
    }, []);

    // load the background image and Lottie animation only after user interactions to ensure smooth navigation transitions.
    if (!isInteractionComplete) {
        return;
    }

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
