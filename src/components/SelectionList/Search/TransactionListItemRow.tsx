import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import type {TransactionListItemType} from '@components/SelectionList/types';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import type {SearchTransactionType} from '@src/types/onyx/SearchResults';
import ExpenseItemHeader from './ExpenseItemHeader';
import TextWithIconCell from './TextWithIconCell';
import UserInfoCell from './UserInfoCell';

type TransactionListItemRowProps = {
    item: TransactionListItemType;
    showTooltip: boolean;
    isDisabled: boolean;
    canSelectMultiple: boolean;
    onButtonPress: () => void;
    showItemHeaderOnNarrowLayout?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
};

const getTypeIcon = (type?: SearchTransactionType) => {
    switch (type) {
        case CONST.SEARCH_TRANSACTION_TYPE.CASH:
            return Expensicons.Cash;
        case CONST.SEARCH_TRANSACTION_TYPE.CARD:
            return Expensicons.CreditCard;
        case CONST.SEARCH_TRANSACTION_TYPE.DISTANCE:
            return Expensicons.Car;
        default:
            return Expensicons.Cash;
    }
};

function getMerchant(item: TransactionListItemType) {
    const merchant = TransactionUtils.getMerchant(item as OnyxEntry<Transaction>);

    if (merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT || merchant === CONST.TRANSACTION.DEFAULT_MERCHANT) {
        return '';
    }

    return merchant;
}

function TransactionListItemRow({item, showTooltip, isDisabled, canSelectMultiple, onButtonPress, showItemHeaderOnNarrowLayout = true, containerStyle}: TransactionListItemRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const {isLargeScreenWidth} = useWindowDimensions();
    const StyleUtils = useStyleUtils();

    const isFromExpenseReport = item.reportType === CONST.REPORT.TYPE.EXPENSE;
    const date = TransactionUtils.getCreated(item as OnyxEntry<Transaction>, CONST.DATE.MONTH_DAY_ABBR_FORMAT);
    const amount = TransactionUtils.getAmount(item as OnyxEntry<Transaction>, isFromExpenseReport);
    const taxAmount = TransactionUtils.getTaxAmount(item as OnyxEntry<Transaction>, isFromExpenseReport);
    const currency = TransactionUtils.getCurrency(item as OnyxEntry<Transaction>);
    const description = TransactionUtils.getDescription(item as OnyxEntry<Transaction>);
    const merchant = getMerchant(item);
    const typeIcon = getTypeIcon(item.type);

    const dateCell = (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={date}
            style={[styles.label, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? undefined : [styles.textMicro, styles.textSupporting]]}
        />
    );

    const merchantCell = (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={item.shouldShowMerchant ? merchant : description}
            style={[styles.optionDisplayName, styles.label, styles.pre, styles.justifyContentCenter]}
        />
    );

    const categoryCell = isLargeScreenWidth ? (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={item?.category}
            style={[styles.optionDisplayName, styles.label, styles.pre, styles.justifyContentCenter]}
        />
    ) : (
        <TextWithIconCell
            icon={Expensicons.Folder}
            showTooltip={showTooltip}
            text={item?.category}
        />
    );

    const tagCell = isLargeScreenWidth ? (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={item?.tag}
            style={[styles.optionDisplayName, styles.label, styles.pre, styles.justifyContentCenter]}
        />
    ) : (
        <TextWithIconCell
            icon={Expensicons.Tag}
            showTooltip={showTooltip}
            text={item?.tag}
        />
    );

    const taxCell = (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={CurrencyUtils.convertToDisplayString(taxAmount, currency)}
            style={[styles.optionDisplayName, styles.label, styles.pre, styles.justifyContentCenter, styles.textAlignRight]}
        />
    );

    const totalCell = (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={CurrencyUtils.convertToDisplayString(amount, currency)}
            style={[styles.optionDisplayName, styles.textNewKansasNormal, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? undefined : styles.textAlignRight]}
        />
    );

    const typeCell = (
        <Icon
            src={typeIcon}
            fill={theme.icon}
            height={isLargeScreenWidth ? 20 : 12}
            width={isLargeScreenWidth ? 20 : 12}
        />
    );

    const actionCell = (
        <Button
            text={translate('common.view')}
            onPress={onButtonPress}
            small
            pressOnEnter
            style={[styles.p0]}
        />
    );

    if (!isLargeScreenWidth) {
        return (
            <View style={containerStyle}>
                {showItemHeaderOnNarrowLayout && (
                    <ExpenseItemHeader
                        participantFrom={item.from}
                        participantTo={item.to}
                        buttonText={translate('common.view')}
                        onButtonPress={onButtonPress}
                    />
                )}

                <View style={[styles.flexRow, styles.justifyContentBetween, styles.gap1]}>
                    <View style={[styles.flex2, styles.gap1]}>
                        {merchantCell}
                        <View style={[styles.flexRow, styles.flex1, styles.alignItemsEnd, styles.gap3]}>
                            {categoryCell}
                            {tagCell}
                        </View>
                    </View>
                    <View style={[styles.alignItemsEnd, styles.flex1, styles.gap1]}>
                        {totalCell}
                        <View style={[styles.flexRow, styles.gap1, styles.justifyContentCenter]}>
                            {typeCell}
                            {dateCell}
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, containerStyle]}>
            {canSelectMultiple && (
                <Checkbox
                    onPress={() => {}}
                    isChecked={item.isSelected}
                    containerStyle={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(Boolean(item.isSelected), Boolean(item.isDisabled))]}
                    disabled={isDisabled || item.isDisabledCheckbox}
                    accessibilityLabel={item.text ?? ''}
                    style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), item.isDisabledCheckbox && styles.cursorDisabled]}
                />
            )}
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.ph4, styles.gap3]}>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.DATE)]}>{dateCell}</View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.MERCHANT)]}>{merchantCell}</View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.FROM)]}>
                    <UserInfoCell participant={item.from} />
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TO)]}>
                    <UserInfoCell participant={item.to} />
                </View>
                {item.shouldShowCategory && <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.CATEGORY)]}>{categoryCell}</View>}
                {item.shouldShowTag && <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TAG)]}>{tagCell}</View>}
                {item.shouldShowTax && <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TAX_AMOUNT)]}>{taxCell}</View>}
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TOTAL)]}>{totalCell}</View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TYPE)]}>{typeCell}</View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.ACTION)]}>{actionCell}</View>
            </View>
        </View>
    );
}

TransactionListItemRow.displayName = 'TransactionListItemRow';

export default TransactionListItemRow;
