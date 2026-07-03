import * as Export from '@userActions/Export';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import type {MockFetch} from '../utils/TestHelper';

import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation');

describe('Export actions', () => {
    let mockFetch: MockFetch;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockFetch = TestHelper.getGlobalFetchMock() as MockFetch;
        global.fetch = mockFetch;
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    test('sendExportFileFromConcierge merges shouldSendFromConcierge into the correct Onyx key', async () => {
        const exportID = 'test-export-123';
        const existingData = {state: 'preparing' as const};
        Export.sendExportFileFromConcierge(exportID, existingData);
        await waitForBatchedUpdates();

        const value = await getOnyxValue(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}`);
        expect(value).toEqual(expect.objectContaining({shouldSendFromConcierge: true}));
    });

    test('sendExportFileFromConcierge failureData reverts shouldSendFromConcierge to its previous value', async () => {
        const exportID = 'test-export-456';
        const onyxKey = `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}` as const;
        const existingData = {state: 'ready' as const, shouldSendFromConcierge: false};

        await Onyx.set(onyxKey, existingData);
        await waitForBatchedUpdates();

        mockFetch.fail?.();
        Export.sendExportFileFromConcierge(exportID, existingData);
        await waitForBatchedUpdates();

        const value = await getOnyxValue(onyxKey);
        expect(value).toEqual(expect.objectContaining({shouldSendFromConcierge: false, state: 'ready'}));
    });

    test('clearExportDownload sets the Onyx key to null', async () => {
        const exportID = 'test-export-789';
        const onyxKey = `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}` as const;

        const existingData = {state: 'ready' as const};
        await Onyx.set(onyxKey, existingData);
        await waitForBatchedUpdates();

        Export.clearExportDownload(exportID, existingData);
        await waitForBatchedUpdates();

        const value = await getOnyxValue(onyxKey);
        expect(value).toBeUndefined();
    });

    test('clearExportDownload failureData restores the previous value on failure', async () => {
        const exportID = 'test-export-restore';
        const onyxKey = `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}` as const;
        const existingData = {state: 'ready' as const, reportCount: 5};

        await Onyx.set(onyxKey, existingData);
        await waitForBatchedUpdates();

        mockFetch.fail?.();
        Export.clearExportDownload(exportID, existingData);
        await waitForBatchedUpdates();

        const value = await getOnyxValue(onyxKey);
        expect(value).toEqual(expect.objectContaining({state: 'ready', reportCount: 5}));
    });

    test('exportReportsToPDF sets optimistic Onyx data with state preparing and returns exportID', async () => {
        const exportID = Export.exportReportsToPDF(['1', '2']);
        await waitForBatchedUpdates();

        expect(typeof exportID).toBe('string');
        expect(exportID.length).toBeGreaterThan(0);

        const value = await getOnyxValue(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}`);
        expect(value).toEqual(expect.objectContaining({state: 'preparing'}));
    });

    test('exportReportsToPDF failureData sets failed state on failure', async () => {
        mockFetch.fail?.();
        const exportID = Export.exportReportsToPDF(['1']);
        await waitForBatchedUpdates();

        const value = await getOnyxValue(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}`);
        expect(value).toEqual(expect.objectContaining({state: 'failed'}));
    });

    test('clearStaleExportDownloads clears ready/failed entries but preserves preparing ones', async () => {
        const key1 = `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}stale-1` as const;
        const key2 = `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}stale-2` as const;
        const key3 = `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}stale-3` as const;

        await Onyx.mergeCollection(ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD, {
            [key1]: {state: 'ready'},
            [key2]: {state: 'failed'},
            [key3]: {state: 'preparing'},
        });
        await waitForBatchedUpdates();

        Export.clearStaleExportDownloads();
        await waitForBatchedUpdates();

        const value1 = await getOnyxValue(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}stale-1`);
        const value2 = await getOnyxValue(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}stale-2`);
        const value3 = await getOnyxValue(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}stale-3`);
        expect(value1).toBeUndefined();
        expect(value2).toBeUndefined();
        expect(value3).toEqual(expect.objectContaining({state: 'preparing'}));
    });
});
