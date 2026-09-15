import Log from '@libs/Log';
import ReceiptStorage from '@libs/ReceiptStorage';
import {finish as finishUpgrade, isClaimedForRead as wasReceiptClaimed, recordUpgrade, start as startUpgrade} from '@libs/ReceiptStorage/receiptUpgrades';

import rotatePhotoToUpright from '@pages/iou/request/step/IOURequestStepScan/utils/rotatePhotoToUpright';

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
};

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
            return;
        }

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
                return undefined;
            },
        );

        // Outlives the screen on purpose: the swap finishes after the scan page is gone, and a late
        // arrival still needs deleting.
        let deadlineTimeout: ReturnType<typeof setTimeout>;
        const deadline = new Promise<undefined>((resolve) => {
            deadlineTimeout = setTimeout(() => {
                isDiscarded = true;
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
        };
        captureCountRef.current += 1;
        setHasPendingPhotoCapture(true);
    };

    const upgradeReceiptWithPhoto = (durableName: string) => {
        const pending = pendingPhotoRef.current;
        if (!pending) {
            return;
        }
        pendingPhotoRef.current = undefined;

        // From here a reader can claim these bytes, and a view can refresh once they change.
        startUpgrade(durableName);

        pending.promise
            .then((photo) => {
                if (!photo) {
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
                Log.warn(`[PhotoUpgrade] keeping the snapshot, upgrade ${wasClaimed ? 'claimed for upload' : 'failed'}`, {
                    error: error instanceof Error ? error.message : String(error),
                });
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
