import React from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import type {SearchColumnType} from '@components/Search/types';
import type {ListItem, TransactionMerchantGroupListItemType} from '@components/SelectionListWithSections/types';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ExpandCollapseArrowButton from './ExpandCollapseArrowButton';
import TextCell from './TextCell';
import TotalCell from './TotalCell';

type MerchantListItemHeaderProps<TItem extends ListItem> = {
    /** The merchant group currently being looked at */
    merchant: TransactionMerchantGroupListItemType;

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

function MerchantListItemHeader<TItem extends ListItem>({
    merchant: merchantItem,
    onCheckboxPress,
    isDisabled,
    canSelectMultiple,
    isSelectAllChecked,
    isIndeterminate,
    isExpanded,
    onDownArrowClick,
    columns,
}: MerchantListItemHeaderProps<TItem>) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();
    const formattedMerchant = merchantItem.formattedMerchant ?? merchantItem.merchant;

    const columnComponents = {
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.MERCHANT)}
            >
                <View style={[styles.gap1, styles.flexShrink1]}>
                    <TextWithTooltip
                        text={formattedMerchant}
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
                <TextCell text={String(merchantItem.count)} />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL, false, false, false, false, false, false, false, true)}
            >
                <TotalCell
                    total={merchantItem.total}
                    currency={merchantItem.currency}
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
                            onPress={() => onCheckboxPress?.(merchantItem as unknown as TItem)}
                            isChecked={isSelectAllChecked}
                            isIndeterminate={isIndeterminate}
                            disabled={!!isDisabled || merchantItem.isDisabledCheckbox}
                            accessibilityLabel={translate('common.select')}
                            style={isLargeScreenWidth && styles.mr1}
                        />
                    )}
                    {!isLargeScreenWidth && (
                        <View style={[styles.flexRow, styles.flex1, styles.gap3]}>
                            <View>
                                <Icon
                                    src={Expensicons.Receipt}
                                    fill={theme.icon}
                                    width={36}
                                    height={36}
                                />
                            </View>
                            <View style={[styles.gap1, styles.flexShrink1]}>
                                <TextWithTooltip
                                    text={formattedMerchant}
                                    style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre, styles.fontWeightNormal]}
                                />
                            </View>
                        </View>
                    )}
                    {isLargeScreenWidth && (
                        <>
                            <View style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.AVATAR)}>
                                <Icon
                                    src={Expensicons.Receipt}
                                    fill={theme.icon}
                                    width={36}
                                    height={36}
                                />
                            </View>

                            {columns?.map((column) => columnComponents[column as keyof typeof columnComponents])}
                        </>
                    )}
                </View>
                {!isLargeScreenWidth && (
                    <View style={[[styles.flexShrink0, styles.mr3, styles.gap1]]}>
                        <TotalCell
                            total={merchantItem.total}
                            currency={merchantItem.currency}
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

MerchantListItemHeader.displayName = 'MerchantListItemHeader';

export default MerchantListItemHeader;
