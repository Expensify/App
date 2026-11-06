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
};

interface DocumentDetectorModule extends HybridObject<{ios: 'swift'; android: 'kotlin'}> {
    readonly isSupported: boolean;

    detect(pixelBuffer: UInt64): DetectedDocument | undefined;

    // Android frames do not expose a buffer pointer the detector can use.
    detectYuv(frame: YuvFrame): DetectedDocument | undefined;
}

export type {DocumentCorner, DetectedDocument, YuvFrame, DocumentDetectorModule};
