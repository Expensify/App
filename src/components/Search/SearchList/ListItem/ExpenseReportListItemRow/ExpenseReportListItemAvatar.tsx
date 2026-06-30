import React from 'react';
import {View} from 'react-native';
import IconsAvatar from '@components/Avatars/IconsAvatar';
import type {ExpenseReportListItemType} from '@components/Search/SearchList/ListItem/types';
import {useRowSelection} from '@components/Search/SearchSelectionProvider';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

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

    const icons = [item.primaryAvatar, item.secondaryAvatar].filter((icon) => icon !== undefined);
    const avatarSize = isLargeScreenWidth ? CONST.AVATAR_SIZE.X_SMALL : CONST.AVATAR_SIZE.DEFAULT;

    return (
        <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.AVATAR), styles.alignItemsStretch]}>
            <IconsAvatar
                icons={icons}
                avatarType={item.avatarType}
                size={avatarSize}
                shouldShowTooltip={showTooltip}
                subscriptAvatarBorderColor={finalAvatarBorderColor}
                reportID={item.reportID}
            />
        </View>
    );
}

export default ExpenseReportListItemAvatar;
