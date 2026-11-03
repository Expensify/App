import {registerSessionCleanupCallback} from '@libs/SessionCleanup';

import {cleanupSession} from '@src/libs/actions/Session';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

Onyx.init({
    keys: ONYXKEYS,
});

// Kept in its own file: cleanupSession has global side effects (clearCache, PersistedRequests.clear, ...)
// that break other tests when it runs inside a shared suite like SessionTest.
describe('Session cleanup integration', () => {
    it('cleanupSession runs registered session cleanup callbacks', () => {
        const callback = jest.fn();
        registerSessionCleanupCallback(callback);

        cleanupSession();

        expect(callback).toHaveBeenCalledTimes(1);
    });
});
