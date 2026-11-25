import type {Image} from 'react-native-nitro-image';
import type {HybridObject, UInt64} from 'react-native-nitro-modules';

type DocumentCorner = {
    x: number;
    y: number;
};

type DetectedDocument = {
    corners: DocumentCorner[];

    confidence: number;

    outline?: DocumentCorner[];
};

type YuvFrame = {
    y: ArrayBuffer;
    u: ArrayBuffer;
    v: ArrayBuffer;

    width: number;
    height: number;

    yRowStride: number;
    uvRowStride: number;

    uvPixelStride: number;

    rotation: number;

    /** Token from open() of the scanner that sent the frame */
    owner: number;
};

interface DocumentDetectorModule extends HybridObject<{ios: 'swift'; android: 'kotlin'}> {
    detect(pixelBuffer: UInt64): DetectedDocument | undefined;

    // Android frames do not expose a buffer pointer the detector can use.
    detectYuv(frame: YuvFrame): DetectedDocument | undefined;

    /** Claims the detector for a scanner and returns the token its frames and release() must carry */
    open(): number;

    /** Frees the detector's model and buffers, unless another scanner has opened the detector since */
    release(owner: number): void;

    /**
     * Finds the receipt in an upright still, such as a captured snapshot or photo, with no frame-to-frame tracking.
     * Corners and outline are shares of the image's width and height. When several papers are in view it returns the
     * largest.
     */
    detectInImage(image: Image): Promise<DetectedDocument | undefined>;

    /**
     * Maps the four-cornered area of an upright image onto a rectangle, which straightens a receipt seen at an angle.
     * The corners are in pixels, clockwise from the top left. The result's longer side is at most maxLongSide.
     */
    warpImage(image: Image, quad: DocumentCorner[], maxLongSide: number): Promise<Image>;
}

export type {DocumentCorner, DetectedDocument, YuvFrame, DocumentDetectorModule};
