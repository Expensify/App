import {exists, unlink} from 'react-native-fs';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Add, Clear, ClearAll, ClearByKey} from './types';

/*
 * We need to save the paths of PDF files so we can delete them later.
 * This is to remove the cached PDFs when an attachment is deleted or the user logs out.
 */
let pdfPaths: Record<string, string> = {};
Onyx.connect({
    key: ONYXKEYS.CACHED_PDF_PATHS,
    callback: (val) => {
        pdfPaths = val ?? {};
    },
});

const add: Add = (reportActionID: string, path: string) => {
    if (pdfPaths[reportActionID]) {
        return Promise.resolve();
    }
    return Onyx.merge(ONYXKEYS.CACHED_PDF_PATHS, {[reportActionID]: path});
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

const clearByKey: ClearByKey = (reportActionID: string) => {
    clear(pdfPaths[reportActionID] ?? '').then(() => Onyx.merge(ONYXKEYS.CACHED_PDF_PATHS, {[reportActionID]: null}));
};

const clearAll: ClearAll = () => {
    Promise.all(Object.values(pdfPaths).map(clear)).then(() => Onyx.merge(ONYXKEYS.CACHED_PDF_PATHS, {}));
};

export {add, clearByKey, clearAll};
