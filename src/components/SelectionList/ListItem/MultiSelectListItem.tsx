import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import BaseSelectListItem from './BaseSelectListItem';
import type {ListItem, MultiSelectListItemProps} from './types';

/**
 * A compact row with a checkbox and optional avatar, used in multi-choice picker lists
 * (e.g. search filters, feature toggles, category selection).
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
    shouldHighlightSelectedItem,
    shouldShowSelectionButton = true,
}: MultiSelectListItemProps<TItem>) {
    const styles = useThemeStyles();
    const icon = item.icons?.at(0);

    const avatarElement = icon ? (
        <View style={[styles.mentionSuggestionsAvatarContainer, styles.mr3]}>
            <Avatar
                source={icon.source}
                size={CONST.AVATAR_SIZE.SMALLER}
                name={icon.name}
                avatarID={icon.id}
                type={icon.type ?? CONST.ICON_TYPE_AVATAR}
                fallbackIcon={icon.fallbackIcon}
            />
        </View>
    ) : undefined;

    const itemWithAvatar = icon ? {...item, leftElement: avatarElement} : item;
    const computedWrapperStyle = icon ? [wrapperStyle, styles.pv0, styles.mnh13] : [wrapperStyle, styles.optionRowCompact];

    return (
        <BaseSelectListItem
            item={itemWithAvatar}
            keyForList={item.keyForList}
            isFocused={isFocused}
            showTooltip={showTooltip}
            isDisabled={isDisabled}
            canSelectMultiple
            onSelectRow={onSelectRow}
            accessibilityRole={CONST.ROLE.CHECKBOX}
            onDismissError={onDismissError}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            isMultilineSupported={isMultilineSupported}
            isAlternateTextMultilineSupported={isAlternateTextMultilineSupported}
            alternateTextNumberOfLines={alternateTextNumberOfLines}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            wrapperStyle={computedWrapperStyle}
            titleStyles={titleStyles}
            shouldHighlightSelectedItem={shouldHighlightSelectedItem}
            shouldShowSelectionButton={shouldShowSelectionButton}
        />
    );
}

export default MultiSelectListItem;
