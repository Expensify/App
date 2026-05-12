import React from 'react';
import {View} from 'react-native';
import SearchReportAvatar from '@components/ReportActionAvatars/SearchReportAvatar';
import type {ExpenseReportListItemType} from '@components/Search/SearchList/ListItem/types';
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

    const finalAvatarBorderColor =
        StyleUtils.getItemBackgroundColorStyle(!!item.isSelected, isFocused || isHovered, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG)?.backgroundColor ??
        theme.highlightBG;

    return (
        <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.AVATAR), styles.alignItemsStretch]}>
            <SearchReportAvatar
                primaryAvatar={item.primaryAvatar}
                secondaryAvatar={item.secondaryAvatar}
                avatarType={item.avatarType}
                shouldShowTooltip={showTooltip}
                subscriptAvatarBorderColor={finalAvatarBorderColor}
                reportID={item.reportID}
                isLargeScreenWidth={isLargeScreenWidth}
            />
        </View>
    );
}

export default ExpenseReportListItemAvatar;
