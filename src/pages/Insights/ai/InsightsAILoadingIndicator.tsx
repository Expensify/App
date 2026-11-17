import Icon from '@components/Icon';
import PulsingView from '@components/PulsingView';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

/** Explains the wait for AI insights without blocking the dashboard charts. */
function InsightsAILoadingIndicator() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Sparkles']);

    return (
        <View
            style={[styles.alignItemsCenter, styles.pv12, styles.ph5]}
            role={CONST.ROLE.STATUS}
            accessibilityLiveRegion="polite"
        >
            <PulsingView
                shouldPulse
                style={styles.mb4}
            >
                <Icon
                    src={icons.Sparkles}
                    fill={theme.icon}
                />
            </PulsingView>
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
