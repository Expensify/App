import type ReceiptStorageType from '@libs/ReceiptStorage/types';

const mockExists = jest.fn<Promise<boolean>, [string]>();
const mockMv = jest.fn<Promise<void>, [string, string]>();
const mockMkdir = jest.fn<Promise<void>, [string]>();

jest.mock('react-native-fs', () => ({
    exists: (path: string) => mockExists(path),
    moveFile: (from: string, to: string) => mockMv(from, to),
    mkdir: (path: string) => mockMkdir(path),
}));

jest.mock('@libs/NumberUtils', () => ({rand64: () => '1234'}));

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
