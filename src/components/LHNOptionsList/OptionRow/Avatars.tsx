import React from 'react';
import ReportActionAvatars from '@components/ReportActionAvatars';
import useIsArchived from '@hooks/useIsArchived';
import useIsInFocusMode from '@hooks/useIsInFocusMode';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

function OptionRowLHNAvatars({reportID, isHovered, isFocused}: {reportID: string; isHovered: boolean; isFocused: boolean}) {
    const isInFocusMode = useIsInFocusMode();
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const isArchived = useIsArchived(reportID);

    const hoveredBackgroundColor = !!styles.sidebarLinkHover && 'backgroundColor' in styles.sidebarLinkHover ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;
    const focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    const subscriptAvatarBorderColor = isFocused ? focusedBackgroundColor : theme.sidebar;

    return (
        <ReportActionAvatars
            subscriptAvatarBorderColor={isHovered && !isFocused ? hoveredBackgroundColor : subscriptAvatarBorderColor}
            useMidSubscriptSizeForMultipleAvatars={isInFocusMode}
            size={isInFocusMode ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT}
            secondaryAvatarContainerStyle={[
                StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                isFocused ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
                isHovered && !isFocused ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
            ]}
            singleAvatarContainerStyle={[styles.actionAvatar, styles.mr3]}
            shouldShowTooltip={!isArchived}
            reportID={reportID}
        />
    );
}

export default OptionRowLHNAvatars;
