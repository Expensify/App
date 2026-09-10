import Log from '@libs/Log';
import ReceiptStorage from '@libs/ReceiptStorage';
import {finish as finishUpgrade, start as startUpgrade} from '@libs/ReceiptStorage/receiptUpgrades';

import rotateStillToUpright from '@pages/iou/request/step/IOURequestStepScan/utils/rotateStillToUpright';

import type {Camera, PhotoFile} from 'react-native-vision-camera';

import {useRef, useState} from 'react';
import RNFS from 'react-native-fs';

/**
 * Runs the full-resolution still capture that upgrades a receipt taken with `takeSnapshot`.
 */

/**
 * How long the camera session is held open waiting for the still. After that the receipt keeps the
 * snapshot, which is how this path behaved before the upgrade.
 */
const STILL_CAPTURE_TIMEOUT_MS = 3000;

/**
 * Deletes a still that has no consumer. A failure only leaves a file in the OS temp directory, so it is
 * logged and not surfaced.
 */
function discardStill(path: string) {
    ReceiptStorage.discard(path).catch((error: unknown) => {
        Log.warn('[StillPhotoUpgrade] could not delete the abandoned still', {error: error instanceof Error ? error.message : String(error)});
    });
}

/**
 * Deletes the still once the pending capture produces one. Callers set `isDiscarded` first, so a still
 * that lands before this runs is deleted by the capture handler instead.
 */
function discardWhenItLands(pending: PendingStill) {
    pending.promise
        .then((photo) => {
            if (!photo) {
                return;
            }
            discardStill(photo.path);
        })
        .catch(() => {
            // `promise` resolves instead of rejecting, so there is nothing to clean up here.
        });
}

type PendingStill = {
    /** Resolves with the temporary still, or `undefined` when the capture failed or missed the deadline. */
    promise: Promise<PhotoFile | undefined>;

    /** Set once the still has no consumer, so anything that lands afterwards is deleted. */
    isDiscarded: boolean;
};

/**
 * Upgrades a receipt captured with `takeSnapshot`, a screen-sized screenshot of the preview, to the
 * full-resolution `takePhoto` still.
 *
 * `captureStill` starts the still at the shutter and nothing awaits it, so the snapshot keeps driving
 * navigation, and `upgradeReceiptWithStill` swaps the still onto that receipt in place under the same
 * durable name. `hasPendingStillCapture` holds the camera session open, since closing it during a capture
 * cancels the still with "Camera is closed."
 */
function useStillPhotoUpgrade() {
    const [hasPendingStillCapture, setHasPendingStillCapture] = useState(false);
    const pendingStillRef = useRef<PendingStill | undefined>(undefined);

    // Retaking a receipt can leave two captures in flight, so count them. With a single flag, the first
    // capture to settle would close the session under the second one.
    const captureCountRef = useRef(0);

    const releaseSession = () => {
        captureCountRef.current -= 1;
        if (captureCountRef.current > 0) {
            return;
        }
        setHasPendingStillCapture(false);
    };

    const captureStill = (camera: Camera) => {
        const pending: PendingStill = {isDiscarded: false, promise: Promise.resolve(undefined)};

        // The still goes to the temp directory, not the receipts folder, so ReceiptStorage stays the only
        // writer there and an abandoned still never sits among the receipts looking like one.
        const capture = camera.takePhoto({flash: 'off', enableShutterSound: false, path: RNFS.TemporaryDirectoryPath}).then(
            (photo) => {
                if (!pending.isDiscarded) {
                    return photo;
                }
                // This one has no consumer, so it does not stay on disk.
                discardStill(photo.path);
                return undefined;
            },
            (error: unknown) => {
                Log.warn('[StillPhotoUpgrade] full-resolution capture failed', {error: error instanceof Error ? error.message : String(error)});
                return undefined;
            },
        );

        // The deadline outlives the screen on purpose, since the swap finishes after the scan page is gone
        // and a late arrival still needs deleting.
        let deadlineTimeout: ReturnType<typeof setTimeout>;
        const deadline = new Promise<undefined>((resolve) => {
            deadlineTimeout = setTimeout(() => {
                pending.isDiscarded = true;
                resolve(undefined);
            }, STILL_CAPTURE_TIMEOUT_MS);
        });

        // The session is released when the race settles, not when the swap finishes. Once the still is on
        // disk the camera is free, and the rotate and replace steps run without it.
        pending.promise = Promise.race([capture, deadline]).then((photo) => {
            clearTimeout(deadlineTimeout);
            releaseSession();

            if (!photo) {
                Log.info('[StillPhotoUpgrade] no still to upgrade with, keeping the snapshot');
                return undefined;
            }

            return photo;
        });

        pendingStillRef.current = pending;
        captureCountRef.current += 1;
        setHasPendingStillCapture(true);
    };

    const upgradeReceiptWithStill = (durableName: string) => {
        const pending = pendingStillRef.current;
        if (!pending) {
            return;
        }
        pendingStillRef.current = undefined;

        // Anything that reads or shows this receipt can now wait for the better file, or refresh once it
        // arrives, instead of taking the snapshot it is about to replace.
        startUpgrade(durableName);

        pending.promise
            .then((photo) => {
                if (!photo) {
                    return undefined;
                }

                return rotateStillToUpright(photo.path).then((uprightPath) =>
                    ReceiptStorage.overwrite(durableName, uprightPath ?? photo.path).then(() => {
                        Log.info('[StillPhotoUpgrade] receipt upgraded to the full-resolution still', false, {
                            width: photo.width,
                            height: photo.height,
                            wasRotated: !!uprightPath,
                        });

                        if (!uprightPath) {
                            return;
                        }
                        // `overwrite` moved the rotated copy, so the original is left behind, and its cleanup
                        // must not fail an upgrade that already went through.
                        discardStill(photo.path);
                    }),
                );
            })
            .catch((error: unknown) => {
                Log.warn('[StillPhotoUpgrade] keeping the snapshot, upgrade failed', {error: error instanceof Error ? error.message : String(error)});
                pending.isDiscarded = true;
                discardWhenItLands(pending);
            })
            .finally(() => finishUpgrade(durableName));
    };

    const discardPendingStill = () => {
        const pending = pendingStillRef.current;
        if (!pending) {
            return;
        }
        pendingStillRef.current = undefined;
        pending.isDiscarded = true;
        discardWhenItLands(pending);
    };

    return {hasPendingStillCapture, captureStill, upgradeReceiptWithStill, discardPendingStill};
}

export default useStillPhotoUpgrade;
