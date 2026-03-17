import {exists, unlink} from 'react-native-fs';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Add, Clear, ClearByKey} from './types';

/*
 * We need to save the paths of PDF files so we can delete them later.
 * This is to remove the cached PDFs when an attachment is deleted or the user logs out.
 */
let pdfPaths: Record<string, string> = {};
// We use `connectWithoutView` here since this connection only updates a module-level variable
// and doesn't need to trigger component re-renders
Onyx.connectWithoutView({
    key: ONYXKEYS.CACHED_PDF_PATHS,
    callback: (val) => {
        pdfPaths = val ?? {};
    },
});

const add: Add = (id: string, path: string) => {
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

const clearByKey: ClearByKey = (id: string) => {
    clear(pdfPaths[id] ?? '').then(() => Onyx.merge(ONYXKEYS.CACHED_PDF_PATHS, {[id]: null}));
};

export {add, clearByKey};
