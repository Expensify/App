import {isMobile} from '@libs/Browser';

import {MultiScanProvider} from '@pages/iou/request/step/IOURequestStepScan/components/MultiScanContext';

import React from 'react';

type MultiScanGateProps = {
    iouRequestType: string | undefined;
    children: React.ReactNode;
};

/**
 * Web gate — renders MultiScanProvider on mobile web (camera-based interaction),
 * passes children through on desktop (which uses file picker with shouldAcceptMultipleFiles instead).
 */
function MultiScanGate({iouRequestType, children}: MultiScanGateProps) {
    if (isMobile()) {
        return <MultiScanProvider iouRequestType={iouRequestType}>{children}</MultiScanProvider>;
    }
    return children;
}

export default MultiScanGate;
