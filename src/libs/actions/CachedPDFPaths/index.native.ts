import {exists, unlink} from 'react-native-fs';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Add, Clear, ClearByKey} from './types';

/*
 * We need to save the paths of PDF files so we can delete them later.
 * This is to remove the cached PDFs when an attachment is deleted or the user logs out.
 */
const add: Add = (id: string, path: string, pdfPaths: Record<string, string>) => {
    if (pdfPaths[id]) {
        return Promise.resolve();
    }
    return Onyx.merge(ONYXKEYS.CACHED_PDF_PATHS, {[id]: path});
};

const clear: Clear = (path: string) => {
    if (!path) {
        return Promise.resolve();
    }
    return new Promise((resolve) => {
        exists(path).then((exist) => {
            if (!exist) {
                resolve();
            }
            return unlink(path);
        });
    });
};

const clearByKey: ClearByKey = (id: string, pdfPaths: Record<string, string>) => {
    clear(pdfPaths[id] ?? '').then(() => Onyx.merge(ONYXKEYS.CACHED_PDF_PATHS, {[id]: null}));
};

export {add, clearByKey};
