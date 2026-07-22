import useTheme from '@hooks/useTheme';

import CONST from '@src/CONST';

import React from 'react';

import type {AvatarCommonProps} from './types';

import useWorkspaceAvatarSource from './hooks/useWorkspaceAvatarSource';
import AvatarContainer from './primitives/AvatarContainer';
import AvatarIcon from './primitives/AvatarIcon';
import AvatarImage from './primitives/AvatarImage';

type WorkspaceAvatarProps = AvatarCommonProps & {
    /** Workspace name. Seeds the default workspace avatar (icon + test ID) used when `source` is missing. */
    name: string;

    /** Workspace/policy ID. Picks the background color of the default workspace avatar. */
    avatarID: number | string;
};

/** Renders a workspace avatar, falling back to a default icon derived from the workspace name. */
function WorkspaceAvatar({source, imageStyles, iconAdditionalStyles, containerStyles, size = CONST.AVATAR_SIZE.DEFAULT, fill, name, avatarID, testID}: WorkspaceAvatarProps) {
    const theme = useTheme();
    const resolvedAvatar = useWorkspaceAvatarSource({source, name, avatarID});

    return (
        <AvatarContainer
            containerStyles={containerStyles}
            testID={testID}
        >
            {resolvedAvatar.variant === 'image' && (
                <AvatarImage
                    avatarSource={resolvedAvatar.avatarSource}
                    size={size}
                    type={CONST.ICON_TYPE_WORKSPACE}
                    imageStyles={imageStyles}
                    imageContainerAdditionalStyles={iconAdditionalStyles}
                    onImageError={resolvedAvatar.onImageError}
                />
            )}
            {resolvedAvatar.variant === 'icon' && (
                <AvatarIcon
                    avatarSource={resolvedAvatar.avatarSource}
                    size={size}
                    type={CONST.ICON_TYPE_WORKSPACE}
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

export default WorkspaceAvatar;
