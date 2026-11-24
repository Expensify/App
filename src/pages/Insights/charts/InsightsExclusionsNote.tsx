/** Line under a ranking chart's title counting the items the user excluded from it. It never names them, so a shared screen doesn't show who or what was left out. */
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {InsightsRankedItems} from '@pages/Insights/dashboardSpecs';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';

type InsightsExclusionsNoteProps = {
    /** What the chart ranks */
    rankedItems: InsightsRankedItems;

    /** How many items the user excluded, counting ones with no data for the current filters */
    count: number;

    /** Opens the Exclude panel */
    onPress: () => void;
};

function InsightsExclusionsNote({rankedItems, count, onPress}: InsightsExclusionsNoteProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['EyeDisabled']);
    const text = translate(`insightsPage.exclude.excluding.${rankedItems}`, {count});

    return (
        <PressableWithFeedback
            onPress={onPress}
            accessibilityRole={CONST.ROLE.BUTTON}
            accessibilityLabel={text}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.EXCLUSIONS_NOTE}
            style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.alignSelfStart]}
        >
            <Icon
                src={icons.EyeDisabled}
                fill={theme.icon}
                width={variables.iconSizeExtraSmall}
                height={variables.iconSizeExtraSmall}
            />
            <Text
                variant="label"
                style={styles.textSupporting}
                numberOfLines={1}
            >
                {text}
            </Text>
        </PressableWithFeedback>
    );
}

export default InsightsExclusionsNote;
