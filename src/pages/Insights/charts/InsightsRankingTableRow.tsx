import formatChartCount from '@components/Charts/utils/formatChartCount';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import {buildChartDrillDownQuery} from '@components/Search/chartDrillDown';
import CHART_GROUP_BY_CONFIG from '@components/Search/chartGroupByConfig';
import type {SearchChartCountDimension, SearchGroupBy, SearchQueryJSON} from '@components/Search/types';
import {getCellAccessibilityProps, getRowAccessibilityProps, shouldUseTableSemantics} from '@components/Table/tableAccessibility';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {RankingTableRow} from './buildRankingTableRows';

import InsightsRankingTableChange, {formatRankingTableChange} from './InsightsRankingTableChange';

/** Smaller shares would otherwise be displayed as zero. In percentage points. */
const MIN_WRITTEN_SHARE = 0.1;

type InsightsRankingTableRowProps = {
    row: RankingTableRow;
    groupBy: SearchGroupBy;
    countDimension: SearchChartCountDimension;
    queryJSON: Readonly<SearchQueryJSON> | undefined;
    /** Position on the same scale as the bars, omitted outside average comparison mode */
    averageWidthPercent?: number;
    /** Zero-based data row position, excluding the header */
    rowIndex: number;
    style?: StyleProp<ViewStyle>;
};

function InsightsRankingTableRow({row, groupBy, countDimension, queryJSON, averageWidthPercent, rowIndex, style}: InsightsRankingTableRowProps) {
    const {item, share, barWidthPercent, change} = row;
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate, numberFormat} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {cardPaddingHorizontal} = useLayoutSpacing();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {getLabel, getFilterQuery} = CHART_GROUP_BY_CONFIG[groupBy];
    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowLayout);
    const label = getLabel(item);
    const formattedCount = formatChartCount(item.count, countDimension, translate, numberFormat);
    const formattedAmount = convertToDisplayString(item.total, item.currency);
    const percentOptions = {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    } as const;
    const formattedShare = share > 0 && share < MIN_WRITTEN_SHARE ? `<${numberFormat(MIN_WRITTEN_SHARE / 100, percentOptions)}` : numberFormat(share / 100, percentOptions);
    const changeLabel = change ? formatRankingTableChange(change, translate, numberFormat).accessibilityLabel : undefined;
    const accessibilityLabel = [label, formattedCount, formattedShare, formattedAmount, changeLabel].filter(Boolean).join(', ');
    const cellStyle = [styles.tableRowVerticalPadding, styles.justifyContentCenter];

    const openOnSpend = () => {
        if (!queryJSON) {
            return;
        }
        const query = buildChartDrillDownQuery(queryJSON, getFilterQuery(item));
        if (query) {
            Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query}));
        }
    };

    if (shouldUseNarrowLayout) {
        return (
            <PressableWithFeedback
                onPress={openOnSpend}
                accessibilityRole={CONST.ROLE.BUTTON}
                accessibilityLabel={accessibilityLabel}
                sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.TABLE_ROW}
                style={[cardPaddingHorizontal, styles.tableRowVerticalPaddingCompact, styles.gap3, style]}
                hoverStyle={styles.hoveredComponentBG}
            >
                <View style={[styles.flexRow, styles.alignItemsStart, styles.gap3]}>
                    <View style={[styles.flex1, styles.mnw0, styles.gap1]}>
                        <Text style={styles.breakWord}>{label}</Text>
                        <Text
                            variant="label"
                            style={styles.textSupporting}
                        >
                            {[formattedCount, formattedShare].join(` ${CONST.DOT_SEPARATOR} `)}
                        </Text>
                    </View>
                    <View style={[styles.flexShrink0, styles.alignItemsEnd, styles.gap1]}>
                        <Text>{formattedAmount}</Text>
                        {!!change && <InsightsRankingTableChange change={change} />}
                    </View>
                </View>
                <View style={styles.insightsRankingTableBarTrack}>
                    <View style={styles.insightsRankingTableBar(barWidthPercent)} />
                    {averageWidthPercent !== undefined && (
                        <View style={styles.insightsRankingTableAverageLineAnchor(averageWidthPercent, variables.insightsRankingTableAverageMarkerOverhang)}>
                            <View style={[styles.flex1, styles.insightsRankingTableAverageDashedLine]} />
                        </View>
                    )}
                </View>
            </PressableWithFeedback>
        );
    }

    return (
        <PressableWithFeedback
            onPress={openOnSpend}
            role={isTableSemanticsEnabled ? CONST.ROLE.ROW : CONST.ROLE.BUTTON}
            accessibilityLabel={accessibilityLabel}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.TABLE_ROW}
            style={[styles.flexRow, styles.gap5, styles.tableRowHeight, cardPaddingHorizontal, style]}
            hoverStyle={styles.hoveredComponentBG}
            {...getRowAccessibilityProps(isTableSemanticsEnabled, rowIndex)}
        >
            {({hovered}) => (
                <>
                    <View
                        style={[styles.flex1, styles.mnw0, cellStyle]}
                        {...getCellAccessibilityProps(isTableSemanticsEnabled, 1)}
                    >
                        <Text style={styles.breakWord}>{label}</Text>
                    </View>
                    <View
                        style={styles.insightsRankingTableShareColumn}
                        {...getCellAccessibilityProps(isTableSemanticsEnabled, 2)}
                    >
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                            <View style={styles.insightsRankingTableBar(barWidthPercent)} />
                            {averageWidthPercent !== undefined && (
                                <View style={styles.insightsRankingTableAverageLineAnchor(averageWidthPercent)}>
                                    <View style={[styles.flex1, styles.insightsRankingTableAverageDashedLine]} />
                                </View>
                            )}
                            <Text
                                variant="micro"
                                style={[
                                    styles.textSupporting,
                                    styles.noWrap,
                                    styles.ph2,
                                    // Covers the average line where the two cross, so the percentage stays readable
                                    averageWidthPercent !== undefined && StyleUtils.getBackgroundColorStyle(hovered ? theme.hoverComponentBG : theme.cardBG),
                                ]}
                            >
                                {formattedShare}
                            </Text>
                        </View>
                    </View>
                    <View
                        style={[styles.insightsRankingTableNumberColumn, cellStyle]}
                        {...getCellAccessibilityProps(isTableSemanticsEnabled, 3)}
                    >
                        <Text>{numberFormat(item.count)}</Text>
                    </View>
                    <View
                        style={[styles.insightsRankingTableNumberColumn, styles.alignItemsEnd, cellStyle]}
                        {...getCellAccessibilityProps(isTableSemanticsEnabled, 4)}
                    >
                        <Text>{formattedAmount}</Text>
                    </View>
                    {!!change && (
                        <View
                            style={[styles.insightsRankingTableChangeColumn, cellStyle]}
                            {...getCellAccessibilityProps(isTableSemanticsEnabled, 5)}
                        >
                            <InsightsRankingTableChange change={change} />
                        </View>
                    )}
                </>
            )}
        </PressableWithFeedback>
    );
}

export default InsightsRankingTableRow;
