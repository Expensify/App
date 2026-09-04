import type ONYXKEYS from '@src/ONYXKEYS';
import type {TryNewDot} from '@src/types/onyx';
import type HybridApp from '@src/types/onyx/HybridApp';

type HybridAppSettings = {
    [ONYXKEYS.HYBRID_APP]: HybridApp;
    [ONYXKEYS.NVP_TRY_NEW_DOT]?: TryNewDot;
    /** OldDot sends its own boolean staging flag on handoff; it knows nothing about ACTIVE_SERVER */
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    [ONYXKEYS.SHOULD_USE_STAGING_SERVER]?: boolean;
};

export default HybridAppSettings;
