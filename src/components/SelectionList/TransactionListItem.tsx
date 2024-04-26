import {format} from 'date-fns';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MultipleAvatars from '@components/MultipleAvatars';
import {usePersonalDetails} from '@components/OnyxProvider';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import CONST from '@src/CONST';
import BaseListItem from './BaseListItem';
import type {ListItem, TransactionListItemProps} from './types';

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
    rightHandSideComponent,
    onFocus,
    shouldSyncFocus,
}: TransactionListItemProps<TItem>) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const personalDetails = usePersonalDetails() ?? CONST.EMPTY_OBJECT;
    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    const hoveredBackgroundColor = styles.sidebarLinkHover?.backgroundColor ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;

    const handleCheckboxPress = useCallback(() => {
        if (onCheckboxPress) {
            onCheckboxPress(item);
        } else {
            onSelectRow(item);
        }
    }, [item, onCheckboxPress, onSelectRow]);

    console.log('personalDetails', personalDetails);

    return (
        <BaseListItem
            item={item}
            pressableStyle={[[styles.selectionListPressableItemWrapper, item.isSelected && styles.activeComponentBG, isFocused && styles.sidebarLinkActive]]}
            wrapperStyle={[styles.flexRow, styles.flex1, styles.justifyContentBetween, styles.userSelectNone, styles.alignItemsCenter]}
            containerStyle={[styles.mb3]}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
            rightHandSideComponent={rightHandSideComponent}
            errors={item.errors}
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            hoverStyle={item.isSelected && styles.activeComponentBG}
        >
            {(hovered) => (
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
                    {!!item.icons && (
                        <MultipleAvatars
                            icons={item.icons ?? []}
                            shouldShowTooltip={showTooltip}
                            secondAvatarStyle={[
                                StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                                isFocused ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
                                hovered && !isFocused ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
                            ]}
                        />
                    )}
                    <View style={[styles.flexRow, styles.flex1, styles.gap3]}>
                        <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch]}>
                            <TextWithTooltip
                                shouldShowTooltip={showTooltip}
                                text={format(new Date(item.created), 'MMM dd')}
                                style={[styles.optionDisplayName, styles.textNormalThemeText, styles.pre, styles.justifyContentCenter]}
                            />
                        </View>
                        <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch]}>
                            <TextWithTooltip
                                shouldShowTooltip={showTooltip}
                                text={item.description}
                                style={[styles.optionDisplayName, styles.textNormalThemeText, styles.pre, styles.justifyContentCenter]}
                            />
                        </View>
                        <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch]}>
                            <View style={[styles.flexRow, styles.gap3, styles.flex1, styles.alignItemsCenter]}>
                                <Avatar
                                    imageStyles={[styles.alignSelfCenter]}
                                    size={CONST.AVATAR_SIZE.SMALL}
                                    source={personalDetails[item.managerID]?.avatar}
                                    name={personalDetails[item.managerID]?.displayName}
                                    type={CONST.ICON_TYPE_WORKSPACE}
                                />
                                <Text
                                    numberOfLines={1}
                                    style={[styles.flex1, styles.flexGrow1, styles.textStrong]}
                                >
                                    {personalDetails[item.managerID]?.displayName}
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch]}>
                            <View style={[styles.flexRow, styles.gap3, styles.flex1, styles.alignItemsCenter]}>
                                <Avatar
                                    imageStyles={[styles.alignSelfCenter]}
                                    size={CONST.AVATAR_SIZE.SMALL}
                                    source={personalDetails[item.accountID]?.avatar}
                                    name={personalDetails[item.accountID]?.displayName}
                                    type={CONST.ICON_TYPE_WORKSPACE}
                                />
                                <Text
                                    numberOfLines={1}
                                    style={[styles.flex1, styles.flexGrow1, styles.textStrong]}
                                >
                                    {personalDetails[item.accountID]?.displayName}
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch]}>
                            <TextWithTooltip
                                shouldShowTooltip={showTooltip}
                                text={item.category}
                                style={[styles.optionDisplayName, styles.textNormalThemeText, styles.pre, styles.justifyContentCenter]}
                            />
                        </View>
                        <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch]}>
                            <TextWithTooltip
                                shouldShowTooltip={showTooltip}
                                text={item.tag}
                                style={[styles.optionDisplayName, styles.textNormalThemeText, styles.pre, styles.justifyContentCenter]}
                            />
                        </View>
                        <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsEnd]}>
                            <TextWithTooltip
                                shouldShowTooltip={showTooltip}
                                text={`${CurrencyUtils.getLocalizedCurrencySymbol(item.currency)}${item.amount}`}
                                style={[styles.optionDisplayName, styles.textNewKansasNormal, styles.pre, styles.justifyContentCenter]}
                            />
                        </View>
                        <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch]}>
                            <Icon
                                src={Expensicons.CreditCard}
                                fill={theme.icon}
                            />
                        </View>

                        <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch]}>
                            <Button
                                success
                                onPress={() => {}}
                                small
                                pressOnEnter
                                text="View"
                            />
                        </View>
                    </View>
                    {!!item.rightElement && item.rightElement}
                </>
            )}
        </BaseListItem>
    );
}

TransactionListItem.displayName = 'TransactionListItem';

export default TransactionListItem;
