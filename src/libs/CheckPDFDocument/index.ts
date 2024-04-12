import pdfWorkerSource from 'pdfjs-dist/legacy/build/pdf.worker';
import {pdfjs} from 'react-pdf';
import type CheckPDFDocument from './types';

if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([pdfWorkerSource], {type: 'text/javascript'}));
}

const checkPDFDocument: CheckPDFDocument = {
    isValidPDF: (path) =>
        new Promise((resolve) => {
            pdfjs
                .getDocument(path ?? '')
                .promise.then(() => resolve(true))
                .catch(() => resolve(false));
        }),
};

export default checkPDFDocument;
