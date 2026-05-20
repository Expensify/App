import type {OdometerReceiptState, UseOdometerReceiptStitcherArgs, UseOdometerReceiptStitcherResult} from './types';

const IDLE_STATE: OdometerReceiptState = {kind: 'idle'};

/**
 * Native pass-through. There are no blob:// URLs on native, so source-blob verification is a no-op
 * and the canvas-based stitch is handled differently. The hook stays in `idle` and reports the
 * receipt as always ready so consumers can render without gating.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useOdometerReceiptStitcher(_args: UseOdometerReceiptStitcherArgs): UseOdometerReceiptStitcherResult {
    return {
        state: IDLE_STATE,
        isReady: true,
        isStitching: false,
        error: null,
        hasVerifiedBlobs: true,
    };
}

export type {OdometerReceiptState, UseOdometerReceiptStitcherArgs, UseOdometerReceiptStitcherResult} from './types';
export default useOdometerReceiptStitcher;
