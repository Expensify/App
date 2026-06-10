jest.mock('react-native-fs', () => ({
    exists: jest.fn(() => Promise.resolve(true)),
    mkdir: jest.fn(() => Promise.resolve()),
    moveFile: jest.fn(() => Promise.resolve()),
}));

const DURABLE_UPLOAD_DIR = '/var/mobile/Documents/Receipts-Upload';
jest.mock('@libs/getReceiptsUploadFolderPath', () => ({
    __esModule: true,
    default: () => DURABLE_UPLOAD_DIR,
}));

jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {warn: jest.fn(), alert: jest.fn()},
}));

type MoveReceiptFn = (uri: string, fileName: string) => Promise<string>;

// Bypass the global jest/setup.ts mock to test the real native implementation.

const {default: moveReceiptToDurableStorage}: {default: MoveReceiptFn} = jest.requireActual('@libs/moveReceiptToDurableStorage/index.native.ts');

describe('Receipt flows should persist to durable storage after crop/rotate', () => {
    it('should move a cropped receipt out of ImageManipulator cache into Receipts-Upload', async () => {
        const cachePath = 'file:///var/mobile/Library/Caches/ImageManipulator/cropped-abc123.jpg';

        const result = await moveReceiptToDurableStorage(cachePath, 'receipt.jpg');

        expect(result).toContain('Receipts-Upload');
        expect(result).not.toContain('Library/Caches');
    });

    it('should move a rotated receipt out of ImageManipulator cache into Receipts-Upload', async () => {
        const cachePath = 'file:///var/mobile/Library/Caches/ImageManipulator/rotated-def456.jpg';

        const result = await moveReceiptToDurableStorage(cachePath, 'rotated-receipt.jpg');

        expect(result).toContain('Receipts-Upload');
        expect(result).not.toContain('Library/Caches');
    });

    it('should generate unique destination paths to avoid filename collisions', async () => {
        const cachePath1 = 'file:///var/mobile/Library/Caches/ImageManipulator/img1.jpg';
        const cachePath2 = 'file:///var/mobile/Library/Caches/ImageManipulator/img2.jpg';

        const result1 = await moveReceiptToDurableStorage(cachePath1, 'receipt.jpg');
        const result2 = await moveReceiptToDurableStorage(cachePath2, 'receipt.jpg');

        expect(result1).not.toBe(result2);
        expect(result1).toMatch(/\.jpg$/);
        expect(result2).toMatch(/\.jpg$/);
    });

    it('should preserve receipts already in a durable directory', async () => {
        const durablePath = `file://${DURABLE_UPLOAD_DIR}/existing-receipt.jpg`;

        const result = await moveReceiptToDurableStorage(durablePath, 'existing-receipt.jpg');

        expect(result).toContain('Receipts-Upload');
    });
});
