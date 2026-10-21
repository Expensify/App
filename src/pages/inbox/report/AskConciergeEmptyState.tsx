import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';

import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming} from 'react-native-reanimated';

const ILLUSTRATION_NAMES = ['ConciergeBot'] as const;
const ILLUSTRATION_SIZE = 68;

// Matches the drift the home page's Concierge illustration has: far enough to notice, slow enough to ignore.
const CONCIERGE_BOB_DISTANCE = 4;
const CONCIERGE_BOB_DURATION = 1500;

function AskConciergeEmptyState() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(ILLUSTRATION_NAMES);
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const bobOffset = useSharedValue(0);

    useEffect(() => {
        if (isReduceMotionEnabled) {
            cancelAnimation(bobOffset);
            bobOffset.set(0);
            return;
        }

        bobOffset.set(withRepeat(withTiming(-CONCIERGE_BOB_DISTANCE, {duration: CONCIERGE_BOB_DURATION, easing: Easing.inOut(Easing.ease)}), -1, true));

        return () => cancelAnimation(bobOffset);
    }, [isReduceMotionEnabled, bobOffset]);

    const bobStyle = useAnimatedStyle(() => ({transform: [{translateY: bobOffset.get()}]}));

    return (
        <View
            testID="AskConciergeEmptyState"
            style={styles.askConciergeEmptyStateContainer}
        >
            <Animated.View style={bobStyle}>
                <ImageSVG
                    src={illustrations.ConciergeBot}
                    width={ILLUSTRATION_SIZE}
                    height={ILLUSTRATION_SIZE}
                />
            </Animated.View>
            <Text style={styles.askConciergeEmptyStateTitle}>{translate('reportActionsView.askMeAnything')}</Text>
            <Text style={styles.askConciergeEmptyStateDescription}>{translate('common.concierge.welcomeDescription')}</Text>
        </View>
    );
}

export default AskConciergeEmptyState;
