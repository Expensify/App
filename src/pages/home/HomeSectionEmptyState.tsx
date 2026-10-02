import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';

import type IconAsset from '@src/types/utils/IconAsset';

import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming} from 'react-native-reanimated';

const ILLUSTRATION_SIZE = 68;

// The same drift the Concierge illustration has elsewhere on the page.
const BOB_DISTANCE = 4;
const BOB_DURATION = 1500;

type HomeSectionEmptyStateProps = {
    /** Illustration rendered above the text. */
    illustration: IconAsset | undefined;

    /** Title shown below the illustration. */
    title: string;

    /** Supporting description shown below the title. */
    description: string;

    /** Optional test identifier for the container. */
    testID?: string;

    /** Whether the illustration drifts up and down on a loop */
    shouldBobIllustration?: boolean;
};

function HomeSectionEmptyState({illustration, title, description, testID, shouldBobIllustration = false}: HomeSectionEmptyStateProps) {
    const styles = useThemeStyles();
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const bobOffset = useSharedValue(0);

    useEffect(() => {
        if (!shouldBobIllustration || isReduceMotionEnabled) {
            cancelAnimation(bobOffset);
            bobOffset.set(0);
            return;
        }

        bobOffset.set(withRepeat(withTiming(-BOB_DISTANCE, {duration: BOB_DURATION, easing: Easing.inOut(Easing.ease)}), -1, true));

        return () => cancelAnimation(bobOffset);
    }, [shouldBobIllustration, isReduceMotionEnabled, bobOffset]);

    const bobStyle = useAnimatedStyle(() => ({transform: [{translateY: bobOffset.get()}]}));

    return (
        <View
            testID={testID}
            style={styles.forYouEmptyStateContainer}
        >
            <Animated.View style={bobStyle}>
                <ImageSVG
                    src={illustration}
                    width={ILLUSTRATION_SIZE}
                    height={ILLUSTRATION_SIZE}
                />
            </Animated.View>
            <View style={styles.forYouEmptyStateTextContainer}>
                <Text style={styles.forYouEmptyStateTitle}>{title}</Text>
                <Text style={styles.forYouEmptyStateDescription}>{description}</Text>
            </View>
        </View>
    );
}

export default HomeSectionEmptyState;
