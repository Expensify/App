import Onyx from 'react-native-onyx';
import _ from 'underscore';
import CONST from '../../src/CONST';
import getPlatform from '../../src/libs/getPlatform';
import MoveToIndexedDB from '../../src/libs/migrations/MoveToIndexedDB';
import ONYXKEYS from '../../src/ONYXKEYS';

jest.mock('../../src/libs/getPlatform');

// Using fake timers is causing problems with promises getting timed out
// This seems related: https://github.com/facebook/jest/issues/11876
jest.useRealTimers();

describe('MoveToIndexedDb', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        getPlatform.mockImplementation(() => CONST.PLATFORM.WEB);
        jest.spyOn(Onyx, 'multiSet').mockImplementation(() => Promise.resolve());
        localStorage.clear();
    });

    it('Should do nothing for non web/desktop platforms', () => {
        // Given the migration is not running on web or desktop
        getPlatform.mockImplementation(() => CONST.PLATFORM.ANDROID);

        // When the migration runs
        return MoveToIndexedDB()
            .then(() => {
                // Then we don't expect any storage calls
                expect(Onyx.multiSet).not.toHaveBeenCalled();
            });
    });

    it('Should do nothing when there is no old session data', () => {
        // Given no session in old storage medium (localStorage)
        localStorage.removeItem(ONYXKEYS.SESSION);

        // When the migration runs
        return MoveToIndexedDB()
            .then(() => {
                // Then we don't expect any storage calls
                expect(Onyx.multiSet).not.toHaveBeenCalled();
            });
    });

    it('Should migrate Onyx keys in localStorage to (new) Onyx', () => {
        // Given some old data exists in storage
        const data = {
            [ONYXKEYS.SESSION]: {authToken: 'mock-token', loading: false},
            [ONYXKEYS.ACCOUNT]: {email: 'test@mock.com'},
            [ONYXKEYS.NETWORK]: {isOffline: true},
        };

        _.forEach(data, (value, key) => localStorage.setItem(key, JSON.stringify(value)));

        // When the migration runs
        return MoveToIndexedDB()
            .then(() => {
                // Then multiset should be called with all the data available in localStorage
                expect(Onyx.multiSet).toHaveBeenCalledWith(data);
            });
    });

    it('Should not clear non Onyx keys from localStorage', () => {
        // Given some Onyx and non-Onyx data exists in localStorage
        localStorage.setItem(ONYXKEYS.SESSION, JSON.stringify({authToken: 'mock-token'}));
        localStorage.setItem('non-onyx-item', 'MOCK');

        // When the migration runs
        return MoveToIndexedDB()
            .then(() => {
                // Then non-Onyx data should remain in localStorage
                expect(localStorage.getItem('non-onyx-item')).toEqual('MOCK');
            });
    });
});
