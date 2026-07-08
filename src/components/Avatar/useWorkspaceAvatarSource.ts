import useStyleUtils from '@hooks/useStyleUtils';

import {getDefaultWorkspaceAvatar, getDefaultWorkspaceAvatarTestID} from '@libs/ReportUtils';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import {optimizeAvatarSource} from '@libs/UserAvatarUtils';

import type {ResolvedIconAvatar, ResolvedImageAvatar} from './types';

import useAvatarLoadError from './useAvatarLoadError';

type UseWorkspaceAvatarSourceParams = {
    source?: AvatarSource;
    name?: string;
    avatarID?: number | string;
};

/** Resolves a workspace avatar source into a renderable model: a remote image or an SVG icon, never initials. */
function useWorkspaceAvatarSource({source: originalSource, name = '', avatarID}: UseWorkspaceAvatarSourceParams): ResolvedImageAvatar | ResolvedIconAvatar {
    const StyleUtils = useStyleUtils();
    const {hasImageError, onImageError} = useAvatarLoadError(originalSource);

    const source = originalSource;
    const optimizedSource = optimizeAvatarSource(source);
    const useFallBackAvatar = hasImageError || !source;
    const fallbackAvatar = getDefaultWorkspaceAvatar(name);
    const fallbackAvatarTestID = getDefaultWorkspaceAvatarTestID(name);
    const avatarSource = useFallBackAvatar ? fallbackAvatar : (optimizedSource ?? fallbackAvatar);
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
