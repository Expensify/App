import Badge from '@components/Badge';
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

/** How a ranking table row's count changed against the previous period, right-aligned in its cell */
function InsightsRankingTableChange({change}: InsightsRankingTableChangeProps) {
    const styles = useThemeStyles();
    const {translate, numberFormat} = useLocalize();

    if (change.type === RANKING_TABLE_CHANGE.NONE) {
        return <Text style={styles.textSupporting}>{CONST.INSIGHTS.NO_CHANGE_PLACEHOLDER}</Text>;
    }

    if (change.type === RANKING_TABLE_CHANGE.NEW) {
        return (
            <Badge
                text={translate('common.new')}
                badgeStyles={[styles.ml0, styles.alignSelfEnd]}
            />
        );
    }

    return (
        <InsightsChangeBadge
            text={numberFormat(change.percent / 100, {style: 'percent', maximumFractionDigits: 0})}
            isIncrease={change.type === RANKING_TABLE_CHANGE.INCREASE}
            style={styles.alignSelfEnd}
        />
    );
}

export default InsightsRankingTableChange;
