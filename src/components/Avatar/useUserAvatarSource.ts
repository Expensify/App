import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import {getAvatar, optimizeAvatarSource} from '@libs/UserAvatarUtils';
import type {ResolvedAvatar} from './types';
import useAvatarLoadError from './useAvatarLoadError';

type UseUserAvatarSourceParams = {
    source?: AvatarSource;
    avatarID?: number | string;
    fallbackIcon?: AvatarSource;
    fallbackIconTestID?: string;
};

function useUserAvatarSource({source: originalSource, avatarID, fallbackIcon, fallbackIconTestID = ''}: UseUserAvatarSourceParams): ResolvedAvatar {
    const defaultAvatars = useDefaultAvatars();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {hasImageError, onImageError} = useAvatarLoadError(originalSource);

    const userAccountID = typeof avatarID === 'number' ? avatarID : undefined;
    const source = getAvatar({avatarSource: originalSource, accountID: userAccountID, defaultAvatars});
    const optimizedSource = optimizeAvatarSource(source);
    const useFallBackAvatar = hasImageError || !source || source === defaultAvatars.FallbackAvatar;
    const fallbackAvatar = (fallbackIcon ?? defaultAvatars.FallbackAvatar) || defaultAvatars.FallbackAvatar;
    const fallbackAvatarTestID = fallbackIconTestID || 'SvgFallbackAvatar Icon';
    const avatarSource = useFallBackAvatar ? fallbackAvatar : (optimizedSource ?? fallbackAvatar);

    if (typeof avatarSource === 'string') {
        return {
            avatarSource,
            isImageSource: true,
            hasImageError,
            iconColors: null,
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
        isImageSource: false,
        hasImageError,
        iconColors,
        fallbackAvatarTestID,
        onImageError,
    };
}

export default useUserAvatarSource;
