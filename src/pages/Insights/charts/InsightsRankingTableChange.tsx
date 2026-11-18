import type {LocaleContextProps} from '@components/LocaleContextProvider';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import InsightsChangeBadge from '@pages/Insights/InsightsChangeBadge';

import CONST from '@src/CONST';

import React from 'react';

import type {RankingTableChange} from './buildRankingTableRows';

import {RANKING_TABLE_CHANGE} from './buildRankingTableRows';

type InsightsRankingTableChangeProps = {
    change: RankingTableChange;
};

function formatRankingTableChange(change: RankingTableChange, translate: LocaleContextProps['translate'], numberFormat: LocaleContextProps['numberFormat']) {
    if (change.type === RANKING_TABLE_CHANGE.NONE) {
        return {
            text: CONST.INSIGHTS.NO_CHANGE_PLACEHOLDER,
            accessibilityLabel: translate('insightsPage.compare.noChange'),
        };
    }
    if (change.type === RANKING_TABLE_CHANGE.NEW) {
        return {
            text: CONST.INSIGHTS.NO_CHANGE_PLACEHOLDER,
            accessibilityLabel: translate('common.new'),
        };
    }
    const text = numberFormat(change.percent / 100, {
        style: 'percent',
        maximumFractionDigits: 0,
    });
    return {
        text,
        accessibilityLabel: translate(change.type === RANKING_TABLE_CHANGE.INCREASE ? 'insightsPage.compare.increase' : 'insightsPage.compare.decrease', text),
    };
}

/** How a ranking table row's count changed against the previous period */
function InsightsRankingTableChange({change}: InsightsRankingTableChangeProps) {
    const styles = useThemeStyles();
    const {translate, numberFormat} = useLocalize();
    const {text, accessibilityLabel} = formatRankingTableChange(change, translate, numberFormat);

    if (change.type === RANKING_TABLE_CHANGE.NONE || change.type === RANKING_TABLE_CHANGE.NEW) {
        return (
            <Text
                style={styles.textSupporting}
                accessibilityLabel={accessibilityLabel}
            >
                {text}
            </Text>
        );
    }

    return (
        <InsightsChangeBadge
            text={text}
            isIncrease={change.type === RANKING_TABLE_CHANGE.INCREASE}
            style={styles.alignSelfEnd}
        />
    );
}

export default InsightsRankingTableChange;
export {formatRankingTableChange};
