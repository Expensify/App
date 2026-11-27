/** Biggest changes section of the Details panel, listing the items whose spend in the period moved furthest from their own average. */
import ChartOfflineState from '@components/Search/ChartOfflineState';
import type {ChartPeriod} from '@components/Search/comparisonBuckets';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {InsightsBiggestChangesGroupBy, InsightsDetailsBiggestChange} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

import type {InsightsDetailsSectionState} from './insightsDetailsSectionState';

import InsightsBiggestChangeRow from './InsightsBiggestChangeRow';
import InsightsBiggestChangesControl from './InsightsBiggestChangesControl';
import InsightsBiggestChangesSkeleton from './InsightsBiggestChangesSkeleton';
import {getRankingItemKey} from './insightsDetailsItem';
import InsightsDetailsSectionHeader from './InsightsDetailsSectionHeader';
import {INSIGHTS_DETAILS_SECTION_STATE} from './insightsDetailsSectionState';

type InsightsBiggestChangesProps = {
    /** Items of the picked grouping, largest change first */
    changes: InsightsDetailsBiggestChange[] | undefined;

    groupBy: InsightsBiggestChangesGroupBy;

    /** Groupings the user can pick, without Members for people who can't see Top spenders */
    groupByOptions: InsightsBiggestChangesGroupBy[];

    onGroupByChange: (groupBy: InsightsBiggestChangesGroupBy) => void;
    state: InsightsDetailsSectionState;
    currency: string;

    /** Last day the dashboard counted expenses through, passed on to the panels the rows open */
    asOfDate: string | undefined;

    /** The Spend over time period the panel summarizes, which the panels the rows open cover too */
    period: ChartPeriod;
};

function InsightsBiggestChanges({changes, groupBy, groupByOptions, onGroupByChange, state, currency, asOfDate, period}: InsightsBiggestChangesProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const rows = changes?.slice(0, CONST.INSIGHTS.BIGGEST_CHANGES_LIMIT) ?? [];

    if (state === INSIGHTS_DETAILS_SECTION_STATE.READY && rows.length === 0) {
        return null;
    }

    return (
        <View style={[styles.highlightBG, styles.borderRadiusComponentLarge, styles.overflowHidden]}>
            <InsightsDetailsSectionHeader title={translate('insightsPage.biggestChanges')}>
                <InsightsBiggestChangesControl
                    groupBy={groupBy}
                    options={groupByOptions}
                    onChange={onGroupByChange}
                />
            </InsightsDetailsSectionHeader>
            {state === INSIGHTS_DETAILS_SECTION_STATE.OFFLINE && <ChartOfflineState />}
            {state === INSIGHTS_DETAILS_SECTION_STATE.LOADING && <InsightsBiggestChangesSkeleton />}
            {state === INSIGHTS_DETAILS_SECTION_STATE.READY &&
                rows.map((change, index) => (
                    <View
                        key={getRankingItemKey(groupBy, change) ?? index}
                        style={index < rows.length - 1 && styles.borderBottom}
                    >
                        <InsightsBiggestChangeRow
                            change={change}
                            groupBy={groupBy}
                            currency={currency}
                            asOfDate={asOfDate}
                            period={period}
                        />
                    </View>
                ))}
        </View>
    );
}

export default InsightsBiggestChanges;
