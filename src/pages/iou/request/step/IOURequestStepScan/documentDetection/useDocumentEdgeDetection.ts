/**
 * Runs the native receipt edge detector on camera frames and turns each result into a smoothed outline in the camera
 * preview's coordinates: four straight lines while the receipt moves, the paper's real edge once it holds still.
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

import type {OneEuroState, ViewEdge} from './edgeGeometry';
import type DocumentQuad from './types';
import type {DocumentEdge, QuadPoint} from './types';

import {buildEdge, EDGE_POINT_COUNT, filterOneEuro, getEdgeShape, getViewEdgeAndCorners, hasLocalBendChange} from './edgeGeometry';

// A module-level value, not an import: under Worklets Bundle Mode a worklet resolves captured imports again on its own runtime.
const documentDetector = getDocumentDetectorNitroModule();

// Same reason: a worklet that captures an import gets a remote function, which throws when the worklet calls it.
const edgeGeometry = {EDGE_POINT_COUNT, buildEdge, filterOneEuro, getEdgeShape, getViewEdgeAndCorners, hasLocalBendChange};

const MIN_VISION_CONFIDENCE = 0.3;

const IS_IOS = Platform.OS === 'ios';

const MIN_MODEL_CONFIDENCE = 0.6;

const ROTATION_TO_UPRIGHT = {up: 0, right: 270, down: 180, left: 90} as const;

// Android's model takes a 256x256 input, so a small frame keeps copying and shrinking it cheap. iOS moves Vision's edge
// onto the paper in the camera image itself, so it gets a sharper frame.
const FRAME_OUTPUT_RESOLUTION = IS_IOS ? {width: 1280, height: 960} : {width: 640, height: 480};

const MIN_ANALYSIS_INTERVAL_MS = 80;

const OUTLINE_HOLD_MS = 400;

// When the receipt was moving this fast (view points per second) as it was lost, the phone swung away, so the outline
// hides sooner instead of hanging over the spot the paper left.
const FAST_OUTLINE_SPEED = 210;
const FAST_OUTLINE_HOLD_MS = 120;

// A corner that jumps further than this between two detections is a different receipt, so the outline starts over there
// instead of gliding across the screen.
const OUTLINE_SNAP_DISTANCE = 120;

// One Euro filter cutoffs (Hz): a still receipt is smoothed hard so the outline doesn't jitter, and speed raises the
// cutoff so a moving one isn't trailed.
const CORNER_MIN_CUTOFF = 0.25;
const CORNER_SPEED_CUTOFF = 0.035;
const CORNER_DERIVATIVE_CUTOFF = 1;

// A detection describes a frame taken about this long ago, so a moving outline is drawn this far ahead along the corners'
// speed and doesn't trail the paper.
const CORNER_PREDICTION_SECONDS = 0.11;

// The outline shows straight lines until this many whole-receipt detections in a row agree on the paper's edge while the
// receipt is nearly still. It then locks that shape, so detection noise can't wobble it.
const LOCK_DETECTIONS = 4;
const POINT_AGREEMENT = 0.04;
const AGREEING_POINT_SHARE = 0.8;
const LOCK_MAX_SPEED = 80;

const CANDIDATE_DETECTIONS = 4;

// A fold or tear spans only a few points, so this many neighboring points apart counts as a change of shape.
const MIN_CHANGED_POINTS = 3;

// Further off the straight side than this (a share of the shorter side), a point is a shadow or a misread curl. Higher on
// iOS, where Vision's corners sit on the flat part of a crumpled receipt, so the real edge can lie well outside them.
const MAX_BEND = IS_IOS ? 0.25 : 0.12;

const UNLOCK_SPEED = 210;
const MISSES_TO_UNLOCK = 3;

// The bend fades in and out, and morphs to a new locked shape, by this share per detection, so the outline never jumps.
const BEND_FADE = 0.35;

const PREVIEW_CHECK_INTERVAL_MS = 1000;

const MAX_LOGGED_ERRORS = 3;

type OutlineState = {
    corners: OneEuroState[];
    bend: number[];
    targetBend: number[];
    bendShare: number;
    isLocked: boolean;
    history: number[][];
    candidate: number[];
    agreeingDetections: number;
    missedDetections: number;
    changedDetections: number;
    updatedAt: number;
};

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
        // The smoothed corners, bend and bend share behind the shown outline. Not fixedType, so written with setBlocking.
        outlineState: createSynchronizable<OutlineState | null>(null),
        shownEdge: createSynchronizable<DocumentEdge | null>(null),
    };
}

function getUnchangedPoint(point: QuadPoint): QuadPoint {
    'worklet';

    return point;
}

function isSameBend(first: number[], second: number[]): boolean {
    'worklet';

    if (first.length === 0 || first.length !== second.length) {
        return false;
    }
    let agreeing = 0;
    for (let index = 0; index < first.length; index++) {
        if (Math.abs((first.at(index) ?? 0) - (second.at(index) ?? 0)) <= POINT_AGREEMENT) {
            agreeing++;
        }
    }
    return agreeing >= AGREEING_POINT_SHARE * first.length;
}

function getMedianBend(history: number[][]): number[] {
    'worklet';

    const median: number[] = [];
    const pointCount = history.at(0)?.length ?? 0;
    for (let index = 0; index < pointCount; index++) {
        const values: number[] = [];
        for (const offsets of history) {
            values.push(offsets.at(index) ?? 0);
        }
        values.sort((first, second) => first - second);
        const middle = Math.floor(values.length / 2);
        median.push(values.length % 2 ? (values.at(middle) ?? 0) : ((values.at(middle - 1) ?? 0) + (values.at(middle) ?? 0)) / 2);
    }
    return median;
}

function getCornerSpeed(corners: OneEuroState[]): number {
    'worklet';

    const cornerCount = corners.length / 2;
    if (cornerCount === 0) {
        return 0;
    }
    // Each corner's own speed, averaged, so corners moving apart when the phone moves closer don't cancel out.
    let speed = 0;
    for (let index = 0; index < corners.length; index += 2) {
        speed += Math.hypot(corners.at(index)?.derivative ?? 0, corners.at(index + 1)?.derivative ?? 0) / cornerCount;
    }
    return speed;
}

function getTimestamp(): number {
    'worklet';

    // Not every worklet runtime installs `performance`.
    return typeof performance === 'undefined' ? Date.now() : performance.now();
}

function useDocumentEdgeDetection({cameraRef, isEnabled}: UseDocumentEdgeDetectionParams) {
    const edge = useSharedValue<DocumentEdge | null>(null);
    const [{lastAnalysisAt, loggedErrorCount, lastDetectedAt, lastPreviewCheckAt, outlineState, shownEdge}] = useState(createFrameState);

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

    const setOutline = (outline: DocumentEdge | null) => {
        'worklet';

        shownEdge.setBlocking(outline);
        edge.set(outline);
    };

    const updateOutline = (corners: DocumentQuad | null, detectedEdge: DocumentEdge | undefined, toCameraPoint: (point: QuadPoint) => QuadPoint, detectedAt: number) => {
        'worklet';

        if (!corners || !preview) {
            // Holding the outline over a few missed detections keeps it from flickering.
            const shownState = outlineState.getDirty();
            const holdMs = getCornerSpeed(shownState?.corners ?? []) > FAST_OUTLINE_SPEED ? FAST_OUTLINE_HOLD_MS : OUTLINE_HOLD_MS;
            if (detectedAt - lastDetectedAt.getDirty() >= holdMs && shownEdge.getDirty() !== null) {
                outlineState.setBlocking(null);
                setOutline(null);
            }
            return;
        }
        let view: ViewEdge;
        try {
            view = edgeGeometry.getViewEdgeAndCorners(corners, detectedEdge, (point) => preview.convertCameraPointToViewPoint(toCameraPoint(point)));
        } catch {
            // The preview throws until its first layout.
            return;
        }
        // The position comes from the detector's corners whether or not it bent the edge, so the outline doesn't step each
        // time the bend comes or goes.
        const measured = edgeGeometry.getEdgeShape(view.edge, view.corners);
        if (!measured) {
            return;
        }
        lastDetectedAt.setDirty(detectedAt);
        const isWholeReceipt = detectedEdge?.length === edgeGeometry.EDGE_POINT_COUNT;
        const previous = outlineState.getDirty();
        let hasJumped = !previous;
        for (let corner = 0; previous && corner < measured.corners.length; corner++) {
            const point = measured.corners.at(corner);
            const shownX = previous.corners.at(corner * 2)?.value;
            const shownY = previous.corners.at(corner * 2 + 1)?.value;
            if (point && shownX !== undefined && shownY !== undefined && Math.hypot(point.x - shownX, point.y - shownY) > OUTLINE_SNAP_DISTANCE) {
                hasJumped = true;
            }
        }

        const elapsedSeconds = previous && !hasJumped ? (detectedAt - previous.updatedAt) / 1000 : 0;
        const filteredCorners: OneEuroState[] = [];
        const shownCorners: DocumentQuad = [];
        for (let corner = 0; corner < measured.corners.length; corner++) {
            const point = measured.corners.at(corner);
            if (!point) {
                return;
            }
            const x = edgeGeometry.filterOneEuro(
                hasJumped ? undefined : previous?.corners.at(corner * 2),
                point.x,
                elapsedSeconds,
                CORNER_MIN_CUTOFF,
                CORNER_SPEED_CUTOFF,
                CORNER_DERIVATIVE_CUTOFF,
            );
            const y = edgeGeometry.filterOneEuro(
                hasJumped ? undefined : previous?.corners.at(corner * 2 + 1),
                point.y,
                elapsedSeconds,
                CORNER_MIN_CUTOFF,
                CORNER_SPEED_CUTOFF,
                CORNER_DERIVATIVE_CUTOFF,
            );
            filteredCorners.push(x, y);
            shownCorners.push({x: x.value + x.derivative * CORNER_PREDICTION_SECONDS, y: y.value + y.derivative * CORNER_PREDICTION_SECONDS});
        }

        const speed = getCornerSpeed(filteredCorners);

        const kept = hasJumped ? null : previous;
        let history = kept?.history ?? [];
        let candidate = kept?.candidate ?? [];
        let agreeingDetections = 0;
        if (isWholeReceipt) {
            const offsets: number[] = [];
            for (let index = 0; index < measured.offsets.length; index++) {
                offsets.push(Math.max(-MAX_BEND, Math.min(MAX_BEND, measured.offsets.at(index) ?? 0)));
            }
            if (isSameBend(offsets, candidate)) {
                history = [...history.slice(1 - CANDIDATE_DETECTIONS), offsets];
                agreeingDetections = (kept?.agreeingDetections ?? 0) + 1;
            } else {
                history = [offsets];
                agreeingDetections = 1;
            }
            candidate = getMedianBend(history);
        }
        const missedDetections = isWholeReceipt ? 0 : (kept?.missedDetections ?? 0) + 1;
        const isSettled = agreeingDetections >= LOCK_DETECTIONS;

        let targetBend = kept?.targetBend ?? [];
        let isLocked = kept?.isLocked ?? false;
        let changedDetections = 0;
        if (isLocked && (speed > UNLOCK_SPEED || missedDetections >= MISSES_TO_UNLOCK)) {
            isLocked = false;
        }
        if (!isLocked && isSettled && speed < LOCK_MAX_SPEED) {
            isLocked = true;
            targetBend = candidate;
        } else if (isLocked && isSettled) {
            // A locked shape is only replaced once the settled candidate disagrees with it, so a reshaped receipt is picked
            // up but noise isn't. A change in one place, such as a newly folded corner, must hold for LOCK_DETECTIONS
            // detections first, since the overall check never sees it.
            if (!isSameBend(candidate, targetBend)) {
                targetBend = candidate;
            } else if (edgeGeometry.hasLocalBendChange(candidate, targetBend, POINT_AGREEMENT, MIN_CHANGED_POINTS)) {
                changedDetections = (kept?.changedDetections ?? 0) + 1;
                if (changedDetections >= LOCK_DETECTIONS) {
                    targetBend = candidate;
                    changedDetections = 0;
                }
            }
        }
        const previousBend = kept?.bend ?? [];
        const bend: number[] = [];
        for (let index = 0; index < targetBend.length; index++) {
            const target = targetBend.at(index) ?? 0;
            const shown = previousBend.length === targetBend.length ? (previousBend.at(index) ?? target) : target;
            bend.push(shown + (target - shown) * BEND_FADE);
        }

        const previousShare = kept?.bendShare ?? 0;
        const bendShare = isLocked ? previousShare + (1 - previousShare) * BEND_FADE : previousShare * (1 - BEND_FADE);

        outlineState.setBlocking({
            corners: filteredCorners,
            bend,
            targetBend,
            bendShare,
            isLocked,
            history,
            candidate,
            agreeingDetections,
            missedDetections,
            changedDetections,
            updatedAt: detectedAt,
        });
        setOutline(edgeGeometry.buildEdge(shownCorners, bend, bend.length > 0 ? bendShare : 0));
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

        let corners: DocumentQuad | null = null;
        let detectedEdge: DocumentEdge | undefined;
        let toCameraPoint: (point: QuadPoint) => QuadPoint = getUnchangedPoint;
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
                    corners = document.corners;
                    detectedEdge = document.outline;
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
                corners = document.corners;
                detectedEdge = document.outline;
                toCameraPoint = (point) => frame.convertFramePointToCameraPoint({x: point.x * frame.width, y: point.y * frame.height});
            }
        }
        if (!preview || detectedAt - lastPreviewCheckAt.getDirty() >= PREVIEW_CHECK_INTERVAL_MS) {
            lastPreviewCheckAt.setDirty(detectedAt);
            scheduleOnRN(syncPreview);
        }
        updateOutline(corners, detectedEdge, toCameraPoint, detectedAt);
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
                    if (shownEdge.getDirty() !== null) {
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
                // A failed frame counts as a missed detection, so the hold timeout still clears the outline.
                updateOutline(null, undefined, getUnchangedPoint, getTimestamp());
            } finally {
                frame.dispose();
            }
        },
    });

    return {frameOutput, edge};
}

export default useDocumentEdgeDetection;
