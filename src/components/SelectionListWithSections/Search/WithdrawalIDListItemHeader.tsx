import React, {useMemo} from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import getBankIcon from '@components/Icon/BankIcons';
import type {ListItem, TransactionWithdrawalIDGroupListItemType} from '@components/SelectionListWithSections/types';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import BankAccountCell from './BankAccountCell';
import ExpandCollapseArrowButton from './ExpandCollapseArrowButton';
import ExpensesCell from './ExpensesCell';
import TotalCell from './TotalCell';

type WithdrawalIDListItemHeaderProps<TItem extends ListItem> = {
    /** The withdrawal ID currently being looked at */
    withdrawalID: TransactionWithdrawalIDGroupListItemType;

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
};

function WithdrawalIDListItemHeader<TItem extends ListItem>({
    withdrawalID: withdrawalIDItem,
    onCheckboxPress,
    isDisabled,
    canSelectMultiple,
    isIndeterminate,
    isSelectAllChecked,
    onDownArrowClick,
    isExpanded,
}: WithdrawalIDListItemHeaderProps<TItem>) {
    const {isLargeScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {icon, iconSize, iconStyles} = getBankIcon({bankName: withdrawalIDItem.bankName, styles});
    const accountLabel = useMemo(() => {
        const formattedBankName = CONST.BANK_NAMES_USER_FRIENDLY[withdrawalIDItem.bankName] ?? CONST.BANK_NAMES_USER_FRIENDLY[CONST.BANK_NAMES.GENERIC_BANK];
        const maskedNumber = withdrawalIDItem.accountNumber ? `xx${withdrawalIDItem.accountNumber.slice(-4)}` : '';

        return `${formattedBankName} ${maskedNumber}`;
    }, [withdrawalIDItem.accountNumber, withdrawalIDItem.bankName]);

    const checkbox = useMemo(
        () =>
            canSelectMultiple ? (
                <Checkbox
                    onPress={() => onCheckboxPress?.(withdrawalIDItem as unknown as TItem)}
                    isChecked={isSelectAllChecked}
                    disabled={!!isDisabled || withdrawalIDItem.isDisabledCheckbox}
                    accessibilityLabel={translate('common.select')}
                    isIndeterminate={isIndeterminate}
                    style={[styles.mr1]}
                />
            ) : null,
        [canSelectMultiple, isSelectAllChecked, isDisabled, withdrawalIDItem, translate, isIndeterminate, styles.mr1, onCheckboxPress],
    );

    if (!isLargeScreenWidth) {
        return (
            <View style={[styles.pv1Half, styles.pl3, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
                    {checkbox}
                    <BankAccountCell
                        icon={icon}
                        iconSize={iconSize}
                        iconStyles={iconStyles}
                        title={accountLabel}
                        subtitle={withdrawalIDItem.formattedWithdrawalDate ?? ''}
                    />
                </View>
                <View style={[styles.flexShrink0, styles.mr3, styles.gap1]}>
                    <TotalCell
                        total={withdrawalIDItem.total}
                        currency={withdrawalIDItem.currency}
                    />
                    {!!onDownArrowClick && (
                        <ExpandCollapseArrowButton
                            isExpanded={isExpanded ?? false}
                            onPress={onDownArrowClick}
                        />
                    )}
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.pv1Half, styles.pl3, styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
            {checkbox}
            <View style={[styles.flexRow, styles.flex1, styles.alignItemsCenter, styles.gap3]}>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.BANK_ACCOUNT)]}>
                    <BankAccountCell
                        icon={icon}
                        iconSize={iconSize}
                        iconStyles={iconStyles}
                        title={accountLabel}
                    />
                </View>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.WITHDRAWN)]}>
                    <TextWithTooltip
                        text={withdrawalIDItem.formattedWithdrawalDate ?? ''}
                        style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre]}
                    />
                </View>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.WITHDRAWAL_ID)]}>
                    <TextWithTooltip
                        text={withdrawalIDItem.entryID?.toString() ?? ''}
                        style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre]}
                    />
                </View>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.EXPENSES)]}>
                    <ExpensesCell count={withdrawalIDItem.count} />
                </View>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL)]}>
                    <TotalCell
                        total={withdrawalIDItem.total}
                        currency={withdrawalIDItem.currency}
                    />
                </View>
            </View>
        </View>
    );
}

WithdrawalIDListItemHeader.displayName = 'WithdrawalIDListItemHeader';

export default WithdrawalIDListItemHeader;
