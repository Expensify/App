import Onyx from 'react-native-onyx';
import * as App from '@libs/actions/App';
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

        // The lastFullReconnecTime should be updated
        const lastFullReconnectTime = await getOnyxValue(ONYXKEYS.LAST_FULL_RECONNECT_TIME);
        expect(lastFullReconnectTime).toBeTruthy();
    });
});
