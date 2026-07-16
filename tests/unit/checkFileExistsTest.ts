import checkFileExists from '@libs/fileDownload/checkFileExists/index';

import type RNFS from 'react-native-fs';

const mockStat = jest.fn<Promise<RNFS.StatResult>, [string]>();

jest.mock('react-native-fs', () => ({
    stat: (...args: [string]) => mockStat(...args),
}));

const buildStatResult = (isFile: boolean): RNFS.StatResult => ({
    name: undefined,
    path: '',
    size: 0,
    mode: 0,
    ctime: 0,
    mtime: 0,
    originalFilepath: '',
    isFile: () => isFile,
    isDirectory: () => !isFile,
});

describe('checkFileExists', () => {
    beforeEach(() => {
        mockStat.mockReset();
    });

    it('should return false for undefined path', async () => {
        const result = await checkFileExists(undefined);
        expect(result).toBe(false);
        expect(mockStat).not.toHaveBeenCalled();
    });

    it('should return false for empty string', async () => {
        const result = await checkFileExists('');
        expect(result).toBe(false);
        expect(mockStat).not.toHaveBeenCalled();
    });

    it('should call RNFS.stat with a plain POSIX path', async () => {
        mockStat.mockResolvedValue(buildStatResult(true));
        const result = await checkFileExists('/var/mobile/Containers/shared_image.png');
        expect(result).toBe(true);
        expect(mockStat).toHaveBeenCalledWith('/var/mobile/Containers/shared_image.png');
    });

    it('should strip file:// prefix before calling RNFS.stat', async () => {
        mockStat.mockResolvedValue(buildStatResult(true));
        const result = await checkFileExists('file:///var/mobile/Containers/shared_image.png');
        expect(result).toBe(true);
        expect(mockStat).toHaveBeenCalledWith('/var/mobile/Containers/shared_image.png');
    });

    it('should decode URI-encoded paths', async () => {
        mockStat.mockResolvedValue(buildStatResult(true));
        const result = await checkFileExists('file:///var/mobile/Containers/my%20receipt.png');
        expect(result).toBe(true);
        expect(mockStat).toHaveBeenCalledWith('/var/mobile/Containers/my receipt.png');
    });

    it('should decode reserved characters like # in the filename', async () => {
        mockStat.mockResolvedValue(buildStatResult(true));
        const result = await checkFileExists('file:///var/mobile/Containers/sharedFiles/Receipt%20%2342.pdf');
        expect(result).toBe(true);
        expect(mockStat).toHaveBeenCalledWith('/var/mobile/Containers/sharedFiles/Receipt #42.pdf');
    });

    it('should fall back to the raw path when the filename literally contains a % sequence', async () => {
        // moveReceiptToDurableStorage builds file:// paths from the raw filename without encoding,
        // so a file literally named "Receipt %23.pdf" must not be decoded to "Receipt #.pdf".
        const rawPath = '/var/mobile/Containers/Receipts-Upload/Receipt %23.pdf';
        mockStat.mockImplementation((candidate: string) => (candidate === rawPath ? Promise.resolve(buildStatResult(true)) : Promise.reject(new Error('File not found'))));
        const result = await checkFileExists(`file://${rawPath}`);
        expect(result).toBe(true);
        expect(mockStat).toHaveBeenCalledWith('/var/mobile/Containers/Receipts-Upload/Receipt #.pdf');
        expect(mockStat).toHaveBeenCalledWith(rawPath);
    });

    it('should fall back to the raw path when the URI is not valid percent-encoding', async () => {
        // A literal "%" that is not a valid escape (e.g. "50%") makes decodeURIComponent throw.
        const rawPath = '/var/mobile/Containers/Receipts-Upload/Report 50%.pdf';
        mockStat.mockResolvedValue(buildStatResult(true));
        const result = await checkFileExists(`file://${rawPath}`);
        expect(result).toBe(true);
        expect(mockStat).toHaveBeenCalledWith(rawPath);
    });

    it('should return false when neither the decoded nor the raw path exists', async () => {
        mockStat.mockRejectedValue(new Error('File not found'));
        const result = await checkFileExists('file:///var/mobile/Containers/sharedFiles/Ghost%20%2342.pdf');
        expect(result).toBe(false);
        expect(mockStat).toHaveBeenCalledWith('/var/mobile/Containers/sharedFiles/Ghost #42.pdf');
        expect(mockStat).toHaveBeenCalledWith('/var/mobile/Containers/sharedFiles/Ghost%20%2342.pdf');
    });

    it('should return false when RNFS.stat throws', async () => {
        mockStat.mockRejectedValue(new Error('File not found'));
        const result = await checkFileExists('/nonexistent/path');
        expect(result).toBe(false);
    });

    it('should return false when path is a directory', async () => {
        mockStat.mockResolvedValue(buildStatResult(false));
        const result = await checkFileExists('/var/mobile/Containers/');
        expect(result).toBe(false);
    });
});
