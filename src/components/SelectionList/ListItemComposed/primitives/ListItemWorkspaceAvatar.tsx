import PolicyAvatar from '@components/Avatar/connected/PolicyAvatar';
import {AvatarTooltipsProvider} from '@components/Avatar/tooltips/AvatarTooltipContext';
import useListItemBackdropColor from '@components/SelectionList/ListItemComposed/hooks/useListItemBackdropColor';
import {useListItemContext} from '@components/SelectionList/ListItemContext';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

type ListItemWorkspaceAvatarProps = {
    /** ID of the policy whose avatar should be rendered */
    policyID: string;

    /** Account rendered as the subscript avatar, when present */
    accountID?: number;

    /** Display name used for the fallback avatar when the policy has none */
    fallbackDisplayName?: string;
};

/** A workspace's avatar sized and colored for a list row. The backdrop follows the row's focus/hover state. */
function ListItemWorkspaceAvatar({policyID, accountID, fallbackDisplayName}: ListItemWorkspaceAvatarProps) {
    const styles = useThemeStyles();
    const {shouldShowTooltip} = useListItemContext();
    const backdropColor = useListItemBackdropColor();

    return (
        <AvatarTooltipsProvider isEnabled={shouldShowTooltip}>
            <PolicyAvatar
                policyID={policyID}
                accountID={accountID}
                containerStyle={[styles.actionAvatar, styles.mr3]}
                backdropColor={backdropColor}
                fallbackDisplayName={fallbackDisplayName}
            />
        </AvatarTooltipsProvider>
    );
}

export default ListItemWorkspaceAvatar;
