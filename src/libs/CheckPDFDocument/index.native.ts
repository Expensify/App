import {NativeModules} from 'react-native';
import type CheckPDFDocument from './types';

const checkPDFDocument: CheckPDFDocument = {
    isValidPDF: (path) =>
        new Promise((resolve) => {
            NativeModules.CheckPDFDocument.checkPdf(path, resolve);
        }),
};

export default checkPDFDocument;
