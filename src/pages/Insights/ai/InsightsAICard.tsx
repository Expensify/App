import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {AIInsight, InsightsScope} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

import InsightsAIChip from './InsightsAIChip';
import InsightsExplainButton from './InsightsExplainButton';

const TITLE_MAX_LINES = 2;

type InsightsAICardProps = {
    insight: AIInsight;
    insightsScope: InsightsScope;
};

function InsightsAICard({insight, insightsScope}: InsightsAICardProps) {
    const styles = useThemeStyles();
    const explainScope =
        insight.tagLevel !== undefined && insight.parentTagPath !== undefined ? {...insightsScope, tagLevel: insight.tagLevel, tagParent: insight.parentTagPath} : insightsScope;

    return (
        <View style={[styles.flex1, styles.gap5, styles.justifyContentBetween]}>
            <View style={[styles.ml3, styles.gap2]}>
                <InsightsAIChip chip={insight.chip} />
                <View style={styles.gap3}>
                    <Text
                        variant="textStrong"
                        numberOfLines={TITLE_MAX_LINES}
                    >
                        {insight.title}
                    </Text>
                    <Text
                        variant="label"
                        style={styles.textSupporting}
                    >
                        {insight.summary}
                    </Text>
                </View>
            </View>
            <InsightsExplainButton
                explainPrompt={insight.explainPrompt}
                insightsScope={explainScope}
            />
        </View>
    );
}

export default InsightsAICard;
