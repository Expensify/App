/**
 * Runs the native receipt edge detector on camera frames and turns each result into a smoothed outline in the camera
 * preview's coordinates: four straight lines while the receipt moves, the paper's real edge once it holds still.
 */
import Log from '@libs/Log';

import type {RefObject} from 'react';
import type {CameraRef, Frame, PreviewView} from 'react-native-vision-camera';

import {getDocumentDetectorNitroModule} from '@expensify/nitro-utils';
import {useEffect, useState} from 'react';
import {useSharedValue} from 'react-native-reanimated';
import {useFrameOutput} from 'react-native-vision-camera';
import {createSynchronizable, scheduleOnRN} from 'react-native-worklets';

import type {OneEuroState, ViewEdge} from './edgeGeometry';
import type DocumentQuad from './types';
import type {DocumentEdge, QuadPoint} from './types';

import {buildEdge, EDGE_POINT_COUNT, filterOneEuro, getEdgeShape, getViewEdgeAndCorners, hasLocalBendChange, resampleEdge} from './edgeGeometry';
import documentReader from './readDocument';

// A module-level value, not an import: under Worklets Bundle Mode a worklet resolves captured imports again on its own runtime.
const documentDetector = getDocumentDetectorNitroModule();

// Same reason: a worklet that captures an import gets a remote function, which throws when the worklet calls it.
const edgeGeometry = {EDGE_POINT_COUNT, buildEdge, filterOneEuro, getEdgeShape, getViewEdgeAndCorners, hasLocalBendChange, resampleEdge};

const platformReader = {readDocument: documentReader.readDocument};

const FRAME_OUTPUT_RESOLUTION = documentReader.frameResolution;

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

const MAX_BEND = documentReader.maxBend;

const UNLOCK_SPEED = 210;

const HIDE_SPEED = 150;
const SHOW_SPEED = 80;
const MISSES_TO_UNLOCK = 3;

// The bend fades in and out, and morphs to a new locked shape, by this share per detection, so the outline never jumps.
const BEND_FADE = 0.35;

const LONE_CORNER_DISTANCE = 30;
const LONE_CORNER_STILL_DISTANCE = 10;
const LONE_CORNER_HOLD_DETECTIONS = 12;

const MIN_CORNER_ANGLE_DEG = 45;
const MAX_CORNER_ANGLE_DEG = 135;
const MAX_CORNER_ANGLE_CHANGE_DEG = 35;
const MAX_SKIPPED_SHAPES = 15;

const SKIPS_BEFORE_SHOWING = 3;

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
    heldCornerDetections: number;
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
        skippedShapes: createSynchronizable(0, {fixedType: true}),
        owner: createSynchronizable(0, {fixedType: true}),
        // The smoothed corners, bend and bend share behind the shown outline. Not fixedType, so written with setBlocking.
        outlineState: createSynchronizable<OutlineState | null>(null),
        shownEdge: createSynchronizable<DocumentEdge | null>(null),
    };
}

function getCornerAngles(corners: QuadPoint[]): number[] {
    'worklet';

    const angles: number[] = [];
    for (let corner = 0; corner < corners.length; corner++) {
        const point = corners.at(corner);
        const previous = corners.at((corner + corners.length - 1) % corners.length);
        const next = corners.at((corner + 1) % corners.length);
        if (!point || !previous || !next) {
            return [];
        }
        const toPreviousX = previous.x - point.x;
        const toPreviousY = previous.y - point.y;
        const toNextX = next.x - point.x;
        const toNextY = next.y - point.y;
        angles.push((Math.abs(Math.atan2(toPreviousX * toNextY - toPreviousY * toNextX, toPreviousX * toNextX + toPreviousY * toNextY)) * 180) / Math.PI);
    }
    return angles;
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
    const isMoving = useSharedValue(false);
    const [{lastAnalysisAt, loggedErrorCount, lastDetectedAt, lastPreviewCheckAt, skippedShapes, owner, outlineState, shownEdge}] = useState(createFrameState);

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

    useEffect(() => {
        const token = documentDetector?.open() ?? 0;
        owner.setDirty(token);
        return () => {
            owner.setDirty(0);
            documentDetector?.release(token);
        };
    }, [owner]);

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
        const previousShape = outlineState.getDirty();
        const measuredAngles = getCornerAngles(measured.corners);
        const shownQuad: QuadPoint[] = [];
        for (let index = 0; previousShape && index + 1 < previousShape.corners.length; index += 2) {
            shownQuad.push({x: previousShape.corners.at(index)?.value ?? 0, y: previousShape.corners.at(index + 1)?.value ?? 0});
        }
        const shownAngles = getCornerAngles(shownQuad);
        // Loops, not array callbacks: React Compiler can hoist a callback out of the worklet, and this runtime can't call it.
        let isOddShape = false;
        for (let index = 0; index < measuredAngles.length; index++) {
            const angle = measuredAngles.at(index) ?? 90;
            const shownAngle = shownAngles.at(index);
            if (angle < MIN_CORNER_ANGLE_DEG || angle > MAX_CORNER_ANGLE_DEG || (shownAngle !== undefined && Math.abs(angle - shownAngle) > MAX_CORNER_ANGLE_CHANGE_DEG)) {
                isOddShape = true;
            }
        }
        if (isOddShape && skippedShapes.getDirty() < MAX_SKIPPED_SHAPES) {
            skippedShapes.setDirty(skippedShapes.getDirty() + 1);
            if (previousShape) {
                lastDetectedAt.setDirty(detectedAt);
                if (skippedShapes.getDirty() >= SKIPS_BEFORE_SHOWING) {
                    isMoving.set(false);
                }
            }
            return;
        }
        skippedShapes.setDirty(0);
        lastDetectedAt.setDirty(detectedAt);
        const isDetectedWhole = detectedEdge?.length === edgeGeometry.EDGE_POINT_COUNT;
        const previous = outlineState.getDirty();
        const cornerMoves: number[] = [];
        for (let corner = 0; previous && corner < measured.corners.length; corner++) {
            const point = measured.corners.at(corner);
            const shownX = previous.corners.at(corner * 2)?.value;
            const shownY = previous.corners.at(corner * 2 + 1)?.value;
            cornerMoves.push(point && shownX !== undefined && shownY !== undefined ? Math.hypot(point.x - shownX, point.y - shownY) : Infinity);
        }
        let heldCorner = -1;
        if (previous && previous.heldCornerDetections < LONE_CORNER_HOLD_DETECTIONS) {
            let movedCount = 0;
            let stillCount = 0;
            for (let corner = 0; corner < cornerMoves.length; corner++) {
                const move = cornerMoves.at(corner) ?? Infinity;
                if (move > LONE_CORNER_DISTANCE) {
                    movedCount++;
                    heldCorner = corner;
                } else if (move < LONE_CORNER_STILL_DISTANCE) {
                    stillCount++;
                }
            }
            if (movedCount !== 1 || stillCount !== cornerMoves.length - 1) {
                heldCorner = -1;
            }
        }
        let hasJumped = !previous;
        for (let corner = 0; corner < cornerMoves.length; corner++) {
            if (corner !== heldCorner && (cornerMoves.at(corner) ?? 0) > OUTLINE_SNAP_DISTANCE) {
                hasJumped = true;
            }
        }
        if (hasJumped) {
            heldCorner = -1;
        }
        const isWholeReceipt = isDetectedWhole && heldCorner < 0;

        const elapsedSeconds = previous && !hasJumped ? (detectedAt - previous.updatedAt) / 1000 : 0;
        const filteredCorners: OneEuroState[] = [];
        const shownCorners: DocumentQuad = [];
        for (let corner = 0; corner < measured.corners.length; corner++) {
            const point = measured.corners.at(corner);
            if (!point) {
                return;
            }
            const heldX = corner === heldCorner ? previous?.corners.at(corner * 2) : undefined;
            const heldY = corner === heldCorner ? previous?.corners.at(corner * 2 + 1) : undefined;
            if (heldX && heldY) {
                filteredCorners.push(heldX, heldY);
                shownCorners.push({x: heldX.value, y: heldY.value});
                continue;
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
        let rawSpeed = 0;
        const rawElapsedSeconds = previous ? (detectedAt - previous.updatedAt) / 1000 : 0;
        for (let corner = 0; previous && rawElapsedSeconds > 0 && corner < measured.corners.length; corner++) {
            const point = measured.corners.at(corner);
            const shownX = previous.corners.at(corner * 2)?.value;
            const shownY = previous.corners.at(corner * 2 + 1)?.value;
            if (corner !== heldCorner && point && shownX !== undefined && shownY !== undefined) {
                rawSpeed += Math.hypot(point.x - shownX, point.y - shownY) / rawElapsedSeconds / measured.corners.length;
            }
        }
        if (rawSpeed > HIDE_SPEED || hasJumped) {
            isMoving.set(true);
        } else if (rawSpeed < SHOW_SPEED) {
            isMoving.set(false);
        }

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
        let missedDetections = isWholeReceipt ? 0 : (kept?.missedDetections ?? 0) + 1;
        if (heldCorner >= 0) {
            missedDetections = kept?.missedDetections ?? 0;
        }
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
            heldCornerDetections: heldCorner >= 0 ? (kept?.heldCornerDetections ?? 0) + 1 : 0,
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

        const frameOwner = owner.getDirty();
        if (!documentDetector || frameOwner === 0) {
            return;
        }
        const {corners, outline, toCameraPoint} = platformReader.readDocument(frame, documentDetector, frameOwner);
        const detectedAt = getTimestamp();
        const detectedEdge = outline ? edgeGeometry.resampleEdge(outline) : undefined;
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

    return {frameOutput, edge, isMoving};
}

export default useDocumentEdgeDetection;
