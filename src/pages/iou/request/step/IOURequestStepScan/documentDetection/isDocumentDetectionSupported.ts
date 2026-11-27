import {getDocumentDetectorNitroModule} from '@expensify/nitro-utils';

function isDocumentDetectionSupported(): boolean {
    return getDocumentDetectorNitroModule() !== null;
}

export default isDocumentDetectionSupported;
