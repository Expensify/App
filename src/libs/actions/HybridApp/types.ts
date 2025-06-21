import type ONYXKEYS from '@src/ONYXKEYS';
import type {TryNewDot} from '@src/types/onyx';
import type HybridApp from '@src/types/onyx/HybridApp';

type HybridAppSettings = {
    [ONYXKEYS.HYBRID_APP]: HybridApp;
    [ONYXKEYS.NVP_TRY_NEW_DOT]?: TryNewDot;
    [ONYXKEYS.ACCOUNT]?: {shouldUseStagingServer: boolean};
};

export default HybridAppSettings;
