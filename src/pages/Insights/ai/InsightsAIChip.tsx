import Badge from '@components/Badge';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {convertToShortDisplayString} from '@libs/CurrencyUtils';

import InsightsChangeBadge from '@pages/Insights/InsightsChangeBadge';

import CONST from '@src/CONST';
import type {AIInsightChip} from '@src/types/onyx';

import React from 'react';

type InsightsAIChipProps = {
    chip: AIInsightChip;
};

/** Chip with an AI insight's statistic */
function InsightsAIChip({chip}: InsightsAIChipProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {numberFormat} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Coins']);

    const value =
        chip.unit === CONST.INSIGHTS.AI_INSIGHT.CHIP_UNIT.AMOUNT
            ? convertToShortDisplayString(chip.value, chip.currency)
            : numberFormat(chip.value / 100, {style: 'percent', maximumFractionDigits: 0});

    if (chip.type === CONST.INSIGHTS.AI_INSIGHT.CHIP_TYPE.NEUTRAL) {
        return (
            <Badge
                text={value}
                icon={icons.Coins}
                iconFill={theme.badgeInfoText}
                badgeStyles={[styles.ml0, styles.alignSelfStart, StyleUtils.getBackgroundAndBorderStyle(theme.badgeInfoBG)]}
                textStyles={StyleUtils.getColorStyle(theme.badgeInfoText)}
            />
        );
    }

    return (
        <InsightsChangeBadge
            text={value}
            isIncrease={chip.direction === CONST.INSIGHTS.AI_INSIGHT.CHIP_DIRECTION.INCREASE}
            style={styles.alignSelfStart}
        />
    );
}

export default InsightsAIChip;
