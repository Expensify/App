import {cleanFileName, isLocalFile} from '@libs/fileDownload/FileUtils';
import fileURIToPath from '@libs/fileURIToPath';
import {rand64} from '@libs/NumberUtils';

import CONST from '@src/CONST';

import RNFS from 'react-native-fs';

import type ReceiptStorage from './types';

// The single durable directory for staged receipts and attachments, shared with `stageAttachment`
// in @libs/actions/Attachment so a staged file is never copied twice.
const ATTACHMENT_DIR = `${RNFS.DocumentDirectoryPath}/${CONST.ATTACHMENT_DIR_NAME}`;

// Builds released before the attachment-dir convergence wrote queued receipts into this folder.
// Stored Onyx paths may still name it, so reads keep recognizing it and `adopt` migrates those
// files into the attachments folder when it touches one.
const LEGACY_RECEIPT_DIR = `${RNFS.DocumentDirectoryPath}/${CONST.LEGACY_RECEIPTS_UPLOAD_DIR_NAME}`;

// A durable name is the bare filename inside the attachments folder. Never store a full path: iOS
// moves the app data container on most upgrades, so an absolute path stored before the upgrade names
// a directory the device no longer has, even though iOS carried the file itself across.

async function verify(dir: string, name: string): Promise<string> {
    if (!name || !(await RNFS.exists(`${dir}/${name}`))) {
        throw new Error('[ReceiptStorage] file is not in durable storage');
    }
    return name;
}

const adopt: ReceiptStorage['adopt'] = async (uriOrPath, fileName) => {
    const path = fileURIToPath(uriOrPath);
    const durableName = path.split('/').pop();

    // vision-camera writes straight into the attachments folder through its `path` option, so there
    // is nothing to move. Confirm the write landed before the app builds an expense around the file.
    if (path.includes(`/${CONST.ATTACHMENT_DIR_NAME}/`) && durableName) {
        return verify(ATTACHMENT_DIR, durableName);
    }

    await RNFS.mkdir(ATTACHMENT_DIR);

    // Strip the characters (#, %, space) that make percent-encoding of the on-disk name ambiguous.
    // The user-visible filename travels on the file object `name` field and stays unchanged.
    const safeName = cleanFileName(fileName ?? durableName ?? '');
    const dotIndex = safeName.lastIndexOf('.');
    const uniqueName = dotIndex > 0 ? `${safeName.slice(0, dotIndex)}_${rand64()}${safeName.slice(dotIndex)}` : `${safeName}_${rand64()}`;

    // A legacy receipts-folder path can sit on Android external storage while the attachments
    // folder is app-private, so the move can cross filesystems. RNFS falls back to copy-then-delete
    // when the rename fails, which react-native-blob-util's `mv` does not.
    await RNFS.moveFile(path, `${ATTACHMENT_DIR}/${uniqueName}`);

    return verify(ATTACHMENT_DIR, uniqueName);
};

const toLocalUri: ReceiptStorage['toLocalUri'] = (durableName) => {
    // Valid for this launch only, so never store the result.
    return `file://${ATTACHMENT_DIR}/${durableName}`;
};

/**
 * Re-roots a stored source onto the directory it belongs to under the current app container,
 * ignoring the container prefix. The app reads these directories through two filesystem libraries
 * whose absolute forms can differ (/private/var and /var), but the trailing segments stay stable.
 */
const resolve: ReceiptStorage['resolve'] = (source) => {
    if (typeof source !== 'string') {
        return undefined;
    }
    if (!isLocalFile(source)) {
        return source;
    }
    const path = fileURIToPath(source);
    const fileName = path.split('/').pop();
    if (!fileName) {
        return source;
    }
    if (path.includes(`/${CONST.ATTACHMENT_DIR_NAME}/`)) {
        return toLocalUri(fileName);
    }
    if (path.includes(`/${CONST.LEGACY_RECEIPTS_UPLOAD_DIR_NAME}/`)) {
        // Pre-convergence capture. iOS carries the whole Documents content across upgrades, so the
        // file waits in this folder under the CURRENT container until `adopt` migrates it.
        return `file://${LEGACY_RECEIPT_DIR}/${fileName}`;
    }
    return source;
};

const receiptStorage: ReceiptStorage = {adopt, toLocalUri, resolve};

export default receiptStorage;
