/**
 * Shows an integration's logo and the Expensify logo circling a dashed ring, to illustrate the two apps connecting.
 */
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type IconAsset from '@src/types/utils/IconAsset';

import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming} from 'react-native-reanimated';
import Svg, {Circle} from 'react-native-svg';

import Icon from './Icon';

const ORBIT_DURATION_MS = 10000;
const RING_STROKE_WIDTH = 1;
const RING_DASH_PATTERN = '4 4';
const RING_RADIUS = variables.connectionOrbitDiameter / 2;
const ORBIT_SIZE = variables.connectionOrbitDiameter + variables.connectionOrbitBadgeSize;

// The integration starts at the top left of the ring and Expensify sits opposite it, matching the design
const INTEGRATION_START_ANGLE = -0.75 * Math.PI;

type ConnectionOrbitAnimationProps = {
    /** Logo of the integration being connected */
    integrationIcon: IconAsset;
};

function getOrbitTransform(angle: number) {
    'worklet';

    return {transform: [{translateX: RING_RADIUS * Math.cos(angle)}, {translateY: RING_RADIUS * Math.sin(angle)}]};
}

function ConnectionOrbitAnimation({integrationIcon}: ConnectionOrbitAnimationProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['ExpensifyAppIcon']);
    const rotation = useSharedValue(0);

    useEffect(() => {
        rotation.set(withRepeat(withTiming(2 * Math.PI, {duration: ORBIT_DURATION_MS, easing: Easing.linear}), -1, false));
        return () => cancelAnimation(rotation);
    }, [rotation]);

    const integrationBadgeStyle = useAnimatedStyle(() => getOrbitTransform(INTEGRATION_START_ANGLE + rotation.get()));
    const expensifyBadgeStyle = useAnimatedStyle(() => getOrbitTransform(INTEGRATION_START_ANGLE + Math.PI + rotation.get()));

    return (
        <View
            style={StyleUtils.getWidthAndHeightStyle(ORBIT_SIZE)}
            aria-hidden
            importantForAccessibility="no-hide-descendants"
        >
            <Svg
                width={variables.connectionOrbitDiameter}
                height={variables.connectionOrbitDiameter}
                style={styles.connectionOrbitRing}
            >
                <Circle
                    cx={RING_RADIUS}
                    cy={RING_RADIUS}
                    r={RING_RADIUS - RING_STROKE_WIDTH}
                    stroke={theme.border}
                    strokeWidth={RING_STROKE_WIDTH}
                    strokeDasharray={RING_DASH_PATTERN}
                    fill="none"
                />
            </Svg>
            <Animated.View style={[styles.connectionOrbitBadge, integrationBadgeStyle]}>
                <Icon
                    src={integrationIcon}
                    width={variables.connectionOrbitBadgeSize}
                    height={variables.connectionOrbitBadgeSize}
                />
            </Animated.View>
            <Animated.View style={[styles.connectionOrbitBadge, expensifyBadgeStyle]}>
                <Icon
                    src={icons.ExpensifyAppIcon}
                    width={variables.connectionOrbitBadgeSize}
                    height={variables.connectionOrbitBadgeSize}
                />
            </Animated.View>
        </View>
    );
}

export default ConnectionOrbitAnimation;
export type {ConnectionOrbitAnimationProps};
