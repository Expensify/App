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
    });

    it('Should do nothing for non web/desktop platforms', () => {
        // Given the migration is not running on web or desktop
        getPlatform.mockImplementation(() => CONST.PLATFORM.ANDROID);
        const multiSetSpy = jest.spyOn(Onyx, 'multiSet').mockRejectedValue(new Error('Unexpected Onyx call'));

        // When the migration runs
        return MoveToIndexedDB()
            .then(() => {
                // Then we don't expect any storage calls
                expect(multiSetSpy).not.toHaveBeenCalled();
            });
    });

    it('Should do nothing when there is no old session data', () => {
        // Given no session in old storage medium (localStorage)
        const multiSetSpy = jest.spyOn(Onyx, 'multiSet').mockRejectedValue(new Error('Unexpected Onyx call'));

        // When the migration runs
        return MoveToIndexedDB()
            .then(() => {
                // Then we don't expect any storage calls
                expect(multiSetSpy).not.toHaveBeenCalled();
            });
    });

    it('Should migrate all keys in localStorage to Onyx', () => {
        // Given some old data exists in storage
        const data = {
            [ONYXKEYS.SESSION]: {authToken: 'mock-token', loading: false},
            [ONYXKEYS.ACCOUNT]: {email: 'test@mock.com'},
            [ONYXKEYS.NETWORK]: {isOffline: true},
        };

        _.forEach(data, (value, key) => localStorage.setItem(key, JSON.stringify(value)));

        const multiSetSpy = jest.spyOn(Onyx, 'multiSet').mockImplementation(() => Promise.resolve());

        // When the migration runs
        return MoveToIndexedDB()
            .then(() => {
                // Then multiset should be called with all the data available in localStorage
                expect(multiSetSpy).toHaveBeenCalledWith(data);
            });
    });
});
