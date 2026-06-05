import type {OnyxEntry} from 'react-native-onyx';
import type {IOUType} from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

/**
 * Finite state machine for the stitcher's lifecycle. Verification states are handled upstream;
 * this FSM only covers derivation + stitching.
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

    /** Used for the invalidated-recovery navigation target. */
    reportID: string;

    /** Used for the invalidated-recovery navigation target. */
    iouType: IOUType;

    /** Used for the invalidated-recovery navigation target. */
    backToReport: string | undefined;

    /**
     * Fires BEFORE clear+navigate so a host backup mechanism can mark itself as already-handled.
     * Race-critical ordering: this callback runs before any state reset.
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

    /** True once source-blob verification has completed (regardless of stitching state). */
    hasVerifiedBlobs: boolean;
};

export type {OdometerReceiptState, UseOdometerReceiptStitcherArgs, UseOdometerReceiptStitcherResult};
