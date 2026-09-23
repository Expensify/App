import getPlatform from '@libs/getPlatform';
import type Platform from '@libs/getPlatform/types';

import ONYXKEYS from '@src/ONYXKEYS';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import useOnyx from './useOnyx';

/** Returns whether the user has muted sounds on the current platform. */
function useIsPlatformMuted(): boolean {
    const platform = getPlatform(true);
    const [mutedPlatforms = getEmptyObject<Partial<Record<Platform, true>>>()] = useOnyx(ONYXKEYS.NVP_MUTED_PLATFORMS);

    return !!mutedPlatforms[platform];
}

export default useIsPlatformMuted;
