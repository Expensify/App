import {format} from 'date-fns';
import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {SearchPersonalDetails, SearchTransactionType} from '@src/types/onyx/SearchResults';
import BaseListItem from './BaseListItem';
import type {ListItem, TransactionListItemProps} from './types';

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
    shouldShowMerchant,
}: TransactionListItemProps<TItem>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const {isSmallScreenWidth, isMediumScreenWidth} = useWindowDimensions();
    const StyleUtils = useStyleUtils();

    const isNarrowView = isMediumScreenWidth || isSmallScreenWidth;
    const date = (item.modifiedCreated ? item.modifiedCreated : item.created) ?? '';
    const merchant = (item.modifiedMerchant ? item.modifiedMerchant : item.merchant) ?? '';
    const description = item.comment?.comment ?? '';
    const amount = (item.modifiedAmount ? item.modifiedAmount : item.amount) ?? 0;
    const currency = (item.modifiedCurrency ? item.modifiedCurrency : item.currency) ?? CONST.CURRENCY.USD;
    const typeIcon = getTypeIcon(item?.type as SearchTransactionType);

    const dateCell = (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={item?.created ? format(new Date(date), 'MMM dd') : ''}
            style={[styles.label, styles.pre, styles.justifyContentCenter, isNarrowView ? [styles.textMicro, styles.textSupporting] : undefined]}
        />
    );

    const merchantCell = (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={shouldShowMerchant ? merchant : description}
            style={[styles.optionDisplayName, styles.label, styles.pre, styles.justifyContentCenter]}
        />
    );

    const userCell = (userDetails: SearchPersonalDetails | undefined) => (
        <View style={[styles.flexRow, styles.gap1, styles.alignItemsCenter]}>
            <Avatar
                imageStyles={[styles.alignSelfCenter]}
                size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                source={userDetails?.avatar}
                name={userDetails?.displayName ?? userDetails?.login}
                type={CONST.ICON_TYPE_WORKSPACE}
            />
            <Text
                numberOfLines={1}
                style={[styles.textMicroBold]}
            >
                {userDetails?.displayName ?? userDetails?.login}
            </Text>
        </View>
    );

    const totalCell = (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={CurrencyUtils.convertToDisplayString(amount, currency)}
            style={[styles.optionDisplayName, styles.textNewKansasNormal, styles.pre, styles.justifyContentCenter, isNarrowView ? styles.textAlignRight : undefined]}
        />
    );

    const typeCell = (
        <Icon
            src={typeIcon}
            fill={theme.icon}
            height={isNarrowView ? 12 : 20}
            width={isNarrowView ? 12 : 20}
        />
    );

    const actionCell = (
        <Button
            text={translate('common.view')}
            onPress={() => {
                onSelectRow(item);
            }}
            small
            pressOnEnter
        />
    );

    const listItemPressableStyle = [styles.selectionListPressableItemWrapper, item.isSelected && styles.activeComponentBG, isFocused && styles.sidebarLinkActive];

    if (isNarrowView) {
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
                {() => (
                    <>
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.mb2]}>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.flex1]}>
                                {userCell(item?.from)}
                                <Icon
                                    src={Expensicons.ArrowRightLong}
                                    width={variables.iconSizeXXSmall}
                                    height={variables.iconSizeXXSmall}
                                    fill={theme.icon}
                                />
                                {userCell(item?.to)}
                            </View>
                            <View style={[{width: 80}]}>{actionCell}</View>
                        </View>
                        <View style={[styles.flexRow, styles.justifyContentBetween]}>
                            {merchantCell}
                            <View style={[styles.alignItemsEnd, styles.gap1]}>
                                {totalCell}
                                <View style={[styles.flexRow, styles.gap1, styles.justifyContentCenter]}>
                                    {typeCell}
                                    {dateCell}
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
            {() => (
                <View style={[styles.flex1, styles.flexRow, styles.gap3, styles.alignItemsCenter]}>
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.DATE)]}>{dateCell}</View>
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.MERCHANT)]}>{merchantCell}</View>
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.FROM)]}>{userCell(item.from)}</View>
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.FROM)]}>{userCell(item.to)}</View>
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TOTAL)]}>{totalCell}</View>
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TYPE)]}>{typeCell}</View>
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.ACTION)]}>{actionCell}</View>
                </View>
            )}
        </BaseListItem>
    );
}

TransactionListItem.displayName = 'TransactionListItem';

export default TransactionListItem;
