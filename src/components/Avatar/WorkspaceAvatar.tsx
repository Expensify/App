import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';

import {getDefaultWorkspaceAvatar, getDefaultWorkspaceAvatarTestID} from '@libs/ReportUtils';
import {optimizeAvatarSource} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';

import React from 'react';

import type {AvatarCommonProps} from './types';

import useAvatarLoadError from './hooks/useAvatarLoadError';
import AvatarContainer from './primitives/AvatarContainer';
import AvatarIcon from './primitives/AvatarIcon';
import AvatarImage from './primitives/AvatarImage';

type WorkspaceAvatarProps = AvatarCommonProps & {
    /** Workspace name. Seeds the default workspace avatar (icon + test ID) used when `source` is missing. */
    name: string;

    /** Workspace/policy ID. Picks the background color of the default workspace avatar. */
    avatarID: number;
};

/** Renders a workspace avatar, falling back to a default icon derived from the workspace name. */
function WorkspaceAvatar({source, imageStyles, iconAdditionalStyles, containerStyles, size = CONST.AVATAR_SIZE.DEFAULT, fill, name, avatarID, testID}: WorkspaceAvatarProps) {
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const defaultAvatars = useDefaultAvatars();
    const {hasImageError, onImageError} = useAvatarLoadError(source);

    const optimizedSource = optimizeAvatarSource(source);
    const shouldUseFallBackAvatar = hasImageError || !source || source === defaultAvatars.FallbackAvatar;
    const fallbackAvatar = getDefaultWorkspaceAvatar(name);
    const fallbackAvatarTestID = getDefaultWorkspaceAvatarTestID(name);
    const avatarSource = shouldUseFallBackAvatar ? fallbackAvatar : (optimizedSource ?? fallbackAvatar);

    if (typeof avatarSource === 'string') {
        return (
            <AvatarContainer
                containerStyles={containerStyles}
                testID={testID}
            >
                <AvatarImage
                    avatarSource={avatarSource}
                    size={size}
                    type={CONST.ICON_TYPE_WORKSPACE}
                    imageStyles={imageStyles}
                    imageContainerAdditionalStyles={iconAdditionalStyles}
                    onImageError={onImageError}
                />
            </AvatarContainer>
        );
    }

    const iconColors = StyleUtils.getDefaultWorkspaceAvatarColor(avatarID.toString());

    return (
        <AvatarContainer
            containerStyles={containerStyles}
            testID={testID}
        >
            <AvatarIcon
                avatarSource={avatarSource}
                size={size}
                type={CONST.ICON_TYPE_WORKSPACE}
                iconContainerStyles={imageStyles}
                iconAdditionalStyles={iconAdditionalStyles}
                fallbackAvatarTestID={fallbackAvatarTestID}
                iconColors={iconColors}
                fill={iconColors?.fill ?? (hasImageError ? theme.offline : fill)}
            />
        </AvatarContainer>
    );
}

export default WorkspaceAvatar;
