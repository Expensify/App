import Onyx from 'react-native-onyx';
import {dismissForSession} from '@libs/actions/ConciergeNotificationBanner';
import ONYXKEYS from '@src/ONYXKEYS';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('ConciergeNotificationBanner', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    describe('dismissForSession', () => {
        it('writes true to the RAM-only dismissal flag', async () => {
            dismissForSession();
            await waitForBatchedUpdates();
            const value = await getOnyxValue(ONYXKEYS.RAM_ONLY_HAS_DISMISSED_CONCIERGE_NOTIFICATION_BANNER);
            expect(value).toBe(true);
        });
    });
});
