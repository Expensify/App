import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import useIsMobileWebLandscape from './useIsMobileWebLandscape';

/** The mweb landscape header is so short that the default avatar would touch its top and bottom edges, so it uses the small one there. */
function useHeaderAvatarSize(): ValueOf<typeof CONST.AVATAR_SIZE> {
    const isMobileWebLandscape = useIsMobileWebLandscape();

    return isMobileWebLandscape ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT;
}

export default useHeaderAvatarSize;
