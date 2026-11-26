import getReceiptCropQuad, {CROP_MARGIN_SHARE} from '@pages/iou/request/step/IOURequestStepScan/documentDetection/getReceiptCropQuad';
import type {ReceiptDetection} from '@pages/iou/request/step/IOURequestStepScan/documentDetection/getReceiptCropQuad';
import type DocumentQuad from '@pages/iou/request/step/IOURequestStepScan/documentDetection/types';
import type {QuadPoint} from '@pages/iou/request/step/IOURequestStepScan/documentDetection/types';

const SQUARE_IMAGE = {width: 1000, height: 1000};

const MIN_CONFIDENCE = 0.5;

const UPRIGHT_RECEIPT: DocumentQuad = [
    {x: 0.2, y: 0.1},
    {x: 0.8, y: 0.1},
    {x: 0.8, y: 0.9},
    {x: 0.2, y: 0.9},
];

function detect(corners: DocumentQuad, outline?: QuadPoint[], confidence = 0.9): ReceiptDetection {
    return {corners, outline, confidence};
}

function getQuadArea(quad: DocumentQuad): number {
    let doubledArea = 0;
    for (const [index, point] of quad.entries()) {
        const next = quad.at((index + 1) % quad.length) ?? point;
        doubledArea += point.x * next.y - next.x * point.y;
    }
    return Math.abs(doubledArea) / 2;
}

function getDistanceToLine(point: QuadPoint, start: QuadPoint, end: QuadPoint): number {
    const length = Math.hypot(end.x - start.x, end.y - start.y);
    return Math.abs((end.x - start.x) * (start.y - point.y) - (start.x - point.x) * (end.y - start.y)) / length;
}

function expectQuadToBeClose(actual: DocumentQuad | undefined, expected: DocumentQuad) {
    expect(actual).toHaveLength(expected.length);
    for (const [index, point] of expected.entries()) {
        expect(actual?.at(index)?.x).toBeCloseTo(point.x, 6);
        expect(actual?.at(index)?.y).toBeCloseTo(point.y, 6);
    }
}

describe('getReceiptCropQuad', () => {
    it('adds the margin outside every side of a straight receipt and returns pixels', () => {
        // Given an upright receipt with no bent edge, 600 x 800 px on a 1000 x 1000 image
        const margin = CROP_MARGIN_SHARE * 600;

        // When the crop is worked out
        const quad = getReceiptCropQuad(detect(UPRIGHT_RECEIPT), SQUARE_IMAGE, MIN_CONFIDENCE);

        // Then every side moves out by the margin, a share of the shorter side, so a slightly-off edge never cuts the receipt
        expectQuadToBeClose(quad, [
            {x: 200 - margin, y: 100 - margin},
            {x: 800 + margin, y: 100 - margin},
            {x: 800 + margin, y: 900 + margin},
            {x: 200 - margin, y: 900 + margin},
        ]);
    });

    it('scales each axis by its own image size', () => {
        // Given the same receipt on a 2000 x 1000 image, so it is 1200 x 800 px and the shorter side is the height
        const image = {width: 2000, height: 1000};
        const margin = CROP_MARGIN_SHARE * 800;

        // When the crop is worked out
        const quad = getReceiptCropQuad(detect(UPRIGHT_RECEIPT), image, MIN_CONFIDENCE);

        // Then the detector's shares of the image become pixels on each axis separately
        expectQuadToBeClose(quad, [
            {x: 400 - margin, y: 100 - margin},
            {x: 1600 + margin, y: 100 - margin},
            {x: 1600 + margin, y: 900 + margin},
            {x: 400 - margin, y: 900 + margin},
        ]);
    });

    it('pushes a side out to cover a part of the edge that bulges past it', () => {
        // Given a bent edge whose right side bulges out to 0.85 in the middle, like a curled receipt
        const outline: QuadPoint[] = [...UPRIGHT_RECEIPT, {x: 0.85, y: 0.5}];
        const margin = CROP_MARGIN_SHARE * 600;

        // When the crop is worked out
        const quad = getReceiptCropQuad(detect(UPRIGHT_RECEIPT, outline), SQUARE_IMAGE, MIN_CONFIDENCE);

        // Then only the right side moves past the bulge, because cropping to the straight corners would cut the curl off
        expectQuadToBeClose(quad, [
            {x: 200 - margin, y: 100 - margin},
            {x: 850 + margin, y: 100 - margin},
            {x: 850 + margin, y: 900 + margin},
            {x: 200 - margin, y: 900 + margin},
        ]);
    });

    it('ignores edge points that sit inside the straight sides', () => {
        // Given a bent edge that dips inward, as the paper's own shadow can make it
        const outline: QuadPoint[] = [...UPRIGHT_RECEIPT, {x: 0.7, y: 0.5}];

        // When the crop is worked out with and without that edge
        const withDip = getReceiptCropQuad(detect(UPRIGHT_RECEIPT, outline), SQUARE_IMAGE, MIN_CONFIDENCE);
        const straight = getReceiptCropQuad(detect(UPRIGHT_RECEIPT), SQUARE_IMAGE, MIN_CONFIDENCE);

        // Then the crop never moves inside the corners, since a tighter crop could cut off part of the receipt
        expectQuadToBeClose(withDip, straight ?? []);
    });

    it('keeps every side parallel to the receipt and the margin away from it when the receipt is seen at an angle', () => {
        // Given a receipt photographed at an angle, so its top is narrower than its bottom
        const corners: DocumentQuad = [
            {x: 0.3, y: 0.15},
            {x: 0.7, y: 0.15},
            {x: 0.85, y: 0.85},
            {x: 0.15, y: 0.85},
        ];

        // When the crop is worked out
        const quad = getReceiptCropQuad(detect(corners), SQUARE_IMAGE, MIN_CONFIDENCE);

        // Then each new side runs the margin away from the matching receipt side, so the warp keeps the receipt's shape
        const pixelCorners = corners.map((point) => ({x: point.x * 1000, y: point.y * 1000}));
        const shorterSide = (400 + 700) / 2;
        expect(quad).toHaveLength(4);
        for (const [side, start] of pixelCorners.entries()) {
            const end = pixelCorners.at((side + 1) % 4) ?? start;
            const newStart = quad?.at(side) ?? start;
            const newEnd = quad?.at((side + 1) % 4) ?? start;
            expect(getDistanceToLine(newStart, start, end)).toBeCloseTo(CROP_MARGIN_SHARE * shorterSide, 6);
            expect(getDistanceToLine(newEnd, start, end)).toBeCloseTo(CROP_MARGIN_SHARE * shorterSide, 6);
        }
    });

    it('keeps the crop inside the image when the receipt reaches the edge', () => {
        // Given a receipt whose left and top sides touch the image edge
        const corners: DocumentQuad = [
            {x: 0, y: 0},
            {x: 0.7, y: 0},
            {x: 0.7, y: 0.8},
            {x: 0, y: 0.8},
        ];

        // When the crop is worked out
        const quad = getReceiptCropQuad(detect(corners), SQUARE_IMAGE, MIN_CONFIDENCE);

        // Then no corner falls outside the image, because the warp can only read pixels that exist
        for (const point of quad ?? []) {
            expect(point.x).toBeGreaterThanOrEqual(0);
            expect(point.x).toBeLessThanOrEqual(1000);
            expect(point.y).toBeGreaterThanOrEqual(0);
            expect(point.y).toBeLessThanOrEqual(1000);
        }
        expect(quad?.at(0)).toEqual({x: 0, y: 0});
    });

    it('skips the crop when keeping it inside the image would cut into a tilted receipt at the edge', () => {
        // Given a tilted receipt with two corners on the image edge and a bent top edge that nearly touches it
        const corners: DocumentQuad = [
            {x: 0, y: 0.2},
            {x: 0.6, y: 0},
            {x: 0.8, y: 0.8},
            {x: 0.1, y: 0.9},
        ];
        const outline: QuadPoint[] = [...corners, {x: 0.3, y: 0.01}];

        // When the crop is worked out
        const quad = getReceiptCropQuad(detect(corners, outline), SQUARE_IMAGE, MIN_CONFIDENCE);

        // Then it is skipped, because clamping the corners to the image turns the top side into the paper, and a crop that
        // loses part of the receipt must not replace the photo
        expect(quad).toBeUndefined();
    });

    it('skips the crop when the receipt fills nearly the whole image', () => {
        // Given a receipt that covers almost the whole frame
        const corners: DocumentQuad = [
            {x: 0.01, y: 0.01},
            {x: 0.99, y: 0.01},
            {x: 0.99, y: 0.99},
            {x: 0.01, y: 0.99},
        ];

        // When the crop is worked out
        const quad = getReceiptCropQuad(detect(corners), SQUARE_IMAGE, MIN_CONFIDENCE);

        // Then there is no crop, since cutting a sliver off costs a full re-encode and gains nothing
        expect(quad).toBeUndefined();
    });

    it('skips the crop when the receipt is too small to be the real receipt', () => {
        // Given a detection that covers a small patch of the frame, more likely a label or a card than the receipt
        const corners: DocumentQuad = [
            {x: 0.45, y: 0.45},
            {x: 0.6, y: 0.45},
            {x: 0.6, y: 0.6},
            {x: 0.45, y: 0.6},
        ];

        // When the crop is worked out
        const quad = getReceiptCropQuad(detect(corners), SQUARE_IMAGE, MIN_CONFIDENCE);

        // Then the full frame is kept, because a crop to the wrong thing would lose the receipt for good
        expect(quad).toBeUndefined();
        expect(getQuadArea(corners)).toBeLessThan(0.1);
    });

    it('skips the crop when the corners cross over each other', () => {
        // Given corners in an order that makes the sides cross, which no real sheet of paper can do
        const corners: DocumentQuad = [
            {x: 0.2, y: 0.1},
            {x: 0.8, y: 0.9},
            {x: 0.8, y: 0.1},
            {x: 0.2, y: 0.9},
        ];

        // When the crop is worked out
        const quad = getReceiptCropQuad(detect(corners), SQUARE_IMAGE, MIN_CONFIDENCE);

        // Then there is no crop
        expect(quad).toBeUndefined();
    });

    it('skips the crop when a corner is far from square', () => {
        // Given a four-sided detection whose first corner is about 41 degrees, sharper than any photographed sheet would show
        const corners: DocumentQuad = [
            {x: 0.2, y: 0.1},
            {x: 0.9, y: 0.9},
            {x: 0.5, y: 0.9},
            {x: 0.2, y: 0.5},
        ];

        // When the crop is worked out
        const quad = getReceiptCropQuad(detect(corners), SQUARE_IMAGE, MIN_CONFIDENCE);

        // Then there is no crop
        expect(quad).toBeUndefined();
    });

    it('skips the crop when the detector is not confident enough', () => {
        // Given a detection below the confidence the live outline needs to show
        const detection = detect(UPRIGHT_RECEIPT, undefined, MIN_CONFIDENCE - 0.1);

        // When the crop is worked out
        const quad = getReceiptCropQuad(detection, SQUARE_IMAGE, MIN_CONFIDENCE);

        // Then there is no crop, so the shot is never cut to an edge the camera did not trust
        expect(quad).toBeUndefined();
    });

    it('skips the crop when the detector does not return four corners', () => {
        // Given a detection with three corners
        const detection = detect(UPRIGHT_RECEIPT.slice(0, 3));

        // When the crop is worked out
        const quad = getReceiptCropQuad(detection, SQUARE_IMAGE, MIN_CONFIDENCE);

        // Then there is no crop
        expect(quad).toBeUndefined();
    });
});
