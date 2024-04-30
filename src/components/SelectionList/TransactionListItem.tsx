import {format} from 'date-fns';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import type { OnyxEntry} from 'react-native-onyx';
import Avatar from '@components/Avatar';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxProvider';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import ReceiptImage from '@components/ReceiptImage';
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
    onCheckboxPress,
    onDismissError,
    shouldPreventDefaultFocusOnSelectRow,
    onFocus,
    shouldSyncFocus,
}: TransactionListItemProps<TItem>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const {isSmallScreenWidth, isMediumScreenWidth} = useWindowDimensions();
    const StyleUtils = useStyleUtils();
    const personalDetails = usePersonalDetails() ?? CONST.EMPTY_OBJECT;
    const typeIcon = getTypeIcon(item?.type as SearchTransactionType);

    const handleCheckboxPress = useCallback(() => {
        if (onCheckboxPress) {
            onCheckboxPress(item);
        } else {
            onSelectRow(item);
        }
    }, [item, onCheckboxPress, onSelectRow]);

    const displayNarrowVersion = isMediumScreenWidth || isSmallScreenWidth;
    const userFontStyle = displayNarrowVersion ? styles.textMicro : undefined;

    const accountDetails = item.accountID ? personalDetails[item.accountID] : null;
    const managerDetails = item.managerID ? personalDetails[item.managerID] : null;

    const rowButtonElement = (
        <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.ACTION)]}>
            <Button
                text={translate('common.view')} // Todo add translate
                onPress={() => {
                    onSelectRow(item);
                }}
                small
                pressOnEnter
            />
        </View>
    );

    const amountElement = (
        <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TOTAL)]}>
            <TextWithTooltip
                shouldShowTooltip={showTooltip}
                text={CurrencyUtils.convertToDisplayString(item.amount, item.currency)}
                style={[styles.optionDisplayName, styles.textNewKansasNormal, styles.pre, styles.justifyContentCenter]}
            />
        </View>
    );

    const categoryElement = (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={item.category ?? ''}
            style={[styles.optionDisplayName, styles.label, styles.pre, styles.justifyContentCenter]}
        />
    );

    const tagElement = (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={item.tag ?? ''}
            style={[styles.optionDisplayName, styles.label, styles.pre, styles.justifyContentCenter]}
        />
    );

    const descriptionElement = (
        <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.DESCRIPTION)]}>
            <TextWithTooltip
                shouldShowTooltip={showTooltip}
                text={item?.comment?.comment ?? ''}
                style={[styles.optionDisplayName, styles.label, styles.pre, styles.justifyContentCenter]}
            />
        </View>
    );

    const dateElement = (
        <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.DATE)]}>
            <TextWithTooltip
                shouldShowTooltip={showTooltip}
                text={item?.created ? format(new Date(item.created), 'MMM dd') : ''}
                style={[styles.optionDisplayName, styles.label, styles.pre, styles.justifyContentCenter]}
            />
        </View>
    );

    const typeElement = (
        <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TYPE), styles.alignItemsCenter]}>
            <Icon
                src={typeIcon}
                fill={theme.icon}
            />
        </View>
    )

    const userElement = (userDetails: OnyxEntry<PersonalDetails>, columnName: string) => (
        <View style={[StyleUtils.getSearchTableColumnStyles(columnName)]}>
            <View style={[styles.flexRow, styles.flex1, styles.gap1, styles.alignItemsCenter]}>
                <Avatar
                    imageStyles={[styles.alignSelfCenter]}
                    size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                    source={userDetails?.avatar}
                    name={userDetails?.displayName}
                    type={CONST.ICON_TYPE_WORKSPACE}
                />
                <Text
                    numberOfLines={1}
                    style={[styles.flex1, styles.flexGrow1, styles.textMicroBold]}
                >
                    {userDetails?.displayName}
                </Text>
            </View>
        </View>
    );

    const listItemPressableStyle = [styles.selectionListPressableItemWrapper, item.isSelected && styles.activeComponentBG, isFocused && styles.sidebarLinkActive];

    if (displayNarrowVersion) {
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
                            {rowButtonElement}
                        </View>
                        <View style={[styles.flexRow, styles.justifyContentBetween]}>
                            <View>
                                {descriptionElement}
                                {categoryElement}
                            </View>
                            <View>
                                {amountElement}
                                <View style={[styles.flex1, styles.flexRow, styles.alignItemsStretch, styles.gap2]}>
                                    <Icon
                                        src={typeIcon}
                                        fill={theme.icon}
                                    />
                                    {dateElement}
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
                <>
                    {/* {canSelectMultiple && (
                        <PressableWithFeedback
                            accessibilityLabel={item.text ?? ''}
                            role={CONST.ROLE.BUTTON}
                            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                            disabled={isDisabled || item.isDisabledCheckbox}
                            onPress={handleCheckboxPress}
                            style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), item.isDisabledCheckbox && styles.cursorDisabled, styles.mr3]}
                        >
                            <View style={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled)]}>
                                {item.isSelected && (
                                    <Icon
                                        src={Expensicons.Checkmark}
                                        fill={theme.textLight}
                                        height={14}
                                        width={14}
                                    />
                                )}
                            </View>
                        </PressableWithFeedback>
                    )} */}
                    <View style={[styles.flex1, styles.flexRow, styles.gap3, styles.alignItemsCenter]}>
                        {dateElement}
                        {descriptionElement}
                        {userElement(accountDetails, CONST.SEARCH_TABLE_COLUMNS.FROM)}
                        {userElement(managerDetails, CONST.SEARCH_TABLE_COLUMNS.TO)}
                        {amountElement}
                        {typeElement}
                        {rowButtonElement}
                    </View>
                </>
            )}
        </BaseListItem>
    );
}

TransactionListItem.displayName = 'TransactionListItem';

export default TransactionListItem;
