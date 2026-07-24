import fileURIToPath from '@libs/fileURIToPath';
import moveReceiptToDurableStorage from '@libs/moveReceiptToDurableStorage/index.native';

const mockMkdir = jest.fn<Promise<void>, [string]>();
const mockExists = jest.fn<Promise<boolean>, [string]>();
const mockMoveFile = jest.fn<Promise<void>, [string, string]>();

jest.mock('react-native-fs', () => ({
    mkdir: (...args: [string]) => mockMkdir(...args),
    exists: (...args: [string]) => mockExists(...args),
    moveFile: (...args: [string, string]) => mockMoveFile(...args),
}));

const mockGetReceiptsUploadFolderPath = jest.fn<string, []>();

jest.mock('@libs/getReceiptsUploadFolderPath', () => ({
    __esModule: true,
    default: () => mockGetReceiptsUploadFolderPath(),
}));

const UPLOAD_FOLDER = '/var/mobile/Documents/Receipts-Upload';

describe('moveReceiptToDurableStorage', () => {
    beforeEach(() => {
        mockMkdir.mockReset().mockResolvedValue();
        mockExists.mockReset().mockResolvedValue(true);
        mockMoveFile.mockReset().mockResolvedValue();
        mockGetReceiptsUploadFolderPath.mockReset().mockReturnValue(UPLOAD_FOLDER);
    });

    it('moves the file out of the cache into the upload folder and returns a file:// URI to the destination', async () => {
        const result = await moveReceiptToDurableStorage('file:///var/mobile/Library/Caches/ImageManipulator/cropped-abc123.jpg', 'receipt.jpg');
        const [sourcePath, destPath] = mockMoveFile.mock.calls.at(0) ?? [];
        expect(sourcePath).toBe('/var/mobile/Library/Caches/ImageManipulator/cropped-abc123.jpg');
        expect(destPath).toMatch(new RegExp(`^${UPLOAD_FOLDER}/receipt_\\d+\\.jpg$`));
        expect(result).toBe(`file://${destPath}`);
    });

    it('decodes an encoded source URI before moving', async () => {
        await moveReceiptToDurableStorage('file:///cache/img%20%2342.jpg', 'receipt.jpg');
        expect(mockMoveFile.mock.calls.at(0)?.at(0)).toBe('/cache/img #42.jpg');
    });

    it('sanitizes the on-disk name, keeping the extension', async () => {
        await moveReceiptToDurableStorage('file:///cache/img.pdf', 'Receipt #42 50%.pdf');
        const destPath = mockMoveFile.mock.calls.at(0)?.at(1) ?? '';
        expect(destPath).toMatch(new RegExp(`^${UPLOAD_FOLDER}/Receipt__42_50__\\d+\\.pdf$`));
        expect(destPath).not.toMatch(/[#% ]/);
    });

    it('returns a URI whose decoded and raw forms are identical', async () => {
        const result = await moveReceiptToDurableStorage('file:///cache/img.pdf', 'Receipt from the store. #42.pdf');
        const destPath = mockMoveFile.mock.calls.at(0)?.at(1);
        expect(fileURIToPath(result)).toBe(destPath);
    });

    it('generates unique destination paths for the same filename', async () => {
        const result1 = await moveReceiptToDurableStorage('file:///cache/img1.jpg', 'receipt.jpg');
        const result2 = await moveReceiptToDurableStorage('file:///cache/img2.jpg', 'receipt.jpg');
        expect(result1).not.toBe(result2);
    });

    it('appends the unique suffix at the end when the filename has no extension', async () => {
        await moveReceiptToDurableStorage('file:///cache/img', 'receipt');
        expect(mockMoveFile.mock.calls.at(0)?.at(1)).toMatch(new RegExp(`^${UPLOAD_FOLDER}/receipt_\\d+$`));
    });

    it('returns the source URI untouched when there is no upload folder', async () => {
        mockGetReceiptsUploadFolderPath.mockReturnValue('');
        const result = await moveReceiptToDurableStorage('file:///cache/img.jpg', 'receipt.jpg');
        expect(result).toBe('file:///cache/img.jpg');
        expect(mockMoveFile).not.toHaveBeenCalled();
    });

    it('returns the source URI when the upload folder does not exist after mkdir', async () => {
        mockExists.mockResolvedValue(false);
        const result = await moveReceiptToDurableStorage('file:///cache/img.jpg', 'receipt.jpg');
        expect(result).toBe('file:///cache/img.jpg');
        expect(mockMoveFile).not.toHaveBeenCalled();
    });

    it('returns the source URI when the move fails', async () => {
        mockMoveFile.mockRejectedValue(new Error('disk full'));
        const result = await moveReceiptToDurableStorage('file:///cache/img.jpg', 'receipt.jpg');
        expect(result).toBe('file:///cache/img.jpg');
    });
});
