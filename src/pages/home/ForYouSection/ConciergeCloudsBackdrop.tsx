import Icon from '@components/Icon';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';

import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming} from 'react-native-reanimated';

// The artwork's own 655x173 ratio, scaled to the height the card gives it.
const CLOUDS_HEIGHT = 160;
const CLOUDS_WIDTH = Math.round((CLOUDS_HEIGHT * 655) / 173);

// One full pass across a single copy. Two copies sit side by side, so restarting at 0 lands the second copy exactly
// where the first began and the drift reads as continuous.
const CLOUDS_DURATION = 60000;

// Pull the band above the card's top edge so the clouds are cropped rather than starting flush against it.
const CLOUDS_TOP_OFFSET = -20;

/** A slow, looping band of clouds drifting behind the Concierge card's content. */
function ConciergeCloudsBackdrop() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const illustrations = useMemoizedLazyIllustrations(['Clouds']);
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const offset = useSharedValue(0);

    useEffect(() => {
        if (isReduceMotionEnabled) {
            cancelAnimation(offset);
            offset.set(0);
            return;
        }

        offset.set(withRepeat(withTiming(-CLOUDS_WIDTH, {duration: CLOUDS_DURATION, easing: Easing.linear}), -1, false));

        return () => cancelAnimation(offset);
    }, [isReduceMotionEnabled, offset]);

    const driftStyle = useAnimatedStyle(() => ({transform: [{translateX: offset.get()}]}));

    return (
        <View
            style={[styles.pAbsolute, styles.l0, styles.r0, styles.overflowHidden, {top: CLOUDS_TOP_OFFSET, height: CLOUDS_HEIGHT}]}
            pointerEvents="none"
        >
            <Animated.View style={[styles.flexRow, driftStyle]}>
                <Icon
                    src={illustrations.Clouds}
                    fill={theme.hoverComponentBG}
                    width={CLOUDS_WIDTH}
                    height={CLOUDS_HEIGHT}
                />
                <Icon
                    src={illustrations.Clouds}
                    fill={theme.hoverComponentBG}
                    width={CLOUDS_WIDTH}
                    height={CLOUDS_HEIGHT}
                />
            </Animated.View>
        </View>
    );
}

export default ConciergeCloudsBackdrop;
