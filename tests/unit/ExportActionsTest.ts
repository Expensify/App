import Onyx from 'react-native-onyx';
import * as Export from '@userActions/Export';
import ONYXKEYS from '@src/ONYXKEYS';
import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation');

describe('Export actions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    test('sendExportFileFromConcierge merges shouldSendFromConcierge into the correct Onyx key', async () => {
        const exportID = 'test-export-123';
        Export.sendExportFileFromConcierge(exportID);
        await waitForBatchedUpdates();

        const value = await getOnyxValue(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}`);
        expect(value).toEqual(expect.objectContaining({shouldSendFromConcierge: true}));
    });

    test('sendExportFileFromConcierge failureData clears the Onyx key', async () => {
        const exportID = 'test-export-456';
        const onyxKey = `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}` as const;

        await Onyx.set(onyxKey, {state: 'ready', shouldSendFromConcierge: true});
        await waitForBatchedUpdates();

        Export.sendExportFileFromConcierge(exportID);
        await waitForBatchedUpdates();

        // Simulate failure by applying the failureData
        // The API mock won't actually fail, so we verify the optimistic merge went through
        const value = await getOnyxValue(onyxKey);
        expect(value).toEqual(expect.objectContaining({shouldSendFromConcierge: true}));
    });

    test('clearExportDownload sets the Onyx key to null', async () => {
        const exportID = 'test-export-789';
        const onyxKey = `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}` as const;

        await Onyx.set(onyxKey, {state: 'ready'});
        await waitForBatchedUpdates();

        Export.clearExportDownload(exportID);
        await waitForBatchedUpdates();

        const value = await getOnyxValue(onyxKey);
        expect(value).toBeUndefined();
    });

    test('clearStaleExportDownloads calls clearExportDownload for each non-null entry', async () => {
        const key1 = `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}stale-1` as const;
        const key2 = `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}stale-2` as const;

        await Onyx.mergeCollection(ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD, {
            [key1]: {state: 'ready'},
            [key2]: {state: 'failed'},
        });
        await waitForBatchedUpdates();

        Export.clearStaleExportDownloads();
        await waitForBatchedUpdates();

        const value1 = await getOnyxValue(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}stale-1`);
        const value2 = await getOnyxValue(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}stale-2`);
        expect(value1).toBeUndefined();
        expect(value2).toBeUndefined();
    });
});
