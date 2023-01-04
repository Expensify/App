import Onyx from 'react-native-onyx';
import PushNotification from '../../src/libs/Notification/PushNotification';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';

// The Onyx handler for subscribing and unsubscribing is in this module
// so we must import it
import '../../src/libs/actions/Session';

jest.mock('../../src/libs/Notification/PushNotification');

describe('PushNotifications', () => {
    describe('Subscribe/Unsubscribe', () => {
        beforeAll(() => {
            Onyx.init({keys: ONYXKEYS});
            return waitForPromisesToResolve();
        });

        beforeEach(() => {
            jest.clearAllMocks();
        });

        afterAll(() => {
            jest.clearAllMocks();
            Onyx.clear();
            return waitForPromisesToResolve();
        });

        test('Push notifications are subscribed after signing in', () => {
            Onyx.merge(ONYXKEYS.SESSION, {
                accountID: 'test-id',
            });

            return waitForPromisesToResolve().then(() => {
                expect(PushNotification.register).toBeCalled();
            });
        });

        test('Push notifications are unsubscribed after signing out', () => {
            Onyx.set(ONYXKEYS.SESSION, null);

            return waitForPromisesToResolve().then(() => {
                expect(PushNotification.deregister).toBeCalled();
            });
        });
    });
});
