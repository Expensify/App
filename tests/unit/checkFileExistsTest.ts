import type RNFS from 'react-native-fs';
import checkFileExists from '@libs/fileDownload/checkFileExists/index';

const mockStat = jest.fn<Promise<RNFS.StatResult>, [string]>();

jest.mock('react-native-fs', () => ({
    stat: (...args: [string]) => mockStat(...args),
}));

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
        mockStat.mockResolvedValue({isFile: () => true} as RNFS.StatResult);
        const result = await checkFileExists('/var/mobile/Containers/shared_image.png');
        expect(result).toBe(true);
        expect(mockStat).toHaveBeenCalledWith('/var/mobile/Containers/shared_image.png');
    });

    it('should strip file:// prefix before calling RNFS.stat', async () => {
        mockStat.mockResolvedValue({isFile: () => true} as RNFS.StatResult);
        const result = await checkFileExists('file:///var/mobile/Containers/shared_image.png');
        expect(result).toBe(true);
        expect(mockStat).toHaveBeenCalledWith('/var/mobile/Containers/shared_image.png');
    });

    it('should decode URI-encoded paths', async () => {
        mockStat.mockResolvedValue({isFile: () => true} as RNFS.StatResult);
        const result = await checkFileExists('file:///var/mobile/Containers/my%20receipt.png');
        expect(result).toBe(true);
        expect(mockStat).toHaveBeenCalledWith('/var/mobile/Containers/my receipt.png');
    });

    it('should return false when RNFS.stat throws', async () => {
        mockStat.mockRejectedValue(new Error('File not found'));
        const result = await checkFileExists('/nonexistent/path');
        expect(result).toBe(false);
    });

    it('should return false when path is a directory', async () => {
        mockStat.mockResolvedValue({isFile: () => false} as RNFS.StatResult);
        const result = await checkFileExists('/var/mobile/Containers/');
        expect(result).toBe(false);
    });
});
