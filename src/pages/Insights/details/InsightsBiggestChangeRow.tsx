/** Row of Biggest changes: the item's icon, name and spend in the period, with how much that changed from its own average. */
import UserAvatar from '@components/Avatar/UserAvatar';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {ChartPeriod} from '@components/Search/comparisonBuckets';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {usePersonalDetail} from '@hooks/usePersonalDetails';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {format} from '@libs/NumberFormatUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {InsightsBiggestChangesGroupBy, InsightsDetailsBiggestChange} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

import {getRankingItemKey, resolveInsightsDetailsItem} from './insightsDetailsItem';

/** A pressed row opens the item's panel from the chart that ranks it, e.g. Top categories for a category */
const ITEM_GRAPH_KEYS = {
    [CONST.SEARCH.GROUP_BY.CATEGORY]: CONST.INSIGHTS.GRAPH.TOP_CATEGORIES,
    [CONST.SEARCH.GROUP_BY.MERCHANT]: CONST.INSIGHTS.GRAPH.TOP_MERCHANTS,
    [CONST.SEARCH.GROUP_BY.FROM]: CONST.INSIGHTS.GRAPH.TOP_SPENDERS,
} as const satisfies Record<InsightsBiggestChangesGroupBy, string>;

type InsightsBiggestChangeRowProps = {
    change: InsightsDetailsBiggestChange;
    groupBy: InsightsBiggestChangesGroupBy;
    currency: string;
    asOfDate: string | undefined;
    period: ChartPeriod;
};

function InsightsBiggestChangeRow({change, groupBy, currency, asOfDate, period}: InsightsBiggestChangeRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate, preferredLocale, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowUpLong', 'ArrowDownLong', 'Folder', 'Basket']);
    const accountID = 'accountID' in change ? change.accountID : undefined;
    const [member] = usePersonalDetail(accountID);
    const itemKey = getRankingItemKey(groupBy, change);
    const title = itemKey === undefined ? undefined : resolveInsightsDetailsItem({groupBy, itemKey, member, dateFnsLocale, translate})?.title;

    const difference = change.total - change.average;
    const isIncrease = difference > 0;
    const changeColor = StyleUtils.getSpendChangeColor(isIncrease);
    const amount = convertToDisplayString(change.total, currency);
    const differenceAmount = convertToDisplayString(Math.abs(difference), currency);
    const percentage =
        change.average === 0
            ? CONST.INSIGHTS.NO_CHANGE_PLACEHOLDER
            : format(preferredLocale, difference / Math.abs(change.average), {style: 'percent', maximumFractionDigits: 1, signDisplay: 'exceptZero'});

    const openItem = () => {
        if (itemKey === undefined) {
            return;
        }
        Navigation.navigate(
            ROUTES.INSIGHTS_DETAILS.getRoute({
                dashboardID: CONST.INSIGHTS.DASHBOARD.SPEND,
                graphKey: ITEM_GRAPH_KEYS[groupBy],
                itemKey,
                periodStart: period.start,
                periodEnd: period.end,
                asOfDate,
            }),
        );
    };

    return (
        <PressableWithFeedback
            onPress={openItem}
            accessibilityRole={CONST.ROLE.BUTTON}
            accessibilityLabel={[title, amount, differenceAmount, percentage].filter(Boolean).join(', ')}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.DETAILS_BIGGEST_CHANGE}
            style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.p4]}
            hoverStyle={styles.hoveredComponentBG}
        >
            <View
                style={[
                    StyleUtils.getWidthAndHeightStyle(variables.insightsBiggestChangeIconFrameWidth, variables.insightsBiggestChangeIconFrameHeight),
                    styles.alignItemsCenter,
                    styles.justifyContentCenter,
                ]}
            >
                {accountID === undefined ? (
                    <Icon
                        src={groupBy === CONST.SEARCH.GROUP_BY.MERCHANT ? icons.Basket : icons.Folder}
                        fill={theme.icon}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                    />
                ) : (
                    <UserAvatar
                        size={CONST.AVATAR_SIZE.SMALL}
                        source={member?.avatar}
                        accountID={accountID}
                    />
                )}
            </View>
            <View style={[styles.flex1, styles.mnw0, styles.gap1]}>
                <Text numberOfLines={1}>{title}</Text>
                <Text
                    variant="label"
                    style={styles.textSupporting}
                >
                    {amount}
                </Text>
            </View>
            <View style={[styles.alignItemsEnd, styles.gap1]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
                    {difference !== 0 && (
                        <Icon
                            src={isIncrease ? icons.ArrowUpLong : icons.ArrowDownLong}
                            fill={changeColor}
                            width={variables.iconSizeExtraSmall}
                            height={variables.iconSizeExtraSmall}
                        />
                    )}
                    <Text style={difference === 0 ? styles.textSupporting : StyleUtils.getColorStyle(changeColor)}>{differenceAmount}</Text>
                </View>
                <Text
                    variant="label"
                    style={styles.textSupporting}
                >
                    {percentage}
                </Text>
            </View>
        </PressableWithFeedback>
    );
}

export default InsightsBiggestChangeRow;
