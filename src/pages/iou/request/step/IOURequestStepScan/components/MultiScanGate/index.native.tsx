import {MultiScanProvider} from '@pages/iou/request/step/IOURequestStepScan/components/MultiScanContext';

import React from 'react';

type MultiScanGateProps = {
    iouRequestType: string | undefined;
    children: React.ReactNode;
};

/**
 * Native gate — always renders MultiScanProvider since multi-scan is available on native.
 */
function MultiScanGate({iouRequestType, children}: MultiScanGateProps) {
    return <MultiScanProvider iouRequestType={iouRequestType}>{children}</MultiScanProvider>;
}

export default MultiScanGate;
