import {Image} from 'expo-image';
import React, {useEffect, useState} from 'react';
import {InteractionManager} from 'react-native';
import type {ImageSourcePropType} from 'react-native';
import AndroidBackgroundImage from '@assets/images/home-background--android.svg';
import useThemeStyles from '@hooks/useThemeStyles';
import {isAnonymousUser} from '@libs/actions/Session';
import type BackgroundImageProps from './types';

function BackgroundImage({pointerEvents, width, transitionDuration}: BackgroundImageProps) {
    const styles = useThemeStyles();
    const [isInteractionComplete, setIsInteractionComplete] = useState(false);
    const isAnonymous = isAnonymousUser();

    useEffect(() => {
        if (!isAnonymous) {
            return;
        }

        const interactionTask = InteractionManager.runAfterInteractions(() => {
            setIsInteractionComplete(true);
        });

        return () => {
            interactionTask.cancel();
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    // load the background image and Lottie animation only after user interactions to ensure smooth navigation transitions.
    if (!isInteractionComplete && isAnonymous) {
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
