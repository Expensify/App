import React from 'react';
import {View} from 'react-native';
import MultipleAvatars from '@components/MultipleAvatars';
import SubscriptAvatar from '@components/SubscriptAvatar';
import TextWithTooltip from '@components/TextWithTooltip';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {UserListItemProps} from './types';

function UserListItem({item, textStyles, alternateTextStyles, showTooltip, style, isFocused, isHovered, shouldUseOnySubscriptAvatar = true}: UserListItemProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();

    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    const subscriptAvatarBorderColor = isFocused ? focusedBackgroundColor : theme.sidebar;
    const hoveredBackgroundColor = !!styles.sidebarLinkHover && 'backgroundColor' in styles.sidebarLinkHover ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;

    return (
        <>
            {!!item.icons && (
                <>
                    {shouldUseOnySubscriptAvatar || item.shouldShowSubscript ? (
                        <SubscriptAvatar
                            mainAvatar={item.icons[0]}
                            secondaryAvatar={item.icons[1]}
                            showTooltip={showTooltip}
                            backgroundColor={isHovered && !isFocused ? hoveredBackgroundColor : subscriptAvatarBorderColor}
                        />
                    ) : (
                        <MultipleAvatars
                            icons={item.icons ?? []}
                            shouldShowTooltip={showTooltip}
                            secondAvatarStyle={[
                                StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                                isFocused ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
                                isHovered && !isFocused ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
                            ]}
                        />
                    )}
                </>
            )}
            <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, styles.optionRow]}>
                <TextWithTooltip
                    shouldShowTooltip={showTooltip}
                    text={item.text}
                    textStyles={[textStyles, style]}
                />
                {!!item.alternateText && (
                    <TextWithTooltip
                        shouldShowTooltip={showTooltip}
                        text={item.alternateText}
                        textStyles={[alternateTextStyles, style]}
                    />
                )}
            </View>
            {!!item.rightElement && item.rightElement}
        </>
    );
}

UserListItem.displayName = 'UserListItem';

export default UserListItem;
