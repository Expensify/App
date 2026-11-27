import type {RefObject, ReactNode} from 'react';
import type {CameraRef} from 'react-native-vision-camera';

import useDocumentEdgeDetection from './useDocumentEdgeDetection';

type DocumentEdgeDetection = ReturnType<typeof useDocumentEdgeDetection>;

type DocumentDetectionProps = {
    /** The camera whose preview the outline is drawn over */
    cameraRef: RefObject<CameraRef | null>;

    /** Whether frames are analyzed and the outline shown */
    isEnabled: boolean;

    /** Renders the camera with the detection's frame output and outline values */
    children: (detection: DocumentEdgeDetection) => ReactNode;
};

/** Runs receipt edge detection only where it is rendered, so cameras without it don't create the frame output's worklet runtime. */
function DocumentDetection({cameraRef, isEnabled, children}: DocumentDetectionProps) {
    const detection = useDocumentEdgeDetection({cameraRef, isEnabled});
    return children(detection);
}

export default DocumentDetection;
export type {DocumentEdgeDetection};
