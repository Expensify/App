import React from 'react';
import {isMobile} from '@libs/Browser';
import {MultiScanProvider} from '@pages/iou/request/step/IOURequestStepScan/components/MultiScanContext';

type MultiScanGateProps = {
    children: React.ReactNode;
};

/**
 * Web gate — renders MultiScanProvider on mobile web (camera-based interaction),
 * passes children through on desktop (which uses file picker with shouldAcceptMultipleFiles instead).
 */
function MultiScanGate({children}: MultiScanGateProps) {
    if (isMobile()) {
        return <MultiScanProvider>{children}</MultiScanProvider>;
    }
    return children;
}

export default MultiScanGate;
