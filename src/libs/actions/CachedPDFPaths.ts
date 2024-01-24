import {exists, unlink} from 'react-native-fs';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

let pdfPaths: Record<string, string> = {};
Onyx.connect({
    key: ONYXKEYS.CACHED_PDF_PATHS,
    callback: (val) => {
        pdfPaths = val ?? {};
    },
});

function add(reportActionID: string, path: string): Promise<void> {
    return Onyx.merge(ONYXKEYS.CACHED_PDF_PATHS, {[reportActionID]: path});
}

function clear(path: string): Promise<void> {
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
}

function clearByKey(reportActionID: string) {
    clear(pdfPaths[reportActionID] ?? '').then(() => Onyx.merge(ONYXKEYS.CACHED_PDF_PATHS, {[reportActionID]: null}));
}

function clearAll() {
    Promise.all(Object.values(pdfPaths).map(clear)).then(() => Onyx.merge(ONYXKEYS.CACHED_PDF_PATHS, {}));
}

export {add, clearByKey, clearAll};
