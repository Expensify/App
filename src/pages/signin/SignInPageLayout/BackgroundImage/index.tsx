import React, {lazy, Suspense, useEffect, useMemo, useState} from 'react';
import {InteractionManager} from 'react-native';
import Animated, {FadeIn} from 'react-native-reanimated';
import useThemeStyles from '@hooks/useThemeStyles';
import {isAnonymousUser} from '@libs/actions/Session';
import CONST from '@src/CONST';
import type BackgroundImageProps from './types';

const BackgroundMobile = lazy(() =>
    import('@assets/images/home-background--mobile.svg').catch(() => ({
        default: () => null,
    })),
);
const BackgroundDesktop = lazy(() =>
    import('@assets/images/home-background--desktop.svg').catch(() => ({
        default: () => null,
    })),
);

function BackgroundImage({width, isSmallScreen = false}: BackgroundImageProps) {
    const styles = useThemeStyles();
    const [isInteractionComplete, setIsInteractionComplete] = useState(false);
    const isAnonymous = isAnonymousUser();

    const BackgroundComponent = useMemo(() => {
        if (isSmallScreen) {
            return BackgroundMobile;
        }
        return BackgroundDesktop;
    }, [isSmallScreen]);

    useEffect(() => {
        if (!isAnonymous) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const interactionTask = InteractionManager.runAfterInteractions(() => {
            setIsInteractionComplete(true);
        });

        return () => {
            interactionTask.cancel();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!isInteractionComplete && isAnonymous) {
        return;
    }

    return (
        <Suspense fallback={null}>
            <Animated.View
                style={styles.signInBackground}
                entering={FadeIn.duration(CONST.BACKGROUND_IMAGE_TRANSITION_DURATION)}
            >
                <BackgroundComponent width={width} />
            </Animated.View>
        </Suspense>
    );
}

export default BackgroundImage;
