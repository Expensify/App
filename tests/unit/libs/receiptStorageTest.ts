import fileURIToPath from '@libs/fileURIToPath';
import type ReceiptStorageType from '@libs/ReceiptStorage/types';

const mockExists = jest.fn<Promise<boolean>, [string]>();
const mockMv = jest.fn<Promise<void>, [string, string]>();
const mockMkdir = jest.fn<Promise<void>, [string]>();
const mockUnlink = jest.fn<Promise<void>, [string]>();
const mockReadDir = jest.fn<Promise<Array<{name: string}>>, [string]>();

jest.mock('react-native-fs', () => ({
    exists: (path: string) => mockExists(path),
    moveFile: (from: string, to: string) => mockMv(from, to),
    mkdir: (path: string) => mockMkdir(path),
    unlink: (path: string) => mockUnlink(path),
    readDir: (path: string) => mockReadDir(path),
}));

jest.mock('@libs/NumberUtils', () => ({rand64: () => '1234'}));

const mockCheckFileExists = jest.fn<Promise<boolean>, [string | undefined]>();

jest.mock('@libs/fileDownload/checkFileExists', () => ({
    __esModule: true,
    default: (path: string | undefined) => mockCheckFileExists(path),
    checkFileExistsWithReason: (path: string | undefined) => mockCheckFileExists(path).then((exists) => ({exists})),
}));

const FOLDER = '/var/mobile/Containers/Data/Application/AAAA-1111/Documents/Receipts-Upload';
jest.mock('@libs/getReceiptsUploadFolderPath', () => ({
    __esModule: true,
    default: () => FOLDER,
}));

// Import the native implementation by path. Jest resolves the bare specifier to the web implementation.
const {default: ReceiptStorage}: {default: ReceiptStorageType} = jest.requireActual('@libs/ReceiptStorage/index.native.ts');
const {
    start: startUpgrade,
    finish: finishUpgrade,
    isClaimedForRead,
}: {start: (name: string) => void; finish: (name: string) => void; isClaimedForRead: (name: string) => boolean} = jest.requireActual('@libs/ReceiptStorage/receiptUpgrades.ts');

describe('ReceiptStorage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockExists.mockResolvedValue(true);
        mockMv.mockResolvedValue(undefined);
        mockMkdir.mockResolvedValue(undefined);
        mockUnlink.mockResolvedValue(undefined);
        mockCheckFileExists.mockResolvedValue(true);
        mockReadDir.mockResolvedValue([]);
    });

    describe('adopt', () => {
        it('stores a bare filename, never a path', async () => {
            const name = await ReceiptStorage.adopt('file:///var/mobile/Library/Caches/ImageManipulator/cropped.jpg', 'receipt.jpg');

            expect(name).toBe('receipt_1234.jpg');
            expect(name).not.toContain('/');
            expect(mockMv).toHaveBeenCalledWith('/var/mobile/Library/Caches/ImageManipulator/cropped.jpg', `${FOLDER}/receipt_1234.jpg`);
        });

        it('verifies rather than moves a file the camera already wrote into the folder', async () => {
            const name = await ReceiptStorage.adopt(`file://${FOLDER}/CAM-1.jpg`);

            expect(name).toBe('CAM-1.jpg');
            expect(mockMv).not.toHaveBeenCalled();
            expect(mockExists).toHaveBeenCalledWith(`${FOLDER}/CAM-1.jpg`);
        });

        it('appends the unique suffix at the end when the filename has no extension', async () => {
            const name = await ReceiptStorage.adopt('file:///cache/img', 'receipt');

            expect(name).toBe('receipt_1234');
        });

        it('verifies a path that names the folder under a container the device no longer has, rather than moving from it', async () => {
            const name = await ReceiptStorage.adopt('file:///private/var/mobile/Containers/Data/Application/BBBB-2222/Documents/Receipts-Upload/CAM-2.jpg');

            expect(name).toBe('CAM-2.jpg');
            expect(mockMv).not.toHaveBeenCalled();
            expect(mockExists).toHaveBeenCalledWith(`${FOLDER}/CAM-2.jpg`);
        });

        it('rejects when the move fails, instead of handing back the ephemeral path', async () => {
            mockMv.mockRejectedValue(new Error('no space left on device'));

            await expect(ReceiptStorage.adopt('file:///cache/img.jpg', 'receipt.jpg')).rejects.toThrow();
        });

        it('rejects when the file is not on disk after the move', async () => {
            mockExists.mockResolvedValue(false);

            await expect(ReceiptStorage.adopt('file:///cache/img.jpg', 'receipt.jpg')).rejects.toThrow('not in durable storage');
        });
    });

    describe('overwrite', () => {
        const RECEIPT = 'CAM-1.jpg';
        const STILL = '/var/mobile/tmp/still.jpg';

        // Only the receipt is on disk, not the staged or backup paths a previous swap would have used.
        const onlyTheReceiptExists = (path: string) => Promise.resolve(path === `${FOLDER}/${RECEIPT}`);

        it('swaps the bytes and hands back the same durable name, so every consumer of the receipt follows along', async () => {
            mockExists.mockImplementation(onlyTheReceiptExists);

            const name = await ReceiptStorage.overwrite(RECEIPT, `file://${STILL}`);

            expect(name).toBe(RECEIPT);
            expect(mockMv.mock.calls).toEqual([
                [STILL, `${FOLDER}/${RECEIPT}.receipt-swap-staged`],
                [`${FOLDER}/${RECEIPT}`, `${FOLDER}/${RECEIPT}.receipt-swap-backup`],
                [`${FOLDER}/${RECEIPT}.receipt-swap-staged`, `${FOLDER}/${RECEIPT}`],
            ]);
        });

        it('drops the file it moved aside once the swap went through, so a capture leaves one receipt behind', async () => {
            mockExists.mockImplementation((path: string) => Promise.resolve(path === `${FOLDER}/${RECEIPT}` || path === `${FOLDER}/${RECEIPT}.receipt-swap-backup`));

            await ReceiptStorage.overwrite(RECEIPT, STILL);

            expect(mockUnlink).toHaveBeenCalledWith(`${FOLDER}/${RECEIPT}.receipt-swap-backup`);
        });

        it('puts the original receipt back when the swap fails, rather than leaving the receipt missing', async () => {
            const existing = new Set([`${FOLDER}/${RECEIPT}`]);
            mockExists.mockImplementation((path: string) => Promise.resolve(existing.has(path)));
            mockMv.mockImplementation((from: string, to: string) => {
                if (from === `${FOLDER}/${RECEIPT}.receipt-swap-staged` && to === `${FOLDER}/${RECEIPT}`) {
                    return Promise.reject(new Error('no space left on device'));
                }
                existing.delete(from);
                existing.add(to);
                return Promise.resolve();
            });

            await expect(ReceiptStorage.overwrite(RECEIPT, STILL)).rejects.toThrow('no space left on device');

            expect(mockMv).toHaveBeenCalledWith(`${FOLDER}/${RECEIPT}.receipt-swap-backup`, `${FOLDER}/${RECEIPT}`);
            expect(mockUnlink).toHaveBeenCalledWith(`${FOLDER}/${RECEIPT}.receipt-swap-staged`);
        });

        it('reports where the receipt was left when the swap fails and the restore fails too', async () => {
            const existing = new Set([`${FOLDER}/${RECEIPT}`]);
            mockExists.mockImplementation((path: string) => Promise.resolve(existing.has(path)));
            mockMv.mockImplementation((from: string, to: string) => {
                if (to === `${FOLDER}/${RECEIPT}`) {
                    return Promise.reject(new Error('no space left on device'));
                }
                existing.delete(from);
                existing.add(to);
                return Promise.resolve();
            });

            await expect(ReceiptStorage.overwrite(RECEIPT, STILL)).rejects.toThrow(`it is left at ${FOLDER}/${RECEIPT}.receipt-swap-backup`);

            // Freeing the staged copy gives a full disk room for the restore, so it happens even when the
            // restore then fails.
            expect(mockUnlink).toHaveBeenCalledWith(`${FOLDER}/${RECEIPT}.receipt-swap-staged`);
        });

        it('still reports success when only the housekeeping delete fails, because the receipt is already swapped', async () => {
            mockExists.mockImplementation(onlyTheReceiptExists);
            mockUnlink.mockRejectedValue(new Error('permission denied'));

            await expect(ReceiptStorage.overwrite(RECEIPT, STILL)).resolves.toBe(RECEIPT);
        });

        it('restores a receipt stranded under the backup name by a swap the app died in the middle of', async () => {
            const existing = new Set([`${FOLDER}/${RECEIPT}.receipt-swap-backup`]);
            mockExists.mockImplementation((path: string) => Promise.resolve(existing.has(path)));
            mockMv.mockImplementation((from: string, to: string) => {
                existing.delete(from);
                existing.add(to);
                return Promise.resolve();
            });

            await expect(ReceiptStorage.overwrite(RECEIPT, STILL)).resolves.toBe(RECEIPT);

            // The stranded copy is the only one left, so it goes back before any cleanup can delete it.
            expect(mockMv).toHaveBeenNthCalledWith(1, `${FOLDER}/${RECEIPT}.receipt-swap-backup`, `${FOLDER}/${RECEIPT}`);
            expect(mockMv.mock.invocationCallOrder.at(0) ?? 0).toBeLessThan(mockUnlink.mock.invocationCallOrder.at(0) ?? Number.MAX_SAFE_INTEGER);
        });

        it('rejects without touching anything when the receipt is not in durable storage', async () => {
            mockExists.mockResolvedValue(false);

            await expect(ReceiptStorage.overwrite(RECEIPT, STILL)).rejects.toThrow('not in durable storage');
            expect(mockMv).not.toHaveBeenCalled();
        });

        it('backs out at the last moment when an upload claimed the receipt while the swap was getting ready', async () => {
            const existing = new Set([`${FOLDER}/${RECEIPT}`, STILL]);
            mockExists.mockImplementation((path: string) => Promise.resolve(existing.has(path)));

            // False when `overwrite` is called, true by the time the renames are about to start: the checks
            // in between all read the filesystem, so this is the window the in-swap guard covers.
            let hasReaderGivenUp = false;
            mockMv.mockImplementation((from: string, to: string) => {
                existing.delete(from);
                existing.add(to);
                if (from === STILL) {
                    hasReaderGivenUp = true;
                }
                return Promise.resolve();
            });
            mockUnlink.mockImplementation((path: string) => {
                existing.delete(path);
                return Promise.resolve();
            });

            await expect(ReceiptStorage.overwrite(RECEIPT, STILL, () => hasReaderGivenUp)).rejects.toThrow('an upload claimed the receipt');

            // Staging only put a file beside the receipt, so backing out means dropping that copy and
            // leaving the receipt's own name untouched.
            expect(mockUnlink).toHaveBeenCalledWith(`${FOLDER}/${RECEIPT}.receipt-swap-staged`);
            expect(mockMv).not.toHaveBeenCalledWith(`${FOLDER}/${RECEIPT}`, `${FOLDER}/${RECEIPT}.receipt-swap-backup`);
            // The receipt itself is exactly where it was.
            expect(existing.has(`${FOLDER}/${RECEIPT}`)).toBe(true);
        });

        it('swaps as normal when no upload has claimed the receipt', async () => {
            mockExists.mockImplementation(onlyTheReceiptExists);

            await expect(ReceiptStorage.overwrite(RECEIPT, STILL, () => false)).resolves.toBe(RECEIPT);
            expect(mockMv).toHaveBeenCalledWith(`${FOLDER}/${RECEIPT}.receipt-swap-staged`, `${FOLDER}/${RECEIPT}`);
        });

        it('refuses a second swap over a receipt already being swapped, rather than clearing its staged copy', async () => {
            const existing = new Set([`${FOLDER}/${RECEIPT}`]);
            let finishFirstSwap: () => void = () => {};
            const firstSwapStarted = new Promise<void>((resolve) => {
                mockMv.mockImplementation((from: string, to: string) => {
                    existing.delete(from);
                    existing.add(to);
                    if (to === `${FOLDER}/${RECEIPT}.receipt-swap-staged`) {
                        resolve();
                        return new Promise<void>((settle) => {
                            finishFirstSwap = settle;
                        });
                    }
                    return Promise.resolve();
                });
            });
            mockExists.mockImplementation((path: string) => Promise.resolve(existing.has(path)));

            const first = ReceiptStorage.overwrite(RECEIPT, STILL);
            await firstSwapStarted;

            await expect(ReceiptStorage.overwrite(RECEIPT, '/var/mobile/tmp/other.jpg')).rejects.toThrow('a swap is already running');

            finishFirstSwap();
            await expect(first).resolves.toBe(RECEIPT);
        });

        it('registers the swap before it reads the filesystem, so a reader cannot slip in front of it', async () => {
            const existing = new Set([`${FOLDER}/${RECEIPT}`]);
            mockExists.mockImplementation((path: string) => Promise.resolve(existing.has(path)));
            mockMv.mockImplementation((from: string, to: string) => {
                existing.delete(from);
                existing.add(to);
                return Promise.resolve();
            });

            // No awaits yet: the checks inside `overwrite` all read the filesystem, and a reader arriving
            // during them would otherwise see nothing in flight and read the file about to be renamed.
            const swap = ReceiptStorage.overwrite(RECEIPT, STILL);
            await expect(ReceiptStorage.overwrite(RECEIPT, STILL)).rejects.toThrow('a swap is already running');

            await swap;
        });
    });

    describe('sweeping leftovers from an interrupted swap', () => {
        const RECEIPT = 'CAM-1.jpg';

        /** The sweep runs once per launch, so a test that wants to watch it needs a module that has not swept yet. */
        function loadFreshStorage(): ReceiptStorageType {
            jest.resetModules();
            const {default: storage}: {default: ReceiptStorageType} = jest.requireActual('@libs/ReceiptStorage/index.native.ts');
            return storage;
        }

        it('never waits on the swap that asked for it, since `overwrite` registers itself before awaiting the sweep', async () => {
            const storage = loadFreshStorage();
            const existing = new Set([FOLDER, `${FOLDER}/${RECEIPT}.receipt-swap-backup`]);
            mockReadDir.mockResolvedValue([{name: `${RECEIPT}.receipt-swap-backup`}]);
            mockExists.mockImplementation((path: string) => Promise.resolve(existing.has(path)));
            mockMv.mockImplementation((from: string, to: string) => {
                existing.delete(from);
                existing.add(to);
                return Promise.resolve();
            });

            // The receipt is missing under its own name, so the sweep has to restore it while a swap over
            // that same path is already registered. If the sweep ever waits for a running swap, it waits on
            // the caller waiting on it and neither ever finishes, so this asserts completion, not a result.
            const swap = storage.overwrite(RECEIPT, '/var/mobile/tmp/still.jpg');
            let stall: ReturnType<typeof setTimeout> | undefined;
            const stalled = new Promise<string>((resolve) => {
                stall = setTimeout(() => resolve('deadlocked'), 1000);
            });

            await expect(Promise.race([swap.then(() => 'settled'), stalled])).resolves.toBe('settled');
            await expect(swap).resolves.toBe(RECEIPT);
            // The sweep actually listed the folder, so the restore above went through it and not overwrite's own path.
            expect(mockReadDir).toHaveBeenCalledWith(FOLDER);
            if (stall) {
                clearTimeout(stall);
            }
        });

        it('puts back a stranded backup and deletes the copies nothing owns before it renames anything', async () => {
            const storage = loadFreshStorage();
            const existing = new Set([FOLDER, `${FOLDER}/${RECEIPT}.receipt-swap-backup`, `${FOLDER}/other.jpg`, `${FOLDER}/other.jpg.receipt-swap-staged`]);
            mockReadDir.mockResolvedValue([{name: `${RECEIPT}.receipt-swap-backup`}, {name: 'other.jpg'}, {name: 'other.jpg.receipt-swap-staged'}]);
            mockExists.mockImplementation((path: string) => Promise.resolve(existing.has(path)));
            mockMv.mockImplementation((from: string, to: string) => {
                existing.delete(from);
                existing.add(to);
                return Promise.resolve();
            });

            // The app died mid-swap last launch, so this receipt exists only under the backup name. The swap
            // has to find it there, which means the sweep must finish before `verify` runs.
            await expect(storage.overwrite(RECEIPT, '/var/mobile/tmp/still.jpg')).resolves.toBe(RECEIPT);

            expect(mockMv).toHaveBeenNthCalledWith(1, `${FOLDER}/${RECEIPT}.receipt-swap-backup`, `${FOLDER}/${RECEIPT}`);
            // A staged copy beside a receipt that is already in place has no owner.
            expect(mockUnlink).toHaveBeenCalledWith(`${FOLDER}/other.jpg.receipt-swap-staged`);
            expect(mockUnlink).not.toHaveBeenCalledWith(`${FOLDER}/${RECEIPT}`);

            // A second write does not pay for the directory listing again.
            mockReadDir.mockClear();
            await storage.overwrite(RECEIPT, '/var/mobile/tmp/another.jpg');
            expect(mockReadDir).not.toHaveBeenCalled();
        });

        it('keeps the directory listing off the request path, so a read never waits on housekeeping', async () => {
            const storage = loadFreshStorage();
            let hasListed = false;
            mockReadDir.mockImplementation(() => {
                hasListed = true;
                return Promise.resolve([]);
            });
            mockCheckFileExists.mockResolvedValue(true);

            // `locate` runs inside the request the sequential queue is processing, so it starts the sweep
            // without waiting for it — the receipt it is reading has its own recovery.
            await expect(storage.locate(`file://${FOLDER}/${RECEIPT}`)).resolves.toBe(`file://${FOLDER}/${RECEIPT}`);
            expect(mockMv).not.toHaveBeenCalled();

            // Started all the same, so a launch that only ever reads still gets its folder tidied.
            expect(hasListed).toBe(true);
        });

        it('skips the sweep when the receipts folder does not exist yet', async () => {
            // Given a fresh install that has never scanned or adopted a receipt, so the folder was never created
            const storage = loadFreshStorage();
            mockExists.mockResolvedValue(false);
            const originalRequestIdleCallback = global.requestIdleCallback;
            global.requestIdleCallback = ((callback: IdleRequestCallback) => {
                callback({didTimeout: false, timeRemaining: () => 50});
                return 0;
            }) as typeof requestIdleCallback;

            // When the startup sweep runs
            try {
                await storage.sweepLeftovers();
            } finally {
                global.requestIdleCallback = originalRequestIdleCallback;
            }

            // Then it never lists the missing folder, which would reject and log a warning on every launch
            expect(mockReadDir).not.toHaveBeenCalled();
        });

        it('leaves an adopted attachment alone even when its own extension is .backup or .staged', async () => {
            // Given attachments whose picked names kept a `.backup` or `.staged` extension through `adopt`
            const storage = loadFreshStorage();
            mockReadDir.mockResolvedValue([{name: 'db_123.backup'}, {name: 'notes_456.staged'}]);
            const originalRequestIdleCallback = global.requestIdleCallback;
            global.requestIdleCallback = ((callback: IdleRequestCallback) => {
                callback({didTimeout: false, timeRemaining: () => 50});
                return 0;
            }) as typeof requestIdleCallback;

            // When the startup sweep runs
            try {
                await storage.sweepLeftovers();
            } finally {
                global.requestIdleCallback = originalRequestIdleCallback;
            }

            // Then neither is renamed or deleted, so a queued upload still finds its file
            expect(mockMv).not.toHaveBeenCalled();
            expect(mockUnlink).not.toHaveBeenCalled();
        });

        it('restores a stranded receipt during the deferred startup sweep, without needing an upload', async () => {
            const storage = loadFreshStorage();
            const existing = new Set([FOLDER, `${FOLDER}/${RECEIPT}.receipt-swap-backup`, `${FOLDER}/${RECEIPT}.receipt-swap-staged`]);
            mockReadDir.mockResolvedValue([{name: `${RECEIPT}.receipt-swap-backup`}, {name: `${RECEIPT}.receipt-swap-staged`}]);
            mockExists.mockImplementation((path: string) => Promise.resolve(existing.has(path)));
            mockMv.mockImplementation((from: string, to: string) => {
                existing.delete(from);
                existing.add(to);
                return Promise.resolve();
            });
            mockUnlink.mockImplementation((path: string) => {
                existing.delete(path);
                return Promise.resolve();
            });

            const originalRequestIdleCallback = global.requestIdleCallback;
            global.requestIdleCallback = ((callback: IdleRequestCallback) => {
                callback({didTimeout: false, timeRemaining: () => 50});
                return 0;
            }) as typeof requestIdleCallback;

            try {
                await storage.sweepLeftovers();
            } finally {
                global.requestIdleCallback = originalRequestIdleCallback;
            }

            expect(mockMv).toHaveBeenCalledWith(`${FOLDER}/${RECEIPT}.receipt-swap-backup`, `${FOLDER}/${RECEIPT}`);
            expect(mockUnlink).toHaveBeenCalledWith(`${FOLDER}/${RECEIPT}.receipt-swap-staged`);
            expect(existing.has(`${FOLDER}/${RECEIPT}`)).toBe(true);
            expect(existing.has(`${FOLDER}/${RECEIPT}.receipt-swap-backup`)).toBe(false);
            expect(existing.has(`${FOLDER}/${RECEIPT}.receipt-swap-staged`)).toBe(false);
        });
    });

    describe('locate', () => {
        const RECEIPT_URI = `file://${FOLDER}/CAM-1.jpg`;
        const RECEIPT_PATH = `${FOLDER}/CAM-1.jpg`;

        /** Drains the microtask queue, so an assertion sees where a promise chain actually stopped. */
        const flushPendingWork = () =>
            new Promise<void>((resolve) => {
                setImmediate(resolve);
            });

        it('hands back a receipt that is where it should be', async () => {
            await expect(ReceiptStorage.locate(RECEIPT_URI)).resolves.toBe(RECEIPT_URI);
            expect(mockMv).not.toHaveBeenCalled();
        });

        it('puts back a receipt stranded under the backup name by an interrupted swap', async () => {
            mockCheckFileExists.mockResolvedValue(false);
            mockExists.mockImplementation((path: string) => Promise.resolve(path === `${RECEIPT_PATH}.receipt-swap-backup`));

            await expect(ReceiptStorage.locate(RECEIPT_URI)).resolves.toBe(RECEIPT_URI);
            expect(mockMv).toHaveBeenCalledWith(`${RECEIPT_PATH}.receipt-swap-backup`, RECEIPT_PATH);
        });

        it('reads straight through while a swap is still staging, since that half can be called off', async () => {
            const existing = new Set([RECEIPT_PATH]);
            let finishStaging: () => void = () => {};
            const stagingStarted = new Promise<void>((resolve) => {
                mockMv.mockImplementation((from: string, to: string) => {
                    if (to === `${RECEIPT_PATH}.receipt-swap-staged`) {
                        resolve();
                        return new Promise<void>((settle) => {
                            finishStaging = settle;
                        });
                    }
                    existing.delete(from);
                    existing.add(to);
                    return Promise.resolve();
                });
            });
            mockExists.mockImplementation((path: string) => Promise.resolve(existing.has(path)));
            mockCheckFileExists.mockImplementation((path?: string) => Promise.resolve(existing.has(fileURIToPath(path ?? ''))));

            // The upgrade has to be registered for a claim to land on it, as it is in the real flow.
            startUpgrade('CAM-1.jpg');
            const swap = ReceiptStorage.overwrite('CAM-1.jpg', '/var/mobile/tmp/still.jpg', () => isClaimedForRead('CAM-1.jpg'));
            await stagingStarted;

            // Staging is a copy into the receipts folder, which on a cross-filesystem move is the whole
            // image. Waiting it out would put that copy in front of every other queued request.
            await expect(ReceiptStorage.locate(RECEIPT_URI)).resolves.toBe(RECEIPT_URI);
            expect(isClaimedForRead('CAM-1.jpg')).toBe(true);

            finishStaging();
            // The claim reaches the guard below the staging move, so the swap leaves the receipt alone.
            await expect(swap).rejects.toThrow('an upload claimed the receipt');

            finishUpgrade('CAM-1.jpg');
        });

        it('waits for a swap that has started renaming, which is the one gap a claim cannot call off', async () => {
            const existing = new Set([RECEIPT_PATH]);
            let finishRename: () => void = () => {};
            const renameStarted = new Promise<void>((resolve) => {
                mockMv.mockImplementation((from: string, to: string) => {
                    if (to === `${RECEIPT_PATH}.receipt-swap-backup`) {
                        resolve();
                        return new Promise<void>((settle) => {
                            finishRename = settle;
                        });
                    }
                    existing.delete(from);
                    existing.add(to);
                    return Promise.resolve();
                });
            });
            mockExists.mockImplementation((path: string) => Promise.resolve(existing.has(path)));
            mockCheckFileExists.mockImplementation((path?: string) => Promise.resolve(existing.has(fileURIToPath(path ?? ''))));

            const swap = ReceiptStorage.overwrite('CAM-1.jpg', '/var/mobile/tmp/still.jpg');
            await renameStarted;

            let hasLocated = false;
            const located = ReceiptStorage.locate(RECEIPT_URI).then((uri) => {
                hasLocated = true;
                return uri;
            });
            await flushPendingWork();

            // The receipt's own name is moving, so reading it now returns the old bytes, the new ones, or
            // nothing at all. This is the only part of a swap a reader ever sits through.
            expect(hasLocated).toBe(false);

            finishRename();
            await swap;
            await expect(located).resolves.toBe(RECEIPT_URI);
        });

        it('does not wait on an upgrade that has no swap running, so a submit never queues behind a capture', async () => {
            const existing = new Set([RECEIPT_PATH]);
            mockExists.mockImplementation((path: string) => Promise.resolve(existing.has(path)));
            mockCheckFileExists.mockImplementation((path?: string) => Promise.resolve(existing.has(fileURIToPath(path ?? ''))));

            // The upgrade is registered but still capturing or rotating: nothing has reached the renames.
            startUpgrade('CAM-1.jpg');

            const located = await ReceiptStorage.locate(RECEIPT_URI);

            // Read straight through, and the upgrade is told to leave the file alone rather than waited on.
            expect(located).toBe(RECEIPT_URI);
            expect(isClaimedForRead('CAM-1.jpg')).toBe(true);

            finishUpgrade('CAM-1.jpg');
        });

        it('waits for a swap that is running rather than putting the backup back over it', async () => {
            const existing = new Set([RECEIPT_PATH]);
            let finishSwap: () => void = () => {};
            const swapReachedItsGap = new Promise<void>((resolve) => {
                mockMv.mockImplementation((from: string, to: string) => {
                    existing.delete(from);
                    existing.add(to);
                    if (to === `${RECEIPT_PATH}.receipt-swap-backup`) {
                        // The receipt is now missing from its own path, which is the gap a reader can land in.
                        resolve();
                        return new Promise<void>((settle) => {
                            finishSwap = () => {
                                existing.delete(`${RECEIPT_PATH}.receipt-swap-staged`);
                                existing.add(RECEIPT_PATH);
                                settle();
                            };
                        });
                    }
                    return Promise.resolve();
                });
            });
            mockExists.mockImplementation((path: string) => Promise.resolve(existing.has(path)));
            mockCheckFileExists.mockImplementation((path?: string) => Promise.resolve(existing.has(fileURIToPath(path ?? ''))));

            const swap = ReceiptStorage.overwrite('CAM-1.jpg', '/var/mobile/tmp/still.jpg');
            await swapReachedItsGap;

            const located = ReceiptStorage.locate(RECEIPT_URI);
            finishSwap();
            await swap;

            // The swapped-in file is what the reader gets, and the backup was never moved back over it.
            await expect(located).resolves.toBe(RECEIPT_URI);
            expect(mockMv).not.toHaveBeenCalledWith(`${RECEIPT_PATH}.receipt-swap-backup`, RECEIPT_PATH);
        });

        it('treats a receipt that reappeared while the restore was failing as readable', async () => {
            mockCheckFileExists.mockResolvedValue(false);
            let hasMoved = false;
            mockExists.mockImplementation((path: string) => Promise.resolve(path === `${RECEIPT_PATH}.receipt-swap-backup` || (path === RECEIPT_PATH && hasMoved)));
            mockMv.mockImplementation(() => {
                hasMoved = true;
                return Promise.reject(new Error('file exists'));
            });

            await expect(ReceiptStorage.locate(RECEIPT_URI)).resolves.toBe(RECEIPT_URI);
        });

        it('reports a receipt that is gone and has no backup, so the caller can log it as dropped', async () => {
            mockCheckFileExists.mockResolvedValue(false);
            mockExists.mockResolvedValue(false);

            await expect(ReceiptStorage.locate(RECEIPT_URI)).resolves.toBeUndefined();
        });

        it('reports a remote source that could not be read, rather than handing back a URL to upload', async () => {
            mockCheckFileExists.mockResolvedValue(false);

            await expect(ReceiptStorage.locate('https://www.expensify.com/receipts/w_9.jpg')).resolves.toBeUndefined();
            expect(mockMv).not.toHaveBeenCalled();
        });
    });

    describe('recheckAfterSwap', () => {
        const RECEIPT_URI = `file://${FOLDER}/CAM-1.jpg`;
        const RECEIPT_PATH = `${FOLDER}/CAM-1.jpg`;

        const flushPendingWork = () =>
            new Promise<void>((resolve) => {
                setImmediate(resolve);
            });

        function holdSwapWithReceiptMissing() {
            const existing = new Set([RECEIPT_PATH]);
            let release: () => void = () => {};
            const receiptMissing = new Promise<void>((resolve) => {
                mockMv.mockImplementation((from: string, to: string) => {
                    existing.delete(from);
                    if (from === `${RECEIPT_PATH}.receipt-swap-staged` && to === RECEIPT_PATH) {
                        resolve();
                        return new Promise<void>((settle) => {
                            release = () => {
                                existing.add(to);
                                settle();
                            };
                        });
                    }
                    existing.add(to);
                    return Promise.resolve();
                });
            });
            mockExists.mockImplementation((path: string) => Promise.resolve(existing.has(path)));
            return {existing, receiptMissing, release: () => release()};
        }

        it('confirms a receipt that is where it should be', async () => {
            // Given a receipt on disk with nothing swapping it
            mockExists.mockResolvedValue(true);

            // When a reader that failed rechecks it
            const isPresent = await ReceiptStorage.recheckAfterSwap(RECEIPT_URI);

            // Then the receipt counts as present and nothing is moved
            expect(isPresent).toBe(true);
            expect(mockMv).not.toHaveBeenCalled();
        });

        it('waits for a swap caught between its two renames, then confirms the receipt', async () => {
            // Given a swap that has moved the receipt aside and not yet moved the upgraded file in
            const {existing, receiptMissing, release} = holdSwapWithReceiptMissing();
            const swap = ReceiptStorage.overwrite('CAM-1.jpg', '/var/mobile/tmp/still.jpg');
            await receiptMissing;

            // When a reader that failed in that gap rechecks the receipt
            let hasAnswered = false;
            const recheck = ReceiptStorage.recheckAfterSwap(RECEIPT_URI).then((isPresent) => {
                hasAnswered = true;
                return isPresent;
            });
            await flushPendingWork();

            // Then it answers only once the swap is done, and the receipt is there
            expect(hasAnswered).toBe(false);
            release();
            await swap;
            await expect(recheck).resolves.toBe(true);
            expect(existing.has(RECEIPT_PATH)).toBe(true);
        });

        it('waits for a swap that is still staging, so the retried read cannot land in its gap', async () => {
            // Given a swap still staging its new file, with the receipt still at its own path
            const existing = new Set([RECEIPT_PATH]);
            let finishStaging: () => void = () => {};
            const stagingStarted = new Promise<void>((resolve) => {
                mockMv.mockImplementation((from: string, to: string) => {
                    const move = () => {
                        existing.delete(from);
                        existing.add(to);
                    };
                    if (to === `${RECEIPT_PATH}.receipt-swap-staged`) {
                        resolve();
                        return new Promise<void>((settle) => {
                            finishStaging = () => {
                                move();
                                settle();
                            };
                        });
                    }
                    move();
                    return Promise.resolve();
                });
            });
            mockExists.mockImplementation((path: string) => Promise.resolve(existing.has(path)));
            const swap = ReceiptStorage.overwrite('CAM-1.jpg', '/var/mobile/tmp/still.jpg');
            await stagingStarted;

            // When a reader whose read failed for another reason rechecks the receipt
            let hasAnswered = false;
            const recheck = ReceiptStorage.recheckAfterSwap(RECEIPT_URI).then((isPresent) => {
                hasAnswered = true;
                return isPresent;
            });
            await flushPendingWork();

            // Then it does not answer while the swap can still rename the receipt, and answers once the swap is done
            expect(hasAnswered).toBe(false);
            finishStaging();
            await swap;
            await expect(recheck).resolves.toBe(true);
        });

        it('leaves a registered upgrade alone, since a reader rechecking the receipt is not an upload claiming it', async () => {
            // Given an upgrade that is still capturing
            startUpgrade('CAM-1.jpg');

            // When a reader rechecks the receipt
            await ReceiptStorage.recheckAfterSwap(RECEIPT_URI);

            // Then the upgrade is not claimed, so it can still swap the better photo in. `locate` would call it off.
            expect(isClaimedForRead('CAM-1.jpg')).toBe(false);

            finishUpgrade('CAM-1.jpg');
        });

        it('puts back a receipt stranded under the backup name by an interrupted swap', async () => {
            // Given a swap the app died in, with the receipt left under its backup name
            mockExists.mockImplementation((path: string) => Promise.resolve(path === `${RECEIPT_PATH}.receipt-swap-backup`));

            // When a reader rechecks the receipt
            await expect(ReceiptStorage.recheckAfterSwap(RECEIPT_URI)).resolves.toBe(true);

            // Then the backup is moved back, so the retried read finds the receipt
            expect(mockMv).toHaveBeenCalledWith(`${RECEIPT_PATH}.receipt-swap-backup`, RECEIPT_PATH);
        });

        it('reports a receipt that is gone and has no backup, so the reader can fail for real', async () => {
            // Given a receipt that is missing with no swap and no backup
            mockExists.mockResolvedValue(false);

            // When a reader rechecks it
            const isPresent = await ReceiptStorage.recheckAfterSwap(RECEIPT_URI);

            // Then it is reported gone
            expect(isPresent).toBe(false);
        });

        it('reports a remote source as gone without touching the filesystem', async () => {
            // Given a remote receipt whose read failed
            const remoteSource = 'https://www.expensify.com/receipts/w_9.jpg';

            // When the reader rechecks it
            const isPresent = await ReceiptStorage.recheckAfterSwap(remoteSource);

            // Then there is no local swap to wait for, so the failure stands
            expect(isPresent).toBe(false);
            expect(mockExists).not.toHaveBeenCalled();
        });
    });

    describe('discard', () => {
        it('deletes a temporary file', async () => {
            await ReceiptStorage.discard('file:///var/mobile/tmp/still.jpg');

            expect(mockUnlink).toHaveBeenCalledWith('/var/mobile/tmp/still.jpg');
        });

        it('resolves without deleting when the file is already gone', async () => {
            mockExists.mockResolvedValue(false);

            await ReceiptStorage.discard('/var/mobile/tmp/still.jpg');

            expect(mockUnlink).not.toHaveBeenCalled();
        });
    });

    describe('toLocalUri', () => {
        it('resolves against the folder as it is right now', () => {
            expect(ReceiptStorage.toLocalUri('receipt_1234.jpg')).toBe(`file://${FOLDER}/receipt_1234.jpg`);
        });
    });

    describe('resolve', () => {
        const stale = 'file:///var/mobile/Containers/Data/Application/BBBB-2222/Documents/Receipts-Upload/receipt_9.jpg';

        it('re-roots the filename in a stored path onto the folder as it stands now, whichever container the path names', () => {
            expect(ReceiptStorage.resolve(stale)).toBe(`file://${FOLDER}/receipt_9.jpg`);
        });

        it('re-roots a stored path that carries no file:// scheme', () => {
            expect(ReceiptStorage.resolve('/var/mobile/Containers/Data/Application/BBBB-2222/Documents/Receipts-Upload/receipt_9.jpg')).toBe(`file://${FOLDER}/receipt_9.jpg`);
        });

        it('leaves a path that never belonged to the folder alone, so a purged cache file is not reported as recoverable', () => {
            const purged = 'file:///var/mobile/Library/Caches/ImageManipulator/cropped.jpg';

            expect(ReceiptStorage.resolve(purged)).toBe(purged);
            expect(ReceiptStorage.resolve('file:///private/var/mobile/Containers/Shared/AppGroup/CCCC/sharedFiles/x.jpg')).toBe(
                'file:///private/var/mobile/Containers/Shared/AppGroup/CCCC/sharedFiles/x.jpg',
            );
        });

        it('passes a remote source through, so an uploaded receipt is not mistaken for a local one', () => {
            expect(ReceiptStorage.resolve('https://www.expensify.com/receipts/w_9.jpg')).toBe('https://www.expensify.com/receipts/w_9.jpg');
        });
    });
});
