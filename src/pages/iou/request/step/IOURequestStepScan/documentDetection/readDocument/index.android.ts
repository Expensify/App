import type {DocumentReader, ReadDocumentResult} from './types';

const MIN_MODEL_CONFIDENCE = 0.6;

const ROTATION_TO_UPRIGHT = {up: 0, right: 270, down: 180, left: 90} as const;

const documentReader: DocumentReader = {
    frameResolution: {width: 640, height: 480},
    maxBend: 0.12,
    readDocument(frame, detector, owner) {
        'worklet';

        const result: ReadDocumentResult = {corners: null, outline: undefined, toCameraPoint: (point) => point};
        const [yPlane, uPlane, vPlane] = frame.getPlanes();
        if (!yPlane?.isValid || !uPlane?.isValid || !vPlane?.isValid) {
            throw new Error(`Frame has no YUV planes (pixelFormat=${frame.pixelFormat})`);
        }
        const document = detector.detectYuv({
            y: yPlane.getPixelBuffer(),
            u: uPlane.getPixelBuffer(),
            v: vPlane.getPixelBuffer(),
            width: frame.width,
            height: frame.height,
            yRowStride: yPlane.bytesPerRow,
            uvRowStride: uPlane.bytesPerRow,
            uvPixelStride: Math.round(uPlane.bytesPerRow / uPlane.width),
            rotation: ROTATION_TO_UPRIGHT[frame.orientation],
            owner,
        });
        if (document && document.confidence >= MIN_MODEL_CONFIDENCE && document.corners.length === 4) {
            result.corners = document.corners;
            result.outline = document.outline;
            result.toCameraPoint = (point) => frame.convertFramePointToCameraPoint({x: point.x * frame.width, y: point.y * frame.height});
        }
        return result;
    },
};

export default documentReader;
