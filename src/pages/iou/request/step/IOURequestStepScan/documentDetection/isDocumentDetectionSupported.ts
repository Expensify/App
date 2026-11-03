import {getDocumentDetectorNitroModule} from '@expensify/nitro-utils';

const IS_DOCUMENT_DETECTION_SUPPORTED = getDocumentDetectorNitroModule()?.isSupported === true;

export default IS_DOCUMENT_DETECTION_SUPPORTED;
