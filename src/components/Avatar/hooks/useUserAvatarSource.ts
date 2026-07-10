import type {ResolvedAvatar} from '@components/Avatar/types';

import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';

import type {AvatarSource} from '@libs/UserAvatarUtils';
import {getAvatar, optimizeAvatarSource, parseLetterAvatarURL} from '@libs/UserAvatarUtils';

import useAvatarLoadError from './useAvatarLoadError';

type UseUserAvatarSourceParams = {
    /** Avatar to render: an image URL or an SVG icon. Falls back to `fallbackIcon` when missing or it fails to load. */
    source?: AvatarSource;

    /** Owning account/policy ID. Complements `source` — picks the default avatar when `source` is a default or absent. */
    avatarID?: number | string;

    /** Icon rendered when `source` is missing or fails to load. Defaults to the shared fallback avatar. */
    fallbackIcon?: AvatarSource;

    /** Test ID applied to the fallback icon so end-to-end tests can locate it. */
    fallbackIconTestID: string;
};

/** Resolves a user avatar source into a renderable model: locally drawn initials, a remote image, or an SVG icon. */
function useUserAvatarSource({source: originalSource, avatarID, fallbackIcon, fallbackIconTestID}: UseUserAvatarSourceParams): ResolvedAvatar {
    const defaultAvatars = useDefaultAvatars();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {hasImageError, onImageError} = useAvatarLoadError(originalSource);

    const userAccountID = typeof avatarID === 'string' ? parseInt(avatarID, 10) : avatarID;
    const source = getAvatar({avatarSource: originalSource, accountID: userAccountID, defaultAvatars});

    // Generated letter-avatar URLs are not fetched — their color and initials are parsed out and drawn locally.
    const letterAvatar = parseLetterAvatarURL(source);
    if (letterAvatar) {
        return {
            variant: 'initials',
            initials: letterAvatar.initials,
            colors: letterAvatar.colors,
        };
    }

    const optimizedSource = optimizeAvatarSource(source);
    const useFallBackAvatar = hasImageError || !source || source === defaultAvatars.FallbackAvatar;
    const fallbackAvatar = (fallbackIcon ?? defaultAvatars.FallbackAvatar) || defaultAvatars.FallbackAvatar;
    const fallbackAvatarTestID = fallbackIconTestID || 'SvgFallbackAvatar Icon';
    const avatarSource = useFallBackAvatar ? fallbackAvatar : (optimizedSource ?? fallbackAvatar);

    if (typeof avatarSource === 'string') {
        return {
            avatarSource,
            variant: 'image',
            hasImageError,
            fallbackAvatarTestID,
            onImageError,
        };
    }

    let iconColors = null;
    if (useFallBackAvatar && avatarSource === defaultAvatars.FallbackAvatar) {
        iconColors = StyleUtils.getBackgroundColorAndFill(theme.buttonHoveredBG, theme.icon);
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

export default useUserAvatarSource;
