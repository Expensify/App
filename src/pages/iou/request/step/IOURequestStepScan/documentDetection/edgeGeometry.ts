/**
 * Geometry for the receipt outline: spreading points along a four-cornered shape, moving detector points onto the camera
 * preview, splitting an edge into where the paper is (its corners) and how it bends, and the One Euro filter that smooths
 * the corners.
 */
import type DocumentQuad from './types';
import type {DocumentEdge, QuadPoint} from './types';

// Must match the native detectors.
const EDGE_POINTS_PER_SIDE = 24;

const EDGE_POINT_COUNT = 4 * EDGE_POINTS_PER_SIDE;

const MAX_TRANSFORM_ERROR = 1;

const MIN_TRANSFORM_DETERMINANT = 1e-12;

/**
 * `offsets` holds, for every point, how far it sits outside (negative: inside) the straight side, as a share of the
 * shorter side, then one more value per corner: how far that corner slid along its side.
 */
type EdgeShape = {
    corners: DocumentQuad;
    offsets: number[];
};

type OneEuroState = {
    value: number;
    derivative: number;
    raw: number;
};

type ViewEdge = {
    edge: DocumentEdge;
    corners: DocumentQuad;
};

type AffineTransform = {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
};

function getStraightEdge(corners: DocumentQuad): DocumentEdge {
    'worklet';

    const edge: DocumentEdge = [];
    for (let side = 0; side < corners.length; side++) {
        const start = corners.at(side);
        const end = corners.at((side + 1) % corners.length);
        if (!start || !end) {
            continue;
        }
        for (let point = 0; point < EDGE_POINTS_PER_SIDE; point++) {
            const share = point / EDGE_POINTS_PER_SIDE;
            edge.push({x: start.x + (end.x - start.x) * share, y: start.y + (end.y - start.y) * share});
        }
    }
    return edge;
}

function isEdgeCorner(index: number): boolean {
    'worklet';

    return index % EDGE_POINTS_PER_SIDE === 0;
}

function applyAffineTransform(transform: AffineTransform, point: QuadPoint): QuadPoint {
    'worklet';

    return {
        x: transform.a * point.x + transform.b * point.y + transform.c,
        y: transform.d * point.x + transform.e * point.y + transform.f,
    };
}

/**
 * The transform taking the first, second and fourth corner of `from` onto those of `to`. Null when it misses the third
 * corner, which means the mapping has perspective and every point has to be converted on its own.
 */
function getExactAffineTransform(from: DocumentQuad, to: DocumentQuad): AffineTransform | null {
    'worklet';

    const [fromOrigin, fromFirst, fromOpposite, fromSecond] = from;
    const [toOrigin, toFirst, toOpposite, toSecond] = to;
    if (!fromOrigin || !fromFirst || !fromOpposite || !fromSecond || !toOrigin || !toFirst || !toOpposite || !toSecond) {
        return null;
    }
    const u = {x: fromFirst.x - fromOrigin.x, y: fromFirst.y - fromOrigin.y};
    const v = {x: fromSecond.x - fromOrigin.x, y: fromSecond.y - fromOrigin.y};
    const mappedU = {x: toFirst.x - toOrigin.x, y: toFirst.y - toOrigin.y};
    const mappedV = {x: toSecond.x - toOrigin.x, y: toSecond.y - toOrigin.y};
    const determinant = u.x * v.y - u.y * v.x;
    if (Math.abs(determinant) < MIN_TRANSFORM_DETERMINANT) {
        return null;
    }
    const a = (mappedU.x * v.y - mappedV.x * u.y) / determinant;
    const b = (mappedV.x * u.x - mappedU.x * v.x) / determinant;
    const d = (mappedU.y * v.y - mappedV.y * u.y) / determinant;
    const e = (mappedV.y * u.x - mappedU.y * v.x) / determinant;
    const transform = {
        a,
        b,
        c: toOrigin.x - a * fromOrigin.x - b * fromOrigin.y,
        d,
        e,
        f: toOrigin.y - d * fromOrigin.x - e * fromOrigin.y,
    };
    const mappedOpposite = applyAffineTransform(transform, fromOpposite);
    if (Math.hypot(mappedOpposite.x - toOpposite.x, mappedOpposite.y - toOpposite.y) > MAX_TRANSFORM_ERROR) {
        return null;
    }
    return transform;
}

// Only the corners go through `toViewPoint`, which is a native call per point; the rest follow the transform they give.
function getViewEdgeAndCorners(corners: DocumentQuad, edge: DocumentEdge | undefined, toViewPoint: (point: QuadPoint) => QuadPoint): ViewEdge {
    'worklet';

    const points = edge?.length === EDGE_POINT_COUNT ? edge : getStraightEdge(corners);
    const viewCorners: DocumentQuad = [];
    for (const corner of corners) {
        viewCorners.push(toViewPoint(corner));
    }
    const transform = getExactAffineTransform(corners, viewCorners);
    const viewEdge: DocumentEdge = [];
    for (const point of points) {
        viewEdge.push(transform ? applyAffineTransform(transform, point) : toViewPoint(point));
    }
    return {edge: viewEdge, corners: viewCorners};
}

function getViewEdge(corners: DocumentQuad, edge: DocumentEdge | undefined, toViewPoint: (point: QuadPoint) => QuadPoint): DocumentEdge {
    'worklet';

    return getViewEdgeAndCorners(corners, edge, toViewPoint).edge;
}

function getShorterSide(corners: DocumentQuad): number {
    'worklet';

    let shorter = Infinity;
    for (let side = 0; side < corners.length; side++) {
        const start = corners.at(side);
        const end = corners.at((side + 1) % corners.length);
        if (start && end) {
            shorter = Math.min(shorter, Math.hypot(end.x - start.x, end.y - start.y));
        }
    }
    return shorter;
}

function getUnitVector(start: QuadPoint, end: QuadPoint): QuadPoint {
    'worklet';

    const length = Math.hypot(end.x - start.x, end.y - start.y) || 1;
    return {x: (end.x - start.x) / length, y: (end.y - start.y) / length};
}

function getOutwardNormal(start: QuadPoint, end: QuadPoint, centre: QuadPoint): QuadPoint {
    'worklet';

    const length = Math.hypot(end.x - start.x, end.y - start.y) || 1;
    let normal = {x: (end.y - start.y) / length, y: -(end.x - start.x) / length};
    // The corner order alone doesn't say which way is outward, since the preview may mirror the frame.
    if (normal.x * ((start.x + end.x) / 2 - centre.x) + normal.y * ((start.y + end.y) / 2 - centre.y) < 0) {
        normal = {x: -normal.x, y: -normal.y};
    }
    return normal;
}

function getCentre(corners: DocumentQuad): QuadPoint {
    'worklet';

    let x = 0;
    let y = 0;
    for (const corner of corners) {
        x += corner.x / corners.length;
        y += corner.y / corners.length;
    }
    return {x, y};
}

// With `poseCorners` the bend is measured against those corners, so where the paper is stays the same whether or not the
// detector moved its corners onto the paper.
function getEdgeShape(edge: DocumentEdge, poseCorners?: DocumentQuad): EdgeShape | null {
    'worklet';

    if (edge.length !== EDGE_POINT_COUNT) {
        return null;
    }
    const corners: DocumentQuad = [];
    for (let side = 0; side < 4; side++) {
        const corner = poseCorners ? poseCorners.at(side) : edge.at(side * EDGE_POINTS_PER_SIDE);
        if (!corner) {
            return null;
        }
        corners.push(corner);
    }
    const scale = getShorterSide(corners);
    if (!(scale > 0)) {
        return null;
    }
    const centre = getCentre(corners);
    const straight = getStraightEdge(corners);
    const offsets: number[] = [];
    for (let index = 0; index < EDGE_POINT_COUNT; index++) {
        const side = Math.floor(index / EDGE_POINTS_PER_SIDE);
        const start = corners.at(side);
        const end = corners.at((side + 1) % 4);
        const point = edge.at(index);
        const straightPoint = straight.at(index);
        if (!start || !end || !point || !straightPoint) {
            return null;
        }
        const normal = getOutwardNormal(start, end, centre);
        offsets.push(((point.x - straightPoint.x) * normal.x + (point.y - straightPoint.y) * normal.y) / scale);
    }
    // The normal alone drops a corner's move along its side, which drew the corner short of the paper's tip.
    for (let side = 0; side < 4; side++) {
        const start = corners.at(side);
        const end = corners.at((side + 1) % 4);
        const point = edge.at(side * EDGE_POINTS_PER_SIDE);
        if (!start || !end || !point) {
            return null;
        }
        const tangent = getUnitVector(start, end);
        offsets.push(((point.x - start.x) * tangent.x + (point.y - start.y) * tangent.y) / scale);
    }
    return {corners, offsets};
}

function buildEdge(corners: DocumentQuad, offsets: number[], bendShare: number): DocumentEdge {
    'worklet';

    const straight = getStraightEdge(corners);
    const scale = getShorterSide(corners);
    const centre = getCentre(corners);
    const edge: DocumentEdge = [];
    for (let index = 0; index < straight.length; index++) {
        const side = Math.floor(index / EDGE_POINTS_PER_SIDE);
        const start = corners.at(side);
        const end = corners.at((side + 1) % 4);
        const straightPoint = straight.at(index);
        if (!start || !end || !straightPoint) {
            continue;
        }
        const normal = getOutwardNormal(start, end, centre);
        const offset = (offsets.at(index) ?? 0) * scale * bendShare;
        const tangent = getUnitVector(start, end);
        const slide = index % EDGE_POINTS_PER_SIDE === 0 ? (offsets.at(EDGE_POINT_COUNT + side) ?? 0) * scale * bendShare : 0;
        edge.push({x: straightPoint.x + normal.x * offset + tangent.x * slide, y: straightPoint.y + normal.y * offset + tangent.y * slide});
    }
    return edge;
}

function getSmoothingShare(cutoff: number, elapsedSeconds: number): number {
    'worklet';

    const rate = 2 * Math.PI * cutoff * elapsedSeconds;
    return rate / (rate + 1);
}

// One Euro filter (Casiez et al., 2012): its cutoff rises with speed, so a still value is smoothed hard and a moving one
// is followed closely.
function filterOneEuro(previous: OneEuroState | undefined, measured: number, elapsedSeconds: number, minCutoff: number, speedCutoff: number, derivativeCutoff: number): OneEuroState {
    'worklet';

    if (!previous || !(elapsedSeconds > 0)) {
        return {value: measured, derivative: 0, raw: measured};
    }
    // Speed from the last raw sample, as in the paper: taken from the smoothed value, which trails a moving one, it read
    // too fast.
    const speed = (measured - previous.raw) / elapsedSeconds;
    const derivative = previous.derivative + (speed - previous.derivative) * getSmoothingShare(derivativeCutoff, elapsedSeconds);
    const cutoff = minCutoff + speedCutoff * Math.abs(derivative);
    return {value: previous.value + (measured - previous.value) * getSmoothingShare(cutoff, elapsedSeconds), derivative, raw: measured};
}

/**
 * Whether two bends differ in one place: `minRun` neighboring edge points, or one corner's slide, apart by more than
 * `threshold`. A fold or tear moves a handful of points together, which a share-of-all-points check never sees.
 */
function hasLocalBendChange(first: number[], second: number[], threshold: number, minRun: number): boolean {
    'worklet';

    if (first.length !== second.length) {
        return false;
    }
    for (let index = EDGE_POINT_COUNT; index < first.length; index++) {
        if (Math.abs((first.at(index) ?? 0) - (second.at(index) ?? 0)) > threshold) {
            return true;
        }
    }
    const pointCount = Math.min(first.length, EDGE_POINT_COUNT);
    let run = 0;
    // Twice round, so a change spanning the first and last points, across the first corner, still counts as one run.
    for (let step = 0; step < 2 * pointCount; step++) {
        const index = step % pointCount;
        if (Math.abs((first.at(index) ?? 0) - (second.at(index) ?? 0)) > threshold) {
            run++;
            if (run >= minRun) {
                return true;
            }
        } else {
            run = 0;
        }
    }
    return false;
}

export {
    EDGE_POINTS_PER_SIDE,
    EDGE_POINT_COUNT,
    getStraightEdge,
    isEdgeCorner,
    getExactAffineTransform,
    getViewEdge,
    getViewEdgeAndCorners,
    getEdgeShape,
    buildEdge,
    filterOneEuro,
    hasLocalBendChange,
};
export type {OneEuroState, ViewEdge};
