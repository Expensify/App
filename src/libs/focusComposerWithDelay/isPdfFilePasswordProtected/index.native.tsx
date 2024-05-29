import {PDFDocument} from 'pdf-lib';
import RNFetchBlob from 'react-native-blob-util';
import type {FileObject} from '@components/AttachmentModal';

const isPdfFilePasswordProtected = (file: FileObject) =>
    new Promise((resolve) => {
        if (!file.uri) {
            resolve(false);
            return;
        }

        const filePath = file.uri.replace('file://', '');

        RNFetchBlob.fs
            .readFile(filePath, 'base64')
            .then((pdfBytes: string | Uint8Array | ArrayBuffer) => PDFDocument.load(pdfBytes, {ignoreEncryption: true}))
            .then((pdfDoc) => resolve(pdfDoc.isEncrypted))
            .catch(() => resolve(false));
    });

export default isPdfFilePasswordProtected;
