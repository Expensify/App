import ReportAvatar from '@components/Avatar/connected/ReportAvatar';
import {AvatarTooltipsProvider} from '@components/Avatar/tooltips/AvatarTooltipContext';
import {useListItemSecondaryAvatarContainerStyle, useListItemSubscriptAvatarBorderColor} from '@components/SelectionList/ListItemComposed/hooks/useListItemAvatarColors';
import {useListItemContext} from '@components/SelectionList/ListItemContext';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

type ListItemReportAvatarProps = {
    /** ID of the report whose avatars should be rendered */
    reportID?: string;

    /** Display name used for the fallback avatar when the report has none */
    fallbackDisplayName?: string;
};

/** A report's avatar(s) sized and colored for a list row; subscript border follows the row's focus/hover state. */
function ListItemReportAvatar({reportID, fallbackDisplayName}: ListItemReportAvatarProps) {
    const styles = useThemeStyles();
    const {shouldShowTooltip} = useListItemContext();
    const subscriptAvatarBorderColor = useListItemSubscriptAvatarBorderColor();
    const secondaryAvatarContainerStyle = useListItemSecondaryAvatarContainerStyle();

    return (
        <AvatarTooltipsProvider isEnabled={shouldShowTooltip}>
            <ReportAvatar
                reportID={reportID}
                subscriptAvatarBorderColor={subscriptAvatarBorderColor}
                secondaryAvatarContainerStyle={secondaryAvatarContainerStyle}
                singleAvatarContainerStyle={[styles.actionAvatar, styles.mr3]}
                fallbackDisplayName={fallbackDisplayName}
            />
        </AvatarTooltipsProvider>
    );
}

export default ListItemReportAvatar;
