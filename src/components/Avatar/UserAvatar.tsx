import useTheme from '@hooks/useTheme';

import type {AvatarSource} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';

import React from 'react';

import type {AvatarCommonProps} from './types';

import useUserAvatarSource from './hooks/useUserAvatarSource';
import AvatarContainer from './primitives/AvatarContainer';
import AvatarIcon from './primitives/AvatarIcon';
import AvatarImage from './primitives/AvatarImage';
import AvatarInitials from './primitives/AvatarInitials';

type UserAvatarProps = AvatarCommonProps & {
    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
    fallbackIcon?: AvatarSource;

    /** Used to locate fallback icon in end-to-end tests. */
    fallbackIconTestID?: string;

    /** Owning account ID. Picks the default avatar when `source` is a default or absent. */
    avatarID: number | string;
};

/** Renders a user avatar, falling back to a default icon when no source is available. */
function UserAvatar({
    source,
    imageStyles,
    iconAdditionalStyles,
    containerStyles,
    size = CONST.AVATAR_SIZE.DEFAULT,
    fill,
    fallbackIcon,
    fallbackIconTestID = '',
    avatarID,
    testID,
}: UserAvatarProps) {
    const theme = useTheme();
    const resolvedAvatar = useUserAvatarSource({source, avatarID, fallbackIcon, fallbackIconTestID});

    return (
        <AvatarContainer
            containerStyles={containerStyles}
            testID={testID}
        >
            {resolvedAvatar.variant === 'initials' && (
                <AvatarInitials
                    initials={resolvedAvatar.initials}
                    urlColors={resolvedAvatar.colors}
                    accountID={typeof avatarID === 'string' ? parseInt(avatarID, 10) : avatarID}
                    size={size}
                    type={CONST.ICON_TYPE_AVATAR}
                    initialsContainerStyles={imageStyles}
                    initialsAdditionalStyles={iconAdditionalStyles}
                />
            )}
            {resolvedAvatar.variant === 'image' && (
                <AvatarImage
                    avatarSource={resolvedAvatar.avatarSource}
                    size={size}
                    type={CONST.ICON_TYPE_AVATAR}
                    imageStyles={imageStyles}
                    imageContainerAdditionalStyles={iconAdditionalStyles}
                    onImageError={resolvedAvatar.onImageError}
                />
            )}
            {resolvedAvatar.variant === 'icon' && (
                <AvatarIcon
                    avatarSource={resolvedAvatar.avatarSource}
                    size={size}
                    type={CONST.ICON_TYPE_AVATAR}
                    iconContainerStyles={imageStyles}
                    iconAdditionalStyles={iconAdditionalStyles}
                    fallbackAvatarTestID={resolvedAvatar.fallbackAvatarTestID}
                    iconColors={resolvedAvatar.iconColors}
                    fill={resolvedAvatar.iconColors?.fill ?? (resolvedAvatar.hasImageError ? theme.offline : fill)}
                />
            )}
        </AvatarContainer>
    );
}

export default UserAvatar;
