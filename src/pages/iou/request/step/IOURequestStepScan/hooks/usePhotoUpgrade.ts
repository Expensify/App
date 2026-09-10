import Log from '@libs/Log';
import ReceiptStorage from '@libs/ReceiptStorage';
import {finish as finishUpgrade, start as startUpgrade} from '@libs/ReceiptStorage/receiptUpgrades';
import {endSpanWithAttributes, startSpan} from '@libs/telemetry/activeSpans';

import rotatePhotoToUpright from '@pages/iou/request/step/IOURequestStepScan/utils/rotatePhotoToUpright';

import CONST from '@src/CONST';

import type {Camera, PhotoFile} from 'react-native-vision-camera';

import {useRef, useState} from 'react';
import RNFS from 'react-native-fs';

/**
 * Runs the full-resolution photo capture that upgrades a receipt taken with `takeSnapshot`.
 */

/**
 * How long the camera session is held open waiting for the photo. After that the receipt keeps the
 * snapshot, which is how this path behaved before the upgrade.
 */
const PHOTO_CAPTURE_TIMEOUT_MS = 3000;

/**
 * Deletes a photo that has no consumer. A failure only leaves a file in the OS temp directory, so it is
 * logged and not surfaced.
 */
function discardPhoto(path: string) {
    ReceiptStorage.discard(path).catch((error: unknown) => {
        Log.warn('[PhotoUpgrade] could not delete the abandoned photo', {error: error instanceof Error ? error.message : String(error)});
    });
}

/**
 * Deletes the photo once the pending capture produces one. Callers set `isDiscarded` first, so a photo
 * that lands before this runs is deleted by the capture handler instead.
 */
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

type PendingPhoto = {
    /** Resolves with the temporary photo, or `undefined` when the capture failed or missed the deadline. */
    promise: Promise<PhotoFile | undefined>;

    /** Set once the photo has no consumer, so anything that lands afterwards is deleted. */
    isDiscarded: boolean;
};

/**
 * Upgrades a receipt captured with `takeSnapshot`, a screen-sized screenshot of the preview, to the
 * full-resolution `takePhoto` photo.
 *
 * `startPhotoCapture` starts the photo at the shutter and nothing awaits it, so the snapshot keeps driving
 * navigation, and `upgradeReceiptWithPhoto` swaps the photo onto that receipt in place under the same
 * durable name. `hasPendingPhotoCapture` holds the camera session open, since closing it during a capture
 * cancels the photo with "Camera is closed."
 */
function usePhotoUpgrade() {
    const [hasPendingPhotoCapture, setHasPendingPhotoCapture] = useState(false);
    const pendingPhotoRef = useRef<PendingPhoto | undefined>(undefined);

    // Retaking a receipt can leave two captures in flight, so count them. With a single flag, the first
    // capture to settle would close the session under the second one.
    const captureCountRef = useRef(0);

    const releaseSession = () => {
        captureCountRef.current -= 1;
        if (captureCountRef.current > 0) {
            return;
        }
        setHasPendingPhotoCapture(false);
    };

    const startPhotoCapture = (camera: Camera) => {
        const pending: PendingPhoto = {isDiscarded: false, promise: Promise.resolve(undefined)};

        // The photo goes to the temp directory, not the receipts folder, so ReceiptStorage stays the only
        // writer there and an abandoned photo never sits among the receipts looking like one.
        const capture = camera.takePhoto({flash: 'off', enableShutterSound: false, path: RNFS.TemporaryDirectoryPath}).then(
            (photo) => {
                if (!pending.isDiscarded) {
                    return photo;
                }
                // This one has no consumer, so it does not stay on disk.
                discardPhoto(photo.path);
                return undefined;
            },
            (error: unknown) => {
                Log.warn('[PhotoUpgrade] full-resolution capture failed', {error: error instanceof Error ? error.message : String(error)});
                return undefined;
            },
        );

        // The deadline outlives the screen on purpose, since the swap finishes after the scan page is gone
        // and a late arrival needs deleting too.
        let deadlineTimeout: ReturnType<typeof setTimeout>;
        const deadline = new Promise<undefined>((resolve) => {
            deadlineTimeout = setTimeout(() => {
                pending.isDiscarded = true;
                resolve(undefined);
            }, PHOTO_CAPTURE_TIMEOUT_MS);
        });

        // The session is released when the race settles, not when the swap finishes. Once the photo is on
        // disk the camera is free, and the rotate and replace steps run without it.
        pending.promise = Promise.race([capture, deadline]).then((photo) => {
            clearTimeout(deadlineTimeout);
            releaseSession();

            if (!photo) {
                Log.info('[PhotoUpgrade] no photo to upgrade with, keeping the snapshot');
                return undefined;
            }

            return photo;
        });

        pendingPhotoRef.current = pending;
        captureCountRef.current += 1;
        setHasPendingPhotoCapture(true);

        // Nothing about this upgrade is visible to the user, so the span is the only way to tell a receipt
        // that was upgraded from one that quietly kept its snapshot.
        startSpan(CONST.TELEMETRY.SPAN_RECEIPT_PHOTO_UPGRADE, {
            name: CONST.TELEMETRY.SPAN_RECEIPT_PHOTO_UPGRADE,
            op: CONST.TELEMETRY.SPAN_RECEIPT_PHOTO_UPGRADE,
            attributes: {[CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: CONST.TELEMETRY.SPAN_PLATFORM.NATIVE},
        });
    };

    const upgradeReceiptWithPhoto = (durableName: string) => {
        const pending = pendingPhotoRef.current;
        if (!pending) {
            return;
        }
        pendingPhotoRef.current = undefined;

        // Anything that reads or shows this receipt can now wait for the better file, or refresh once it
        // arrives, instead of taking the snapshot it is about to replace.
        startUpgrade(durableName);

        pending.promise
            .then((photo) => {
                if (!photo) {
                    endSpanWithAttributes(CONST.TELEMETRY.SPAN_RECEIPT_PHOTO_UPGRADE, {
                        [CONST.TELEMETRY.ATTRIBUTE_UPGRADE_OUTCOME]: CONST.TELEMETRY.UPGRADE_OUTCOME.NO_PHOTO,
                    });
                    return undefined;
                }

                return rotatePhotoToUpright(photo.path).then((uprightPath) =>
                    ReceiptStorage.overwrite(durableName, uprightPath ?? photo.path).then(() => {
                        Log.info('[PhotoUpgrade] receipt upgraded to the full-resolution photo', false, {
                            width: photo.width,
                            height: photo.height,
                            wasRotated: !!uprightPath,
                        });
                        endSpanWithAttributes(CONST.TELEMETRY.SPAN_RECEIPT_PHOTO_UPGRADE, {
                            [CONST.TELEMETRY.ATTRIBUTE_UPGRADE_OUTCOME]: CONST.TELEMETRY.UPGRADE_OUTCOME.UPGRADED,
                            [CONST.TELEMETRY.ATTRIBUTE_PHOTO_WIDTH]: photo.width,
                            [CONST.TELEMETRY.ATTRIBUTE_PHOTO_HEIGHT]: photo.height,
                        });

                        if (!uprightPath) {
                            return;
                        }
                        // `overwrite` moved the rotated copy, so the original is left behind, and its cleanup
                        // must not fail an upgrade that already went through.
                        discardPhoto(photo.path);
                    }),
                );
            })
            .catch((error: unknown) => {
                Log.warn('[PhotoUpgrade] keeping the snapshot, upgrade failed', {error: error instanceof Error ? error.message : String(error)});
                endSpanWithAttributes(CONST.TELEMETRY.SPAN_RECEIPT_PHOTO_UPGRADE, {
                    [CONST.TELEMETRY.ATTRIBUTE_UPGRADE_OUTCOME]: CONST.TELEMETRY.UPGRADE_OUTCOME.FAILED,
                });
                pending.isDiscarded = true;
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
        endSpanWithAttributes(CONST.TELEMETRY.SPAN_RECEIPT_PHOTO_UPGRADE, {
            [CONST.TELEMETRY.ATTRIBUTE_UPGRADE_OUTCOME]: CONST.TELEMETRY.UPGRADE_OUTCOME.ABANDONED,
        });
        pending.isDiscarded = true;
        discardWhenItLands(pending);
    };

    return {hasPendingPhotoCapture, startPhotoCapture, upgradeReceiptWithPhoto, discardPendingPhoto};
}

export default usePhotoUpgrade;
