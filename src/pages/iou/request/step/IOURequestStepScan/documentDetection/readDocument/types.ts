import type DocumentQuad from '@pages/iou/request/step/IOURequestStepScan/documentDetection/types';
import type {DocumentEdge, QuadPoint} from '@pages/iou/request/step/IOURequestStepScan/documentDetection/types';

import type {DocumentDetectorModule} from '@expensify/nitro-utils';
import type {Frame} from 'react-native-vision-camera';

type ReadDocumentResult = {
    /** The receipt's four corners as shares of the frame, or null when no receipt was found */
    corners: DocumentQuad | null;

    /** The receipt's real edge as shares of the frame, when the detector bent it onto the paper */
    outline: DocumentEdge | undefined;

    /** Maps a detected point to the camera's coordinates */
    toCameraPoint: (point: QuadPoint) => QuadPoint;
};

type ReadDocument = (frame: Frame, detector: DocumentDetectorModule, owner: number) => ReadDocumentResult;

type DocumentReader = {
    /** Size of the frames the detector reads */
    frameResolution: {width: number; height: number};

    /** Furthest a point of the edge may lie off the straight side, as a share of the receipt's shorter side */
    maxBend: number;

    /** Runs the detector on a camera frame */
    readDocument: ReadDocument;
};

export type {DocumentReader, ReadDocumentResult};
