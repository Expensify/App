import {checkFileExistsWithReason} from '@libs/fileDownload/checkFileExists';
import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import prepareRequestPayload from '@libs/prepareRequestPayload';
import prepareNativeRequestPayload from '@libs/prepareRequestPayload/index.native';
import {logReceiptDropped} from '@libs/telemetry/ReceiptObservability';

import type {ReadDirItem} from 'react-native-fs';

import RNFS from 'react-native-fs';

jest.unmock('@libs/prepareRequestPayload/index.native.ts');
jest.mock('@libs/fileDownload/checkFileExists', () => ({checkFileExistsWithReason: jest.fn()}));
jest.mock('@libs/getReceiptsUploadFolderPath', () => jest.fn());
jest.mock('@libs/telemetry/ReceiptObservability', () => ({logReceiptDropped: jest.fn()}));

const buildReadDirItem = (name: string): ReadDirItem => ({
    name,
    path: `/mock/documents/Receipts-Upload/${name}`,
    size: 0,
    ctime: undefined,
    mtime: undefined,
    isFile: () => true,
    isDirectory: () => false,
});

describe('prepareRequestPayload', () => {
    it('should append string values to FormData', async () => {
        const formData = await prepareRequestPayload('TestCommand', {authToken: 'abc123', email: 'test@example.com'}, false);

        expect(formData.get('authToken')).toBe('abc123');
        expect(formData.get('email')).toBe('test@example.com');
    });

    it('should omit null values from FormData instead of coercing them to the string "null"', async () => {
        const formData = await prepareRequestPayload('TestCommand', {authToken: null, email: null, referer: 'ecash'}, false);

        expect(formData.has('authToken')).toBe(false);
        expect(formData.has('email')).toBe(false);
        expect(formData.get('referer')).toBe('ecash');
    });

    it('should omit undefined values from FormData', async () => {
        const formData = await prepareRequestPayload('TestCommand', {authToken: undefined, platform: 'web'}, false);

        expect(formData.has('authToken')).toBe(false);
        expect(formData.get('platform')).toBe('web');
    });

    it('should include falsy non-null/undefined values (0, false, empty string)', async () => {
        const formData = await prepareRequestPayload('TestCommand', {count: 0, flag: false, label: ''}, false);

        expect(formData.get('count')).toBe('0');
        expect(formData.get('flag')).toBe('false');
        expect(formData.get('label')).toBe('');
    });

    it('should return an empty FormData for an empty data object', async () => {
        const formData = await prepareRequestPayload('TestCommand', {}, false);
        const entries = Array.from(formData.entries());

        expect(entries).toHaveLength(0);
    });
});

describe('prepareRequestPayload dropped receipt logging', () => {
    const mockFolderPath = '/mock/documents/Receipts-Upload';

    beforeEach(() => {
        jest.mocked(getReceiptsUploadFolderPath).mockReturnValue(mockFolderPath);
        jest.mocked(checkFileExistsWithReason).mockResolvedValue({exists: false, error: {message: 'no such file', code: 'ENOENT'}});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should log that the whole receipts folder is gone', async () => {
        // Given a receipt whose file is missing because its folder no longer exists
        jest.mocked(RNFS.exists).mockResolvedValue(false);

        // When the upload payload is built
        await prepareNativeRequestPayload('RequestMoney', {transactionID: '1', receipt: {source: 'file:///old/Receipts-Upload/a.png', name: 'a.png'}}, false);

        // Then the drop records the folder as gone, which tells a folder wipe apart from a single deleted file
        expect(logReceiptDropped).toHaveBeenCalledWith(expect.objectContaining({transactionID: '1', receiptsFolder: {exists: false}}));
    });

    it('should log the folder entry count and the path that was checked when only the file is gone', async () => {
        // Given a missing receipt whose folder still holds other files
        jest.mocked(RNFS.exists).mockResolvedValue(true);
        jest.mocked(RNFS.readDir).mockResolvedValue([buildReadDirItem('b.png'), buildReadDirItem('c.png')]);

        // When the upload payload is built
        await prepareNativeRequestPayload('RequestMoney', {transactionID: '1', receipt: {source: 'file:///old/Receipts-Upload/a.png', name: 'a.png'}}, false);

        // Then the drop carries the folder entry count and the re-rooted path the file check actually tested
        expect(logReceiptDropped).toHaveBeenCalledWith(
            expect.objectContaining({source: 'file:///old/Receipts-Upload/a.png', localUri: `file://${mockFolderPath}/a.png`, receiptsFolder: {exists: true, entryCount: 2}}),
        );
    });
});
