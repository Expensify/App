import ExportOnyxState from '@libs/ExportOnyxState';
import ExportOnyxStateNative from '@libs/ExportOnyxState/index.native';

import Onyx from 'react-native-onyx';

describe('Onyx state export', () => {
    it.each([
        ['web', ExportOnyxState],
        ['native', ExportOnyxStateNative],
    ])('reads the %s state through Onyx', async (_platform, exporter) => {
        const state = {test: {value: 1}};
        const exportState = jest.spyOn(Onyx, 'exportState').mockResolvedValueOnce(state);

        await expect(exporter.readOnyxState()).resolves.toBe(state);
        expect(exportState).toHaveBeenCalledTimes(1);

        exportState.mockRestore();
    });

    it.each([
        ['web', ExportOnyxState],
        ['native', ExportOnyxStateNative],
    ])('propagates a %s storage error', async (_platform, exporter) => {
        const error = new Error('Storage read failed');
        const exportState = jest.spyOn(Onyx, 'exportState').mockRejectedValueOnce(error);

        await expect(exporter.readOnyxState()).rejects.toBe(error);

        exportState.mockRestore();
    });
});
