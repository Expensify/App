import React, {useEffect, useState} from 'react';
import {InteractionManager} from 'react-native';
import Animated, {FadeIn} from 'react-native-reanimated';
import DesktopBackgroundImage from '@assets/images/home-background--desktop.svg';
import MobileBackgroundImage from '@assets/images/home-background--mobile.svg';
import useThemeStyles from '@hooks/useThemeStyles';
import {isAnonymousUser} from '@libs/actions/Session';
import type BackgroundImageProps from './types';

function BackgroundImage({width, transitionDuration, isSmallScreen = false}: BackgroundImageProps) {
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

    if (!isInteractionComplete && isAnonymous) {
        return;
    }

    if (isSmallScreen) {
        return (
            <Animated.View
                style={styles.signInBackground}
                entering={FadeIn.duration(transitionDuration)}
            >
                <MobileBackgroundImage
                    width={width}
                    style={styles.signInBackground}
                />
            </Animated.View>
        );
    }

    return (
        <Animated.View
            style={styles.signInBackground}
            entering={FadeIn.duration(transitionDuration)}
        >
            <DesktopBackgroundImage
                width={width}
                style={styles.signInBackground}
            />
        </Animated.View>
    );
}

BackgroundImage.displayName = 'BackgroundImage';

export default BackgroundImage;
