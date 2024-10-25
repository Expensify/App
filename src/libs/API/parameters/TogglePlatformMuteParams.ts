import type Platform from '@libs/getPlatform/types';

type TogglePlatformMuteParams = {
    authToken: string;
    platformToMute: Platform;
};

export default TogglePlatformMuteParams;
