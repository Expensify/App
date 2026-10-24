import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {AIInsight} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

type InsightsAICardProps = {
    insight: AIInsight;
};

function InsightsAICard({insight}: InsightsAICardProps) {
    const styles = useThemeStyles();

    return (
        <View style={styles.pl3}>
            <Text
                variant="h2"
                style={styles.insightsAICardText}
            >
                {insight.text}
            </Text>
        </View>
    );
}

export default InsightsAICard;
