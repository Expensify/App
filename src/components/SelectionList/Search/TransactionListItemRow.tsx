import React, {memo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Button from '@components/Button';
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
import * as TransactionUtils from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {SearchTransactionType} from '@src/types/onyx/SearchResults';
import ExpenseItemHeaderNarrow from './ExpenseItemHeaderNarrow';
import TextWithIconCell from './TextWithIconCell';
import UserInfoCell from './UserInfoCell';

type CellProps = {
    // eslint-disable-next-line react/no-unused-prop-types
    showTooltip: boolean;
    // eslint-disable-next-line react/no-unused-prop-types
    keyForList: string;
    // eslint-disable-next-line react/no-unused-prop-types
    isLargeScreenWidth: boolean;
};

type TransactionCellProps = {
    transactionItem: TransactionListItemType;
} & CellProps;

type ReceiptCellProps = {
    isHovered?: boolean;
} & TransactionCellProps;

type ActionCellProps = {
    onButtonPress: () => void;
} & CellProps;

type TransactionListItemRowProps = {
    item: TransactionListItemType;
    showTooltip: boolean;
    onButtonPress: () => void;
    showItemHeaderOnNarrowLayout?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    isHovered?: boolean;
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

function arePropsEqual(prevProps: CellProps, nextProps: CellProps) {
    return prevProps.keyForList === nextProps.keyForList;
}

function areReceiptPropsEqual(prevProps: ReceiptCellProps, nextProps: ReceiptCellProps) {
    return prevProps.keyForList === nextProps.keyForList && prevProps.isHovered === nextProps.isHovered;
}

const ReceiptCell = memo(({transactionItem, isHovered = false}: ReceiptCellProps) => {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    return (
        <View style={[StyleUtils.getWidthAndHeightStyle(variables.h36, variables.w40), StyleUtils.getBorderRadiusStyle(variables.componentBorderRadiusSmall), styles.overflowHidden]}>
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
                isHovered={isHovered}
            />
        </View>
    );
}, areReceiptPropsEqual);

const DateCell = memo(({transactionItem, showTooltip, isLargeScreenWidth}: TransactionCellProps) => {
    const styles = useThemeStyles();
    const date = TransactionUtils.getCreated(transactionItem, CONST.DATE.MONTH_DAY_ABBR_FORMAT);

    return (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={date}
            style={[styles.label, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? undefined : [styles.textMicro, styles.textSupporting]]}
        />
    );
}, arePropsEqual);

const MerchantCell = memo(({transactionItem, showTooltip}: TransactionCellProps) => {
    const styles = useThemeStyles();
    const description = TransactionUtils.getDescription(transactionItem);

    return (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={transactionItem.shouldShowMerchant ? transactionItem.formattedMerchant : description}
            style={[styles.label, styles.pre, styles.justifyContentCenter]}
        />
    );
}, arePropsEqual);

const TotalCell = memo(({showTooltip, isLargeScreenWidth, transactionItem}: TransactionCellProps) => {
    const styles = useThemeStyles();
    const currency = TransactionUtils.getCurrency(transactionItem);

    return (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={CurrencyUtils.convertToDisplayString(transactionItem.formattedTotal, currency)}
            style={[styles.optionDisplayName, styles.textNewKansasNormal, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? undefined : styles.textAlignRight]}
        />
    );
}, arePropsEqual);

const TypeCell = memo(({transactionItem, isLargeScreenWidth}: TransactionCellProps) => {
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
}, arePropsEqual);

const ActionCell = memo(({onButtonPress}: ActionCellProps) => {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <Button
            text={translate('common.view')}
            onPress={onButtonPress}
            small
            pressOnEnter
            style={[styles.p0]}
        />
    );
}, arePropsEqual);

const CategoryCell = memo(({isLargeScreenWidth, showTooltip, transactionItem}: TransactionCellProps) => {
    const styles = useThemeStyles();
    return isLargeScreenWidth ? (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={transactionItem?.category}
            style={[styles.optionDisplayName, styles.label, styles.pre, styles.justifyContentCenter]}
        />
    ) : (
        <TextWithIconCell
            icon={Expensicons.Folder}
            showTooltip={showTooltip}
            text={transactionItem?.category}
        />
    );
}, arePropsEqual);

const TagCell = memo(({isLargeScreenWidth, showTooltip, transactionItem}: TransactionCellProps) => {
    const styles = useThemeStyles();
    return isLargeScreenWidth ? (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={transactionItem?.tag}
            style={[styles.optionDisplayName, styles.label, styles.pre, styles.justifyContentCenter]}
        />
    ) : (
        <TextWithIconCell
            icon={Expensicons.Tag}
            showTooltip={showTooltip}
            text={transactionItem?.tag}
        />
    );
}, arePropsEqual);

const TaxCell = memo(({transactionItem, showTooltip}: TransactionCellProps) => {
    const styles = useThemeStyles();

    const isFromExpenseReport = transactionItem.reportType === CONST.REPORT.TYPE.EXPENSE;
    const taxAmount = TransactionUtils.getTaxAmount(transactionItem, isFromExpenseReport);
    const currency = TransactionUtils.getCurrency(transactionItem);

    return (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={CurrencyUtils.convertToDisplayString(taxAmount, currency)}
            style={[styles.optionDisplayName, styles.label, styles.pre, styles.justifyContentCenter, styles.textAlignRight]}
        />
    );
}, arePropsEqual);

function TransactionListItemRow({item, showTooltip, onButtonPress, showItemHeaderOnNarrowLayout = true, containerStyle, isHovered = false}: TransactionListItemRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
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
                        buttonText={translate('common.view')}
                        onButtonPress={onButtonPress}
                    />
                )}

                <View style={[styles.flexRow, styles.justifyContentBetween, styles.gap3]}>
                    <ReceiptCell
                        transactionItem={item}
                        keyForList={item.keyForList ?? ''}
                        isLargeScreenWidth={false}
                        showTooltip={false}
                        isHovered={isHovered}
                    />
                    <View style={[styles.flex2, styles.gap1]}>
                        <MerchantCell
                            transactionItem={item}
                            showTooltip={showTooltip}
                            keyForList={item.keyForList ?? ''}
                            isLargeScreenWidth={false}
                        />
                        <View style={[styles.flexRow, styles.flex1, styles.alignItemsEnd, styles.gap3]}>
                            <CategoryCell
                                keyForList={item.keyForList ?? ''}
                                isLargeScreenWidth={isLargeScreenWidth}
                                showTooltip={showTooltip}
                                transactionItem={item}
                            />
                            <TagCell
                                showTooltip={showTooltip}
                                transactionItem={item}
                                isLargeScreenWidth={isLargeScreenWidth}
                                keyForList={item.keyForList ?? ''}
                            />
                        </View>
                    </View>
                    <View style={[styles.alignItemsEnd, styles.flex1, styles.gap1]}>
                        <TotalCell
                            showTooltip={showTooltip}
                            transactionItem={item}
                            isLargeScreenWidth={isLargeScreenWidth}
                            keyForList={item.keyForList ?? ''}
                        />
                        <View style={[styles.flexRow, styles.gap1, styles.justifyContentCenter]}>
                            <TypeCell
                                transactionItem={item}
                                isLargeScreenWidth={isLargeScreenWidth}
                                keyForList={item.keyForList ?? ''}
                                showTooltip={false}
                            />
                            <DateCell
                                transactionItem={item}
                                showTooltip={showTooltip}
                                isLargeScreenWidth={isLargeScreenWidth}
                                keyForList={item.keyForList ?? ''}
                            />
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, containerStyle]}>
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.RECEIPT)]}>
                    <ReceiptCell
                        transactionItem={item}
                        keyForList={item.keyForList ?? ''}
                        isLargeScreenWidth={false}
                        showTooltip={false}
                        isHovered={isHovered}
                    />
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.DATE)]}>
                    <DateCell
                        transactionItem={item}
                        showTooltip={showTooltip}
                        isLargeScreenWidth={isLargeScreenWidth}
                        keyForList={item.keyForList ?? ''}
                    />
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.MERCHANT)]}>
                    <MerchantCell
                        transactionItem={item}
                        showTooltip={showTooltip}
                        keyForList={item.keyForList ?? ''}
                        isLargeScreenWidth={false}
                    />
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.FROM)]}>
                    <UserInfoCell
                        participant={item.from}
                        displayName={item.formattedFrom}
                    />
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.FROM)]}>
                    <UserInfoCell
                        participant={item.to}
                        displayName={item.formattedTo}
                    />
                </View>
                {item.shouldShowCategory && (
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.CATEGORY)]}>
                        <CategoryCell
                            keyForList={item.keyForList ?? ''}
                            isLargeScreenWidth={isLargeScreenWidth}
                            showTooltip={showTooltip}
                            transactionItem={item}
                        />
                    </View>
                )}
                {item.shouldShowTag && (
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TAG)]}>
                        <TagCell
                            keyForList={item.keyForList ?? ''}
                            isLargeScreenWidth={isLargeScreenWidth}
                            showTooltip={showTooltip}
                            transactionItem={item}
                        />
                    </View>
                )}
                {item.shouldShowTax && (
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TAX_AMOUNT)]}>
                        <TaxCell
                            transactionItem={item}
                            keyForList={item.keyForList ?? ''}
                            isLargeScreenWidth={isLargeScreenWidth}
                            showTooltip={showTooltip}
                        />
                    </View>
                )}

                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TOTAL)]}>
                    <TotalCell
                        showTooltip={showTooltip}
                        transactionItem={item}
                        isLargeScreenWidth={isLargeScreenWidth}
                        keyForList={item.keyForList ?? ''}
                    />
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TYPE)]}>
                    <TypeCell
                        transactionItem={item}
                        isLargeScreenWidth={isLargeScreenWidth}
                        keyForList={item.keyForList ?? ''}
                        showTooltip={false}
                    />
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.ACTION)]}>
                    <ActionCell
                        onButtonPress={onButtonPress}
                        keyForList={item.keyForList ?? ''}
                        showTooltip={false}
                        isLargeScreenWidth={false}
                    />
                </View>
            </View>
        </View>
    );
}

TransactionListItemRow.displayName = 'TransactionListItemRow';

export default TransactionListItemRow;
