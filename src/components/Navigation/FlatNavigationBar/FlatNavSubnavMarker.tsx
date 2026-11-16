/** The pill beside the active row of the subnav. It slides to the new row when the active search changes. */
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React, {useEffect} from 'react';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';

type FlatNavSubnavMarkerProps = {
    /** Distance from the top of the subnav to the marker. Undefined when no row is active, which fades the marker out. */
    top: number | undefined;
};

function FlatNavSubnavMarker({top}: FlatNavSubnavMarkerProps) {
    const styles = useThemeStyles();
    const offset = useSharedValue(top ?? 0);
    const opacity = useSharedValue(top === undefined ? 0 : 1);

    useEffect(() => {
        if (top === undefined) {
            opacity.set(withTiming(0, {duration: CONST.ANIMATED_TRANSITION}));
            return;
        }

        // Jump rather than slide when the marker is appearing, so it does not travel from a row it was never on.
        if (opacity.get() === 0) {
            offset.set(top);
        } else {
            offset.set(withTiming(top, {duration: CONST.ANIMATED_TRANSITION, easing: Easing.inOut(Easing.ease)}));
        }
        opacity.set(withTiming(1, {duration: CONST.ANIMATED_TRANSITION}));
    }, [top, offset, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({opacity: opacity.get(), transform: [{translateY: offset.get()}]}));

    return (
        <Animated.View
            testID="FlatNavSubnavMarker"
            style={[styles.flatNavigationBarSubnavMarker, animatedStyle]}
            pointerEvents="none"
        />
    );
}

export default FlatNavSubnavMarker;
