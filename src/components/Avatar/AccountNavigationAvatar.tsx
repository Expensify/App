import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';

import AvatarWithDelegateAvatar from '@pages/inbox/sidebar/AvatarWithDelegateAvatar';
import AvatarWithOptionalStatus from '@pages/inbox/sidebar/AvatarWithOptionalStatus';
import ProfileAvatarWithIndicator from '@pages/inbox/sidebar/ProfileAvatarWithIndicator';

import type {AvatarSizeName} from '@styles/utils/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ColorValue} from 'react-native';

import {delegateEmailSelector} from '@selectors/Account';
import React from 'react';

type AccountNavigationAvatarProps = {
    isSelected?: boolean;
    isHovered?: boolean;
    size?: AvatarSizeName;

    /** Stroke of the delegate or status badge, set to the background behind the avatar so the badge reads as cut out of it */
    badgeBorderColor?: ColorValue;

    /** Whether the emoji status is drawn as a badge on the avatar, defaults to true. Off where the status is shown next to the avatar instead. */
    shouldShowStatus?: boolean;
};

/**
 * Avatar of the signed-in user as drawn in the navigation, badged with the delegate avatar when acting
 * as a delegate, or with the emoji status when one is set.
 */
function AccountNavigationAvatar({isSelected = false, isHovered = false, size = CONST.AVATAR_SIZE.SMALL, badgeBorderColor, shouldShowStatus = true}: AccountNavigationAvatarProps) {
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
                badgeBorderColor={badgeBorderColor}
            />
        );
    }

    if (shouldShowStatus && emojiStatus) {
        return (
            <AvatarWithOptionalStatus
                emojiStatus={emojiStatus}
                isSelected={isSelected}
                size={size}
                badgeBorderColor={badgeBorderColor}
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
