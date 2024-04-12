import {NativeModules} from 'react-native';
import type CheckPDFDocument from './types';

const checkPDFDocument: CheckPDFDocument = {
    isValidPDF: (path, callback) =>
        new Promise(() => {
            NativeModules.CheckPDFDocument.checkPdf(path, callback);
        }),
};

export default checkPDFDocument;
