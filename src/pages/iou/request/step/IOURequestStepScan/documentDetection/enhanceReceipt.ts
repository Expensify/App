/**
 * Crops a captured image to the detected receipt and straightens it, within a time limit. Every way this can go wrong keeps
 * the capture as taken: a scan must never fail, or wait long, because of the crop.
 */
import Log from '@libs/Log';

import CONST from '@src/CONST';

import type {Image} from 'react-native-nitro-image';
import type {ValueOf} from 'type-fest';

import {getDocumentDetectorNitroModule} from '@expensify/nitro-utils';

import getReceiptCropQuad from './getReceiptCropQuad';

const ENHANCE_TIMEOUT_MS = 1000;

const UPGRADE_ENHANCE_TIMEOUT_MS = 20000;

type EnhanceOutcome = ValueOf<typeof CONST.TELEMETRY.ENHANCE_OUTCOME>;

type EnhancedReceipt = {
    /** The image to save: the straightened receipt, or the capture itself when it was not cropped */
    image: Image;

    outcome: EnhanceOutcome;

    detectDurationMs?: number;

    warpDurationMs?: number;

    /** Resolves once the detector and the warp have stopped reading the capture, which after a time limit is later than the result */
    sourceReleased: Promise<unknown>;
};

type CropResult = Omit<EnhancedReceipt, 'sourceReleased'>;

function enhanceReceipt(image: Image, minConfidence: number, timeoutMs = ENHANCE_TIMEOUT_MS): Promise<EnhancedReceipt> {
    const detector = getDocumentDetectorNitroModule();
    if (!detector) {
        return Promise.resolve({image, outcome: CONST.TELEMETRY.ENHANCE_OUTCOME.SKIPPED, sourceReleased: Promise.resolve()});
    }

    let hasTimedOut = false;
    const startedAt = performance.now();
    // Started inside a promise, so a detector that throws before it begins still falls back to the capture as taken.
    const crop: Promise<CropResult> = Promise.resolve()
        .then(() => detector.detectInImage(image))
        .then((detection): Promise<CropResult> | CropResult => {
            const detectDurationMs = Math.round(performance.now() - startedAt);
            if (!detection) {
                return {image, outcome: CONST.TELEMETRY.ENHANCE_OUTCOME.NO_DOCUMENT, detectDurationMs};
            }
            const quad = getReceiptCropQuad(detection, {width: image.width, height: image.height}, minConfidence);
            if (!quad) {
                return {image, outcome: CONST.TELEMETRY.ENHANCE_OUTCOME.SKIPPED, detectDurationMs};
            }
            if (hasTimedOut) {
                return {image, outcome: CONST.TELEMETRY.ENHANCE_OUTCOME.TIMED_OUT, detectDurationMs};
            }
            const warpStartedAt = performance.now();
            return detector.warpImage(image, quad, CONST.RECEIPT_CAMERA.PHOTO_WIDTH).then((warped): CropResult => {
                // The capture was already saved as taken, so nothing will save the late crop: it is freed and never returned.
                if (hasTimedOut) {
                    warped.dispose();
                    return {image, outcome: CONST.TELEMETRY.ENHANCE_OUTCOME.TIMED_OUT, detectDurationMs};
                }
                return {image: warped, outcome: CONST.TELEMETRY.ENHANCE_OUTCOME.CROPPED, detectDurationMs, warpDurationMs: Math.round(performance.now() - warpStartedAt)};
            });
        })
        .catch((error: unknown) => {
            Log.warn('[ReceiptEnhance] cropping the receipt failed, keeping the capture as taken', {error: error instanceof Error ? error.message : String(error)});
            return {image, outcome: CONST.TELEMETRY.ENHANCE_OUTCOME.FAILED};
        });

    let timeout: ReturnType<typeof setTimeout> | undefined;
    const deadline = new Promise<CropResult>((resolve) => {
        timeout = setTimeout(() => {
            hasTimedOut = true;
            resolve({image, outcome: CONST.TELEMETRY.ENHANCE_OUTCOME.TIMED_OUT});
        }, timeoutMs);
    });

    return Promise.race([crop, deadline]).then((result) => {
        clearTimeout(timeout);
        Log.info('[ReceiptEnhance] finished', false, {
            outcome: result.outcome,
            source: `${image.width}x${image.height}`,
            output: `${result.image.width}x${result.image.height}`,
            detectDurationMs: result.detectDurationMs,
            warpDurationMs: result.warpDurationMs,
        });
        return {...result, sourceReleased: crop};
    });
}

export default enhanceReceipt;
export {ENHANCE_TIMEOUT_MS, UPGRADE_ENHANCE_TIMEOUT_MS};
export type {EnhancedReceipt};
