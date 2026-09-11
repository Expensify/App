import DiagonalAvatars from '@components/Avatar/layouts/DiagonalAvatars';
import getAvatarLayout from '@components/Avatar/layouts/getAvatarLayout';
import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';
import SubscriptAvatar from '@components/Avatar/layouts/SubscriptAvatar';
import type {ExpenseReportListItemType} from '@components/Search/SearchList/ListItem/types';
import {useRowSelection} from '@components/Search/SearchSelectionProvider';
import {useListItemContext, useListItemHovered} from '@components/SelectionList/ListItemContext';

import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type ExpenseReportListItemAvatarProps = {
    item: ExpenseReportListItemType;
};

/** The report avatar cell of the wide (table) expense report row. */
function ExpenseReportListItemAvatar({item}: ExpenseReportListItemAvatarProps) {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const theme = useTheme();

    const {isSelected} = useRowSelection(item.keyForList);
    const {isFocusVisible} = useListItemContext();
    const isHovered = useListItemHovered();
    const finalAvatarBorderColor =
        StyleUtils.getItemBackgroundColorStyle(isSelected, isFocusVisible || isHovered, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG)?.backgroundColor ??
        theme.highlightBG;

    // Without a primary avatar there is nothing to anchor the row on, and compacting the array would promote the secondary avatar into the primary slot.
    if (!item.primaryAvatar) {
        return null;
    }

    const icons = item.secondaryAvatar ? [item.primaryAvatar, item.secondaryAvatar] : [item.primaryAvatar];
    const {layout, primaryIcon, secondaryIcon} = getAvatarLayout({icons, avatarType: item.avatarType});

    let avatarContent;
    if (layout === CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT && primaryIcon && secondaryIcon) {
        avatarContent = (
            <SubscriptAvatar
                primaryAvatar={primaryIcon}
                secondaryAvatar={secondaryIcon}
                size={CONST.AVATAR_SIZE.SMALL}
                subscriptAvatarBorderColor={finalAvatarBorderColor}
            />
        );
    } else if (layout === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL) {
        avatarContent = (
            <DiagonalAvatars
                size={CONST.AVATAR_SIZE.SMALL}
                icons={icons}
                isInReportAction={false}
            />
        );
    } else {
        avatarContent = (
            <SingleAvatar
                avatar={item.primaryAvatar}
                size={CONST.AVATAR_SIZE.SMALL}
                containerStyles={StyleUtils.getContainerStyles(CONST.AVATAR_SIZE.SMALL)}
            />
        );
    }

    return <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.AVATAR), styles.alignItemsStretch]}>{avatarContent}</View>;
}

export default ExpenseReportListItemAvatar;
