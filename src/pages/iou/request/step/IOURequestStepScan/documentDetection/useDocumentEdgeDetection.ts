/**
 * Runs the native receipt edge detector on camera frames and turns each result into a smoothed outline in the
 * camera preview's coordinates.
 */
import Log from '@libs/Log';

import type {RefObject} from 'react';
import type {CameraRef, Frame, PreviewView} from 'react-native-vision-camera';

import {getDocumentDetectorNitroModule} from '@expensify/nitro-utils';
import {useEffect, useState} from 'react';
import {Platform} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';
import {useFrameOutput} from 'react-native-vision-camera';
import {createSynchronizable, scheduleOnRN} from 'react-native-worklets';

import type DocumentQuad from './types';

// A module-level value, not an import: under Worklets Bundle Mode a worklet resolves captured imports again on its own runtime.
const documentDetector = getDocumentDetectorNitroModule();

const MIN_VISION_CONFIDENCE = 0.3;

const IS_IOS = Platform.OS === 'ios';

const MIN_MODEL_CONFIDENCE = 0.6;

const ROTATION_TO_UPRIGHT = {up: 0, right: 270, down: 180, left: 90} as const;

const FRAME_OUTPUT_RESOLUTION = IS_IOS ? {width: 1280, height: 960} : {width: 640, height: 480};

const MIN_ANALYSIS_INTERVAL_MS = 80;

const OUTLINE_HOLD_MS = 400;

const OUTLINE_SMOOTHING = 0.35;

const OUTLINE_FOLLOW_DISTANCE = 30;

const OUTLINE_DEAD_ZONE = 3;

const OUTLINE_SNAP_DISTANCE = 120;

const PREVIEW_CHECK_INTERVAL_MS = 1000;

const MAX_LOGGED_ERRORS = 3;

type UseDocumentEdgeDetectionParams = {
    cameraRef: RefObject<CameraRef | null>;
    isEnabled: boolean;
};

// Reanimated shared values block on the UI thread when read from the camera's runtime, so the frame worklet uses Synchronizables.
function createFrameState() {
    return {
        lastAnalysisAt: createSynchronizable(0, {fixedType: true}),
        loggedErrorCount: createSynchronizable(0, {fixedType: true}),
        lastDetectedAt: createSynchronizable(0, {fixedType: true}),
        lastPreviewCheckAt: createSynchronizable(0, {fixedType: true}),
        shownQuad: createSynchronizable<DocumentQuad | null>(null),
    };
}

function getTimestamp(): number {
    'worklet';

    // Not every worklet runtime installs `performance`.
    return typeof performance === 'undefined' ? Date.now() : performance.now();
}

function useDocumentEdgeDetection({cameraRef, isEnabled}: UseDocumentEdgeDetectionParams) {
    const quad = useSharedValue<DocumentQuad | null>(null);
    const [{lastAnalysisAt, loggedErrorCount, lastDetectedAt, lastPreviewCheckAt, shownQuad}] = useState(createFrameState);

    const [preview, setPreview] = useState<PreviewView | undefined>(undefined);
    const syncPreview = () => {
        const currentPreview = cameraRef.current?.preview;
        if (currentPreview !== preview) {
            setPreview(currentPreview);
        }
    };

    useEffect(() => {
        setPreview(cameraRef.current?.preview);
    }, [cameraRef]);

    const setOutline = (outline: DocumentQuad | null) => {
        'worklet';

        shownQuad.setBlocking(outline);
        quad.set(outline);
    };

    const updateOutline = (cameraQuad: DocumentQuad | null, detectedAt: number) => {
        'worklet';

        if (!cameraQuad || !preview) {
            if (detectedAt - lastDetectedAt.getDirty() >= OUTLINE_HOLD_MS && shownQuad.getDirty() !== null) {
                setOutline(null);
            }
            return;
        }
        let viewQuad: DocumentQuad;
        try {
            viewQuad = cameraQuad.map((point) => preview.convertCameraPointToViewPoint(point));
        } catch {
            // The preview throws until its first layout.
            return;
        }
        lastDetectedAt.setDirty(detectedAt);
        const shown = shownQuad.getDirty();
        if (!shown || shown.length !== viewQuad.length) {
            setOutline(viewQuad);
            return;
        }
        const distances = viewQuad.map((point, index) => {
            const shownPoint = shown.at(index) ?? point;
            return Math.hypot(point.x - shownPoint.x, point.y - shownPoint.y);
        });
        const largestMove = Math.max(...distances);
        if (largestMove > OUTLINE_SNAP_DISTANCE) {
            setOutline(viewQuad);
            return;
        }
        if (largestMove < OUTLINE_DEAD_ZONE) {
            return;
        }
        const followShare = Math.min(1, (largestMove - OUTLINE_DEAD_ZONE) / (OUTLINE_FOLLOW_DISTANCE - OUTLINE_DEAD_ZONE));
        const smoothing = OUTLINE_SMOOTHING + (1 - OUTLINE_SMOOTHING) * followShare;
        setOutline(
            viewQuad.map((point, index) => {
                const shownPoint = shown.at(index) ?? point;
                if ((distances.at(index) ?? 0) < OUTLINE_DEAD_ZONE) {
                    return shownPoint;
                }
                return {
                    x: shownPoint.x + (point.x - shownPoint.x) * smoothing,
                    y: shownPoint.y + (point.y - shownPoint.y) * smoothing,
                };
            }),
        );
    };

    const logError = (message: string, stack: string | undefined) => {
        Log.warn('[DocumentDetection] frame processing failed', {message, stack});
    };

    const processFrame = (frame: Frame) => {
        'worklet';

        const startedAt = getTimestamp();
        if (startedAt - lastAnalysisAt.getDirty() < MIN_ANALYSIS_INTERVAL_MS) {
            return;
        }
        lastAnalysisAt.setDirty(startedAt);

        let cameraQuad: DocumentQuad | null = null;
        let detectedAt: number;

        if (!documentDetector?.isSupported) {
            return;
        }
        if (IS_IOS) {
            const nativeBuffer = frame.getNativeBuffer();
            try {
                const document = documentDetector.detect(nativeBuffer.pointer);
                // VisionCamera 5.2.3 on iOS rotates converted frame points twice, swapping x and y, so Vision's raw-buffer corners are used as they are.
                if (document && document.confidence >= MIN_VISION_CONFIDENCE && document.corners.length === 4) {
                    cameraQuad = document.corners;
                }
            } finally {
                nativeBuffer.release();
            }
            detectedAt = getTimestamp();
        } else {
            const [yPlane, uPlane, vPlane] = frame.getPlanes();
            if (!yPlane?.isValid || !uPlane?.isValid || !vPlane?.isValid) {
                throw new Error(`Frame has no YUV planes (pixelFormat=${frame.pixelFormat})`);
            }
            const document = documentDetector.detectYuv({
                y: yPlane.getPixelBuffer(),
                u: uPlane.getPixelBuffer(),
                v: vPlane.getPixelBuffer(),
                width: frame.width,
                height: frame.height,
                yRowStride: yPlane.bytesPerRow,
                uvRowStride: uPlane.bytesPerRow,
                // A plane's width is rowStride / pixelStride, so this gives the chroma pixel stride back.
                uvPixelStride: Math.round(uPlane.bytesPerRow / uPlane.width),
                rotation: ROTATION_TO_UPRIGHT[frame.orientation],
            });
            detectedAt = getTimestamp();
            if (document && document.confidence >= MIN_MODEL_CONFIDENCE && document.corners.length === 4) {
                cameraQuad = document.corners.map((corner) => frame.convertFramePointToCameraPoint({x: corner.x * frame.width, y: corner.y * frame.height}));
            }
        }
        if (!preview || detectedAt - lastPreviewCheckAt.getDirty() >= PREVIEW_CHECK_INTERVAL_MS) {
            lastPreviewCheckAt.setDirty(detectedAt);
            scheduleOnRN(syncPreview);
        }
        updateOutline(cameraQuad, detectedAt);
    };

    const frameOutput = useFrameOutput({
        targetResolution: FRAME_OUTPUT_RESOLUTION,
        // 'native' can be an opaque 'private' format on Android.
        pixelFormat: 'yuv',
        // Without a handler, VisionCamera console.warns on every dropped frame.
        onFrameDropped: () => {},
        onFrame(frame) {
            'worklet';

            try {
                if (!isEnabled) {
                    if (shownQuad.getDirty() !== null) {
                        setOutline(null);
                    }
                    return;
                }
                processFrame(frame);
            } catch (error) {
                if (loggedErrorCount.getDirty() < MAX_LOGGED_ERRORS) {
                    loggedErrorCount.setDirty(loggedErrorCount.getDirty() + 1);
                    scheduleOnRN(logError, error instanceof Error ? error.message : String(error), error instanceof Error ? error.stack : undefined);
                }
            } finally {
                frame.dispose();
            }
        },
    });

    return {frameOutput, quad};
}

export default useDocumentEdgeDetection;
