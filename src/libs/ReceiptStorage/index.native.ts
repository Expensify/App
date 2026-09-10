import checkFileExists from '@libs/fileDownload/checkFileExists';
import {cleanFileName, isLocalFile} from '@libs/fileDownload/FileUtils';
import fileURIToPath from '@libs/fileURIToPath';
import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import Log from '@libs/Log';
import {rand64} from '@libs/NumberUtils';

import RNFS from 'react-native-fs';

import type ReceiptStorage from './types';

// A durable name is the bare filename inside the receipts folder. Never store a full path: iOS moves
// the app data container on most upgrades, so an absolute path stored before the upgrade names a
// directory the device no longer has, even though iOS carried the file itself across.

const STAGED_SUFFIX = '.staged';
const BACKUP_SUFFIX = '.backup';

/** Swaps running right now, by target path. A reader that finds a receipt missing waits on these first. */
const swapsInFlight = new Map<string, Promise<unknown>>();

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

const discard: ReceiptStorage['discard'] = async (uriOrPath) => {
    const path = fileURIToPath(uriOrPath);
    if (!(await RNFS.exists(path))) {
        return;
    }
    await RNFS.unlink(path);
};

/**
 * Deletes a file left over by a swap. Never rethrows, since the receipt is already in its final state and
 * a stale copy beside it is not worth failing over.
 */
async function discardLeftover(path: string) {
    try {
        await discard(path);
    } catch (error) {
        Log.warn('[ReceiptStorage] could not delete a leftover receipt copy', {path, error: error instanceof Error ? error.message : String(error)});
    }
}

/**
 * Puts a receipt back when a swap was interrupted between its two renames, which leaves the file under the
 * backup name with nothing at the receipt's own path. Resolves to whether the receipt is readable now.
 */
async function restoreInterruptedSwap(target: string): Promise<boolean> {
    if (await RNFS.exists(target)) {
        return true;
    }

    // A swap running right now is between its own two renames, so the receipt is missing for a moment
    // rather than stranded. Moving the backup back here would undo the file that swap is installing.
    const runningSwap = swapsInFlight.get(target);
    if (runningSwap) {
        await runningSwap.catch(() => {});
        return RNFS.exists(target);
    }

    const backupPath = `${target}${BACKUP_SUFFIX}`;
    if (!(await RNFS.exists(backupPath))) {
        return false;
    }

    try {
        await RNFS.moveFile(backupPath, target);
    } catch (error) {
        Log.warn('[ReceiptStorage] could not put back a receipt left by an interrupted swap', {error: error instanceof Error ? error.message : String(error)});
        // Something else may have put the receipt back in the meantime, which is a success, not a failure.
        return RNFS.exists(target);
    }

    Log.info('[ReceiptStorage] put back a receipt left by an interrupted swap');
    return true;
}

async function swapIntoPlace(dir: string, durableName: string, target: string, uriOrPath: string): Promise<string> {
    // Neither platform can move a file onto one that already exists. NSFileManager refuses and Android's
    // `renameTo` is unreliable, so stage the new bytes beside the receipt, then swap them in with two
    // renames inside the directory. The original keeps a second name until the swap succeeds.
    const stagedPath = `${target}${STAGED_SUFFIX}`;
    const backupPath = `${target}${BACKUP_SUFFIX}`;
    // An attempt that died mid-swap would leave these occupied, and iOS refuses an occupied destination.
    await discard(stagedPath);
    await discard(backupPath);
    await RNFS.moveFile(fileURIToPath(uriOrPath), stagedPath);

    try {
        await RNFS.moveFile(target, backupPath);
        await RNFS.moveFile(stagedPath, target);
    } catch (error) {
        // A full disk is the likeliest reason the swap failed, so free the staged bytes before restoring.
        await discardLeftover(stagedPath);

        if (await RNFS.exists(target)) {
            throw error;
        }

        // The receipt exists only under the backup name now, so a failed move back is what loses it.
        try {
            await RNFS.moveFile(backupPath, target);
        } catch (restoreError) {
            const reason = restoreError instanceof Error ? restoreError.message : String(restoreError);
            throw new Error(`[ReceiptStorage] could not restore the receipt, it is left at ${backupPath}: ${reason}`);
        }

        throw error;
    }

    // The receipt is in place, so the copy set aside can go.
    await discardLeftover(backupPath);

    return verify(dir, durableName);
}

const replace: ReceiptStorage['replace'] = async (durableName, uriOrPath) => {
    const dir = getReceiptsUploadFolderPath();
    if (!dir) {
        throw new Error('[ReceiptStorage] no receipts folder on this platform');
    }

    const target = `${dir}/${durableName}`;
    await restoreInterruptedSwap(target);
    await verify(dir, durableName);

    // Registered while it runs so a reader that catches the receipt mid-swap waits for it instead of
    // treating the gap between the two renames as an interrupted swap.
    const swap = swapIntoPlace(dir, durableName, target, uriOrPath);
    swapsInFlight.set(target, swap);

    try {
        return await swap;
    } finally {
        swapsInFlight.delete(target);
    }
};

const toLocalUri: ReceiptStorage['toLocalUri'] = (durableName) => `file://${getReceiptsUploadFolderPath()}/${durableName}`;

/**
 * Matches on the folder name and ignores the container prefix. The app reads this directory through
 * two filesystem libraries whose absolute forms can differ (/private/var and /var), but the trailing
 * segments stay stable.
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
    if (typeof source !== 'string') {
        return undefined;
    }
    if (!isLocalFile(source)) {
        return source;
    }
    const durableName = toDurableName(source);
    return durableName ? toLocalUri(durableName) : source;
};

const locate: ReceiptStorage['locate'] = async (source) => {
    const uri = resolve(source);
    if (!uri) {
        return undefined;
    }

    if (await checkFileExists(uri)) {
        return uri;
    }

    // A receipt that is missing may only be missing from its own name, so look for an interrupted swap
    // before the caller writes it off.
    if (!isLocalFile(uri) || !(await restoreInterruptedSwap(fileURIToPath(uri)))) {
        return undefined;
    }

    return uri;
};

const receiptStorage: ReceiptStorage = {adopt, replace, discard, locate, toLocalUri, resolve};

export default receiptStorage;
