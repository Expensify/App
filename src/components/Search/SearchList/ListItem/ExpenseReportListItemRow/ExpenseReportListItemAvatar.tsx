import DiagonalAvatars from '@components/Avatar/layouts/DiagonalAvatars';
import getAvatarLayout from '@components/Avatar/layouts/getAvatarLayout';
import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';
import SubscriptAvatar from '@components/Avatar/layouts/SubscriptAvatar';
import type {ExpenseReportListItemType} from '@components/Search/SearchList/ListItem/types';
import {useRowSelection} from '@components/Search/SearchSelectionProvider';

import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type ExpenseReportListItemAvatarProps = {
    item: ExpenseReportListItemType;
    showTooltip: boolean;
    isHovered?: boolean;
    isFocused?: boolean;
    isLargeScreenWidth?: boolean;
};

function ExpenseReportListItemAvatar({item, showTooltip, isHovered = false, isFocused = false, isLargeScreenWidth = false}: ExpenseReportListItemAvatarProps) {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const theme = useTheme();

    const {isSelected} = useRowSelection(item.keyForList);
    const finalAvatarBorderColor =
        StyleUtils.getItemBackgroundColorStyle(isSelected, isFocused || isHovered, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG)?.backgroundColor ?? theme.highlightBG;

    // Without a primary avatar there is nothing to anchor the row on, and compacting the array would promote the secondary avatar into the primary slot.
    if (!item.primaryAvatar) {
        return null;
    }

    const icons = item.secondaryAvatar ? [item.primaryAvatar, item.secondaryAvatar] : [item.primaryAvatar];
    const avatarSize = isLargeScreenWidth ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT;
    const {layout, primaryIcon, secondaryIcon} = getAvatarLayout({icons, avatarType: item.avatarType});

    let avatarContent;
    if (layout === CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT && primaryIcon && secondaryIcon) {
        avatarContent = (
            <SubscriptAvatar
                primaryAvatar={primaryIcon}
                secondaryAvatar={secondaryIcon}
                size={avatarSize}
                shouldShowTooltip={showTooltip}
                subscriptAvatarBorderColor={finalAvatarBorderColor}
            />
        );
    } else if (layout === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL) {
        avatarContent = (
            <DiagonalAvatars
                shouldShowTooltip={showTooltip}
                size={avatarSize}
                icons={icons}
                isInReportAction={false}
                shouldUseMidSubscriptSize={false}
            />
        );
    } else if (primaryIcon) {
        avatarContent = (
            <SingleAvatar
                avatar={primaryIcon}
                size={avatarSize}
                containerStyles={StyleUtils.getContainerStyles(avatarSize)}
                shouldShowTooltip={showTooltip}
            />
        );
    }

    if (!avatarContent) {
        return null;
    }

    return <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.AVATAR), styles.alignItemsStretch]}>{avatarContent}</View>;
}

export default ExpenseReportListItemAvatar;
