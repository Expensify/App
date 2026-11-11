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
}

export type {DocumentCorner, DetectedDocument, YuvFrame, DocumentDetectorModule};
