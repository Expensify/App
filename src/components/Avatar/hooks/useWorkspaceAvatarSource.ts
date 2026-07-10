import type {ResolvedIconAvatar, ResolvedImageAvatar} from '@components/Avatar/types';

import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useStyleUtils from '@hooks/useStyleUtils';

import {getDefaultWorkspaceAvatar, getDefaultWorkspaceAvatarTestID} from '@libs/ReportUtils';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import {optimizeAvatarSource} from '@libs/UserAvatarUtils';

import useAvatarLoadError from './useAvatarLoadError';

type UseWorkspaceAvatarSourceParams = {
    /** Avatar to render: an image URL or an SVG icon. Falls back to the default workspace avatar when missing or it fails to load. */
    source?: AvatarSource;

    /** Workspace name. Seeds the default workspace avatar (icon + test ID) used when `source` is missing. */
    name: string;

    /** Workspace/policy ID. Picks the background color of the default workspace avatar. */
    avatarID?: number | string;
};

/** Resolves a workspace avatar source into a renderable model: a remote image or an SVG icon, never initials. */
function useWorkspaceAvatarSource({source, name, avatarID}: UseWorkspaceAvatarSourceParams): ResolvedImageAvatar | ResolvedIconAvatar {
    const StyleUtils = useStyleUtils();
    const defaultAvatars = useDefaultAvatars();
    const {hasImageError, onImageError} = useAvatarLoadError(source);

    const optimizedSource = optimizeAvatarSource(source);
    const shouldUseFallBackAvatar = hasImageError || !source || source === defaultAvatars.FallbackAvatar;
    const fallbackAvatar = getDefaultWorkspaceAvatar(name);
    const fallbackAvatarTestID = getDefaultWorkspaceAvatarTestID(name);
    const avatarSource = shouldUseFallBackAvatar ? fallbackAvatar : (optimizedSource ?? fallbackAvatar);
    const iconColors = StyleUtils.getDefaultWorkspaceAvatarColor(avatarID?.toString() ?? '');

    if (typeof avatarSource === 'string') {
        return {
            avatarSource,
            variant: 'image',
            hasImageError,
            fallbackAvatarTestID,
            onImageError,
        };
    }

    return {
        avatarSource,
        variant: 'icon',
        hasImageError,
        iconColors,
        fallbackAvatarTestID,
        onImageError,
    };
}

export default useWorkspaceAvatarSource;
