import {MultiScanProvider} from '@pages/iou/request/step/IOURequestStepScan/components/MultiScanContext';

import React from 'react';

type MultiScanGateProps = {
    children: React.ReactNode;
};

/**
 * Native gate — always renders MultiScanProvider since multi-scan is available on native.
 */
function MultiScanGate({children}: MultiScanGateProps) {
    return <MultiScanProvider>{children}</MultiScanProvider>;
}

export default MultiScanGate;
