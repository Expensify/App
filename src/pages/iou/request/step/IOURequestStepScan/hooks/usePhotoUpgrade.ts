/**
 * Captures a full-resolution photo alongside the fast snapshot and, once a receipt exists, swaps the
 * higher-quality photo in behind it. Owns capture deadlines, rotation, and upgrade telemetry.
 */
import Log from '@libs/Log';
import ReceiptStorage from '@libs/ReceiptStorage';
import {finish as finishUpgrade, isClaimedForRead as wasReceiptClaimed, recordUpgrade, start as startUpgrade} from '@libs/ReceiptStorage/receiptUpgrades';
import {endSpanWithAttributes, getSpan, startSpan} from '@libs/telemetry/activeSpans';

import rotatePhotoToUpright from '@pages/iou/request/step/IOURequestStepScan/utils/rotatePhotoToUpright';

import CONST from '@src/CONST';

import type {Camera, PhotoFile} from 'react-native-vision-camera';

import {useEffect, useRef, useState} from 'react';
import RNFS from 'react-native-fs';

const PHOTO_CAPTURE_TIMEOUT_MS = 3000;

const ROTATE_TIMEOUT_MS = 5000;

function discardPhoto(path: string) {
    ReceiptStorage.discard(path).catch((error: unknown) => {
        Log.warn('[PhotoUpgrade] could not delete the abandoned photo', {error: error instanceof Error ? error.message : String(error)});
    });
}

function discardWhenItLands(pending: PendingPhoto) {
    pending.promise
        .then((photo) => {
            if (!photo) {
                return;
            }
            discardPhoto(photo.path);
        })
        .catch(() => {});
}

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
            .catch(() => {});
    }

    return Promise.race([promise, deadline]).finally(() => clearTimeout(cap));
}

type PendingPhoto = {
    promise: Promise<PhotoFile | undefined>;

    discard: () => void;

    startedAt: number;

    getFailureOutcome: () => string;
};

function toUpgradeSpanId(durableName: string) {
    return `${CONST.TELEMETRY.SPAN_RECEIPT_UPGRADE}_${durableName}`;
}

function abandonPending(pending: PendingPhoto) {
    pending.discard();
    discardWhenItLands(pending);
}

function usePhotoUpgrade() {
    const [hasPendingPhotoCapture, setHasPendingPhotoCapture] = useState(false);
    const pendingPhotoRef = useRef<PendingPhoto | undefined>(undefined);

    // `hasPendingPhotoCapture` holds the vision-camera session open: closing it mid-capture cancels the
    // photo with "Camera is closed."
    const captureCountRef = useRef(0);

    const photosInFlightRef = useRef(0);

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
        const orphaned = pendingPhotoRef.current;
        pendingPhotoRef.current = undefined;
        if (orphaned) {
            abandonPending(orphaned);
        }

        // Abandoning a capture does not stop it: `discard` only marks the result for deletion, and
        // vision-camera cannot cancel a `takePhoto`. A second one started over a capture still running
        // makes them contend, and the next `takeSnapshot` pays for it. 6.6s measured against an 80ms
        // baseline. A receipt keeping its snapshot is the cheaper loss.
        if (photosInFlightRef.current > 0) {
            Log.info('[PhotoUpgrade] a full-resolution capture is still running, so this receipt keeps its snapshot');
            getSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE)?.setAttributes({
                [CONST.TELEMETRY.ATTRIBUTE_UPGRADE_ATTEMPTED]: false,
                [CONST.TELEMETRY.ATTRIBUTE_UPGRADE_OUTCOME]: CONST.TELEMETRY.UPGRADE_OUTCOME.STACKED_CAPTURE_SKIPPED,
            });
            return;
        }

        getSpan(CONST.TELEMETRY.SPAN_RECEIPT_CAPTURE)?.setAttributes({[CONST.TELEMETRY.ATTRIBUTE_UPGRADE_ATTEMPTED]: true});

        const startedAt = Date.now();
        let failureOutcome: string = CONST.TELEMETRY.UPGRADE_OUTCOME.CAPTURE_FAILED;
        let isDiscarded = false;

        const nativeCapture = camera.takePhoto({flash: 'off', enableShutterSound: false, path: RNFS.TemporaryDirectoryPath});

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

        let deadlineTimeout: ReturnType<typeof setTimeout>;
        const deadline = new Promise<undefined>((resolve) => {
            deadlineTimeout = setTimeout(() => {
                isDiscarded = true;
                failureOutcome = CONST.TELEMETRY.UPGRADE_OUTCOME.CAPTURE_TIMED_OUT;
                resolve(undefined);
            }, PHOTO_CAPTURE_TIMEOUT_MS);
        });

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
            Log.info('[PhotoUpgrade] no pending photo for this receipt, so it keeps its snapshot', false, {durableName});
            return;
        }
        pendingPhotoRef.current = undefined;

        const spanId = toUpgradeSpanId(durableName);
        let hasReportedOutcome = false;
        const reportOutcome = (outcome: string, attributes: Record<string, number> = {}) => {
            if (hasReportedOutcome) {
                return;
            }
            hasReportedOutcome = true;
            endSpanWithAttributes(spanId, {[CONST.TELEMETRY.ATTRIBUTE_UPGRADE_OUTCOME]: outcome, ...attributes});
        };
        startSpan(spanId, {
            name: CONST.TELEMETRY.SPAN_RECEIPT_UPGRADE,
            op: CONST.TELEMETRY.SPAN_RECEIPT_UPGRADE,
            startTime: pending.startedAt,
            attributes: {
                [CONST.TELEMETRY.ATTRIBUTE_PLATFORM]: CONST.TELEMETRY.SPAN_PLATFORM.NATIVE,
            },
        });

        startUpgrade(durableName);

        pending.promise
            .then((photo) => {
                if (!photo) {
                    reportOutcome(pending.getFailureOutcome());
                    return undefined;
                }

                return withDeadline(rotatePhotoToUpright(photo.path, photo.orientation), ROTATE_TIMEOUT_MS, 'rotate', (latePath) => {
                    if (!latePath) {
                        return;
                    }
                    discardPhoto(latePath);
                }).then((uprightPath) => {
                    if (wasReceiptClaimed(durableName)) {
                        Log.info('[PhotoUpgrade] keeping the snapshot, upgrade claimed for upload before the swap started', false, {durableName});
                        reportOutcome(CONST.TELEMETRY.UPGRADE_OUTCOME.CLAIMED_FOR_UPLOAD);
                        discardPhoto(photo.path);
                        if (uprightPath) {
                            discardPhoto(uprightPath);
                        }
                        return undefined;
                    }

                    return ReceiptStorage.overwrite(durableName, uprightPath ?? photo.path, () => wasReceiptClaimed(durableName))
                        .then(() => {
                            Log.info('[PhotoUpgrade] receipt upgraded to the full-resolution photo', false, {
                                width: photo.width,
                                height: photo.height,
                                wasRotated: !!uprightPath,
                            });
                            reportOutcome(CONST.TELEMETRY.UPGRADE_OUTCOME.UPGRADED, {
                                [CONST.TELEMETRY.ATTRIBUTE_PHOTO_WIDTH]: photo.width,
                                [CONST.TELEMETRY.ATTRIBUTE_PHOTO_HEIGHT]: photo.height,
                            });
                            recordUpgrade(durableName);

                            if (!uprightPath) {
                                return;
                            }
                            discardPhoto(photo.path);
                        })
                        .catch((error: unknown) => {
                            if (uprightPath) {
                                discardPhoto(uprightPath);
                            }
                            throw error;
                        });
                });
            })
            .catch((error: unknown) => {
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
