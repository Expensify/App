import checkFileExists from '@libs/fileDownload/checkFileExists';
import {cleanFileName, isLocalFile} from '@libs/fileDownload/FileUtils';
import fileURIToPath from '@libs/fileURIToPath';
import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import Log from '@libs/Log';
import {rand64} from '@libs/NumberUtils';

import RNFS from 'react-native-fs';

import type ReceiptStorage from './types';

import {claimForRead} from './receiptUpgrades';

// A durable name is the bare filename inside the receipts folder. Never store a full path: iOS moves
// the app data container on most upgrades, so an absolute path stored before the upgrade names a
// directory the device no longer has, even though iOS carried the file itself across.

const STAGED_SUFFIX = '.staged';
const BACKUP_SUFFIX = '.backup';

/**
 * Swaps running right now, by target path, from the moment `overwrite` is called. Owning an entry stops a
 * second swap over the same receipt and keeps the leftover sweep off one mid-swap.
 */
const swapsInFlight = new Map<string, Promise<unknown>>();

/**
 * Swaps past their last claim check, by target path. From that point the receipt's own name is about to
 * move and no guard can call it off, so this is the only part of a swap a reader ever waits for.
 */
const committedSwaps = new Map<string, Promise<void>>();

/**
 * Waits for a committed swap over this path, if one is running. Its outcome is not the caller's business:
 * `overwrite` reports its own failures and leaves the receipt in place either way, so the caller checks the
 * file for itself once the renames are done.
 */
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
async function restoreInterruptedSwap(target: string, {shouldWaitForRunningSwap = true} = {}): Promise<boolean> {
    if (await RNFS.exists(target)) {
        return true;
    }

    // A swap running right now is between its own two renames, so the receipt is missing for a moment
    // rather than stranded. Moving the backup back here would undo the file that swap is installing.
    if (shouldWaitForRunningSwap && swapsInFlight.has(target)) {
        // Housekeeping, not a read, so it waits for the staging half too.
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
        // Something else may have put the receipt back in the meantime, which is a success, not a failure.
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

    // Last moment at which nothing under the receipt's own name has moved, and everything above yields, so
    // an upload can have claimed it since the caller's check. Staging only added a file beside it.
    if (shouldAbort?.()) {
        await discardLeftover(stagedPath);
        throw new Error('[ReceiptStorage] an upload claimed the receipt, so it was left as it stands');
    }

    // Same synchronous block as the check above, so a claim either stops the swap or finds this and waits.
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
    } finally {
        // Either the new bytes are under the receipt's name or the original has been put back. Deleting the
        // spare copy below never touches that name, so a reader has nothing left to wait for.
        committedSwaps.delete(target);
        releaseCommitted();
    }

    // The receipt is in place, so the copy set aside can go.
    await discardLeftover(backupPath);

    return verify(dir, durableName);
}

/**
 * Clears what a swap leaves behind by dying part-way: a `.staged` copy nothing consumed, or a `.backup`
 * holding the only copy of a receipt. Left alone, a full-size `.backup` stays forever and looks like a
 * receipt to anything listing the directory.
 */
async function sweepInterruptedSwaps(dir: string) {
    const names = (await RNFS.readDir(dir)).map((entry) => entry.name);

    // A `.backup` is the original receipt under a second name, so restore it wherever the receipt's own
    // path is empty. Must never wait on a running swap: `overwrite` awaits the sweep after registering
    // itself, so a wait here waits on the caller waiting on us.
    await Promise.all(
        names.filter((name) => name.endsWith(BACKUP_SUFFIX)).map((name) => restoreInterruptedSwap(`${dir}/${name.slice(0, -BACKUP_SUFFIX.length)}`, {shouldWaitForRunningSwap: false})),
    );

    // Anything still under a temporary name has no owner, whether or not the restore above took from it.
    await Promise.all(names.filter((name) => name.endsWith(STAGED_SUFFIX) || name.endsWith(BACKUP_SUFFIX)).map((name) => discardLeftover(`${dir}/${name}`)));
}

let leftoversSwept: Promise<void> | undefined;

/** Runs the sweep once per launch. A sweep that fails is logged and not retried: it is only housekeeping. */
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

    // Two swaps would clear each other's staged and backup names, leaving the loser renaming from a path
    // holding the only copy.
    if (swapsInFlight.has(target)) {
        throw new Error('[ReceiptStorage] a swap is already running for this receipt');
    }

    // Registered before the first await: the checks below read the filesystem, and a reader arriving
    // during them must not see the path as free.
    const swap = (async () => {
        await whenLeftoversSwept(dir);
        // This swap already owns `target`, so consulting the map here would be waiting on itself.
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

const settle: ReceiptStorage['settle'] = async (durableName) => {
    if (!durableName) {
        return;
    }

    // An upgrade still capturing or rotating gives up here, and the receipt is sent as it stands.
    claimForRead(durableName);

    const dir = getReceiptsUploadFolderPath();
    if (!dir) {
        return;
    }

    // A swap past its own claim check is committed to its renames, so the only safe thing is to let it
    // finish.
    await waitForCommittedSwap(`${dir}/${durableName}`);
};

const locate: ReceiptStorage['locate'] = async (source) => {
    const uri = resolve(source);
    if (!uri) {
        return undefined;
    }

    // Claimed before reading, so the file cannot move underneath the read.
    if (isLocalFile(uri)) {
        const dir = getReceiptsUploadFolderPath();
        const target = fileURIToPath(uri);

        // Not awaited: this runs inside the request the sequential queue is processing, and the sweep is
        // housekeeping for the folder as a whole. The receipt being read has its own recovery below.
        if (dir) {
            whenLeftoversSwept(dir).catch(() => {});
        }

        await settle(target.split('/').pop() ?? '');
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

const receiptStorage: ReceiptStorage = {adopt, overwrite, discard, locate, settle, toLocalUri, resolve};

export default receiptStorage;
