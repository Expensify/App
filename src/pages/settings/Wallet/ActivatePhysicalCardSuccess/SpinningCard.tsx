/**
 * The Expensify Card entering in 3D on the activation success screen: it fades in, spins horizontally while scaling up and
 * settling out of a tilt, then floats and gently sways in place. The card back shows whenever the card faces away.
 * With reduced motion turned on, the card is shown still, facing front.
 */
import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';

import React, {useEffect} from 'react';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming} from 'react-native-reanimated';

import CardFace from './CardFace';

/** Wait before starting, so the entry is not hidden behind the screen's slide-in transition */
const START_DELAY_MS = 500;

/** Entry */
const FADE_DURATION_MS = 350;
const SPIN_DURATION_MS = 1400;
/** Full horizontal turns around the vertical axis during the entry */
const HORIZONTAL_TURNS = 2;
/** In-plane tilt the card starts at and settles out of */
const START_ROTATE_Z_DEG = -20;
const START_SCALE = 0.5;

/**
 * When the card looks settled, measured from mount. The spin eases out, so the last stretch of it barely moves and the
 * text can start appearing before the spin has formally finished.
 */
const CARD_SETTLE_MS = START_DELAY_MS + SPIN_DURATION_MS * 0.8;

/** Idle float after the entry */
const FLOAT_DISTANCE_PX = 6;
const FLOAT_HALF_CYCLE_MS = 1600;
const SWAY_ROTATE_Y_DEG = 6;
const SWAY_ROTATE_X_DEG = 3;
const SWAY_HALF_CYCLE_MS = 2200;

/** Distance of the viewer from the card, in px. Lower values exaggerate the 3D depth. */
const PERSPECTIVE = 900;

/**
 * Each face gets its own rotation and is shown only while it faces the viewer. This works the same on web and native,
 * where backface-visibility does not. The back is turned an extra half turn so its content reads the right way round.
 */
function getFaceStyle(rotateYDeg: number, rotateXDeg: number, rotateZDeg: number, isBack: boolean) {
    'worklet';

    const isFrontFacing = Math.cos((rotateYDeg * Math.PI) / 180) >= 0;
    return {
        opacity: isFrontFacing !== isBack ? 1 : 0,
        transform: [{perspective: PERSPECTIVE}, {rotateY: `${rotateYDeg + (isBack ? 180 : 0)}deg`}, {rotateX: `${rotateXDeg}deg`}, {rotateZ: `${rotateZDeg * (isBack ? -1 : 1)}deg`}],
    };
}

function SpinningCard() {
    const styles = useThemeStyles();
    const isReduceMotionEnabled = Accessibility.useReducedMotion();

    // With reduced motion the values start at their resting state and the effect below never animates them.
    const opacity = useSharedValue(isReduceMotionEnabled ? 1 : 0);
    const spinY = useSharedValue(isReduceMotionEnabled ? 0 : -360 * HORIZONTAL_TURNS);
    const rotateZ = useSharedValue(isReduceMotionEnabled ? 0 : START_ROTATE_Z_DEG);
    const scale = useSharedValue(isReduceMotionEnabled ? 1 : START_SCALE);
    const floatY = useSharedValue(0);
    const sway = useSharedValue(0);

    useEffect(() => {
        if (isReduceMotionEnabled) {
            return;
        }

        const spinEasing = Easing.out(Easing.cubic);
        const idleEasing = Easing.inOut(Easing.sin);
        const idleStart = START_DELAY_MS + SPIN_DURATION_MS;

        opacity.set(withDelay(START_DELAY_MS, withTiming(1, {duration: FADE_DURATION_MS})));
        spinY.set(withDelay(START_DELAY_MS, withTiming(0, {duration: SPIN_DURATION_MS, easing: spinEasing})));
        rotateZ.set(withDelay(START_DELAY_MS, withTiming(0, {duration: SPIN_DURATION_MS, easing: spinEasing})));
        scale.set(withDelay(START_DELAY_MS, withTiming(1, {duration: SPIN_DURATION_MS, easing: spinEasing})));

        floatY.set(
            withDelay(
                idleStart,
                withRepeat(
                    withSequence(
                        withTiming(-FLOAT_DISTANCE_PX, {
                            duration: FLOAT_HALF_CYCLE_MS,
                            easing: idleEasing,
                        }),
                        withTiming(0, {
                            duration: FLOAT_HALF_CYCLE_MS,
                            easing: idleEasing,
                        }),
                    ),
                    -1,
                ),
            ),
        );
        // The sway starts from the middle, so its first move is half as long as the rest.
        sway.set(
            withDelay(
                idleStart,
                withSequence(
                    withTiming(1, {
                        duration: SWAY_HALF_CYCLE_MS / 2,
                        easing: idleEasing,
                    }),
                    withRepeat(
                        withSequence(
                            withTiming(-1, {
                                duration: SWAY_HALF_CYCLE_MS,
                                easing: idleEasing,
                            }),
                            withTiming(1, {
                                duration: SWAY_HALF_CYCLE_MS,
                                easing: idleEasing,
                            }),
                        ),
                        -1,
                    ),
                ),
            ),
        );
    }, [isReduceMotionEnabled, opacity, spinY, rotateZ, scale, floatY, sway]);

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.get(),
        transform: [{translateY: floatY.get()}, {scale: scale.get()}],
    }));

    // Shared values are read directly in each style callback, not in getFaceStyle, so Reanimated tracks them on web.
    const frontStyle = useAnimatedStyle(() => getFaceStyle(spinY.get() + sway.get() * SWAY_ROTATE_Y_DEG, sway.get() * SWAY_ROTATE_X_DEG, rotateZ.get(), false));
    const backStyle = useAnimatedStyle(() => getFaceStyle(spinY.get() + sway.get() * SWAY_ROTATE_Y_DEG, sway.get() * SWAY_ROTATE_X_DEG, rotateZ.get(), true));

    return (
        <Animated.View
            style={[styles.mb5, containerStyle]}
            aria-hidden
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
        >
            <Animated.View style={frontStyle}>
                <CardFace side="front" />
            </Animated.View>
            <Animated.View style={[styles.pAbsolute, styles.t0, styles.l0, backStyle]}>
                <CardFace side="back" />
            </Animated.View>
        </Animated.View>
    );
}

export default SpinningCard;
export {CARD_SETTLE_MS};
