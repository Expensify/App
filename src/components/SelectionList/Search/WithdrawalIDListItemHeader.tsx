import React from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import getBankIcon from '@components/Icon/BankIcons';
import type {ListItem, TransactionWithdrawalIDGroupListItemType} from '@components/SelectionList/types';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import ActionCell from './ActionCell';
import TotalCell from './TotalCell';

type WithdrawalIDListItemHeaderProps<TItem extends ListItem> = {
    /** The withdrawal ID currently being looked at */
    withdrawalID: TransactionWithdrawalIDGroupListItemType;

    /** Callback to fire when the item is pressed */
    onSelectRow: (item: TItem) => void;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress?: (item: TItem) => void;

    /** Whether this section items disabled for selection */
    isDisabled?: boolean | null;

    /** Whether selecting multiple transactions at once is allowed */
    canSelectMultiple: boolean | undefined;
};

function WithdrawalIDListItemHeader<TItem extends ListItem>({
    withdrawalID: withdrawalIDItem,
    onSelectRow,
    onCheckboxPress,
    isDisabled,
    canSelectMultiple,
}: WithdrawalIDListItemHeaderProps<TItem>) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const {icon, iconSize, iconStyles} = getBankIcon({bankName: withdrawalIDItem.bankName, styles});
    const formattedBankName = CONST.BANK_NAMES_USER_FRIENDLY[withdrawalIDItem.bankName] ?? CONST.BANK_NAMES_USER_FRIENDLY[CONST.BANK_NAMES.GENERIC_BANK];
    const formattedWithdrawalDate = DateUtils.formatWithUTCTimeZone(
        withdrawalIDItem.debitPosted,
        DateUtils.doesDateBelongToAPastYear(withdrawalIDItem.debitPosted) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT,
    );
    const shouldShowAction = isLargeScreenWidth;

    return (
        <View>
            <View style={[styles.pv1Half, styles.ph3, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
                    {!!canSelectMultiple && (
                        <Checkbox
                            onPress={() => onCheckboxPress?.(withdrawalIDItem as unknown as TItem)}
                            isChecked={withdrawalIDItem.isSelected}
                            disabled={!!isDisabled || withdrawalIDItem.isDisabledCheckbox}
                            accessibilityLabel={translate('common.select')}
                        />
                    )}
                    <View style={[styles.flexRow, styles.flex1, styles.gap3]}>
                        <Icon
                            src={icon}
                            width={iconSize}
                            height={iconSize}
                            additionalStyles={iconStyles}
                        />
                        <View style={[styles.gapHalf, styles.flexShrink1]}>
                            <TextWithTooltip
                                text={`${formattedBankName} xx${withdrawalIDItem.accountNumber.slice(-4)}`}
                                style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre]}
                            />
                            <TextWithTooltip
                                text={`${formattedWithdrawalDate}  ${translate('common.withdrawalID')}: ${withdrawalIDItem.entryID}`}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                            />
                        </View>
                    </View>
                </View>
                <View style={[styles.flexShrink0, styles.mr3]}>
                    <TotalCell
                        total={withdrawalIDItem.total}
                        currency={withdrawalIDItem.currency}
                    />
                </View>
                {shouldShowAction && (
                    <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.ACTION)]}>
                        <ActionCell
                            action={CONST.SEARCH.ACTION_TYPES.VIEW}
                            goToItem={() => onSelectRow(withdrawalIDItem as unknown as TItem)}
                            isSelected={withdrawalIDItem.isSelected}
                        />
                    </View>
                )}
            </View>
        </View>
    );
}

WithdrawalIDListItemHeader.displayName = 'WithdrawalIDListItemHeader';

export default WithdrawalIDListItemHeader;
