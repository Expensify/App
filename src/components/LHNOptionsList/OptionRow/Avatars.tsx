import React, {use} from 'react';
import ReportActionAvatars from '@components/ReportActionAvatars';
import useIsArchived from '@hooks/useIsArchived';
import useIsInFocusMode from '@hooks/useIsInFocusMode';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {OptionRowContext} from './Provider';

function OptionRowLHNAvatars() {
    // A component can realize its own, local state without affecting other parts of the tree
    // const [isAvatarHovered, setIsAvatarHovered] = useState(false);
    const {
        state: {reportID, isFocused, isHovered},
    } = use(OptionRowContext);
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
