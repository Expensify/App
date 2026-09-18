import Log from '@libs/Log';
import ReceiptStorage from '@libs/ReceiptStorage';
import {finish as finishUpgrade, isClaimedForRead as wasReceiptClaimed, recordUpgrade, start as startUpgrade} from '@libs/ReceiptStorage/receiptUpgrades';
import {endSpanWithAttributes, getSpan, startSpan} from '@libs/telemetry/activeSpans';

import rotatePhotoToUpright from '@pages/iou/request/step/IOURequestStepScan/utils/rotatePhotoToUpright';

import CONST from '@src/CONST';

import type {Camera, PhotoFile} from 'react-native-vision-camera';

import {useEffect, useRef, useState} from 'react';
import RNFS from 'react-native-fs';

/**
 * How long the camera session is held open for the photo. After that the receipt keeps the snapshot. Both
 * caps bound the upgrade only: an upload claims the file as it stands rather than waiting on either.
 */
const PHOTO_CAPTURE_TIMEOUT_MS = 3000;

/** Cap on the rotate step, so a manipulator that never settles cannot leave the receipt marked as changing. */
const ROTATE_TIMEOUT_MS = 5000;

/** Deletes a photo that has no consumer. A failure only strands a file in the OS temp directory. */
function discardPhoto(path: string) {
    ReceiptStorage.discard(path).catch((error: unknown) => {
        Log.warn('[PhotoUpgrade] could not delete the abandoned photo', {error: error instanceof Error ? error.message : String(error)});
    });
}

/** Callers call `discard` first, so a photo landing before this runs is deleted by the capture handler. */
function discardWhenItLands(pending: PendingPhoto) {
    pending.promise
        .then((photo) => {
            if (!photo) {
                return;
            }
            discardPhoto(photo.path);
        })
        .catch(() => {
            // `promise` resolves instead of rejecting, so there is nothing to clean up here.
        });
}

/**
 * Rejects when `promise` outlives `capMs`, so a step that never settles cannot hold the upgrade open.
 * `discardLateResult` deletes a result that arrives afterwards, which nothing else is left to clean up.
 */
function withDeadline<T>(promise: Promise<T>, capMs: number, step: string, discardLateResult?: (value: T) => void): Promise<T> {
    let cap: ReturnType<typeof setTimeout>;
    let hasTimedOut = false;
    const deadline = new Promise<never>((_resolve, reject) => {
        cap = setTimeout(() => {
            hasTimedOut = true;
            reject(new Error(`[PhotoUpgrade] ${step} did not finish within ${capMs}ms`));
        }, capMs);
    });

    if (discardLateResult) {
        promise
            .then((value) => {
                if (!hasTimedOut) {
                    return;
                }
                discardLateResult(value);
            })
            .catch(() => {
                // A rejection is the race's to report, and there is no result to clean up.
            });
    }

    return Promise.race([promise, deadline]).finally(() => clearTimeout(cap));
}

type PendingPhoto = {
    /** Resolves `undefined` when the capture failed or missed the deadline. */
    promise: Promise<PhotoFile | undefined>;

    /** Gives up on the photo, so whatever lands afterwards is deleted instead of kept. */
    discard: () => void;

    /** Shutter time, so the span covers the capture rather than starting when the receipt is handed over. */
    startedAt: number;

    /** Why the capture produced nothing, read once the race has settled. */
    getFailureOutcome: () => string;
};

/** Named per receipt: an upgrade outlives its capture, so a later one must not end this one's span. */
function toUpgradeSpanId(durableName: string) {
    return `${CONST.TELEMETRY.SPAN_RECEIPT_UPGRADE}_${durableName}`;
}

function abandonPending(pending: PendingPhoto) {
    pending.discard();
    discardWhenItLands(pending);
}

/**
 * Upgrades a receipt captured with `takeSnapshot`, a screen-sized screenshot of the preview, to the
 * full-resolution `takePhoto` photo.
 *
 * Nothing awaits `startPhotoCapture`, so the snapshot keeps driving navigation, and the photo is swapped
 * in under the same durable name once it lands. `hasPendingPhotoCapture` holds the camera session open:
 * closing it mid-capture cancels the photo with "Camera is closed."
 */
function usePhotoUpgrade() {
    const [hasPendingPhotoCapture, setHasPendingPhotoCapture] = useState(false);
    const pendingPhotoRef = useRef<PendingPhoto | undefined>(undefined);

    // Holds the camera session open across the race. Counted rather than a flag because it is released
    // when the race settles, which can be while the capture behind it is still running.
    const captureCountRef = useRef(0);

    // Captures the camera has not finished yet. Not the same as `captureCountRef`, which follows the race
    // below and reaches zero once that gives up — the capture itself runs on past that, and cannot be
    // called off.
    const photosInFlightRef = useRef(0);

    // A capture nobody claimed outlives the screen, so its file has to be cleaned up from here.
    useEffect(
        () => () => {
            const pending = pendingPhotoRef.current;
            if (!pending) {
                return;
            }
            pendingPhotoRef.current = undefined;
            abandonPending(pending);
        },
        [],
    );

    const releaseSession = () => {
        captureCountRef.current -= 1;
        if (captureCountRef.current > 0) {
            return;
        }
        setHasPendingPhotoCapture(false);
    };

    const startPhotoCapture = (camera: Camera) => {
        // This capture was never handed a receipt, and the shutter below replaces it. Cleared before the
        // guard, so a capture that skips the upgrade cannot inherit this one's photo.
        const orphaned = pendingPhotoRef.current;
        pendingPhotoRef.current = undefined;
        if (orphaned) {
            abandonPending(orphaned);
        }

        // Abandoning a capture does not stop it: `discard` only marks the result for deletion, and
        // vision-camera cannot cancel a `takePhoto`. A second one started over a capture still running
        // makes them contend, and the next `takeSnapshot` pays for it — 6.6s measured against an 80ms
        // baseline. A receipt keeping its snapshot is the cheaper loss.
        if (photosInFlightRef.current > 0) {
            Log.info('[PhotoUpgrade] a full-resolution capture is still running, so this receipt keeps its snapshot');
            // No receipt exists yet, so there is no upgrade span to end. The capture span is still open and
            // is the only place this outcome can be recorded.
            getSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE)?.setAttributes({
                [CONST.TELEMETRY.ATTRIBUTE_UPGRADE_ATTEMPTED]: false,
                [CONST.TELEMETRY.ATTRIBUTE_UPGRADE_OUTCOME]: CONST.TELEMETRY.UPGRADE_OUTCOME.STACKED_CAPTURE_SKIPPED,
            });
            return;
        }

        // The denominator for every outcome below. It rides on the capture span rather than the upgrade span
        // because sending the app to the background cancels every open span, and the upgrade's own span is open for
        // seconds while this one has already ended. Without it, a lost outcome is indistinguishable from a
        // capture that never tried, and the success rate reads high.
        getSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE)?.setAttributes({[CONST.TELEMETRY.ATTRIBUTE_UPGRADE_ATTEMPTED]: true});

        const startedAt = Date.now();
        let failureOutcome: string = CONST.TELEMETRY.UPGRADE_OUTCOME.CAPTURE_FAILED;
        let isDiscarded = false;

        // Temp directory, not the receipts folder, so ReceiptStorage stays its only writer and a discarded
        // photo never sits among the receipts.
        const nativeCapture = camera.takePhoto({flash: 'off', enableShutterSound: false, path: RNFS.TemporaryDirectoryPath});

        // Released when the capture settles, which is what the guard above reads.
        photosInFlightRef.current += 1;
        const releasePhotoSlot = () => {
            photosInFlightRef.current -= 1;
        };
        nativeCapture.then(releasePhotoSlot, releasePhotoSlot);

        const capture = nativeCapture.then(
            (photo) => {
                if (!isDiscarded) {
                    return photo;
                }
                discardPhoto(photo.path);
                return undefined;
            },
            (error: unknown) => {
                Log.warn('[PhotoUpgrade] full-resolution capture failed', {error: error instanceof Error ? error.message : String(error)});
                failureOutcome = CONST.TELEMETRY.UPGRADE_OUTCOME.CAPTURE_FAILED;
                return undefined;
            },
        );

        // Outlives the screen on purpose: the swap finishes after the scan page is gone, and a late
        // arrival still needs deleting.
        let deadlineTimeout: ReturnType<typeof setTimeout>;
        const deadline = new Promise<undefined>((resolve) => {
            deadlineTimeout = setTimeout(() => {
                isDiscarded = true;
                failureOutcome = CONST.TELEMETRY.UPGRADE_OUTCOME.CAPTURE_TIMED_OUT;
                resolve(undefined);
            }, PHOTO_CAPTURE_TIMEOUT_MS);
        });

        // Released when the race settles, not when the swap finishes: the rotate and swap need no camera.
        const promise = Promise.race([capture, deadline]).then((photo) => {
            clearTimeout(deadlineTimeout);
            releaseSession();

            if (!photo) {
                Log.info('[PhotoUpgrade] no photo to upgrade with, keeping the snapshot');
                return undefined;
            }

            return photo;
        });

        pendingPhotoRef.current = {
            promise,
            discard: () => {
                isDiscarded = true;
            },
            startedAt,
            getFailureOutcome: () => failureOutcome,
        };
        captureCountRef.current += 1;
        setHasPendingPhotoCapture(true);
    };

    const upgradeReceiptWithPhoto = (durableName: string) => {
        const pending = pendingPhotoRef.current;
        if (!pending) {
            // The only branch that would otherwise say nothing at all, which once left a capture with no
            // `[PhotoUpgrade]` line and no way to tell what had happened to it.
            Log.info('[PhotoUpgrade] no pending photo for this receipt, so it keeps its snapshot', false, {durableName});
            return;
        }
        pendingPhotoRef.current = undefined;

        const spanId = toUpgradeSpanId(durableName);
        // The branches below are not mutually exclusive: a swap that already reported an outcome can still
        // reject afterwards. Reporting once is this hook's business rather than a detail of `endSpan`.
        let hasReportedOutcome = false;
        const reportOutcome = (outcome: string, attributes: Record<string, number> = {}) => {
            if (hasReportedOutcome) {
                return;
            }
            hasReportedOutcome = true;
            endSpanWithAttributes(spanId, {[CONST.TELEMETRY.ATTRIBUTE_UPGRADE_OUTCOME]: outcome, ...attributes});
        };
        // Started from the shutter, so the span covers the capture as well as the swap. It deliberately has
        // no parent: the upgrade outlives the screen, and its shutter span has usually ended by now.
        startSpan(spanId, {
            name: CONST.TELEMETRY.SPAN_RECEIPT_UPGRADE,
            op: CONST.TELEMETRY.SPAN_RECEIPT_UPGRADE,
            startTime: pending.startedAt,
            attributes: {
                [CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: CONST.TELEMETRY.SPAN_PLATFORM.NATIVE,
            },
        });

        // From here a reader can claim these bytes, and a view can refresh once they change.
        startUpgrade(durableName);

        pending.promise
            .then((photo) => {
                if (!photo) {
                    reportOutcome(pending.getFailureOutcome());
                    return undefined;
                }

                return withDeadline(rotatePhotoToUpright(photo.path, photo.orientation), ROTATE_TIMEOUT_MS, 'rotate', (latePath) => {
                    // The swap gave up on this rotate, so the copy it went on to write is left orphaned.
                    if (!latePath) {
                        return;
                    }
                    discardPhoto(latePath);
                }).then((uprightPath) => {
                    // An upload is sending the snapshot. Renaming now would hand it the old bytes, the
                    // new ones, or a missing file.
                    if (wasReceiptClaimed(durableName)) {
                        // Logged like every other outcome: a background cancels the span above, and then the
                        // log is the only record that this receipt was upgraded right up to the rename.
                        Log.info('[PhotoUpgrade] keeping the snapshot, upgrade claimed for upload before the swap started', false, {durableName});
                        reportOutcome(CONST.TELEMETRY.UPGRADE_OUTCOME.CLAIMED_FOR_UPLOAD);
                        discardPhoto(photo.path);
                        if (uprightPath) {
                            discardPhoto(uprightPath);
                        }
                        return undefined;
                    }

                    // Asked again immediately before the rename, since everything between the two checks
                    // yields.
                    return ReceiptStorage.overwrite(durableName, uprightPath ?? photo.path, () => wasReceiptClaimed(durableName))
                        .then(() => {
                            Log.info('[PhotoUpgrade] receipt upgraded to the full-resolution photo', false, {
                                width: photo.width,
                                height: photo.height,
                                wasRotated: !!uprightPath,
                            });
                            // Source dimensions, so the resolution the upgrade actually wins is queryable per device.
                            reportOutcome(CONST.TELEMETRY.UPGRADE_OUTCOME.UPGRADED, {
                                [CONST.TELEMETRY.ATTRIBUTE_PHOTO_WIDTH]: photo.width,
                                [CONST.TELEMETRY.ATTRIBUTE_PHOTO_HEIGHT]: photo.height,
                            });
                            // Only now have the bytes changed, which is what reloads the unchanged path.
                            recordUpgrade(durableName);

                            if (!uprightPath) {
                                return;
                            }
                            // `overwrite` moved the rotated copy, leaving the original behind. Its
                            // cleanup must not fail an upgrade that already went through.
                            discardPhoto(photo.path);
                        })
                        .catch((error: unknown) => {
                            // `overwrite` can reject before it moves the rotated copy.
                            if (uprightPath) {
                                discardPhoto(uprightPath);
                            }
                            throw error;
                        });
                });
            })
            .catch((error: unknown) => {
                // A swap that backed out for an upload is not a failure, and gets its own outcome.
                const wasClaimed = wasReceiptClaimed(durableName);
                const reason = error instanceof Error ? error.message : String(error);
                Log.warn(`[PhotoUpgrade] keeping the snapshot, upgrade ${wasClaimed ? 'claimed for upload' : 'failed'}`, {error: reason});
                let outcome: string = CONST.TELEMETRY.UPGRADE_OUTCOME.SWAP_FAILED;
                if (wasClaimed) {
                    outcome = CONST.TELEMETRY.UPGRADE_OUTCOME.CLAIMED_FOR_UPLOAD;
                } else if (reason.includes('rotate did not finish')) {
                    outcome = CONST.TELEMETRY.UPGRADE_OUTCOME.ROTATE_TIMED_OUT;
                }
                reportOutcome(outcome);
                pending.discard();
                discardWhenItLands(pending);
            })
            .finally(() => finishUpgrade(durableName));
    };

    const discardPendingPhoto = () => {
        const pending = pendingPhotoRef.current;
        if (!pending) {
            return;
        }
        pendingPhotoRef.current = undefined;
        abandonPending(pending);
    };

    return {hasPendingPhotoCapture, startPhotoCapture, upgradeReceiptWithPhoto, discardPendingPhoto};
}

export default usePhotoUpgrade;
