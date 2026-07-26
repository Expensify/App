import {verifyFileFormat} from '@libs/fileDownload/FileUtils';

import {Platform} from 'react-native';

const mockReadFile = jest.fn<Promise<string>, [string, string]>();

jest.mock('react-native-blob-util', () => ({
    __esModule: true,
    default: {fs: {readFile: (...args: [string, string]) => mockReadFile(...args)}},
}));

describe('verifyFileFormat', () => {
    let platformReplaceProperty: jest.ReplaceProperty<string>;

    beforeEach(() => {
        platformReplaceProperty = jest.replaceProperty(Platform, 'OS', 'ios');
        mockReadFile.mockReset().mockResolvedValue(Buffer.from('0123456789abcdef').toString('base64'));
    });

    afterEach(() => {
        platformReplaceProperty.restore();
    });

    it('reads the decoded POSIX path for an encoded file:// URI', async () => {
        await verifyFileFormat({fileUri: 'file:///var/mobile/Containers/Receipt%20%2342.mov', formatSignatures: ['667479703flag']});
        expect(mockReadFile).toHaveBeenCalledWith('/var/mobile/Containers/Receipt #42.mov', 'base64');
    });

    it('reads a raw path with only the scheme stripped when the URI is not percent-encoded', async () => {
        await verifyFileFormat({fileUri: 'file:///var/mobile/Containers/video.mov', formatSignatures: ['667479703flag']});
        expect(mockReadFile).toHaveBeenCalledWith('/var/mobile/Containers/video.mov', 'base64');
    });
});
