import React from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import getBankIcon from '@components/Icon/BankIcons';
import type {ListItem, TransactionBankWithdrawalGroupListItemType} from '@components/SelectionList/types';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';

type BankWithdrawalListItemHeaderProps<TItem extends ListItem> = {
    /** The bank currently being looked at */
    bank: TransactionBankWithdrawalGroupListItemType;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress?: (item: TItem) => void;

    /** Whether this section items disabled for selection */
    isDisabled?: boolean | null;

    /** Whether the item is hovered */
    isHovered?: boolean;

    /** Whether the item is focused */
    isFocused?: boolean;

    /** Whether selecting multiple transactions at once is allowed */
    canSelectMultiple: boolean | undefined;
};

function BankWithdrawalListItemHeader<TItem extends ListItem>({bank: bankItem, onCheckboxPress, isDisabled, canSelectMultiple}: BankWithdrawalListItemHeaderProps<TItem>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const {icon, iconSize, iconStyles} = getBankIcon({bankName: bankItem.bankName, styles});
    const formattedBankName = CONST.BANK_NAMES_USER_FRIENDLY[bankItem.bankName];
    const formattedWithdrawalDate = DateUtils.formatWithUTCTimeZone(
        bankItem.withdrawalDate,
        DateUtils.doesDateBelongToAPastYear(bankItem.withdrawalDate) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT,
    );

    // s77rt add total cell, action cell and collapse/expand button

    return (
        <View>
            <View style={[styles.pv1Half, styles.ph3, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
                    {!!canSelectMultiple && (
                        <Checkbox
                            onPress={() => onCheckboxPress?.(bankItem as unknown as TItem)}
                            isChecked={bankItem.isSelected}
                            disabled={!!isDisabled || bankItem.isDisabledCheckbox}
                            accessibilityLabel={translate('common.select')}
                        />
                    )}
                    <View style={[styles.flexRow, styles.gap3]}>
                        <Icon
                            src={icon}
                            width={iconSize}
                            height={iconSize}
                            additionalStyles={iconStyles}
                        />
                        <View style={[styles.gapHalf]}>
                            <TextWithTooltip
                                text={`${formattedBankName} (${translate('bankAccount.accountEnding')} ${bankItem.lastFourPAN})`}
                                style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre]}
                            />
                            <TextWithTooltip
                                text={`${formattedWithdrawalDate}  ${translate('common.entryID')}: ${bankItem.entryID}`}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                            />
                        </View>
                    </View>
                </View>
            </View>
            <View style={[styles.pv2, styles.ph3]}>
                <View style={[styles.borderBottom]} />
            </View>
        </View>
    );
}

BankWithdrawalListItemHeader.displayName = 'BankWithdrawalListItemHeader';

export default BankWithdrawalListItemHeader;
