import type ReceiptStorageType from '@libs/ReceiptStorage/types';

const mockExists = jest.fn<Promise<boolean>, [string]>();
const mockMv = jest.fn<Promise<void>, [string, string]>();
const mockMkdir = jest.fn<Promise<void>, [string]>();
const mockUnlink = jest.fn<Promise<void>, [string]>();

jest.mock('react-native-fs', () => ({
    exists: (path: string) => mockExists(path),
    moveFile: (from: string, to: string) => mockMv(from, to),
    mkdir: (path: string) => mockMkdir(path),
    unlink: (path: string) => mockUnlink(path),
}));

jest.mock('@libs/NumberUtils', () => ({rand64: () => '1234'}));

const mockCheckFileExists = jest.fn<Promise<boolean>, [string | undefined]>();

jest.mock('@libs/fileDownload/checkFileExists', () => ({
    __esModule: true,
    default: (path: string | undefined) => mockCheckFileExists(path),
}));

const FOLDER = '/var/mobile/Containers/Data/Application/AAAA-1111/Documents/Receipts-Upload';
jest.mock('@libs/getReceiptsUploadFolderPath', () => ({
    __esModule: true,
    default: () => FOLDER,
}));

// Import the native implementation by path. Jest resolves the bare specifier to the web implementation.
const {default: ReceiptStorage}: {default: ReceiptStorageType} = jest.requireActual('@libs/ReceiptStorage/index.native.ts');

describe('ReceiptStorage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockExists.mockResolvedValue(true);
        mockMv.mockResolvedValue(undefined);
        mockMkdir.mockResolvedValue(undefined);
        mockUnlink.mockResolvedValue(undefined);
        mockCheckFileExists.mockResolvedValue(true);
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

    describe('replace', () => {
        const RECEIPT = 'CAM-1.jpg';
        const STILL = '/var/mobile/tmp/still.jpg';

        // Only the receipt is on disk, not the staged or backup paths a previous swap would have used.
        const onlyTheReceiptExists = (path: string) => Promise.resolve(path === `${FOLDER}/${RECEIPT}`);

        it('swaps the bytes and hands back the same durable name, so every consumer of the receipt follows along', async () => {
            mockExists.mockImplementation(onlyTheReceiptExists);

            const name = await ReceiptStorage.replace(RECEIPT, `file://${STILL}`);

            expect(name).toBe(RECEIPT);
            expect(mockMv.mock.calls).toEqual([
                [STILL, `${FOLDER}/${RECEIPT}.staged`],
                [`${FOLDER}/${RECEIPT}`, `${FOLDER}/${RECEIPT}.backup`],
                [`${FOLDER}/${RECEIPT}.staged`, `${FOLDER}/${RECEIPT}`],
            ]);
        });

        it('drops the file it moved aside once the swap went through, so a capture leaves one receipt behind', async () => {
            mockExists.mockImplementation((path: string) => Promise.resolve(path === `${FOLDER}/${RECEIPT}` || path === `${FOLDER}/${RECEIPT}.backup`));

            await ReceiptStorage.replace(RECEIPT, STILL);

            expect(mockUnlink).toHaveBeenCalledWith(`${FOLDER}/${RECEIPT}.backup`);
        });

        it('puts the original receipt back when the swap fails, rather than leaving the receipt missing', async () => {
            const existing = new Set([`${FOLDER}/${RECEIPT}`]);
            mockExists.mockImplementation((path: string) => Promise.resolve(existing.has(path)));
            mockMv.mockImplementation((from: string, to: string) => {
                if (from === `${FOLDER}/${RECEIPT}.staged` && to === `${FOLDER}/${RECEIPT}`) {
                    return Promise.reject(new Error('no space left on device'));
                }
                existing.delete(from);
                existing.add(to);
                return Promise.resolve();
            });

            await expect(ReceiptStorage.replace(RECEIPT, STILL)).rejects.toThrow('no space left on device');

            expect(mockMv).toHaveBeenCalledWith(`${FOLDER}/${RECEIPT}.backup`, `${FOLDER}/${RECEIPT}`);
            expect(mockUnlink).toHaveBeenCalledWith(`${FOLDER}/${RECEIPT}.staged`);
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

            await expect(ReceiptStorage.replace(RECEIPT, STILL)).rejects.toThrow(`it is left at ${FOLDER}/${RECEIPT}.backup`);

            // Freeing the staged copy gives a full disk room for the restore, so it happens even when the
            // restore then fails.
            expect(mockUnlink).toHaveBeenCalledWith(`${FOLDER}/${RECEIPT}.staged`);
        });

        it('still reports success when only the housekeeping delete fails, because the receipt is already swapped', async () => {
            mockExists.mockImplementation(onlyTheReceiptExists);
            mockUnlink.mockRejectedValue(new Error('permission denied'));

            await expect(ReceiptStorage.replace(RECEIPT, STILL)).resolves.toBe(RECEIPT);
        });

        it('restores a receipt stranded under the backup name by a swap the app died in the middle of', async () => {
            const existing = new Set([`${FOLDER}/${RECEIPT}.backup`]);
            mockExists.mockImplementation((path: string) => Promise.resolve(existing.has(path)));
            mockMv.mockImplementation((from: string, to: string) => {
                existing.delete(from);
                existing.add(to);
                return Promise.resolve();
            });

            await expect(ReceiptStorage.replace(RECEIPT, STILL)).resolves.toBe(RECEIPT);

            // The stranded copy is the only one left, so it goes back before any cleanup can delete it.
            expect(mockMv).toHaveBeenNthCalledWith(1, `${FOLDER}/${RECEIPT}.backup`, `${FOLDER}/${RECEIPT}`);
            expect(mockMv.mock.invocationCallOrder.at(0) ?? 0).toBeLessThan(mockUnlink.mock.invocationCallOrder.at(0) ?? Number.MAX_SAFE_INTEGER);
        });

        it('rejects without touching anything when the receipt is not in durable storage', async () => {
            mockExists.mockResolvedValue(false);

            await expect(ReceiptStorage.replace(RECEIPT, STILL)).rejects.toThrow('not in durable storage');
            expect(mockMv).not.toHaveBeenCalled();
        });
    });

    describe('locate', () => {
        const RECEIPT_URI = `file://${FOLDER}/CAM-1.jpg`;
        const RECEIPT_PATH = `${FOLDER}/CAM-1.jpg`;

        it('hands back a receipt that is where it should be', async () => {
            await expect(ReceiptStorage.locate(RECEIPT_URI)).resolves.toBe(RECEIPT_URI);
            expect(mockMv).not.toHaveBeenCalled();
        });

        it('puts back a receipt stranded under the backup name by an interrupted swap', async () => {
            mockCheckFileExists.mockResolvedValue(false);
            mockExists.mockImplementation((path: string) => Promise.resolve(path === `${RECEIPT_PATH}.backup`));

            await expect(ReceiptStorage.locate(RECEIPT_URI)).resolves.toBe(RECEIPT_URI);
            expect(mockMv).toHaveBeenCalledWith(`${RECEIPT_PATH}.backup`, RECEIPT_PATH);
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
