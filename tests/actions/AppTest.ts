import Onyx from 'react-native-onyx';
import * as App from '@libs/actions/App';
import DateUtils from '@libs/DateUtils';
import '@libs/Navigation/AppNavigator/AuthScreens';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

OnyxUpdateManager();

describe('actions/App', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    test('lastFullReconnectTime - openApp', async () => {
        // When Open App runs
        App.openApp();
        App.confirmReadyToOpenApp();
        await waitForBatchedUpdates();

        // The lastFullReconnectTime should be updated
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBeTruthy();
    });

    test('lastFullReconnectTime - full reconnectApp', async () => {
        // When a full ReconnectApp runs
        App.reconnectApp();
        App.confirmReadyToOpenApp();
        await waitForBatchedUpdates();

        // The lastFullReconnectTime should be updated
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBeTruthy();
    });

    test('lastFullReconnectTime - incremental reconnectApp', async () => {
        // When an incremental ReconnectApp runs
        App.reconnectApp(123);
        App.confirmReadyToOpenApp();
        await waitForBatchedUpdates();

        // The lastFullReconnectTime should NOT be updated
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBeUndefined();
    });

    test('trigger full reconnect', async () => {
        const reconnectApp = jest.spyOn(App, 'reconnectApp');

        // When OpenApp runs
        App.openApp();
        App.confirmReadyToOpenApp();
        await waitForBatchedUpdates();

        // The lastFullReconnectTime should be updated
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBeTruthy();

        // And when a new reconnectAppIfFullReconnectBefore is received
        Onyx.set(ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE, DateUtils.getDBTime());
        await waitForBatchedUpdates();

        // Then ReconnectApp should get called with no updateIDFrom to perform a full reconnect
        expect(reconnectApp).toHaveBeenCalledTimes(1);
        expect(reconnectApp).toHaveBeenCalledWith();
    });
});
