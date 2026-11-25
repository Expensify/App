/**
 * Works out where to crop a captured receipt: the detected corners, pushed out to cover any part of the bent edge that
 * bulges past them, plus a margin. The saved receipt replaces the original, so whatever this cuts off is gone for good.
 * That is why it errs wide and returns nothing whenever the detection looks wrong.
 */
import type DocumentQuad from './types';
import type {QuadPoint} from './types';

// Room left outside every side, as a share of the receipt's shorter side. The sides are already pushed out to the bent
// edge, so this only has to cover a small error in where the edge was found.
const CROP_MARGIN_SHARE = 0.01;

// Below this share of the image the detection is more likely a label or a card than the receipt.
const MIN_RECEIPT_AREA_SHARE = 0.1;

// Above this share of the image the crop trims only a sliver, not worth a re-encode, and usually means the detector found
// the edge of the frame rather than the paper.
const MAX_CROP_AREA_SHARE = 0.92;

// A sheet photographed at a steep angle still keeps every corner within this many degrees of square. Only a wrong
// detection gets sharper or flatter corners than that.
const MAX_CORNER_ANGLE_DEVIATION = 45;

const CORNER_COUNT = 4;

// Below this the two sides are close to parallel and have no usable meeting point.
const MIN_LINE_DETERMINANT = 1e-9;

type ReceiptDetection = {
    /** Shares of the image, clockwise from the top left */
    corners: QuadPoint[];

    /** The bent edge, in shares of the image */
    outline?: QuadPoint[];

    confidence: number;
};

type ImageSize = {
    width: number;
    height: number;
};

type Line = {
    point: QuadPoint;
    direction: QuadPoint;
};

function getSignedDoubledArea(quad: DocumentQuad): number {
    let doubledArea = 0;
    for (const [index, point] of quad.entries()) {
        const next = quad.at((index + 1) % quad.length) ?? point;
        doubledArea += point.x * next.y - next.x * point.y;
    }
    return doubledArea;
}

function getCornerAngle(previous: QuadPoint, corner: QuadPoint, next: QuadPoint): number {
    const toPrevious = {x: previous.x - corner.x, y: previous.y - corner.y};
    const toNext = {x: next.x - corner.x, y: next.y - corner.y};
    const cosine = (toPrevious.x * toNext.x + toPrevious.y * toNext.y) / (Math.hypot(toPrevious.x, toPrevious.y) * Math.hypot(toNext.x, toNext.y));
    return (Math.acos(Math.min(1, Math.max(-1, cosine))) * 180) / Math.PI;
}

function isPlausibleSheet(quad: DocumentQuad): boolean {
    let turn = 0;
    for (let index = 0; index < quad.length; index++) {
        const previous = quad.at((index + quad.length - 1) % quad.length);
        const corner = quad.at(index);
        const next = quad.at((index + 1) % quad.length);
        if (!previous || !corner || !next) {
            return false;
        }
        const cross = (corner.x - previous.x) * (next.y - corner.y) - (corner.y - previous.y) * (next.x - corner.x);
        if (cross === 0 || (turn !== 0 && Math.sign(cross) !== turn)) {
            return false;
        }
        turn = Math.sign(cross);
        if (Math.abs(getCornerAngle(previous, corner, next) - 90) > MAX_CORNER_ANGLE_DEVIATION) {
            return false;
        }
    }
    return true;
}

function intersectLines(first: Line, second: Line): QuadPoint | undefined {
    const determinant = first.direction.x * second.direction.y - first.direction.y * second.direction.x;
    if (Math.abs(determinant) < MIN_LINE_DETERMINANT) {
        return undefined;
    }
    const along = ((second.point.x - first.point.x) * second.direction.y - (second.point.y - first.point.y) * second.direction.x) / determinant;
    return {x: first.point.x + first.direction.x * along, y: first.point.y + first.direction.y * along};
}

function getReceiptCropQuad(detection: ReceiptDetection, image: ImageSize, minConfidence: number): DocumentQuad | undefined {
    if (detection.confidence < minConfidence || detection.corners.length !== CORNER_COUNT) {
        return undefined;
    }

    const toPixels = (point: QuadPoint): QuadPoint => ({x: point.x * image.width, y: point.y * image.height});
    const corners = detection.corners.map(toPixels);
    const imageArea = image.width * image.height;
    if (!isPlausibleSheet(corners) || Math.abs(getSignedDoubledArea(corners)) / 2 < MIN_RECEIPT_AREA_SHARE * imageArea) {
        return undefined;
    }

    const sideLengths = corners.map((corner, side) => {
        const next = corners.at((side + 1) % CORNER_COUNT) ?? corner;
        return Math.hypot(next.x - corner.x, next.y - corner.y);
    });
    const [top = 0, right = 0, bottom = 0, left = 0] = sideLengths;
    const margin = CROP_MARGIN_SHARE * Math.min((top + bottom) / 2, (left + right) / 2);

    const outwardSign = getSignedDoubledArea(corners) > 0 ? 1 : -1;
    const edgePoints = (detection.outline ?? []).map(toPixels);
    const shiftedSides: Line[] = corners.map((start, side) => {
        const end = corners.at((side + 1) % CORNER_COUNT) ?? start;
        const length = sideLengths.at(side) ?? 1;
        const direction = {x: (end.x - start.x) / length, y: (end.y - start.y) / length};
        const normal = {x: direction.y * outwardSign, y: -direction.x * outwardSign};

        let bulge = 0;
        for (const point of edgePoints) {
            bulge = Math.max(bulge, (point.x - start.x) * normal.x + (point.y - start.y) * normal.y);
        }

        const shift = bulge + margin;
        return {point: {x: start.x + normal.x * shift, y: start.y + normal.y * shift}, direction};
    });

    const cropCorners: DocumentQuad = [];
    for (let corner = 0; corner < CORNER_COUNT; corner++) {
        const incoming = shiftedSides.at((corner + CORNER_COUNT - 1) % CORNER_COUNT);
        const outgoing = shiftedSides.at(corner);
        const point = incoming && outgoing ? intersectLines(incoming, outgoing) : undefined;
        if (!point) {
            return undefined;
        }
        cropCorners.push({x: Math.min(image.width, Math.max(0, point.x)), y: Math.min(image.height, Math.max(0, point.y))});
    }

    if (Math.abs(getSignedDoubledArea(cropCorners)) / 2 > MAX_CROP_AREA_SHARE * imageArea) {
        return undefined;
    }

    return cropCorners;
}

export default getReceiptCropQuad;
export {CROP_MARGIN_SHARE};
export type {ReceiptDetection};
