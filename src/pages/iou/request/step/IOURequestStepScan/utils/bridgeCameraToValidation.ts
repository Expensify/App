import type {FileObject} from '@src/types/utils/Attachment';

function bridgeCameraToValidation(file: FileObject, source: string, validateFiles: (files: FileObject[]) => void) {
    const fileWithUri = file;
    fileWithUri.uri = source;
    validateFiles([fileWithUri]);
}

export default bridgeCameraToValidation;
