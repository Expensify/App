import {pdfjs} from 'react-pdf';
import type {FileObject} from '@components/AttachmentModal';

const isPdfFilePasswordProtected = (file: FileObject): Promise<boolean> =>
    new Promise((resolve) => {
        if (!file.uri) {
            resolve(false);
        }

        pdfjs.getDocument(file.uri ?? '').onPassword = (_callback: () => void, reason: number) => {
            // 1 is the error code for password protected PDF error
            if (reason === 1) {
                resolve(true);
                return;
            }
            resolve(false);
        };
    });

export default isPdfFilePasswordProtected;
