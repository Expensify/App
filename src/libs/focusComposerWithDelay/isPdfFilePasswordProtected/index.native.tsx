import {PDFDocument} from 'pdf-lib';
import RNFetchBlob from 'react-native-blob-util';
import {FileObject} from '@components/AttachmentModal';

const isPdfFilePasswordProtected = async (file: FileObject) => {
    try {
        if (!file.uri) {
            return false;
        }
        const filePath = file.uri.replace('file://', '');
        const pdfBytes = await RNFetchBlob.fs.readFile(filePath, 'base64');
        const pdfDoc = await PDFDocument.load(pdfBytes, {ignoreEncryption: true});
        const isEncrypted = pdfDoc.isEncrypted;
        return isEncrypted;
    } catch (error) {
        return false;
    }
};

export default isPdfFilePasswordProtected;
