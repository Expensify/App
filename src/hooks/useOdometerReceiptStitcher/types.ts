import type {OnyxEntry} from 'react-native-onyx';
import type {IOUType} from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

/**
 * Finite state machine for the stitcher's lifecycle. Verification states (verifying / hydrating /
 * invalidated) are NOT part of this FSM — those live inside the composed `useRestartOnOdometerImagesFailure`
 * hook. The stitcher only owns derivation + stitching.
 *
 * Transitions:
 *   idle      --(verifier ready + URIs known)--> stitching | ready (single/empty derived synchronously)
 *   stitching --(success)--> ready
 *   stitching --(failure)--> error
 *   ready     --(URIs change)--> stitching
 *   error     --(URIs change)--> stitching
 *   *         --(isOdometerDistanceRequest flips off OR transaction goes away)--> idle
 */
type OdometerReceiptState = {kind: 'idle'} | {kind: 'stitching'; derivationKey: string} | {kind: 'ready'; derivationKey: string} | {kind: 'error'; message: string; derivationKey: string};

type UseOdometerReceiptStitcherArgs = {
    /** The active transaction. */
    transaction: OnyxEntry<Transaction>;

    /** Whether this transaction is in the DISTANCE_ODOMETER request type. When false, the hook stays idle. */
    isOdometerDistanceRequest: boolean;

    /** Forwarded to the composed verifier for its invalidated-recovery navigation. */
    reportID: string;

    /** Forwarded to the composed verifier for its invalidated-recovery navigation. */
    iouType: IOUType;

    /** Forwarded to the composed verifier for its invalidated-recovery navigation. */
    backToReport: string | undefined;

    /**
     * Forwarded to the composed verifier. Fires BEFORE clear+navigate so the host's backup hook can
     * mark itself as already-handled. The stitcher does not invoke this directly — the verifier does.
     */
    onBackupHandled?: (args: {shouldResetLocalState: boolean}) => void;
};

type UseOdometerReceiptStitcherResult = {
    /** The full FSM state — primarily exposed for tests; consumers should prefer the derived booleans. */
    state: OdometerReceiptState;

    /** True when the receipt is up to date for the current source images, or when the hook is inactive. */
    isReady: boolean;

    /** True while a canvas stitch is in flight. */
    isStitching: boolean;

    /** Translated error message when the stitch fails; null otherwise. */
    error: string | null;

    /**
     * Forwarded verbatim from the composed verifier. Confirmation-step consumers may read this directly
     * if they need to know whether source-blob verification has completed (without caring about stitching).
     */
    hasVerifiedBlobs: boolean;
};

export type {OdometerReceiptState, UseOdometerReceiptStitcherArgs, UseOdometerReceiptStitcherResult};
