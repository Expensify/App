import localFileCreate from '@libs/localFileCreate';
import saveTextFileNative from '@libs/saveTextFile/index.native';
import type SaveTextFile from '@libs/saveTextFile/types';

import RNFetchBlob from 'react-native-blob-util';
import Share from 'react-native-share';

jest.mock('@libs/localFileCreate', () => jest.fn());
jest.mock('@libs/ApiUtils', () => ({
    getApiRoot: jest.fn(() => 'https://example.com'),
}));
jest.mock('@libs/fileDownload/FileUtils', () => ({
    appendTimeToFileName: jest.fn((fileName: string) => fileName),
    getFileName: jest.fn((fileName: string) => fileName),
}));
jest.mock('@libs/tryResolveUrlFromApiRoot', () => jest.fn((url: string) => url));
jest.mock('@userActions/Link', () => ({openExternalLink: jest.fn()}));
jest.mock('react-native-blob-util', () => ({
    __esModule: true,
    default: {fs: {unlink: jest.fn()}},
}));
jest.mock('react-native-share', () => ({open: jest.fn()}));

const saveTextFileWeb = jest.requireActual<{default: SaveTextFile}>('@libs/saveTextFile/index.ts').default;
const file = {
    path: 'blob:onyx-state',
    newFileName: 'onyx-state.txt',
    size: 7,
};
const options = {fileName: file.newFileName, content: 'example'};

describe('saveTextFile', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.mocked(localFileCreate).mockResolvedValue(file);
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    it('downloads a temporary Blob on web and releases its URL', async () => {
        const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function mockClick(this: HTMLAnchorElement) {
            expect(this.download).toBe(file.newFileName);
            expect(this.href).toBe(file.path);
            expect(document.body.contains(this)).toBe(true);
        });
        const revokeObjectURL = jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

        await saveTextFileWeb(options);

        expect(localFileCreate).toHaveBeenCalledWith(options.fileName, options.content, false);
        expect(click).toHaveBeenCalledTimes(1);
        expect(document.querySelector(`a[href="${file.path}"]`)).toBeNull();
        expect(revokeObjectURL).not.toHaveBeenCalled();

        jest.runOnlyPendingTimers();

        expect(revokeObjectURL).toHaveBeenCalledWith(file.path);
    });

    it('releases the web Blob URL if starting the download fails', async () => {
        const error = new Error('Download failed');
        jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
            throw error;
        });
        const revokeObjectURL = jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

        await expect(saveTextFileWeb(options)).rejects.toBe(error);

        expect(document.querySelector(`a[href="${file.path}"]`)).toBeNull();
        expect(revokeObjectURL).not.toHaveBeenCalled();

        jest.runOnlyPendingTimers();

        expect(revokeObjectURL).toHaveBeenCalledWith(file.path);
    });

    it('shares a temporary file on native and removes it after sharing', async () => {
        jest.mocked(Share.open).mockResolvedValueOnce({success: true, message: ''});
        jest.mocked(RNFetchBlob.fs.unlink).mockResolvedValueOnce(undefined);
        jest.mocked(localFileCreate).mockResolvedValueOnce({...file, path: '/cache/onyx-state.txt'});

        await saveTextFileNative(options);

        expect(localFileCreate).toHaveBeenCalledWith(options.fileName, options.content, false);
        expect(Share.open).toHaveBeenCalledWith({
            url: 'file:///cache/onyx-state.txt',
            failOnCancel: false,
        });
        expect(RNFetchBlob.fs.unlink).toHaveBeenCalledWith('/cache/onyx-state.txt');
    });

    it('removes the native temporary file and propagates a share failure', async () => {
        const error = new Error('Share failed');
        jest.mocked(Share.open).mockRejectedValueOnce(error);
        jest.mocked(RNFetchBlob.fs.unlink).mockResolvedValueOnce(undefined);
        jest.mocked(localFileCreate).mockResolvedValueOnce({...file, path: '/cache/onyx-state.txt'});

        await expect(saveTextFileNative(options)).rejects.toBe(error);

        expect(RNFetchBlob.fs.unlink).toHaveBeenCalledWith('/cache/onyx-state.txt');
    });
});
