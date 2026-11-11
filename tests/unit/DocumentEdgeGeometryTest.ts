import {
    buildEdge,
    EDGE_POINT_COUNT,
    EDGE_POINTS_PER_SIDE,
    filterOneEuro,
    getEdgeShape,
    getExactAffineTransform,
    getStraightEdge,
    getViewEdge,
    getViewEdgeAndCorners,
    hasLocalBendChange,
    isEdgeCorner,
} from '@pages/iou/request/step/IOURequestStepScan/documentDetection/edgeGeometry';
import type {OneEuroState} from '@pages/iou/request/step/IOURequestStepScan/documentDetection/edgeGeometry';
import type DocumentQuad from '@pages/iou/request/step/IOURequestStepScan/documentDetection/types';
import type {QuadPoint} from '@pages/iou/request/step/IOURequestStepScan/documentDetection/types';

const SQUARE: DocumentQuad = [
    {x: 0, y: 0},
    {x: 1, y: 0},
    {x: 1, y: 1},
    {x: 0, y: 1},
];

/** Scales by 400 x 300, rotates a quarter turn and moves, like a preview that shows the buffer turned upright. */
function rotateAndScale(point: QuadPoint): QuadPoint {
    return {x: 50 + 300 * (1 - point.y), y: 20 + 400 * point.x};
}

/** A perspective mapping, which no affine transform can follow. */
function project(point: QuadPoint): QuadPoint {
    const depth = 1 + 0.5 * point.x;
    return {x: (100 * point.x) / depth, y: (100 * point.y) / depth};
}

describe('edgeGeometry', () => {
    describe('getStraightEdge', () => {
        it('spreads the same number of points along every side, starting each side at its corner', () => {
            // Given a square, as the detector returns its four corners
            // When the straight edge is built, which is drawn whenever the detector gives no bent edge
            const edge = getStraightEdge(SQUARE);

            // Then it has as many points as a bent edge, so the outline can glide between the two
            expect(edge).toHaveLength(EDGE_POINT_COUNT);
            // And every EDGE_POINTS_PER_SIDE-th point is a corner, so corners stay put while the outline changes shape
            for (const [side, corner] of SQUARE.entries()) {
                expect(edge.at(side * EDGE_POINTS_PER_SIDE)).toEqual(corner);
                expect(isEdgeCorner(side * EDGE_POINTS_PER_SIDE)).toBe(true);
            }
            // And the points between corners lie evenly on the side
            expect(edge.at(EDGE_POINTS_PER_SIDE / 2)).toEqual({x: 0.5, y: 0});
            expect(isEdgeCorner(1)).toBe(false);
        });
    });

    describe('getExactAffineTransform', () => {
        it('reproduces a mapping that only scales, rotates and moves', () => {
            // Given corners mapped by a scale, a quarter turn and a move, as the camera preview maps buffer points
            const mapped = SQUARE.map(rotateAndScale);

            // When the transform is worked out from the corners
            const transform = getExactAffineTransform(SQUARE, mapped);

            // Then it exists, because the fourth corner lands where the native mapping put it
            expect(transform).not.toBeNull();
        });

        it('refuses a perspective mapping, so every point gets converted on its own', () => {
            // Given corners mapped with perspective, which three corners can't describe
            const mapped = SQUARE.map(project);

            // When the transform is worked out
            const transform = getExactAffineTransform(SQUARE, mapped);

            // Then there is none, because the fourth corner would be drawn in the wrong place
            expect(transform).toBeNull();
        });

        it('refuses corners that lie on one line', () => {
            // Given a collapsed quad, where no transform can be worked out
            const flat: DocumentQuad = [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 2, y: 0},
                {x: 3, y: 0},
            ];

            // When the transform is worked out
            // Then there is none instead of a division by zero
            expect(getExactAffineTransform(flat, flat)).toBeNull();
        });
    });

    describe('getViewEdge', () => {
        it('converts only the corners natively and moves the rest with the transform', () => {
            // Given a native conversion that counts its calls, since each one is a call into the camera
            const toViewPoint = jest.fn(rotateAndScale);

            // When a straight edge is mapped onto the preview
            const viewEdge = getViewEdge(SQUARE, undefined, toViewPoint);

            // Then only the four corners went through the native conversion
            expect(toViewPoint).toHaveBeenCalledTimes(SQUARE.length);
            // And every point still lands where the native conversion would have put it
            for (const [index, point] of getStraightEdge(SQUARE).entries()) {
                const expected = rotateAndScale(point);
                expect(viewEdge.at(index)?.x).toBeCloseTo(expected.x);
                expect(viewEdge.at(index)?.y).toBeCloseTo(expected.y);
            }
        });

        it('uses the bent edge from the detector when it has the expected number of points', () => {
            // Given a bent edge whose second point bulges out past the top side
            const bentEdge = getStraightEdge(SQUARE).map((point, index) => (index === 1 ? {x: point.x, y: -0.05} : point));

            // When it is mapped with a conversion that changes nothing
            const viewEdge = getViewEdge(SQUARE, bentEdge, (point) => point);

            // Then the bulge is drawn
            expect(viewEdge.at(1)?.y).toBeCloseTo(-0.05);
        });

        it('falls back to the straight edge when the detector edge has the wrong number of points', () => {
            // Given an edge from a detector built with a different number of points per side
            const shortEdge = getStraightEdge(SQUARE).slice(1);

            // When it is mapped
            const viewEdge = getViewEdge(SQUARE, shortEdge, (point) => point);

            // Then the straight edge is drawn instead, since its points wouldn't line up with the shown ones
            expect(viewEdge).toEqual(getStraightEdge(SQUARE));
        });

        it('converts every point natively when the mapping has perspective', () => {
            // Given a native conversion that an affine transform can't follow
            const toViewPoint = jest.fn(project);

            // When the edge is mapped
            const viewEdge = getViewEdge(SQUARE, undefined, toViewPoint);

            // Then every point is converted on its own, so the outline still lands on the paper
            expect(viewEdge.at(1)).toEqual(project(getStraightEdge(SQUARE).at(1) ?? {x: 0, y: 0}));
            expect(toViewPoint.mock.calls.length).toBeGreaterThan(SQUARE.length);
        });
    });

    describe('getEdgeShape and buildEdge', () => {
        it('splits an edge into corners and bend and puts it back together', () => {
            // Given a square edge whose top side bulges out in the middle, as a curled receipt would
            const bulge = 0.1;
            const edge = getStraightEdge(SQUARE).map((point, index) => (index === EDGE_POINTS_PER_SIDE / 2 ? {x: point.x, y: -bulge} : point));

            // When it is split and rebuilt
            const shape = getEdgeShape(edge);

            // Then the bulge is a bend outward of 0.1 of the shorter side, and nothing else is bent
            expect(shape?.offsets.at(EDGE_POINTS_PER_SIDE / 2)).toBeCloseTo(bulge);
            expect(shape?.offsets.at(EDGE_POINTS_PER_SIDE + 1)).toBeCloseTo(0);
            // And rebuilding gives the same edge back, so the outline can be drawn from the smoothed parts
            const rebuilt = buildEdge(shape?.corners ?? [], shape?.offsets ?? [], 1);
            for (const [index, point] of rebuilt.entries()) {
                expect(point.x).toBeCloseTo(edge.at(index)?.x ?? NaN);
                expect(point.y).toBeCloseTo(edge.at(index)?.y ?? NaN);
            }
        });

        it('keeps the bend in proportion when the receipt is drawn bigger', () => {
            // Given the bend of a square, applied to corners twice as far apart, as when the phone moves closer
            const edge = getStraightEdge(SQUARE).map((point, index) => (index === 1 ? {x: point.x, y: -0.05} : point));
            const shape = getEdgeShape(edge);
            const bigger = SQUARE.map((point) => ({x: point.x * 2, y: point.y * 2}));

            // When the edge is rebuilt on the bigger corners
            const rebuilt = buildEdge(bigger, shape?.offsets ?? [], 1);

            // Then the bulge grows with it, so zooming doesn't change the outline's shape
            expect(rebuilt.at(1)?.y).toBeCloseTo(-0.1);
        });

        it('draws the straight sides when the bend share is 0', () => {
            // Given a bent edge
            const edge = getStraightEdge(SQUARE).map((point, index) => (index === 1 ? {x: point.x, y: -0.05} : point));
            const shape = getEdgeShape(edge);

            // When it is rebuilt with none of its bend, as while the receipt isn't fully found
            const rebuilt = buildEdge(shape?.corners ?? [], shape?.offsets ?? [], 0);

            // Then it is the straight edge, so the outline can fade between the two
            expect(rebuilt.at(1)?.y).toBeCloseTo(0);
        });

        it('refuses an edge with the wrong number of points', () => {
            // Given an edge from a detector with a different number of points per side
            // When it is split
            // Then there is nothing to split, so the caller keeps what it shows
            expect(getEdgeShape(getStraightEdge(SQUARE).slice(1))).toBeNull();
        });
    });

    describe('filterOneEuro', () => {
        it('steadies a value that only jitters', () => {
            // Given a corner that jitters by 5 points around 100, at ten detections a second
            let state: OneEuroState | undefined;
            const shown: number[] = [];
            for (let step = 0; step < 40; step++) {
                state = filterOneEuro(state, step % 2 === 0 ? 105 : 95, 0.1, 0.5, 0.012, 1);
                shown.push(state.value);
            }

            // When the filter has settled
            const settled = shown.slice(20);

            // Then the shown corner moves far less than the 10 points the detections jump
            expect(Math.max(...settled) - Math.min(...settled)).toBeLessThan(4);
        });

        it('keeps up with a value that moves steadily', () => {
            // Given a corner moving 30 points per detection, as when the receipt slides across the view
            let state: OneEuroState | undefined;
            let measured = 0;
            for (let step = 0; step < 20; step++) {
                measured = step * 30;
                state = filterOneEuro(state, measured, 0.1, 0.5, 0.012, 1);
            }

            // When the corner has been moving for a while
            // Then the shown corner trails it by less than two detections' worth, so it doesn't lag behind the paper
            expect(measured - (state?.value ?? 0)).toBeLessThan(60);
        });
    });

    describe('hasLocalBendChange', () => {
        const flatBend = new Array<number>(EDGE_POINT_COUNT + 4).fill(0);

        it('sees a few neighboring points moving together', () => {
            // Given a locked flat bend, and a new one where three neighboring points stick out, as a newly folded corner would
            const foldedBend = flatBend.map((offset, index) => (index >= 10 && index <= 12 ? 0.1 : offset));

            // When the two are compared point by point
            // Then the fold counts as a change, so the locked outline can follow it
            expect(hasLocalBendChange(foldedBend, flatBend, 0.04, 3)).toBe(true);
        });

        it('ignores a single stray point', () => {
            // Given a new bend with one point off, as a glint on the table would put it
            const strayBend = flatBend.map((offset, index) => (index === 10 ? 0.1 : offset));

            // When the two are compared point by point
            // Then it isn't a change, so noise never replaces the locked outline
            expect(hasLocalBendChange(strayBend, flatBend, 0.04, 3)).toBe(false);
        });

        it('sees a run across the first corner', () => {
            // Given a new bend where the last point and the first two stick out, a fold at the first corner
            const cornerBend = flatBend.map((offset, index) => (index === EDGE_POINT_COUNT - 1 || index <= 1 ? 0.1 : offset));

            // When the two are compared point by point
            // Then the points on both sides of the corner count as one run
            expect(hasLocalBendChange(cornerBend, flatBend, 0.04, 3)).toBe(true);
        });

        it('sees a corner sliding along its side', () => {
            // Given a new bend where only the first corner's slide changed, as when the corner moved onto the paper's tip
            const slidBend = flatBend.map((offset, index) => (index === EDGE_POINT_COUNT ? 0.1 : offset));

            // When the two are compared
            // Then the moved corner counts as a change
            expect(hasLocalBendChange(slidBend, flatBend, 0.04, 3)).toBe(true);
        });
    });

    describe('bend against the detector corners', () => {
        it('keeps the corners where the detector put them when the edge moved its corners onto the paper', () => {
            // Given a bent edge whose first corner the detector moved out by 0.05, onto a curled corner of the paper
            const edge = getStraightEdge(SQUARE).map((point, index) => (index === 0 ? {x: point.x, y: -0.05} : point));

            // When it is split against the detector's own corners
            const shape = getEdgeShape(edge, SQUARE);

            // Then the corners stay the detector's, so the outline's position doesn't step when the bend comes or goes
            expect(shape?.corners).toEqual(SQUARE);
            // And the moved corner is part of the bend, so it is still drawn on the paper
            expect(shape?.offsets.at(0)).toBeCloseTo(0.05);
            const rebuilt = buildEdge(SQUARE, shape?.offsets ?? [], 1);
            expect(rebuilt.at(0)?.y).toBeCloseTo(-0.05);
        });

        it('keeps a corner moved diagonally onto the paper on its tip', () => {
            // Given an edge whose first corner the detector moved up and to the left, onto the paper's sharp tip
            const edge = getStraightEdge(SQUARE).map((point, index) => (index === 0 ? {x: -0.04, y: -0.03} : point));

            // When it is split against the detector's corners and rebuilt
            const shape = getEdgeShape(edge, SQUARE);
            const rebuilt = buildEdge(SQUARE, shape?.offsets ?? [], 1);

            // Then the corner lands on the tip in both directions, so the outline doesn't cut the corner off
            expect(rebuilt.at(0)?.x).toBeCloseTo(-0.04);
            expect(rebuilt.at(0)?.y).toBeCloseTo(-0.03);
            // And the points along the sides stay where they were
            expect(rebuilt.at(1)?.x).toBeCloseTo(edge.at(1)?.x ?? NaN);
            expect(rebuilt.at(1)?.y).toBeCloseTo(edge.at(1)?.y ?? NaN);
        });

        it('returns the detector corners on the preview with the edge', () => {
            // Given a conversion that scales by 100, as the preview would
            const toViewPoint = (point: {x: number; y: number}) => ({x: point.x * 100, y: point.y * 100});

            // When a straight edge is mapped
            const view = getViewEdgeAndCorners(SQUARE, undefined, toViewPoint);

            // Then the corners come back on the preview too, so the hook can take the outline's position from them
            expect(view.corners.at(2)).toEqual({x: 100, y: 100});
            expect(view.edge).toHaveLength(EDGE_POINT_COUNT);
        });
    });

    describe('filterOneEuro speed', () => {
        it('reads the true speed of a value moving steadily', () => {
            // Given a corner moving 30 points per detection at ten detections a second, 300 points per second
            let state: OneEuroState | undefined;
            for (let step = 0; step < 40; step++) {
                state = filterOneEuro(state, step * 30, 0.1, 0.25, 0.035, 1);
            }

            // When the filter has settled
            // Then its speed is close to 300, not inflated by the smoothed value trailing behind, so the drawn-ahead
            // position and the speed limits mean what they say
            expect(state?.derivative ?? 0).toBeGreaterThan(270);
            expect(state?.derivative ?? 0).toBeLessThan(330);
        });
    });
});
