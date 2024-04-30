import {format} from 'date-fns';
import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Avatar from '@components/Avatar';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import type PersonalDetails from '@src/types/onyx/PersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {SearchTransactionType} from '@src/types/onyx/SearchResults';
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

    const shouldDisplayNarrowView = isMediumScreenWidth || isSmallScreenWidth;
    const date = (item.modifiedCreated || item.created) ?? '';
    const merchant = (item.modifiedMerchant || item.merchant) ?? '';
    const description = item.comment?.comment ?? '';
    const amount = (item.modifiedAmount || item.amount) ?? 0;
    const currency = (item.modifiedCurrency || item.currency) ?? CONST.CURRENCY.USD;
    const typeIcon = getTypeIcon(item?.type as SearchTransactionType);

    const dateCell = (
        <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.DATE)]}>
            <TextWithTooltip
                shouldShowTooltip={showTooltip}
                text={item?.created ? format(new Date(date), 'MMM dd') : ''}
                style={[styles.optionDisplayName, styles.label, styles.pre, styles.justifyContentCenter]}
            />
        </View>
    );

    const merchantCell = (
        <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.MERCHANT)]}>
            <TextWithTooltip
                shouldShowTooltip={showTooltip}
                text={shouldShowMerchant ? merchant : description}
                style={[styles.optionDisplayName, styles.label, styles.pre, styles.justifyContentCenter]}
            />
        </View>
    );

    const userCell = (userDetails: OnyxEntry<PersonalDetails>, columnName: string) => (
        <View style={[StyleUtils.getSearchTableColumnStyles(columnName)]}>
            <View style={[styles.flexRow, styles.flex1, styles.gap1, styles.alignItemsCenter]}>
                <Avatar
                    imageStyles={[styles.alignSelfCenter]}
                    size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                    source={userDetails?.avatar}
                    name={userDetails?.displayName ?? userDetails?.login}
                    type={CONST.ICON_TYPE_WORKSPACE}
                />
                <Text
                    numberOfLines={1}
                    style={[styles.flex1, styles.flexGrow1, styles.textMicroBold]}
                >
                    {userDetails?.displayName ?? userDetails?.login}
                </Text>
            </View>
        </View>
    );

    const totalCell = (
        <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TOTAL)]}>
            <TextWithTooltip
                shouldShowTooltip={showTooltip}
                text={CurrencyUtils.convertToDisplayString(amount, currency)}
                style={[styles.optionDisplayName, styles.textNewKansasNormal, styles.pre, styles.justifyContentCenter]}
            />
        </View>
    );

    const typeCell = (
        <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TYPE), styles.alignItemsCenter]}>
            <Icon
                src={typeIcon}
                fill={theme.icon}
            />
        </View>
    )

    const actionCell = (
        <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.ACTION)]}>
            <Button
                text={translate('common.view')}
                onPress={() => {
                    onSelectRow(item);
                }}
                small
                pressOnEnter
            />
        </View>
    );
    

    const listItemPressableStyle = [styles.selectionListPressableItemWrapper, item.isSelected && styles.activeComponentBG, isFocused && styles.sidebarLinkActive];

    if (shouldDisplayNarrowView) {
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
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.flex1]}>
                                {fromElement}
                                <Icon
                                    src={Expensicons.ArrowRightLong}
                                    width={variables.iconSizeXXSmall}
                                    height={variables.iconSizeXXSmall}
                                    fill={theme.icon}
                                />
                                {toElement}
                            </View>
                            {actionCell}
                        </View>
                        <View style={[styles.flexRow, styles.justifyContentBetween]}>
                            <View>
                                {merchantCell}
                            </View>
                            <View>
                                {totalCell}
                                <View style={[styles.flex1, styles.flexRow, styles.alignItemsStretch, styles.gap2]}>
                                    <Icon
                                        src={typeIcon}
                                        fill={theme.icon}
                                    />
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
                    {dateCell}
                    {merchantCell}
                    {userCell(item.from, CONST.SEARCH_TABLE_COLUMNS.FROM)}
                    {userCell(item.to, CONST.SEARCH_TABLE_COLUMNS.TO)}
                    {totalCell}
                    {typeCell}
                    {actionCell}
                </View>
            )}
        </BaseListItem>
    );
}

TransactionListItem.displayName = 'TransactionListItem';

export default TransactionListItem;
