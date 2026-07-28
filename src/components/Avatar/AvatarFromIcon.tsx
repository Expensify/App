import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import React from 'react';

import type {AvatarCommonProps} from './types';

import PressableUserAvatar from './profile/PressableUserAvatar';
import PressableWorkspaceAvatar from './profile/PressableWorkspaceAvatar';

type AvatarFromIconProps = Omit<AvatarCommonProps, 'source' | 'fill'> & {
    /** Resolved avatar icon. Its `type` selects the user or workspace rendering path, and it also provides the source, ID, name, fill and fallback icon. */
    icon: Icon | undefined;

    /** Whether pressing the avatar opens the avatar page of its owner */
    shouldUseProfileNavigationWrapper?: boolean;

    /** Report ID used to open the report avatar page for workspace avatars */
    reportID?: string;
};

/** Renders the user or workspace avatar an `Icon` describes.
 * This is the single point where an `Icon` is resolved into the props each avatar variant needs,
 * so layouts can pass the icon they already hold instead of branching on its type themselves.
 */
function AvatarFromIcon({icon, shouldUseProfileNavigationWrapper, reportID, ...styleProps}: AvatarFromIconProps) {
    const avatarID = icon?.id ?? CONST.DEFAULT_NUMBER_ID;

    if (icon?.type === CONST.ICON_TYPE_WORKSPACE) {
        return (
            <PressableWorkspaceAvatar
                {...styleProps}
                source={icon.source}
                name={icon.name ?? ''}
                avatarID={avatarID}
                shouldUseProfileNavigationWrapper={shouldUseProfileNavigationWrapper}
                reportID={reportID}
            />
        );
    }

    return (
        <PressableUserAvatar
            {...styleProps}
            source={icon?.source}
            accountID={Number(avatarID)}
            fallbackIcon={icon?.fallbackIcon}
            fill={icon?.fill}
            shouldUseProfileNavigationWrapper={shouldUseProfileNavigationWrapper}
        />
    );
}

export default AvatarFromIcon;
