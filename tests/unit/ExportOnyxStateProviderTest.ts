import ExportOnyxState from '@libs/ExportOnyxState';
import saveTextFile from '@libs/saveTextFile';

import CONST from '@src/CONST';

import Onyx from 'react-native-onyx';

jest.mock('@libs/saveTextFile', () => jest.fn());

describe('Onyx state export', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    it('reads persisted state through Onyx', async () => {
        const state = {test: {value: 1}};
        const exportState = jest.spyOn(Onyx, 'exportState').mockResolvedValueOnce(state);

        await expect(ExportOnyxState.readOnyxState()).resolves.toBe(state);
        expect(exportState).toHaveBeenCalledWith({includeStaleRamOnlyKeys: true});
    });

    it('propagates storage errors', async () => {
        const error = new Error('Storage read failed');
        jest.spyOn(Onyx, 'exportState').mockRejectedValueOnce(error);

        await expect(ExportOnyxState.readOnyxState()).rejects.toBe(error);
    });

    it('saves the exported state with its established filename', async () => {
        const content = '{"test":1}';
        jest.mocked(saveTextFile).mockResolvedValueOnce(undefined);

        await ExportOnyxState.shareAsFile(content);

        expect(saveTextFile).toHaveBeenCalledWith({fileName: CONST.DEFAULT_ONYX_DUMP_FILE_NAME, content});
    });
});
