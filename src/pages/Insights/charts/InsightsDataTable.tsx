import UserAvatar from '@components/Avatar/UserAvatar';
import type {TransactionCardGroupListItemType, TransactionMemberGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import type {GroupedItem, SearchChartDataRow} from '@components/Search/types';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import InsightsDataTableSkeleton from './InsightsDataTableSkeleton';

/** Placeholder rows while loading */
const SKELETON_ROW_COUNT = 5;

type InsightsDataTableProps = {
    /** The plotted groups, prepared by `SearchChartView` */
    rows: SearchChartDataRow[];

    isLoading?: boolean;
};

/** Narrows a group to the member-based variants, the ones carrying the person's avatar and account ID. */
function isMemberGroup(item: GroupedItem): item is TransactionMemberGroupListItemType | TransactionCardGroupListItemType {
    return item.groupedBy === CONST.SEARCH.GROUP_BY.FROM || item.groupedBy === CONST.SEARCH.GROUP_BY.CARD;
}

function InsightsDataTable({rows, isLoading}: InsightsDataTableProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {convertToDisplayString} = useCurrencyListActions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    if (isLoading) {
        return <InsightsDataTableSkeleton fixedNumItems={SKELETON_ROW_COUNT} />;
    }

    if (rows.length === 0) {
        return null;
    }

    return (
        <View style={[styles.chartInlineTable, shouldUseNarrowLayout ? styles.ph5 : styles.ph8]}>
            {rows.map(({item, point, color}) => (
                <View
                    key={item.keyForList}
                    style={[styles.flexRow, styles.alignItemsStart, styles.gap5]}
                >
                    <View style={[styles.flex1, styles.mnw0, styles.flexRow, styles.alignItemsStart, styles.gap4]}>
                        {isMemberGroup(item) ? (
                            <View style={[styles.chartInlineTableAvatarBorder, !!color && StyleUtils.getBorderColorStyle(color)]}>
                                <UserAvatar
                                    size={CONST.AVATAR_SIZE.XXX_SMALL}
                                    source={item.avatar}
                                    accountID={item.accountID}
                                />
                            </View>
                        ) : (
                            <View style={[styles.chartInlineTableDot, !!color && StyleUtils.getBackgroundColorStyle(color)]} />
                        )}
                        <Text style={[styles.flex1, styles.mnw0, styles.breakWord]}>{point.label}</Text>
                    </View>
                    <Text style={[styles.flexShrink0, styles.textAlignRight]}>{convertToDisplayString(item.total ?? 0, item.currency)}</Text>
                </View>
            ))}
        </View>
    );
}

export default InsightsDataTable;
