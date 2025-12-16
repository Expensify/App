import Onyx from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import '@libs/Navigation/AppNavigator/AuthScreens';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import * as App from '../../src/libs/actions/App';
import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@src/components/ConfirmedRoute.tsx');


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

    afterEach(() => {
        jest.restoreAllMocks();
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
        await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
        App.reconnectApp();
        App.confirmReadyToOpenApp();
        await waitForBatchedUpdates();

        // The lastFullReconnectTime should be updated
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBeTruthy();
    });

    test('lastFullReconnectTime - incremental reconnectApp', async () => {
        // When an incremental ReconnectApp runs
        await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
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

    test("don't trigger full reconnect", async () => {
        const reconnectApp = jest.spyOn(App, 'reconnectApp');

        // When OpenApp runs
        App.openApp();
        App.confirmReadyToOpenApp();
        await waitForBatchedUpdates();

        // The lastFullReconnectTime should be updated
        expect(await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME)).toBeTruthy();

        // And when a reconnectAppIfFullReconnectBefore is received with a timestamp in the past
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        Onyx.set(ONYXKEYS.NVP_RECONNECT_APP_IF_FULL_RECONNECT_BEFORE, DateUtils.getDBTime(yesterday.toISOString()));
        await waitForBatchedUpdates();

        // Then ReconnectApp should NOT get called
        expect(reconnectApp).toHaveBeenCalledTimes(0);
    });
});
