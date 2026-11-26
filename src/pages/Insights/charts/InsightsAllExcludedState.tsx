/** Stands in for a ranking chart whose every item with data is excluded. The chart has data, so it says the items are excluded rather than showing its empty state. */
import Button from '@components/Button';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {InsightsRankedItems} from '@pages/Insights/dashboardSpecs';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type InsightsAllExcludedStateProps = {
    /** What the chart ranks */
    rankedItems: InsightsRankedItems;

    /** Opens the Exclude panel */
    onEditExclusions: () => void;
};

function InsightsAllExcludedState({rankedItems, onEditExclusions}: InsightsAllExcludedStateProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={styles.forYouEmptyStateContainer}>
            <View style={styles.forYouEmptyStateTextContainer}>
                <Text style={styles.forYouEmptyStateTitle}>{translate(`insightsPage.exclude.allExcluded.${rankedItems}`)}</Text>
                <Text style={styles.forYouEmptyStateDescription}>{translate('insightsPage.exclude.removeAnExclusion')}</Text>
            </View>
            <Button
                size={CONST.BUTTON_SIZE.SMALL}
                onPress={onEditExclusions}
                sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.EDIT_EXCLUSIONS}
            >
                <Button.Text>{translate('insightsPage.exclude.editExclusions')}</Button.Text>
            </Button>
        </View>
    );
}

export default InsightsAllExcludedState;
