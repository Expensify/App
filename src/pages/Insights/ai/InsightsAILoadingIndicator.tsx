/** Explains the wait for AI insights without blocking the dashboard charts. */
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';

import INSIGHTS_DASHBOARD_SPECS from '@pages/Insights/dashboardSpecs';

import {lineHeightScale} from '@styles/typography';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {InsightsSearchKey} from '@src/types/onyx';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import Animated, {FadeInDown, FadeOutUp} from 'react-native-reanimated';

const MESSAGE_INTERVAL_MS = 2000;
const MESSAGE_TRANSITION_DURATION_MS = 200;
const ENTERING_MESSAGE = FadeInDown.duration(MESSAGE_TRANSITION_DURATION_MS);
const EXITING_MESSAGE = FadeOutUp.duration(MESSAGE_TRANSITION_DURATION_MS);

type InsightsAILoadingIndicatorProps = {
    searchKey: InsightsSearchKey;
};

function InsightsAILoadingIndicator({searchKey}: InsightsAILoadingIndicatorProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const animationStyle = StyleUtils.getWidthAndHeightStyle(variables.insightsAILoadingAnimationSize);
    const messageMinHeightStyle = StyleUtils.getMinimumHeight(lineHeightScale.text * variables.insightsAIReservedTextLines);
    const isReducedMotionEnabled = Accessibility.useReducedMotion();
    const [messageIndex, setMessageIndex] = useState(0);
    const chartTitleKey = Object.values(INSIGHTS_DASHBOARD_SPECS).find((dashboard) => dashboard.searchKey === searchKey)?.headlineChart.titleKey;
    const messages = [
        translate('insightsPage.generatingAIInsightsSubtitle'),
        translate('insightsPage.readingChart', chartTitleKey ? translate(chartTitleKey) : translate('common.insights')),
        translate('insightsPage.comparingWithYourAverage'),
        translate('insightsPage.lookingForAnythingUnusual'),
        translate('insightsPage.writingYourInsights'),
    ];
    const lastMessageIndex = messages.length - 1;

    useEffect(() => {
        // These are timed loading hints, not backend progress. Keep the last hint until insights arrive.
        if (messageIndex === lastMessageIndex) {
            return;
        }

        const timeout = setTimeout(() => setMessageIndex((index) => index + 1), MESSAGE_INTERVAL_MS);
        return () => clearTimeout(timeout);
    }, [lastMessageIndex, messageIndex]);

    return (
        <View
            style={[styles.alignItemsCenter, styles.pv12, styles.ph5]}
            role={CONST.ROLE.STATUS}
            accessibilityLiveRegion="polite"
        >
            <View style={styles.mb4}>
                <Lottie
                    source={LottieAnimations.SparkleRotate}
                    autoPlay
                    loop
                    style={animationStyle}
                    webStyle={animationStyle}
                />
            </View>
            <Text
                variant="textStrong"
                style={[styles.textAlignCenter, styles.mb1]}
            >
                {translate('insightsPage.generatingAIInsights')}
            </Text>
            <View style={[styles.overflowHidden, styles.alignSelfStretch, messageMinHeightStyle]}>
                <Animated.View
                    key={messageIndex}
                    entering={!isReducedMotionEnabled && messageIndex > 0 ? ENTERING_MESSAGE : undefined}
                    exiting={isReducedMotionEnabled ? undefined : EXITING_MESSAGE}
                >
                    <Text
                        variant="text"
                        style={[styles.textSupporting, styles.textAlignCenter]}
                    >
                        {messages.at(messageIndex)}
                    </Text>
                </Animated.View>
            </View>
        </View>
    );
}

export default InsightsAILoadingIndicator;
