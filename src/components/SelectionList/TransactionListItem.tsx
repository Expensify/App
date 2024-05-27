import React, {memo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Avatar from '@components/Avatar';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import ReceiptImage from '@components/ReceiptImage';
import Text from '@components/Text';
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
import type {Transaction} from '@src/types/onyx';
import type {SearchTransactionType} from '@src/types/onyx/SearchResults';
import BaseListItem from './BaseListItem';
import TextWithIconCell from './TextWithIconCell';
import type {
    ActionCellProps,
    CellProps,
    CurrencyCellProps,
    DateCellProps,
    ListItem,
    MerchantCellProps,
    ReceiptCellProps,
    TransactionCellProps,
    TransactionListItemProps,
    TransactionListItemType,
    TypeCellProps,
    UserCellProps,
} from './types';

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
}, arePropsEqual);

const DateCell = memo(({showTooltip, date, isLargeScreenWidth}: DateCellProps) => {
    const styles = useThemeStyles();

    return (
        <TextWithTooltip
            shouldShowTooltip={!!showTooltip}
            text={date}
            style={[styles.label, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? undefined : [styles.textMicro, styles.textSupporting]]}
        />
    );
}, arePropsEqual);

const MerchantCell = memo(({showTooltip, transactionItem, merchant, description}: MerchantCellProps) => {
    const styles = useThemeStyles();
    return (
        <TextWithTooltip
            shouldShowTooltip={!!showTooltip}
            text={transactionItem.shouldShowMerchant ? merchant : description}
            style={[styles.optionDisplayName, styles.label, styles.pre, styles.justifyContentCenter]}
        />
    );
}, arePropsEqual);

const UserCell = memo(({participant}: UserCellProps) => {
    const styles = useThemeStyles();

    const displayName = participant?.name ?? participant?.displayName ?? participant?.login;
    const avatarURL = participant?.avatarURL ?? participant?.avatar;
    const isWorkspace = participant?.avatarURL !== undefined;
    const iconType = isWorkspace ? CONST.ICON_TYPE_WORKSPACE : CONST.ICON_TYPE_AVATAR;

    return (
        <View style={[styles.flexRow, styles.gap1, styles.alignItemsCenter]}>
            <Avatar
                imageStyles={[styles.alignSelfCenter]}
                size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                source={avatarURL}
                name={displayName}
                type={iconType}
                avatarID={isWorkspace ? participant?.id : participant?.accountID}
            />
            <Text
                numberOfLines={1}
                style={[styles.textMicroBold, styles.flexShrink1]}
            >
                {displayName}
            </Text>
        </View>
    );
}, arePropsEqual);

const TotalCell = memo(({showTooltip, amount, currency, isLargeScreenWidth}: CurrencyCellProps) => {
    const styles = useThemeStyles();

    return (
        <TextWithTooltip
            shouldShowTooltip={!!showTooltip}
            text={CurrencyUtils.convertToDisplayString(amount, currency)}
            style={[styles.optionDisplayName, styles.textNewKansasNormal, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? undefined : styles.textAlignRight]}
        />
    );
}, arePropsEqual);

const TypeCell = memo(({typeIcon, isLargeScreenWidth}: TypeCellProps) => {
    const theme = useTheme();
    return (
        <Icon
            src={typeIcon}
            fill={theme.icon}
            height={isLargeScreenWidth ? 20 : 12}
            width={isLargeScreenWidth ? 20 : 12}
        />
    );
}, arePropsEqual);

const ActionCell = memo(({item, onSelectRow}: ActionCellProps) => {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <Button
            text={translate('common.view')}
            onPress={() => onSelectRow(item)}
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
            shouldShowTooltip={!!showTooltip}
            text={transactionItem?.category}
            style={[styles.optionDisplayName, styles.label, styles.pre, styles.justifyContentCenter]}
        />
    ) : (
        <TextWithIconCell
            icon={Expensicons.Folder}
            showTooltip={!!showTooltip}
            text={transactionItem?.category}
        />
    );
}, arePropsEqual);

const TagCell = memo(({isLargeScreenWidth, showTooltip, transactionItem}: TransactionCellProps) => {
    const styles = useThemeStyles();
    return isLargeScreenWidth ? (
        <TextWithTooltip
            shouldShowTooltip={!!showTooltip}
            text={transactionItem?.tag}
            style={[styles.optionDisplayName, styles.label, styles.pre, styles.justifyContentCenter]}
        />
    ) : (
        <TextWithIconCell
            icon={Expensicons.Tag}
            showTooltip={!!showTooltip}
            text={transactionItem?.tag}
        />
    );
}, arePropsEqual);

const TaxCell = memo(({showTooltip, amount, currency}: CurrencyCellProps) => {
    const styles = useThemeStyles();
    return (
        <TextWithTooltip
            shouldShowTooltip={!!showTooltip}
            text={CurrencyUtils.convertToDisplayString(amount, currency)}
            style={[styles.optionDisplayName, styles.label, styles.pre, styles.justifyContentCenter, styles.textAlignRight]}
        />
    );
}, arePropsEqual);

function getMerchant(transactionItem: TransactionListItemType) {
    const merchant = TransactionUtils.getMerchant(transactionItem as OnyxEntry<Transaction>);
    return merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT || merchant === CONST.TRANSACTION.DEFAULT_MERCHANT ? '' : merchant;
}

function TransactionListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onDismissError,
    shouldPreventDefaultFocusOnSelectRow,
    onFocus,
    shouldSyncFocus,
}: TransactionListItemProps<TItem>) {
    const transactionItem = item as unknown as TransactionListItemType;
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isLargeScreenWidth} = useWindowDimensions();
    const StyleUtils = useStyleUtils();

    const isFromExpenseReport = transactionItem.reportType === CONST.REPORT.TYPE.EXPENSE;
    const date = TransactionUtils.getCreated(transactionItem as OnyxEntry<Transaction>, CONST.DATE.MONTH_DAY_ABBR_FORMAT);
    const amount = TransactionUtils.getAmount(transactionItem as OnyxEntry<Transaction>, isFromExpenseReport);
    const taxAmount = TransactionUtils.getTaxAmount(transactionItem as OnyxEntry<Transaction>, isFromExpenseReport);
    const currency = TransactionUtils.getCurrency(transactionItem as OnyxEntry<Transaction>);
    const description = TransactionUtils.getDescription(transactionItem as OnyxEntry<Transaction>);
    const merchant = getMerchant(transactionItem);
    const typeIcon = getTypeIcon(transactionItem.type);

    const listItemPressableStyle = [styles.selectionListPressableItemWrapper, styles.pv3, item.isSelected && styles.activeComponentBG, isFocused && styles.sidebarLinkActive];

    if (!isLargeScreenWidth) {
        return (
            <BaseListItem
                item={item}
                pressableStyle={listItemPressableStyle}
                wrapperStyle={[styles.flexColumn, styles.flex1, styles.userSelectNone, styles.alignItemsStretch]}
                containerStyle={[styles.mb3]}
                isFocused={isFocused}
                isDisabled={isDisabled}
                showTooltip={showTooltip}
                canSelectMultiple={canSelectMultiple}
                onSelectRow={onSelectRow}
                onDismissError={onDismissError}
                shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
                errors={item.errors}
                pendingAction={item.pendingAction}
                keyForList={item.keyForList}
                onFocus={onFocus}
                shouldSyncFocus={shouldSyncFocus}
                hoverStyle={item.isSelected && styles.activeComponentBG}
            >
                {(hovered?: boolean) => (
                    <>
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.mb2, styles.gap2]}>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.flex1]}>
                                <View style={[styles.mw50]}>
                                    <UserCell
                                        participant={transactionItem.from}
                                        keyForList={item.keyForList ?? ''}
                                        showTooltip={false}
                                        isLargeScreenWidth={false}
                                    />
                                </View>
                                <Icon
                                    src={Expensicons.ArrowRightLong}
                                    width={variables.iconSizeXXSmall}
                                    height={variables.iconSizeXXSmall}
                                    fill={theme.icon}
                                />
                                <View style={[styles.mw50]}>
                                    <UserCell
                                        participant={transactionItem.to}
                                        keyForList={item.keyForList ?? ''}
                                        showTooltip={false}
                                        isLargeScreenWidth={false}
                                    />
                                </View>
                            </View>
                            <View style={[StyleUtils.getWidthStyle(variables.w80)]}>
                                <ActionCell
                                    item={transactionItem}
                                    onSelectRow={onSelectRow as unknown as (item: TransactionListItemType) => void}
                                    keyForList={item.keyForList ?? ''}
                                    showTooltip={false}
                                    isLargeScreenWidth={false}
                                />
                            </View>
                        </View>
                        <View style={[styles.flexRow, styles.justifyContentBetween, styles.gap3]}>
                            <ReceiptCell
                                transactionItem={transactionItem}
                                keyForList={item.keyForList ?? ''}
                                isLargeScreenWidth={false}
                                showTooltip={false}
                                isHovered={hovered}
                            />
                            <View style={[styles.flex2, styles.gap1]}>
                                <MerchantCell
                                    showTooltip={showTooltip}
                                    transactionItem={transactionItem}
                                    merchant={merchant}
                                    description={description}
                                    keyForList={item.keyForList ?? ''}
                                    isLargeScreenWidth={false}
                                />
                                <View style={[styles.flexRow, styles.flex1, styles.alignItemsEnd, styles.gap3]}>
                                    <CategoryCell
                                        keyForList={item.keyForList ?? ''}
                                        isLargeScreenWidth={isLargeScreenWidth}
                                        showTooltip={showTooltip}
                                        transactionItem={transactionItem}
                                    />
                                    <TagCell
                                        showTooltip={showTooltip}
                                        transactionItem={transactionItem}
                                        isLargeScreenWidth={isLargeScreenWidth}
                                        keyForList={item.keyForList ?? ''}
                                    />
                                </View>
                            </View>
                            <View style={[styles.alignItemsEnd, styles.flex1, styles.gap1]}>
                                <TotalCell
                                    showTooltip={showTooltip}
                                    amount={amount}
                                    currency={currency}
                                    isLargeScreenWidth={isLargeScreenWidth}
                                    keyForList={item.keyForList ?? ''}
                                />
                                <View style={[styles.flexRow, styles.gap1, styles.justifyContentCenter]}>
                                    <TypeCell
                                        typeIcon={typeIcon}
                                        isLargeScreenWidth={isLargeScreenWidth}
                                        keyForList={item.keyForList ?? ''}
                                        showTooltip={false}
                                    />
                                    <DateCell
                                        showTooltip={showTooltip}
                                        date={date}
                                        isLargeScreenWidth={isLargeScreenWidth}
                                        keyForList={item.keyForList ?? ''}
                                    />
                                </View>
                            </View>
                        </View>
                    </>
                )}
            </BaseListItem>
        );
    }

    return (
        <BaseListItem
            item={item}
            pressableStyle={listItemPressableStyle}
            wrapperStyle={[styles.flexRow, styles.flex1, styles.justifyContentBetween, styles.userSelectNone, styles.alignItemsCenter]}
            containerStyle={[styles.mb3]}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
            errors={item.errors}
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            hoverStyle={item.isSelected && styles.activeComponentBG}
        >
            {(hovered?: boolean) => (
                <View style={[styles.flex1, styles.flexRow, styles.gap3, styles.alignItemsCenter]}>
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.RECEIPT)]}>
                        <ReceiptCell
                            transactionItem={transactionItem}
                            keyForList={item.keyForList ?? ''}
                            isLargeScreenWidth={false}
                            showTooltip={false}
                            isHovered={hovered}
                        />
                    </View>
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.DATE)]}>
                        <DateCell
                            showTooltip={showTooltip}
                            date={date}
                            isLargeScreenWidth={isLargeScreenWidth}
                            keyForList={item.keyForList ?? ''}
                        />
                    </View>
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.MERCHANT)]}>
                        <MerchantCell
                            showTooltip={showTooltip}
                            transactionItem={transactionItem}
                            merchant={merchant}
                            description={description}
                            keyForList={item.keyForList ?? ''}
                            isLargeScreenWidth={false}
                        />
                    </View>
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.FROM)]}>
                        <UserCell
                            participant={transactionItem.from}
                            keyForList={item.keyForList ?? ''}
                            showTooltip={false}
                            isLargeScreenWidth={false}
                        />
                    </View>
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.FROM)]}>
                        <UserCell
                            participant={transactionItem.to}
                            keyForList={item.keyForList ?? ''}
                            showTooltip={false}
                            isLargeScreenWidth={false}
                        />
                    </View>
                    {transactionItem.shouldShowCategory && (
                        <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.CATEGORY)]}>
                            <CategoryCell
                                keyForList={item.keyForList ?? ''}
                                isLargeScreenWidth={isLargeScreenWidth}
                                showTooltip={showTooltip}
                                transactionItem={transactionItem}
                            />
                        </View>
                    )}
                    {transactionItem.shouldShowTag && (
                        <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TAG)]}>
                            <TagCell
                                keyForList={item.keyForList ?? ''}
                                isLargeScreenWidth={isLargeScreenWidth}
                                showTooltip={showTooltip}
                                transactionItem={transactionItem}
                            />
                        </View>
                    )}
                    {transactionItem.shouldShowTax && (
                        <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TAX_AMOUNT)]}>
                            <TaxCell
                                keyForList={item.keyForList ?? ''}
                                isLargeScreenWidth={isLargeScreenWidth}
                                showTooltip={showTooltip}
                                amount={taxAmount}
                                currency={currency}
                            />
                        </View>
                    )}

                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TOTAL)]}>
                        <TotalCell
                            showTooltip={showTooltip}
                            amount={amount}
                            currency={currency}
                            isLargeScreenWidth={isLargeScreenWidth}
                            keyForList={item.keyForList ?? ''}
                        />
                    </View>
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TYPE)]}>
                        <TypeCell
                            typeIcon={typeIcon}
                            isLargeScreenWidth={isLargeScreenWidth}
                            keyForList={item.keyForList ?? ''}
                            showTooltip={false}
                        />
                    </View>
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.ACTION)]}>
                        <ActionCell
                            item={transactionItem}
                            onSelectRow={onSelectRow as unknown as (item: TransactionListItemType) => void}
                            keyForList={item.keyForList ?? ''}
                            showTooltip={false}
                            isLargeScreenWidth={false}
                        />
                    </View>
                </View>
            )}
        </BaseListItem>
    );
}

TransactionListItem.displayName = 'TransactionListItem';

export default memo(TransactionListItem);
