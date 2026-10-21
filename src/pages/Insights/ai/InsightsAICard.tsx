import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {InsightsCard} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

type InsightsAICardProps = {
    card: InsightsCard;
};

function InsightsAICard({card}: InsightsAICardProps) {
    const styles = useThemeStyles();

    return (
        <View style={styles.pl3}>
            <Text
                variant="h2"
                style={styles.insightsAICardText}
            >
                {card.text}
            </Text>
        </View>
    );
}

export default InsightsAICard;
