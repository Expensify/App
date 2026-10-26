import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {AIInsight, InsightsScope} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

import InsightsExplainButton from './InsightsExplainButton';

type InsightsAICardProps = {
    insight: AIInsight;
    insightsScope: InsightsScope;
};

function InsightsAICard({insight, insightsScope}: InsightsAICardProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.pl3, styles.gap3, styles.justifyContentBetween]}>
            <Text
                variant="h2"
                style={styles.insightsAICardText}
            >
                {insight.text}
            </Text>
            <InsightsExplainButton
                explainPrompt={insight.explainPrompt}
                insightsScope={insightsScope}
                isAccented
            />
        </View>
    );
}

export default InsightsAICard;
