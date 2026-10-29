import {getAccountIDFromAvatarID} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import React from 'react';

import type {AvatarCommonProps} from './types';

import UserAvatar from './UserAvatar';
import WorkspaceAvatar from './WorkspaceAvatar';

type AvatarFromIconProps = Omit<AvatarCommonProps, 'source'> & {
    /** Icon entry (typically from item.icons) describing the avatar to render. Forks on `icon.type`. */
    icon: Icon;
};

/** Renders a user or workspace avatar from an Onyx `Icon` entry.
 * Prefer `UserAvatar` and `WorkspaceAvatar` directly when the avatar kind is known at the call site.
 */
function AvatarFromIcon({icon, ...rest}: AvatarFromIconProps) {
    if (icon.type === CONST.ICON_TYPE_WORKSPACE) {
        return (
            <WorkspaceAvatar
                name={icon.name ?? ''}
                avatarID={icon.id ?? CONST.DEFAULT_NUMBER_ID}
                source={icon.source}
                {...rest}
            />
        );
    }

    return (
        <UserAvatar
            accountID={getAccountIDFromAvatarID(icon.id)}
            fallbackIcon={icon.fallbackIcon}
            source={icon.source}
            {...rest}
        />
    );
}

export default AvatarFromIcon;
