import type {DocumentReader, ReadDocumentResult} from './types';

const MIN_VISION_CONFIDENCE = 0.3;

const documentReader: DocumentReader = {
    frameResolution: {width: 1280, height: 960},
    maxBend: 0.25,
    readDocument(frame, detector) {
        'worklet';

        const result: ReadDocumentResult = {corners: null, outline: undefined, toCameraPoint: (point) => point};
        const nativeBuffer = frame.getNativeBuffer();
        try {
            const document = detector.detect(nativeBuffer.pointer);
            // VisionCamera 5.2.3 on iOS rotates converted frame points twice, swapping x and y, so Vision's raw-buffer corners are used as they are.
            if (document && document.confidence >= MIN_VISION_CONFIDENCE && document.corners.length === 4) {
                result.corners = document.corners;
                result.outline = document.outline;
            }
        } finally {
            nativeBuffer.release();
        }
        return result;
    },
};

export default documentReader;
