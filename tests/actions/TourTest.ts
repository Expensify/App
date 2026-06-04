import Onyx from 'react-native-onyx';
import OnyxUpdateManager from '@libs/actions/OnyxUpdateManager';
import {startTestDrive} from '@libs/actions/Tour';
import Navigation from '@libs/Navigation/Navigation';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import * as SequentialQueue from '@src/libs/Network/SequentialQueue';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

OnyxUpdateManager();
describe('actions/Tour', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        initOnyxDerivedValues();
        await waitForBatchedUpdates();
    });

    beforeEach(async () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        SequentialQueue.resetQueue();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('startTestDrive', () => {
        it('should navigate to the Test Drive demo screen', async () => {
            startTestDrive();
            await waitForBatchedUpdates();

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.TEST_DRIVE_DEMO_ROOT);
        });
    });
});
