import {getDocumentDetectorNitroModule} from '@expensify/nitro-utils';

function isDocumentDetectionSupported(): boolean {
    return getDocumentDetectorNitroModule()?.isSupported === true;
}

export default isDocumentDetectionSupported;
