import AccountAvatar from '@components/Avatar/connected/AccountAvatar';
import {AvatarTooltipsProvider} from '@components/Avatar/tooltips/AvatarTooltipContext';
import {useListItemContext} from '@components/SelectionList/ListItemContext';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

type ListItemUserAvatarProps = {
    /** ID of the account whose avatar should be rendered */
    accountID: number;

    /** Display name used for the fallback avatar when the account has none */
    fallbackDisplayName?: string;

    /** Login of the account. Seeds a deterministic letter avatar when personal details aren't loaded yet */
    accountEmail?: string;
};

/** A user's avatar sized for a list row. */
function ListItemUserAvatar({accountID, fallbackDisplayName, accountEmail}: ListItemUserAvatarProps) {
    const styles = useThemeStyles();
    const {shouldShowTooltip} = useListItemContext();

    return (
        <AvatarTooltipsProvider isEnabled={shouldShowTooltip}>
            <AccountAvatar
                accountID={accountID}
                containerStyle={[styles.actionAvatar, styles.mr3]}
                fallbackDisplayName={fallbackDisplayName}
                accountEmail={accountEmail}
            />
        </AvatarTooltipsProvider>
    );
}

export default ListItemUserAvatar;
