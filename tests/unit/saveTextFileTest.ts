import localFileCreate from '@libs/localFileCreate';
import saveTextFileNative from '@libs/saveTextFile/index.native';
import type SaveTextFile from '@libs/saveTextFile/types';

import RNFS from 'react-native-fs';
import Share from 'react-native-share';

jest.mock('@libs/localFileCreate', () => jest.fn());
jest.mock('react-native-fs', () => ({unlink: jest.fn()}));
jest.mock('react-native-share', () => ({open: jest.fn()}));

const saveTextFileWeb = jest.requireActual<{default: SaveTextFile}>('@libs/saveTextFile/index.ts').default;
const file = {path: 'blob:onyx-state', newFileName: 'onyx-state.txt', size: 7};
const options = {fileName: file.newFileName, content: 'example'};

describe('saveTextFile', () => {
    beforeEach(() => {
        jest.mocked(localFileCreate).mockResolvedValue(file);
    });

    afterEach(() => {
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
        expect(revokeObjectURL).toHaveBeenCalledWith(file.path);
        expect(document.querySelector(`a[href="${file.path}"]`)).toBeNull();
    });

    it('releases the web Blob URL if starting the download fails', async () => {
        const error = new Error('Download failed');
        jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
            throw error;
        });
        const revokeObjectURL = jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

        await expect(saveTextFileWeb(options)).rejects.toBe(error);

        expect(revokeObjectURL).toHaveBeenCalledWith(file.path);
        expect(document.querySelector(`a[href="${file.path}"]`)).toBeNull();
    });

    it('shares a temporary file on native and removes it after sharing', async () => {
        jest.mocked(Share.open).mockResolvedValueOnce({success: true, message: ''});
        jest.mocked(RNFS.unlink).mockResolvedValueOnce(undefined);
        jest.mocked(localFileCreate).mockResolvedValueOnce({...file, path: '/cache/onyx-state.txt'});

        await saveTextFileNative(options);

        expect(localFileCreate).toHaveBeenCalledWith(options.fileName, options.content, false);
        expect(Share.open).toHaveBeenCalledWith({url: 'file:///cache/onyx-state.txt', failOnCancel: false});
        expect(RNFS.unlink).toHaveBeenCalledWith('/cache/onyx-state.txt');
    });

    it('removes the native temporary file and propagates a share failure', async () => {
        const error = new Error('Share failed');
        jest.mocked(Share.open).mockRejectedValueOnce(error);
        jest.mocked(RNFS.unlink).mockResolvedValueOnce(undefined);
        jest.mocked(localFileCreate).mockResolvedValueOnce({...file, path: '/cache/onyx-state.txt'});

        await expect(saveTextFileNative(options)).rejects.toBe(error);

        expect(RNFS.unlink).toHaveBeenCalledWith('/cache/onyx-state.txt');
    });
});
