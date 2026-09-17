import getFileSize from '@pages/Share/getFileSize/index.native';

import type RNFS from 'react-native-fs';

const mockStat = jest.fn<Promise<Partial<RNFS.StatResult>>, [string]>();

jest.mock('react-native-fs', () => ({
    stat: (...args: [string]) => mockStat(...args),
}));

describe('getFileSize', () => {
    beforeEach(() => {
        mockStat.mockReset();
    });

    it('stats the decoded POSIX path for an encoded share URI', async () => {
        mockStat.mockResolvedValue({size: 1234});
        const size = await getFileSize('file:///var/mobile/Containers/sharedFiles/Receipt%20%2342.pdf');
        expect(size).toBe(1234);
        expect(mockStat).toHaveBeenCalledWith('/var/mobile/Containers/sharedFiles/Receipt #42.pdf');
    });

    it('passes a plain path through unchanged', async () => {
        mockStat.mockResolvedValue({size: 42});
        const size = await getFileSize('/var/mobile/Containers/sharedFiles/receipt.pdf');
        expect(size).toBe(42);
        expect(mockStat).toHaveBeenCalledWith('/var/mobile/Containers/sharedFiles/receipt.pdf');
    });

    it('propagates a stat rejection so callers can handle it', async () => {
        mockStat.mockRejectedValue(new Error('File not found'));
        await expect(getFileSize('file:///var/mobile/Containers/sharedFiles/ghost.pdf')).rejects.toThrow('File not found');
    });
});
