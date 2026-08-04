import {cleanFileName, isLocalFile} from '@libs/fileDownload/FileUtils';
import fileURIToPath from '@libs/fileURIToPath';
import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import {rand64} from '@libs/NumberUtils';

import ReactNativeBlobUtil from 'react-native-blob-util';

import type ReceiptStorage from './types';

/**
 * A durable name is the bare filename inside the receipts folder. Never store a full path.
 *
 * iOS moves the app data container on most upgrades. An absolute path stored before the upgrade names
 * a directory the device no longer has. iOS carries the file itself across to the new container.
 * react-native-blob-util documents the behavior: "On iOS platform the directory path will be changed
 * every time you access to the file system."
 */

async function verify(dir: string, name: string): Promise<string> {
    if (!name || !(await ReactNativeBlobUtil.fs.exists(`${dir}/${name}`))) {
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

    // vision-camera writes into the receipts folder through its `path` option, so there is nothing to
    // move. Confirm the write landed before the app builds an expense around the file.
    if (sourcePath.startsWith(`${dir}/`)) {
        return verify(dir, sourcePath.slice(dir.length + 1));
    }

    await ReactNativeBlobUtil.fs.mkdir(dir).catch(() => {});

    // Strip the characters (#, %, space) that make percent-encoding of the on-disk name ambiguous.
    // The user-visible filename travels on the file object `name` field and stays unchanged.
    const safeName = cleanFileName(fileName ?? sourcePath.split('/').pop() ?? '');
    const dotIndex = safeName.lastIndexOf('.');
    const uniqueName = dotIndex > 0 ? `${safeName.slice(0, dotIndex)}_${rand64()}${safeName.slice(dotIndex)}` : `${safeName}_${rand64()}`;

    // Both directories live on one volume, so `mv` is a rename. The file stays at the old name or
    // lands at the new name. No intermediate state loses the file.
    await ReactNativeBlobUtil.fs.mv(sourcePath, `${dir}/${uniqueName}`);

    return verify(dir, uniqueName);
};

const toLocalUri: ReceiptStorage['toLocalUri'] = (durableName) => `file://${getReceiptsUploadFolderPath()}/${durableName}`;

/**
 * The durable name of a stored receipt: the bare filename inside the receipts folder.
 *
 * Matches on the folder name and ignores the container prefix. The app reads this directory through
 * two filesystem libraries, and their absolute forms can differ (/private/var and /var). The trailing
 * segments stay stable.
 *
 * Returns undefined when the path never named the receipts folder. A purged cache file and a
 * share-extension file both return undefined, so neither reads as a misaddressed receipt.
 */
function toDurableName(storedPath: string): string | undefined {
    const dirName = getReceiptsUploadFolderPath().split('/').pop();
    const path = fileURIToPath(storedPath);
    if (!dirName || !path.includes(`/${dirName}/`)) {
        return undefined;
    }
    return path.split('/').pop();
}

const resolve: ReceiptStorage['resolve'] = (source) => {
    if (typeof source !== 'string' || !isLocalFile(source)) {
        return typeof source === 'string' ? source : undefined;
    }
    const durableName = toDurableName(source);
    return durableName ? toLocalUri(durableName) : source;
};

const receiptStorage: ReceiptStorage = {adopt, toLocalUri, resolve};

export default receiptStorage;
