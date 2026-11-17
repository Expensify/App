/** Explains the wait for AI insights without blocking the dashboard charts. */
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

const ANIMATION_SIZE = 60;

function InsightsAILoadingIndicator() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const animationStyle = StyleUtils.getWidthAndHeightStyle(ANIMATION_SIZE);

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
            <Text
                variant="text"
                style={[styles.textSupporting, styles.textAlignCenter]}
            >
                {translate('insightsPage.generatingAIInsightsSubtitle')}
            </Text>
        </View>
    );
}

export default InsightsAILoadingIndicator;
