import {stageAttachment, cacheAttachment, getAttachmentDir} from '@libs/actions/Attachment/index.native';

import ONYXKEYS from '@src/ONYXKEYS';

const mockMkdir = jest.fn<Promise<void>, [string]>();
const mockExists = jest.fn<Promise<boolean>, [string]>();
const mockMoveFile = jest.fn<Promise<void>, [string, string]>();
const mockCopyFile = jest.fn<Promise<void>, [string, string]>();

jest.mock('react-native-fs', () => ({
    DocumentDirectoryPath: '/var/mobile/Documents',
    mkdir: (...args: [string]) => mockMkdir(...args),
    exists: (...args: [string]) => mockExists(...args),
    moveFile: (...args: [string, string]) => mockMoveFile(...args),
    copyFile: (...args: [string, string]) => mockCopyFile(...args),
}));

const mockOnyxSet = jest.fn<Promise<void>, [string, unknown]>();
jest.mock('react-native-onyx', () => ({
    set: (...args: [string, unknown]) => mockOnyxSet(...args),
    connectWithoutView: jest.fn(),
}));

// Mock FileUtils to avoid the heavy transitive import chain (Log → Localize → Onyx → API → App.ts)
jest.mock('@libs/fileDownload/FileUtils', () => ({
    cleanFileName: (fileName: string) => fileName.replaceAll(/[^a-zA-Z0-9\-._]/g, '_'),
    getMimeTypeFromUri: jest.fn(() => 'image/jpeg'),
    isLocalFile: (uri?: string | number) => !!uri && (typeof uri === 'number' || uri.startsWith('blob:') || uri.startsWith('file:') || uri.startsWith('/')),
}));

jest.mock('@libs/AttachmentUtils', () => ({
    getImageCacheFileExtension: jest.fn(() => 'jpg'),
}));

jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {
        hmmm: jest.fn(),
        info: jest.fn(),
        alert: jest.fn(),
        warn: jest.fn(),
    },
}));

const ATTACHMENT_DIR = '/var/mobile/Documents/attachments';

describe('stageAttachment', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockMkdir.mockReset().mockResolvedValue();
        mockExists.mockReset().mockResolvedValue(false);
        mockMoveFile.mockReset().mockResolvedValue();
        mockOnyxSet.mockReset().mockResolvedValue();
    });

    it('moves the file into the attachments directory and returns a file:// URI to the destination', async () => {
        // Given a local file:// URI and a filename with an extension
        // When the file is staged
        const result = await stageAttachment({
            uri: 'file:///var/mobile/Library/Caches/ImageManipulator/cropped.jpg',
            fileName: 'receipt.jpg',
        });
        const [sourcePath, destPath] = mockMoveFile.mock.calls.at(0) ?? [];
        // Then the file is moved (not copied) into the attachments dir, with a unique suffix before the extension
        expect(sourcePath).toBe('/var/mobile/Library/Caches/ImageManipulator/cropped.jpg');
        expect(destPath).toMatch(new RegExp(`^${ATTACHMENT_DIR}/receipt_\\d+\\.jpg$`));
        expect(result).toBe(`file://${destPath}`);
        expect(mockMoveFile).toHaveBeenCalledTimes(1);
    });

    it('sanitizes the on-disk name, keeping the extension', async () => {
        // Given a filename containing special characters
        // When the file is staged
        await stageAttachment({
            uri: 'file:///cache/img.pdf',
            fileName: 'Receipt #42 50%.pdf',
        });
        const destPath = mockMoveFile.mock.calls.at(0)?.at(1) ?? '';
        // Then the destination name is sanitized (no #, %, or space) and the extension is preserved
        expect(destPath).toMatch(new RegExp(`^${ATTACHMENT_DIR}/Receipt__42_50__\\d+\\.pdf$`));
        expect(destPath).not.toMatch(/[#% ]/);
    });

    it('generates unique destination paths for the same filename', async () => {
        // Given two staging calls with the same filename but different source files
        // When both are staged
        const result1 = await stageAttachment({
            uri: 'file:///cache/img1.jpg',
            fileName: 'receipt.jpg',
        });
        const result2 = await stageAttachment({
            uri: 'file:///cache/img2.jpg',
            fileName: 'receipt.jpg',
        });
        // Then the destination paths differ because of the unique rand64 suffix
        expect(result1).not.toBe(result2);
    });

    it('handles filenames without an extension', async () => {
        // Given a filename with no extension
        // When the file is staged
        await stageAttachment({uri: 'file:///cache/img', fileName: 'receipt'});
        const destPath = mockMoveFile.mock.calls.at(0)?.at(1) ?? '';
        // Then the destination path has the unique suffix appended at the end with no extension
        expect(destPath).toMatch(new RegExp(`^${ATTACHMENT_DIR}/receipt_\\d+$`));
    });

    it('returns the source URI untouched when the URI is not a local file', async () => {
        // Given a remote (non-file://) URI
        // When the file is staged
        const result = await stageAttachment({
            uri: 'https://example.com/image.png',
            fileName: 'image.png',
        });
        // Then the source URI is returned as-is and no move happens
        expect(result).toBe('https://example.com/image.png');
        expect(mockMoveFile).not.toHaveBeenCalled();
    });

    it('returns the source URI when the move fails', async () => {
        // Given a local file that fails to move
        mockMoveFile.mockRejectedValue(new Error('disk full'));
        // When the file is staged
        const result = await stageAttachment({
            uri: 'file:///cache/img.jpg',
            fileName: 'receipt.jpg',
        });
        // Then the original URI is returned as a safe fallback
        expect(result).toBe('file:///cache/img.jpg');
    });
});

describe('cacheAttachment — dedupe of staged files', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockMkdir.mockReset().mockResolvedValue();
        mockExists.mockReset().mockResolvedValue(true);
        mockCopyFile.mockReset().mockResolvedValue();
        mockOnyxSet.mockReset().mockResolvedValue();
    });

    it('reuses an already-staged file instead of copying it again (no duplicate on disk)', async () => {
        // Given a file:// URI pointing inside the attachments directory (already staged by stageAttachment)
        const stagedPath = `${ATTACHMENT_DIR}/receipt_123.jpg`;
        const stagedUri = `file://${stagedPath}`;
        // When cacheAttachment is called with that staged URI
        const result = await cacheAttachment({
            uri: stagedUri,
            attachmentID: 'attach-1',
        });
        // Then it reuses the file in place — no copyFile — and records the source in Onyx
        expect(mockCopyFile).not.toHaveBeenCalled();
        expect(result).toBe(stagedPath);
        expect(mockOnyxSet).toHaveBeenCalledWith(`${ONYXKEYS.COLLECTION.ATTACHMENT}attach-1`, {
            attachmentID: 'attach-1',
            source: stagedPath,
        });
    });

    it('copies a non-staged local file into the attachments directory (normal upload flow)', async () => {
        // Given a local file:// URI pointing outside the attachments directory
        const sourceUri = 'file:///var/mobile/Library/Caches/ImageManipulator/cropped.jpg';
        mockExists.mockResolvedValue(false);
        // When cacheAttachment is called
        await cacheAttachment({
            uri: sourceUri,
            attachmentID: 'attach-2',
            fileType: 'image/jpeg',
        });
        // Then the file is copied into the attachments dir (not moved, since the original may still be needed)
        expect(mockCopyFile).toHaveBeenCalledTimes(1);
        const [, destPath] = mockCopyFile.mock.calls.at(0) ?? [];
        expect(destPath).toMatch(new RegExp(`^${ATTACHMENT_DIR}/attach-2\\.`));
    });
});

describe('getAttachmentDir', () => {
    it('returns the attachments directory path', () => {
        // Given the module is loaded
        // When getAttachmentDir is called
        const result = getAttachmentDir();
        // Then it returns the durable attachments directory under DocumentDirectoryPath
        expect(result).toBe(ATTACHMENT_DIR);
    });
});
