import React from 'react';
import {View} from 'react-native';
import MultipleAvatars from '@components/MultipleAvatars';
import SubscriptAvatar from '@components/SubscriptAvatar';
import TextWithTooltip from '@components/TextWithTooltip';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import BaseListItem from './BaseListItem';
import type {BaseListItemProps, ListItem} from './types';

function UserListItem({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onDismissError,
    shouldPreventDefaultFocusOnSelectRow,
    rightHandSideComponent,
}: BaseListItemProps<ListItem>) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();

    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    const subscriptAvatarBorderColor = isFocused ? focusedBackgroundColor : theme.sidebar;
    const hoveredBackgroundColor = !!styles.sidebarLinkHover && 'backgroundColor' in styles.sidebarLinkHover ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;

    return (
        <BaseListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.peopleRow, isFocused && styles.sidebarLinkActive]}
            selectMultipleStyle={[
                StyleUtils.getCheckboxContainerStyle(20),
                styles.mr3,
                item.isSelected && styles.checkedContainer,
                item.isSelected && styles.borderColorFocus,
                item.isDisabled && styles.cursorDisabled,
                item.isDisabled && styles.buttonOpacityDisabled,
            ]}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
            rightHandSideComponent={rightHandSideComponent}
            keyForList={item.keyForList}
        >
            {(hovered) => (
                <>
                    {!!item.icons && (
                        <>
                            {item.shouldShowSubscript ? (
                                <SubscriptAvatar
                                    mainAvatar={item.icons[0]}
                                    secondaryAvatar={item.icons[1]}
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
                            )}
                        </>
                    )}
                    <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, styles.optionRow]}>
                        <TextWithTooltip
                            shouldShowTooltip={showTooltip}
                            text={item.text}
                            textStyles={[
                                styles.optionDisplayName,
                                isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
                                styles.sidebarLinkTextBold,
                                styles.pre,
                                item.alternateText ? styles.mb1 : null,
                            ]}
                        />
                        {!!item.alternateText && (
                            <TextWithTooltip
                                shouldShowTooltip={showTooltip}
                                text={item.alternateText}
                                textStyles={[styles.textLabelSupporting, styles.lh16, styles.pre]}
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
