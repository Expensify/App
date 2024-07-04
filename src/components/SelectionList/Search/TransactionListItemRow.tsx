import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import ReceiptImage from '@components/ReceiptImage';
import type {TransactionListItemType} from '@components/SelectionList/types';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {SearchTransactionType} from '@src/types/onyx/SearchResults';
import ActionCell from './ActionCell';
import ExpenseItemHeaderNarrow from './ExpenseItemHeaderNarrow';
import TextWithIconCell from './TextWithIconCell';
import UserInfoCell from './UserInfoCell';

type CellProps = {
    // eslint-disable-next-line react/no-unused-prop-types
    showTooltip: boolean;
    // eslint-disable-next-line react/no-unused-prop-types
    isLargeScreenWidth: boolean;
};

type TransactionCellProps = {
    transactionItem: TransactionListItemType;
} & CellProps;

type TotalCellProps = {
    // eslint-disable-next-line react/no-unused-prop-types
    isChildListItem: boolean;
} & TransactionCellProps;

type TransactionListItemRowProps = {
    item: TransactionListItemType;
    showTooltip: boolean;
    onButtonPress: () => void;
    onCheckboxPress: () => void;
    showItemHeaderOnNarrowLayout?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    isChildListItem?: boolean;
    isDisabled: boolean;
    canSelectMultiple: boolean;
    isButtonSelected?: boolean;
};

const getTypeIcon = (type?: SearchTransactionType) => {
    switch (type) {
        case CONST.SEARCH.TRANSACTION_TYPE.CASH:
            return Expensicons.Cash;
        case CONST.SEARCH.TRANSACTION_TYPE.CARD:
            return Expensicons.CreditCard;
        case CONST.SEARCH.TRANSACTION_TYPE.DISTANCE:
            return Expensicons.Car;
        default:
            return Expensicons.Cash;
    }
};

function ReceiptCell({transactionItem}: TransactionCellProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    return (
        <View
            style={[
                StyleUtils.getWidthAndHeightStyle(variables.h36, variables.w40),
                StyleUtils.getBorderRadiusStyle(variables.componentBorderRadiusSmall),
                StyleUtils.getBackgroundColorStyle(theme.border),
                styles.overflowHidden,
            ]}
        >
            <ReceiptImage
                source={tryResolveUrlFromApiRoot(transactionItem?.receipt?.source ?? '')}
                isEReceipt={transactionItem.hasEReceipt}
                transactionID={transactionItem.transactionID}
                shouldUseThumbnailImage={!transactionItem?.receipt?.source}
                isAuthTokenRequired
                fallbackIcon={Expensicons.ReceiptPlus}
                fallbackIconSize={20}
                fallbackIconColor={theme.icon}
                iconSize="x-small"
            />
        </View>
    );
}

function DateCell({transactionItem, showTooltip, isLargeScreenWidth}: TransactionCellProps) {
    const styles = useThemeStyles();

    const created = TransactionUtils.getCreated(transactionItem);
    const date = DateUtils.formatWithUTCTimeZone(created, DateUtils.doesDateBelongToAPastYear(created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT);

    return (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={date}
            style={[styles.lineHeightLarge, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? undefined : [styles.textMicro, styles.textSupporting]]}
        />
    );
}

function MerchantCell({transactionItem, showTooltip, isLargeScreenWidth}: TransactionCellProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const description = TransactionUtils.getDescription(transactionItem);
    let merchant = transactionItem.shouldShowMerchant ? transactionItem.formattedMerchant : description;

    if (TransactionUtils.hasReceipt(transactionItem) && TransactionUtils.isReceiptBeingScanned(transactionItem) && transactionItem.shouldShowMerchant) {
        merchant = translate('iou.receiptStatusTitle');
    }

    return (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={merchant}
            style={[isLargeScreenWidth ? styles.lineHeightLarge : styles.lh20, styles.pre, styles.justifyContentCenter]}
        />
    );
}

function TotalCell({showTooltip, isLargeScreenWidth, transactionItem}: TotalCellProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currency = TransactionUtils.getCurrency(transactionItem);
    let amount = CurrencyUtils.convertToDisplayString(transactionItem.formattedTotal, currency);

    if (TransactionUtils.hasReceipt(transactionItem) && TransactionUtils.isReceiptBeingScanned(transactionItem)) {
        amount = translate('iou.receiptStatusTitle');
    }

    return (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={amount}
            style={[styles.optionDisplayName, styles.justifyContentCenter, isLargeScreenWidth ? undefined : styles.textAlignRight]}
        />
    );
}

function TypeCell({transactionItem, isLargeScreenWidth}: TransactionCellProps) {
    const theme = useTheme();
    const typeIcon = getTypeIcon(transactionItem.type);

    return (
        <Icon
            src={typeIcon}
            fill={theme.icon}
            height={isLargeScreenWidth ? 20 : 12}
            width={isLargeScreenWidth ? 20 : 12}
        />
    );
}

function CategoryCell({isLargeScreenWidth, showTooltip, transactionItem}: TransactionCellProps) {
    const styles = useThemeStyles();
    return isLargeScreenWidth ? (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={transactionItem?.category}
            style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre, styles.justifyContentCenter]}
        />
    ) : (
        <TextWithIconCell
            icon={Expensicons.Folder}
            showTooltip={showTooltip}
            text={transactionItem?.category}
            textStyle={[styles.textMicro, styles.mnh0]}
        />
    );
}

function TagCell({isLargeScreenWidth, showTooltip, transactionItem}: TransactionCellProps) {
    const styles = useThemeStyles();
    return isLargeScreenWidth ? (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={TransactionUtils.getTagForDisplay(transactionItem)}
            style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre, styles.justifyContentCenter]}
        />
    ) : (
        <TextWithIconCell
            icon={Expensicons.Tag}
            showTooltip={showTooltip}
            text={TransactionUtils.getTagForDisplay(transactionItem)}
            textStyle={[styles.textMicro, styles.mnh0]}
        />
    );
}

function TaxCell({transactionItem, showTooltip}: TransactionCellProps) {
    const styles = useThemeStyles();

    const isFromExpenseReport = transactionItem.reportType === CONST.REPORT.TYPE.EXPENSE;
    const taxAmount = TransactionUtils.getTaxAmount(transactionItem, isFromExpenseReport);
    const currency = TransactionUtils.getCurrency(transactionItem);

    return (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={CurrencyUtils.convertToDisplayString(taxAmount, currency)}
            style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre, styles.justifyContentCenter, styles.textAlignRight]}
        />
    );
}

function TransactionListItemRow({
    item,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onButtonPress,
    onCheckboxPress,
    showItemHeaderOnNarrowLayout = true,
    containerStyle,
    isChildListItem = false,
    isButtonSelected = false,
}: TransactionListItemRowProps) {
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useWindowDimensions();
    const StyleUtils = useStyleUtils();

    if (!isLargeScreenWidth) {
        return (
            <View style={containerStyle}>
                {showItemHeaderOnNarrowLayout && (
                    <ExpenseItemHeaderNarrow
                        participantFrom={item.from}
                        participantFromDisplayName={item.formattedFrom}
                        participantTo={item.to}
                        participantToDisplayName={item.formattedTo}
                        onButtonPress={onButtonPress}
                        action={item.action}
                    />
                )}

                <View style={[styles.flexRow, styles.justifyContentBetween, styles.gap3]}>
                    <ReceiptCell
                        transactionItem={item}
                        isLargeScreenWidth={false}
                        showTooltip={false}
                    />
                    <View style={[styles.flex2, styles.gap1]}>
                        <MerchantCell
                            transactionItem={item}
                            showTooltip={showTooltip}
                            isLargeScreenWidth={false}
                        />
                        <View style={[styles.flexRow, styles.flex1, styles.alignItemsEnd, styles.gap3]}>
                            <CategoryCell
                                isLargeScreenWidth={isLargeScreenWidth}
                                showTooltip={showTooltip}
                                transactionItem={item}
                            />
                            <TagCell
                                showTooltip={showTooltip}
                                transactionItem={item}
                                isLargeScreenWidth={isLargeScreenWidth}
                            />
                        </View>
                    </View>
                    <View style={[styles.alignItemsEnd, styles.flex1, styles.gap1, styles.justifyContentBetween]}>
                        <TotalCell
                            showTooltip={showTooltip}
                            transactionItem={item}
                            isLargeScreenWidth={isLargeScreenWidth}
                            isChildListItem={isChildListItem}
                        />
                        <View style={[styles.flexRow, styles.gap1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                            <TypeCell
                                transactionItem={item}
                                isLargeScreenWidth={isLargeScreenWidth}
                                showTooltip={false}
                            />
                            <DateCell
                                transactionItem={item}
                                showTooltip={showTooltip}
                                isLargeScreenWidth={isLargeScreenWidth}
                            />
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
                    isChecked={item.isSelected}
                    onPress={onCheckboxPress}
                    disabled={!!item.isDisabled || isDisabled}
                    accessibilityLabel={item.text ?? ''}
                    style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), item.isDisabledCheckbox && styles.cursorDisabled]}
                />
            )}
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3, canSelectMultiple && styles.ph4]}>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.RECEIPT)]}>
                    <ReceiptCell
                        transactionItem={item}
                        isLargeScreenWidth={false}
                        showTooltip={false}
                    />
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.DATE, item.shouldShowYear)]}>
                    <DateCell
                        transactionItem={item}
                        showTooltip={showTooltip}
                        isLargeScreenWidth={isLargeScreenWidth}
                    />
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.MERCHANT)]}>
                    <MerchantCell
                        transactionItem={item}
                        showTooltip={showTooltip}
                        isLargeScreenWidth={false}
                    />
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.FROM)]}>
                    <UserInfoCell
                        participant={item.from}
                        displayName={item.formattedFrom}
                    />
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.FROM)]}>
                    <UserInfoCell
                        participant={item.to}
                        displayName={item.formattedTo}
                    />
                </View>
                {item.shouldShowCategory && (
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.CATEGORY)]}>
                        <CategoryCell
                            isLargeScreenWidth={isLargeScreenWidth}
                            showTooltip={showTooltip}
                            transactionItem={item}
                        />
                    </View>
                )}
                {item.shouldShowTag && (
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TAG)]}>
                        <TagCell
                            isLargeScreenWidth={isLargeScreenWidth}
                            showTooltip={showTooltip}
                            transactionItem={item}
                        />
                    </View>
                )}
                {item.shouldShowTax && (
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT)]}>
                        <TaxCell
                            transactionItem={item}
                            isLargeScreenWidth={isLargeScreenWidth}
                            showTooltip={showTooltip}
                        />
                    </View>
                )}

                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT)]}>
                    <TotalCell
                        showTooltip={showTooltip}
                        transactionItem={item}
                        isLargeScreenWidth={isLargeScreenWidth}
                        isChildListItem={isChildListItem}
                    />
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TYPE)]}>
                    <TypeCell
                        transactionItem={item}
                        isLargeScreenWidth={isLargeScreenWidth}
                        showTooltip={false}
                    />
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.ACTION)]}>
                    <ActionCell
                        onButtonPress={onButtonPress}
                        action={item.action}
                        isSelected={isButtonSelected}
                    />
                </View>
            </View>
        </View>
    );
}

TransactionListItemRow.displayName = 'TransactionListItemRow';

export default TransactionListItemRow;
