import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Checkbox from '@components/Checkbox';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import RadioListItem from './RadioListItem';
import type {ListItem, MultiSelectListItemProps} from './types';

/**
 * MultiSelectListItem extends RadioListItem with multi-selection support.
 * Renders an avatar when icons are provided.
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
    const icon = item.icons?.at(0);

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

    const {itemWithAvatar, computedWrapperStyle} = useMemo(() => {
        if (!icon) {
            return {
                itemWithAvatar: item,
                computedWrapperStyle: [wrapperStyle, styles.optionRowCompact],
            };
        }

        const avatarElement = (
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
        );

        return {
            itemWithAvatar: {...item, leftElement: avatarElement},
            computedWrapperStyle: [wrapperStyle, styles.pv0, styles.mnh13],
        };
    }, [icon, item, wrapperStyle, styles.mentionSuggestionsAvatarContainer, styles.mr3, styles.optionRowCompact, styles.pv0, styles.mnh13]);

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
            wrapperStyle={computedWrapperStyle}
            titleStyles={titleStyles}
        />
    );
}

export default MultiSelectListItem;
