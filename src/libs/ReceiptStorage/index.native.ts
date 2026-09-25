import {checkFileExistsWithReason} from '@libs/fileDownload/checkFileExists';
import {cleanFileName, isLocalFile} from '@libs/fileDownload/FileUtils';
import fileURIToPath from '@libs/fileURIToPath';
import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import Log from '@libs/Log';
import {rand64} from '@libs/NumberUtils';

import RNFS from 'react-native-fs';

import type ReceiptStorage from './types';

import {toDurableName} from './durableFolder';
import {claimForRead} from './receiptUpgrades';

// A durable name is the bare filename inside the receipts folder. Never store a full path: iOS moves
// the app data container on most upgrades, so an absolute path stored before the upgrade names a
// directory the device no longer has, even though iOS carried the file itself across.

const SWEEP_IDLE_TIMEOUT_MS = 10000;

// Specific enough that no adopted file carries them: `adopt` keeps the picked file's extension, so a plain
// `.backup` attachment would otherwise look like a swap leftover to the sweep.
const STAGED_SUFFIX = '.receipt-swap-staged';
const BACKUP_SUFFIX = '.receipt-swap-backup';

const swapsInFlight = new Map<string, Promise<unknown>>();

const committedSwaps = new Map<string, Promise<void>>();

async function waitForCommittedSwap(target: string) {
    await committedSwaps.get(target)?.catch(() => {});
}

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

async function discardLeftover(path: string) {
    try {
        await discard(path);
    } catch (error) {
        Log.warn('[ReceiptStorage] could not delete a leftover receipt copy', {path, error: error instanceof Error ? error.message : String(error)});
    }
}

async function restoreInterruptedSwap(target: string, {shouldWaitForRunningSwap = true} = {}): Promise<boolean> {
    if (await RNFS.exists(target)) {
        return true;
    }

    if (shouldWaitForRunningSwap && swapsInFlight.has(target)) {
        await swapsInFlight.get(target)?.catch(() => {});
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
        return RNFS.exists(target);
    }

    Log.info('[ReceiptStorage] put back a receipt left by an interrupted swap');
    return true;
}

async function swapIntoPlace(dir: string, durableName: string, target: string, uriOrPath: string, shouldAbort?: () => boolean): Promise<string> {
    // Neither platform can move a file onto one that already exists. NSFileManager refuses and Android's
    // `renameTo` is unreliable, so stage the new bytes beside the receipt, then swap them in with two
    // renames inside the directory. The original keeps a second name until the swap succeeds.
    const stagedPath = `${target}${STAGED_SUFFIX}`;
    const backupPath = `${target}${BACKUP_SUFFIX}`;
    // An attempt that died mid-swap would leave these occupied, and iOS refuses an occupied destination.
    await discard(stagedPath);
    await discard(backupPath);
    await RNFS.moveFile(fileURIToPath(uriOrPath), stagedPath);

    if (shouldAbort?.()) {
        await discardLeftover(stagedPath);
        throw new Error('[ReceiptStorage] an upload claimed the receipt, so it was left as it stands');
    }

    let releaseCommitted: () => void = () => {};
    committedSwaps.set(
        target,
        new Promise<void>((resolve) => {
            releaseCommitted = resolve;
        }),
    );

    try {
        await RNFS.moveFile(target, backupPath);
        await RNFS.moveFile(stagedPath, target);
    } catch (error) {
        await discardLeftover(stagedPath);

        if (await RNFS.exists(target)) {
            throw error;
        }

        try {
            await RNFS.moveFile(backupPath, target);
        } catch (restoreError) {
            const reason = restoreError instanceof Error ? restoreError.message : String(restoreError);
            throw new Error(`[ReceiptStorage] could not restore the receipt, it is left at ${backupPath}: ${reason}`);
        }

        throw error;
    } finally {
        committedSwaps.delete(target);
        releaseCommitted();
    }

    await discardLeftover(backupPath);

    return verify(dir, durableName);
}

async function sweepInterruptedSwaps(dir: string) {
    // Nothing was ever scanned or adopted, so there is nothing to sweep, and `readDir` would reject.
    if (!(await RNFS.exists(dir))) {
        return;
    }

    const names = (await RNFS.readDir(dir)).map((entry) => entry.name);

    await Promise.all(
        names.filter((name) => name.endsWith(BACKUP_SUFFIX)).map((name) => restoreInterruptedSwap(`${dir}/${name.slice(0, -BACKUP_SUFFIX.length)}`, {shouldWaitForRunningSwap: false})),
    );

    await Promise.all(names.filter((name) => name.endsWith(STAGED_SUFFIX) || name.endsWith(BACKUP_SUFFIX)).map((name) => discardLeftover(`${dir}/${name}`)));
}

let leftoversSwept: Promise<void> | undefined;

function whenLeftoversSwept(dir: string): Promise<void> {
    leftoversSwept ??= sweepInterruptedSwaps(dir).catch((error: unknown) => {
        Log.warn('[ReceiptStorage] could not sweep leftover receipt copies', {error: error instanceof Error ? error.message : String(error)});
    });
    return leftoversSwept;
}

const overwrite: ReceiptStorage['overwrite'] = async (durableName, uriOrPath, shouldAbort) => {
    const dir = getReceiptsUploadFolderPath();
    if (!dir) {
        throw new Error('[ReceiptStorage] no receipts folder on this platform');
    }

    const target = `${dir}/${durableName}`;

    if (swapsInFlight.has(target)) {
        throw new Error('[ReceiptStorage] a swap is already running for this receipt');
    }

    const swap = (async () => {
        await whenLeftoversSwept(dir);
        await restoreInterruptedSwap(target, {shouldWaitForRunningSwap: false});
        await verify(dir, durableName);
        return swapIntoPlace(dir, durableName, target, uriOrPath, shouldAbort);
    })();
    swapsInFlight.set(target, swap);

    try {
        return await swap;
    } finally {
        swapsInFlight.delete(target);
    }
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

const settle: ReceiptStorage['settle'] = async (durableName) => {
    if (!durableName) {
        return;
    }

    claimForRead(durableName);

    const dir = getReceiptsUploadFolderPath();
    if (!dir) {
        return;
    }

    await waitForCommittedSwap(`${dir}/${durableName}`);
};

const locate: ReceiptStorage['locate'] = async (source) => {
    const uri = resolve(source);
    if (!uri) {
        return undefined;
    }

    if (isLocalFile(uri)) {
        const dir = getReceiptsUploadFolderPath();
        const target = fileURIToPath(uri);

        if (dir) {
            whenLeftoversSwept(dir).catch(() => {});
        }

        await settle(target.split('/').pop() ?? '');
    }

    if ((await checkFileExistsWithReason(uri)).exists) {
        return uri;
    }

    if (!isLocalFile(uri) || !(await restoreInterruptedSwap(fileURIToPath(uri)))) {
        return undefined;
    }

    return uri;
};

const recheckAfterSwap: ReceiptStorage['recheckAfterSwap'] = async (source) => {
    const uri = resolve(source);
    if (!uri || !isLocalFile(uri)) {
        return false;
    }

    const target = fileURIToPath(uri);
    try {
        await swapsInFlight.get(target)?.catch(() => {});
        return await restoreInterruptedSwap(target);
    } catch (error) {
        Log.warn('[ReceiptStorage] could not recheck a receipt after a failed read', {error: error instanceof Error ? error.message : String(error)});
        return false;
    }
};

const sweepLeftovers: ReceiptStorage['sweepLeftovers'] = async () => {
    try {
        const dir = getReceiptsUploadFolderPath();
        if (!dir) {
            return;
        }

        await new Promise<void>((onIdle) => {
            requestIdleCallback(() => onIdle(), {timeout: SWEEP_IDLE_TIMEOUT_MS});
        });
        await whenLeftoversSwept(dir);
    } catch (error) {
        Log.warn('[ReceiptStorage] could not sweep leftover receipt copies at startup', {error: error instanceof Error ? error.message : String(error)});
    }
};

const receiptStorage: ReceiptStorage = {adopt, overwrite, discard, locate, settle, recheckAfterSwap, toLocalUri, resolve, sweepLeftovers};

export default receiptStorage;
