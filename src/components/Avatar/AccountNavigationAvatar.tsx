import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';

import AvatarWithDelegateAvatar from '@pages/inbox/sidebar/AvatarWithDelegateAvatar';
import AvatarWithOptionalStatus from '@pages/inbox/sidebar/AvatarWithOptionalStatus';
import ProfileAvatarWithIndicator from '@pages/inbox/sidebar/ProfileAvatarWithIndicator';

import type {AvatarSizeName} from '@styles/utils/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {delegateEmailSelector} from '@selectors/Account';
import React from 'react';

type AccountNavigationAvatarProps = {
    isSelected?: boolean;
    isHovered?: boolean;
    size?: AvatarSizeName;
};

/**
 * Avatar of the signed-in user as drawn in the navigation, badged with the delegate avatar when acting
 * as a delegate, or with the emoji status when one is set.
 */
function AccountNavigationAvatar({isSelected = false, isHovered = false, size = CONST.AVATAR_SIZE.SMALL}: AccountNavigationAvatarProps) {
    const [delegateEmail = ''] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const emojiStatus = currentUserPersonalDetails?.status?.emojiCode ?? '';

    if (delegateEmail) {
        return (
            <AvatarWithDelegateAvatar
                delegateEmail={delegateEmail}
                isHovered={isHovered}
                isSelected={isSelected}
                size={size}
            />
        );
    }

    if (emojiStatus) {
        return (
            <AvatarWithOptionalStatus
                emojiStatus={emojiStatus}
                isSelected={isSelected}
                size={size}
            />
        );
    }

    return (
        <ProfileAvatarWithIndicator
            isSelected={isSelected}
            size={size}
        />
    );
}

export default AccountNavigationAvatar;
