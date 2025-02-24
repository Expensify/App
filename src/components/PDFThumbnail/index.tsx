import 'core-js/proposals/promise-with-resolvers';
// eslint-disable-next-line import/extensions
import pdfWorkerSource from 'pdfjs-dist/build/pdf.worker.min.mjs';
// eslint-disable-next-line import/extensions
import pdfWorkerLegacySource from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs';
import {pdfjs} from 'react-pdf';
import {isMobileSafari, isModernSafari} from '@libs/Browser';
import WebBasePDFThumbnail from './WebBasePDFThumbnail';

const shouldUseLegacyWorker = isMobileSafari() && !isModernSafari();
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const pdfWorker = shouldUseLegacyWorker ? pdfWorkerLegacySource : pdfWorkerSource;

if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([pdfWorker], {type: 'text/javascript'}));
}

export default WebBasePDFThumbnail;
