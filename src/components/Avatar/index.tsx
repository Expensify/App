import type {AvatarSource} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import type {AvatarType} from '@src/types/onyx/OnyxCommon';

import React from 'react';

import type {AvatarCommonProps} from './types';

import UserAvatar from './UserAvatar';
import WorkspaceAvatar from './WorkspaceAvatar';

type AvatarProps = AvatarCommonProps & {
    /** ID of the avatar owner: account ID for user avatars, policy ID for workspace avatars. Falls back to the anonymous default when omitted. */
    avatarID?: number | string;

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. Only used for user avatars. */
    fallbackIcon?: AvatarSource;

    /** Used to locate fallback icon in end-to-end tests. Only used for user avatars. */
    fallbackIconTestID?: string;

    /** Workspace name. Only used for workspace avatars — seeds the default workspace avatar. */
    name?: string;

    /** Denotes whether it is an avatar or a workspace avatar */
    type: AvatarType;
};

/** Renders a user or workspace avatar depending on the `type` prop.
 * This wrapper exists for backward compatibility. If possible use WorkspaceAvatar and UserAvatar directly.
 */
function Avatar({
    type,
    name = '',
    fallbackIcon,
    fallbackIconTestID,
    source,
    imageStyles,
    iconAdditionalStyles,
    containerStyles,
    size,
    fill,
    testID,
    avatarID = CONST.DEFAULT_NUMBER_ID,
}: AvatarProps) {
    const numericAvatarID = typeof avatarID === 'string' ? parseInt(avatarID, 10) : avatarID;

    if (type === CONST.ICON_TYPE_WORKSPACE) {
        return (
            <WorkspaceAvatar
                name={name}
                source={source}
                imageStyles={imageStyles}
                iconAdditionalStyles={iconAdditionalStyles}
                containerStyles={containerStyles}
                size={size}
                fill={fill}
                testID={testID}
                avatarID={numericAvatarID}
            />
        );
    }

    return (
        <UserAvatar
            fallbackIcon={fallbackIcon}
            fallbackIconTestID={fallbackIconTestID}
            source={source}
            imageStyles={imageStyles}
            iconAdditionalStyles={iconAdditionalStyles}
            containerStyles={containerStyles}
            size={size}
            fill={fill}
            testID={testID}
            avatarID={numericAvatarID}
        />
    );
}

export default Avatar;

export type {AvatarProps};
