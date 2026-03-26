import useFilesValidation from '@hooks/useFilesValidation';
import type {FileObject} from '@src/types/utils/Attachment';

function useScanCapture(onFilesAccepted: (files: FileObject[]) => void) {
    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation((files: FileObject[]) => {
        onFilesAccepted(files);
    });

    function onCapture(file: FileObject, source: string) {
        const fileWithUri = file;
        fileWithUri.uri = source;
        onFilesAccepted([fileWithUri]);
    }

    return {onCapture, validateFiles, PDFValidationComponent, ErrorModal};
}

export default useScanCapture;
