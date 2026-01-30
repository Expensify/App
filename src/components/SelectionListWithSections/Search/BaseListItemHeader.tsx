import React from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import type {SearchColumnType} from '@components/Search/types';
import type {ListItem, TransactionGroupListItemType} from '@components/SelectionListWithSections/types';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ExpandCollapseArrowButton from './ExpandCollapseArrowButton';
import TextCell from './TextCell';
import TotalCell from './TotalCell';

/** Base group item type that includes common fields used by simple text-based group headers */
type BaseGroupListItemType = TransactionGroupListItemType & {
    /** Number of transactions in the group */
    count: number;

    /** Total value of transactions */
    total: number;

    /** Currency of total value */
    currency: string;
};

/** Supported group column keys for the base header */
type GroupColumnKey =
    | typeof CONST.SEARCH.TABLE_COLUMNS.GROUP_CATEGORY
    | typeof CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT
    | typeof CONST.SEARCH.TABLE_COLUMNS.GROUP_TAG
    | typeof CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH
    | typeof CONST.SEARCH.TABLE_COLUMNS.GROUP_WEEK;

/** Supported column style keys for sizing */
type ColumnStyleKey =
    | typeof CONST.SEARCH.TABLE_COLUMNS.CATEGORY
    | typeof CONST.SEARCH.TABLE_COLUMNS.MERCHANT
    | typeof CONST.SEARCH.TABLE_COLUMNS.TAG
    | typeof CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH
    | typeof CONST.SEARCH.TABLE_COLUMNS.GROUP_WEEK;

type BaseListItemHeaderProps<TItem extends ListItem> = {
    /** The group item being rendered */
    item: BaseGroupListItemType;

    /** The display name to show for this group */
    displayName: string;

    /** The column key for the group name column (e.g., GROUP_CATEGORY, GROUP_MERCHANT) */
    groupColumnKey: GroupColumnKey;

    /** The column style key for sizing (e.g., CATEGORY, MERCHANT) */
    columnStyleKey: ColumnStyleKey;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress?: (item: TItem) => void;

    /** Whether this section items disabled for selection */
    isDisabled?: boolean | null;

    /** Whether selecting multiple transactions at once is allowed */
    canSelectMultiple: boolean | undefined;

    /** Whether all transactions are selected */
    isSelectAllChecked?: boolean;

    /** Whether only some transactions are selected */
    isIndeterminate?: boolean;

    /** Callback for when the down arrow is clicked */
    onDownArrowClick?: () => void;

    /** Whether the down arrow is expanded */
    isExpanded?: boolean;

    /** The visible columns for the header */
    columns?: SearchColumnType[];
};

function BaseListItemHeader<TItem extends ListItem>({
    item,
    displayName,
    groupColumnKey,
    columnStyleKey,
    onCheckboxPress,
    isDisabled,
    canSelectMultiple,
    isSelectAllChecked,
    isIndeterminate,
    isExpanded,
    onDownArrowClick,
    columns,
}: BaseListItemHeaderProps<TItem>) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();

    const columnComponents = {
        [groupColumnKey]: (
            <View
                key={groupColumnKey}
                style={StyleUtils.getReportTableColumnStyles(columnStyleKey)}
            >
                <View style={[styles.gap1, styles.flexShrink1]}>
                    <TextWithTooltip
                        text={displayName}
                        style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre, styles.fontWeightNormal]}
                    />
                </View>
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.EXPENSES)}
            >
                <TextCell text={String(item.count)} />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL, false, false, false, false, false, false, false, true)}
            >
                <TotalCell
                    total={item.total}
                    currency={item.currency}
                />
            </View>
        ),
    };

    return (
        <View>
            <View style={[styles.pv1Half, styles.pl3, styles.flexRow, styles.alignItemsCenter, isLargeScreenWidth ? styles.gap3 : styles.justifyContentStart]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
                    {!!canSelectMultiple && (
                        <Checkbox
                            onPress={() => onCheckboxPress?.(item as unknown as TItem)}
                            isChecked={isSelectAllChecked}
                            isIndeterminate={isIndeterminate}
                            disabled={!!isDisabled || item.isDisabledCheckbox}
                            accessibilityLabel={translate('common.select')}
                            style={isLargeScreenWidth && styles.mr1}
                        />
                    )}
                    {!isLargeScreenWidth && (
                        <View style={[styles.flexRow, styles.flex1, styles.gap3]}>
                            <View style={[styles.gap1, styles.flexShrink1]}>
                                <TextWithTooltip
                                    text={displayName}
                                    style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre, styles.fontWeightNormal]}
                                />
                            </View>
                        </View>
                    )}
                    {isLargeScreenWidth && columns?.map((column) => columnComponents[column as keyof typeof columnComponents])}
                </View>
                {!isLargeScreenWidth && (
                    <View style={[styles.flexShrink0, styles.ml2, styles.mr3, styles.gap1]}>
                        <TotalCell
                            total={item.total}
                            currency={item.currency}
                        />
                        {!!onDownArrowClick && (
                            <ExpandCollapseArrowButton
                                isExpanded={isExpanded}
                                onPress={onDownArrowClick}
                            />
                        )}
                    </View>
                )}
            </View>
        </View>
    );
}

export default BaseListItemHeader;
export type {BaseListItemHeaderProps, BaseGroupListItemType};
