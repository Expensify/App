import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Checkbox from '@components/Checkbox';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import RadioListItem from './RadioListItem';
import type {ListItem, MultiSelectListItemProps} from './types';

/**
 * MultiSelectListItem mirrors the behavior of a default RadioListItem, but adds support
 * for the new style of multi selection lists.
 * When icons are provided, an avatar is rendered on the left side of the item.
 */
function MultiSelectListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    onSelectRow,
    onDismissError,
    shouldPreventEnterKeySubmit,
    isMultilineSupported = false,
    isAlternateTextMultilineSupported = false,
    alternateTextNumberOfLines = 2,
    onFocus,
    shouldSyncFocus,
    wrapperStyle,
    titleStyles,
}: MultiSelectListItemProps<TItem>) {
    const styles = useThemeStyles();

    const checkboxComponent = useCallback(() => {
        return (
            <Checkbox
                shouldSelectOnPressEnter
                isChecked={item.isSelected}
                accessibilityLabel={item.text ?? ''}
                onPress={() => onSelectRow(item)}
            />
        );
    }, [item, onSelectRow]);

    const icon = item.icons?.at(0);

    const avatarElement = useMemo(() => {
        if (!icon) {
            return null;
        }
        return (
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
        );
    }, [icon, styles.mentionSuggestionsAvatarContainer]);

    // Use a modified item with leftElement if we have icons
    const itemWithAvatar = useMemo(() => {
        if (!avatarElement) {
            return item;
        }
        return {
            ...item,
            leftElement: avatarElement,
        };
    }, [item, avatarElement]);

    return (
        <RadioListItem
            item={itemWithAvatar}
            keyForList={item.keyForList}
            isFocused={isFocused}
            showTooltip={showTooltip}
            isDisabled={isDisabled}
            rightHandSideComponent={checkboxComponent}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            isMultilineSupported={isMultilineSupported}
            isAlternateTextMultilineSupported={isAlternateTextMultilineSupported}
            alternateTextNumberOfLines={alternateTextNumberOfLines}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            wrapperStyle={[wrapperStyle, styles.optionRowCompact]}
            titleStyles={titleStyles}
        />
    );
}

MultiSelectListItem.displayName = 'MultiSelectListItem';

export default MultiSelectListItem;
