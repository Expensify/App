import {format} from 'date-fns';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxProvider';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
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
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {isSmallScreenWidth, isMediumScreenWidth} = useWindowDimensions();

    const personalDetails = usePersonalDetails() ?? CONST.EMPTY_OBJECT;
    // const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    // const hoveredBackgroundColor = styles.sidebarLinkHover?.backgroundColor ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;

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
        <Button
            success
            text="View" // Todo add translate
            onPress={() => {
                onSelectRow(item);
            }}
            small
            pressOnEnter
        />
    );

    const amountElement = (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={`${item.currency ? CurrencyUtils.getLocalizedCurrencySymbol(item?.currency) : ''}${item.amount}`}
            style={[styles.optionDisplayName, styles.textNewKansasNormal, styles.pre, styles.justifyContentCenter]}
        />
    );

    const categoryElement = (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={item.category ?? ''}
            style={[styles.optionDisplayName, styles.textNormalThemeText, styles.pre, styles.justifyContentCenter]}
        />
    );

    const descriptionElement = (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={item?.description ?? ''}
            style={[styles.optionDisplayName, styles.textNormalThemeText, styles.pre, styles.justifyContentCenter]}
        />
    );

    const dateElement = (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={item?.created ? format(new Date(item.created), 'MMM dd') : ''}
            style={[styles.optionDisplayName, styles.textNormalThemeText, styles.pre, styles.justifyContentCenter]}
        />
    );

    const fromElement = (
        <View style={[styles.flexRow, styles.flex1, styles.gap3, styles.alignItemsCenter]}>
            <Avatar
                imageStyles={[styles.alignSelfCenter]}
                size={CONST.AVATAR_SIZE.SMALL}
                source={accountDetails?.avatar}
                name={accountDetails?.displayName}
                type={CONST.ICON_TYPE_WORKSPACE}
            />
            <Text
                numberOfLines={1}
                style={[styles.flex1, styles.flexGrow1, styles.textStrong, userFontStyle]}
            >
                {accountDetails?.displayName}
            </Text>
        </View>
    );

    const toElement = (
        <View style={[styles.flexRow, styles.flex1, styles.gap3, styles.alignItemsCenter]}>
            <Avatar
                imageStyles={[styles.alignSelfCenter]}
                size={CONST.AVATAR_SIZE.SMALL}
                source={managerDetails?.avatar}
                name={managerDetails?.displayName}
                type={CONST.ICON_TYPE_WORKSPACE}
            />
            <Text
                numberOfLines={1}
                style={[styles.flex1, styles.flexGrow1, styles.textStrong, userFontStyle]}
            >
                {managerDetails?.displayName}
            </Text>
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
                onSelectRow={() => {}}
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
            onSelectRow={() => {}}
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
                    {canSelectMultiple && (
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
                    )}
                    <View style={[styles.flexRow, styles.flex1, styles.gap3]}>
                        <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsStretch]}>{dateElement}</View>
                        <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsStretch]}>{descriptionElement}</View>
                        <View style={[styles.flex2, styles.justifyContentCenter, styles.alignItemsStretch]}>{fromElement}</View>
                        <View style={[styles.flex2, styles.justifyContentCenter, styles.alignItemsStretch]}>{toElement}</View>
                        <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsStretch]}>{categoryElement}</View>
                        <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsStretch]}>
                            <TextWithTooltip
                                shouldShowTooltip={showTooltip}
                                text={item?.tag ?? ''}
                                style={[styles.optionDisplayName, styles.textNormalThemeText, styles.pre, styles.justifyContentCenter]}
                            />
                        </View>
                        <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsEnd]}>{amountElement}</View>
                        <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsStretch]}>
                            <Icon
                                src={typeIcon}
                                fill={theme.icon}
                            />
                        </View>
                        <View style={[styles.flex1]}>{rowButtonElement}</View>
                    </View>
                </>
            )}
        </BaseListItem>
    );
}

TransactionListItem.displayName = 'TransactionListItem';

export default TransactionListItem;
