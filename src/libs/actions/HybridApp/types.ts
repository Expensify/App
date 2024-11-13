import type ONYXKEYS from '@src/ONYXKEYS';
import type {TryNewDot} from '@src/types/onyx';
import type HybridApp from '@src/types/onyx/HybridApp';

type HybridAppSettings = {
    initialOnyxValues: {
        [ONYXKEYS.HYBRID_APP]: HybridApp;
        [ONYXKEYS.NVP_TRYNEWDOT]?: TryNewDot;
    };
};

export default HybridAppSettings;
