import {cleanFileName, isLocalFile} from '@libs/fileDownload/FileUtils';
import fileURIToPath from '@libs/fileURIToPath';
import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import {rand64} from '@libs/NumberUtils';

import RNFS from 'react-native-fs';

import type ReceiptStorage from './types';

import {isInDurableFolder, toDurableName} from './durableFolder';

// A durable name is the bare filename inside the receipts folder. Never store a full path: iOS moves
// the app data container on most upgrades, so an absolute path stored before the upgrade names a
// directory the device no longer has, even though iOS carried the file itself across.

async function verify(dir: string, name: string): Promise<string> {
    if (!name || !(await RNFS.exists(`${dir}/${name}`))) {
        throw new Error('[ReceiptStorage] file is not in durable storage');
    }
    return name;
}

const adopt: ReceiptStorage['adopt'] = async (uriOrPath, fileName) => {
    const dir = getReceiptsUploadFolderPath();
    if (!dir) {
        throw new Error('[ReceiptStorage] no receipts folder on this platform');
    }

    const sourcePath = fileURIToPath(uriOrPath);

    // vision-camera writes straight into the receipts folder through its `path` option.
    const existingName = toDurableName(uriOrPath);
    if (existingName) {
        return verify(dir, existingName);
    }

    await RNFS.mkdir(dir);

    // Strip the characters (#, %, space) that make percent-encoding of the on-disk name ambiguous.
    // The user-visible filename travels on the file object `name` field and stays unchanged.
    const safeName = cleanFileName(fileName ?? sourcePath.split('/').pop() ?? '');
    const dotIndex = safeName.lastIndexOf('.');
    const uniqueName = dotIndex > 0 ? `${safeName.slice(0, dotIndex)}_${rand64()}${safeName.slice(dotIndex)}` : `${safeName}_${rand64()}`;

    // On Android the receipts folder sits on external storage while picked and cropped files sit in
    // the app cache, so this move can cross filesystems. RNFS falls back to copy-then-delete when the
    // rename fails, which react-native-blob-util's `mv` does not.
    await RNFS.moveFile(sourcePath, `${dir}/${uniqueName}`);

    return verify(dir, uniqueName);
};

const toLocalUri: ReceiptStorage['toLocalUri'] = (durableName) => `file://${getReceiptsUploadFolderPath()}/${durableName}`;

const resolve: ReceiptStorage['resolve'] = (source) => {
    if (typeof source !== 'string') {
        return undefined;
    }
    if (!isLocalFile(source)) {
        return source;
    }
    const durableName = toDurableName(source);
    return durableName ? toLocalUri(durableName) : source;
};

const receiptStorage: ReceiptStorage = {adopt, toLocalUri, resolve, isInDurableFolder};

export default receiptStorage;
