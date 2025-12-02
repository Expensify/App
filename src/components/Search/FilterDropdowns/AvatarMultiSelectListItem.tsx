/**
 * Generic list item component for multi-select lists with avatars.
 * Renders an avatar, text label, and checkbox in a consistent layout.
 * Used by AvatarMultiSelectPopup to display workspace and other avatar-based items.
 * Follows the same layout pattern as UserSelectionListItem but without user-specific logic.
 *
 * IMPORTANT: This component uses SelectionListWithSections/BaseListItem (not SelectionList/ListItem/BaseListItem).
 * This is required to match the UserSelectionListItem pattern and ensure proper canSelectMultiple behavior,
 * which prevents the automatic checkmark from rendering when items are selected.
 */
import React, {useCallback} from 'react';
import type {NativeSyntheticEvent, StyleProp, TargetedEvent, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import BaseListItem from '@components/SelectionListWithSections/BaseListItem';
import type {ListItem} from '@components/SelectionListWithSections/types';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type AvatarMultiSelectListItemProps<TItem extends ListItem = ListItem> = {
    /** The item to render */
    item: TItem;

    /** Whether the item is focused */
    isFocused?: boolean;

    /** Whether to show tooltip on truncated text */
    showTooltip: boolean;

    /** Whether the item is disabled */
    isDisabled?: boolean | null;

    /** Callback when item is selected */
    onSelectRow: (item: TItem) => void;

    /** Callback to dismiss error */
    onDismissError?: (item: TItem) => void;

    /** Whether to prevent enter key from submitting */
    shouldPreventEnterKeySubmit?: boolean;

    /** Callback when item gains focus */
    onFocus?: (event: NativeSyntheticEvent<TargetedEvent>) => void;

    /** Whether to sync focus state */
    shouldSyncFocus?: boolean;

    /** Additional styles to apply to the wrapper */
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Additional styles for the pressable */
    pressableStyle?: StyleProp<ViewStyle>;

    /** Callback when checkbox is pressed */
    onCheckboxPress?: (item: TItem) => void;

    /** Whether multiple items can be selected */
    canSelectMultiple?: boolean;

    /** Component to render on the right side */
    rightHandSideComponent?: ((item: TItem, isFocused?: boolean) => React.ReactElement | null | undefined) | React.ReactElement | null;
};

function AvatarMultiSelectListItem<TItem extends ListItem = ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    onSelectRow,
    onDismissError,
    shouldPreventEnterKeySubmit,
    onFocus,
    shouldSyncFocus,
    wrapperStyle,
    pressableStyle,
    onCheckboxPress,
    canSelectMultiple,
    rightHandSideComponent,
}: AvatarMultiSelectListItemProps<TItem>) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark'] as const);

    const handleCheckboxPress = useCallback(() => {
        if (onCheckboxPress) {
            onCheckboxPress(item);
        } else {
            onSelectRow(item);
        }
    }, [item, onCheckboxPress, onSelectRow]);

    const icon = item.icons?.at(0);

    return (
        <BaseListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.sidebarLinkInner, styles.userSelectNone, wrapperStyle]}
            pressableStyle={pressableStyle}
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
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.h13, styles.gap3, styles.w100]}>
                {!!icon && (
                    <View style={styles.mentionSuggestionsAvatarContainer}>
                        <Avatar
                            source={icon.source}
                            size={CONST.AVATAR_SIZE.SMALLER}
                            name={icon.name}
                            avatarID={icon.id}
                            type={icon.type ?? CONST.ICON_TYPE_AVATAR}
                            fallbackIcon={icon.fallbackIcon}
                        />
                    </View>
                )}

                <View style={[styles.flex1, styles.alignItemsStart]}>
                    <TextWithTooltip
                        shouldShowTooltip={showTooltip}
                        text={item.text ?? ''}
                        style={[styles.optionDisplayName, isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, styles.sidebarLinkTextBold, styles.pre]}
                    />
                </View>

                <PressableWithFeedback
                    accessibilityLabel={item.text ?? ''}
                    role={CONST.ROLE.BUTTON}
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    disabled={isDisabled || item.isDisabledCheckbox}
                    onPress={handleCheckboxPress}
                    style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), item.isDisabledCheckbox && styles.cursorDisabled, !!item.rightElement && styles.mr3]}
                >
                    <View style={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled)]}>
                        {!!item.isSelected && (
                            <Icon
                                src={icons.Checkmark}
                                fill={theme.textLight}
                                height={14}
                                width={14}
                            />
                        )}
                    </View>
                </PressableWithFeedback>

                {!!item.rightElement && item.rightElement}
            </View>
        </BaseListItem>
    );
}

AvatarMultiSelectListItem.displayName = 'AvatarMultiSelectListItem';

export type {AvatarMultiSelectListItemProps};
export default AvatarMultiSelectListItem;
