import Badge from '@components/Badge';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';

import InsightsChangeBadge from '@pages/Insights/InsightsChangeBadge';

import CONST from '@src/CONST';
import type {AIInsightChip} from '@src/types/onyx';

import React from 'react';

const SECONDS_PER_HOUR = 60 * 60;
const MINIMUM_HOURS = 0.1;

type InsightsAIChipProps = {
    chip: AIInsightChip;
};

/** Chip with an AI insight's statistic */
function InsightsAIChip({chip}: InsightsAIChipProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate, numberFormat} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Coins', 'Clock', 'Flag']);

    let value: string;
    let neutralIcon = icons.Coins;
    switch (chip.unit) {
        case CONST.INSIGHTS.AI_INSIGHT.CHIP_UNIT.AMOUNT:
            value = convertToShortDisplayString(chip.value, chip.currency);
            break;
        case CONST.INSIGHTS.AI_INSIGHT.CHIP_UNIT.COUNT:
            value = numberFormat(chip.value);
            neutralIcon = icons.Flag;
            break;
        case CONST.INSIGHTS.AI_INSIGHT.CHIP_UNIT.DURATION: {
            if (chip.type === CONST.INSIGHTS.AI_INSIGHT.CHIP_TYPE.NEUTRAL) {
                value = DateUtils.formatAverageDuration(chip.value, translate, numberFormat, true);
                neutralIcon = icons.Clock;
                break;
            }
            const isUnderADay = chip.value < CONST.DATE.SECONDS_PER_DAY;
            const duration = chip.value / (isUnderADay ? SECONDS_PER_HOUR : CONST.DATE.SECONDS_PER_DAY);
            const isBelowPrecision = isUnderADay && duration > 0 && duration < MINIMUM_HOURS;
            const formattedDuration = numberFormat(isBelowPrecision ? MINIMUM_HOURS : duration, {
                style: 'unit',
                unit: isUnderADay ? 'hour' : 'day',
                unitDisplay: 'long',
                maximumFractionDigits: 1,
            });
            value = isBelowPrecision ? `<${formattedDuration}` : formattedDuration;
            break;
        }
        default:
            value = numberFormat(chip.value / 100, {style: 'percent', maximumFractionDigits: 0});
    }

    if (chip.type === CONST.INSIGHTS.AI_INSIGHT.CHIP_TYPE.NEUTRAL) {
        return (
            <Badge
                text={value}
                icon={neutralIcon}
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
