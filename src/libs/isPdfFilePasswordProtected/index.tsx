import {PDFDocument} from 'pdf-lib';
import type {FileObject} from '@components/AttachmentModal';

const isPdfFilePasswordProtected = (file: FileObject): Promise<boolean> =>
    new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const arrayBuffer = event.target?.result;
            if (!arrayBuffer) {
                resolve(false);
                return;
            }

            PDFDocument.load(arrayBuffer, {ignoreEncryption: true})
                .then((pdfDoc) => {
                    resolve(pdfDoc.isEncrypted);
                })
                .catch(() => {
                    resolve(false);
                });
        };

        reader.onerror = () => {
            resolve(false);
        };

        reader.readAsArrayBuffer(file as File);
    });

export default isPdfFilePasswordProtected;
