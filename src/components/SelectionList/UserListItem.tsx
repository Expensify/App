import {Str} from 'expensify-common';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MultipleAvatars from '@components/MultipleAvatars';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import SubscriptAvatar from '@components/SubscriptAvatar';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import fallbackIcon from '@src/utils/getDefaultIcon';
import BaseListItem from './BaseListItem';
import type {ListItem, UserListItemProps} from './types';

function UserListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onCheckboxPress,
    onDismissError,
    shouldPreventEnterKeySubmit,
    rightHandSideComponent,
    onFocus,
    shouldSyncFocus,
    pressableStyle,
}: UserListItemProps<TItem>) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    const subscriptAvatarBorderColor = isFocused ? focusedBackgroundColor : theme.sidebar;
    const hoveredBackgroundColor = !!styles.sidebarLinkHover && 'backgroundColor' in styles.sidebarLinkHover ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;

    const handleCheckboxPress = useCallback(() => {
        if (onCheckboxPress) {
            onCheckboxPress(item);
        } else {
            onSelectRow(item);
        }
    }, [item, onCheckboxPress, onSelectRow]);

    return (
        <BaseListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.peopleRow, isFocused && styles.sidebarLinkActive]}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            rightHandSideComponent={rightHandSideComponent}
            errors={item.errors}
            pendingAction={item.pendingAction}
            pressableStyle={pressableStyle}
            FooterComponent={
                item.invitedSecondaryLogin ? (
                    <Text style={[styles.ml9, styles.ph5, styles.pb3, styles.textLabelSupporting]}>
                        {translate('workspace.people.invitedBySecondaryLogin', {secondaryLogin: item.invitedSecondaryLogin})}
                    </Text>
                ) : undefined
            }
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
        >
            {(hovered?: boolean) => (
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
                    {!!item.icons &&
                        (item.shouldShowSubscript ? (
                            <SubscriptAvatar
                                mainAvatar={item.icons.at(0) ?? fallbackIcon}
                                secondaryAvatar={item.icons.at(1)}
                                showTooltip={showTooltip}
                                backgroundColor={hovered && !isFocused ? hoveredBackgroundColor : subscriptAvatarBorderColor}
                            />
                        ) : (
                            <MultipleAvatars
                                icons={item.icons ?? []}
                                shouldShowTooltip={showTooltip}
                                secondAvatarStyle={[
                                    StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                                    isFocused ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
                                    hovered && !isFocused ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
                                ]}
                            />
                        ))}
                    <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, styles.optionRow]}>
                        <TextWithTooltip
                            shouldShowTooltip={showTooltip}
                            text={Str.removeSMSDomain(item.text ?? '')}
                            style={[
                                styles.optionDisplayName,
                                isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
                                item.isBold !== false && styles.sidebarLinkTextBold,
                                styles.pre,
                                item.alternateText ? styles.mb1 : null,
                            ]}
                        />
                        {!!item.alternateText && (
                            <TextWithTooltip
                                shouldShowTooltip={showTooltip}
                                text={Str.removeSMSDomain(item.alternateText ?? '')}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                            />
                        )}
                    </View>
                    {!!item.rightElement && item.rightElement}
                </>
            )}
        </BaseListItem>
    );
}

UserListItem.displayName = 'UserListItem';

export default UserListItem;
