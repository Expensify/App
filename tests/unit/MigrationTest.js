import Onyx from 'react-native-onyx';
import _ from 'underscore';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import CONST from '../../src/CONST';
import Log from '../../src/libs/Log';
import getPlatform from '../../src/libs/getPlatform';
import AddLastActionCreated from '../../src/libs/migrations/AddLastActionCreated';
import MoveToIndexedDB from '../../src/libs/migrations/MoveToIndexedDB';
import ONYXKEYS from '../../src/ONYXKEYS';

jest.mock('../../src/libs/getPlatform');

// Using fake timers is causing problems with promises getting timed out
// This seems related: https://github.com/facebook/jest/issues/11876
jest.useRealTimers();

let LogSpy;

describe('Migrations', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        LogSpy = jest.spyOn(Log, 'info');
        return waitForPromisesToResolve();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        Onyx.clear();
        return waitForPromisesToResolve();
    });

    describe('MoveToIndexedDb', () => {
        beforeEach(() => {
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

    describe('AddLastActionCreated', () => {
        it('Should add lastActionCreated wherever lastMessageTimestamp currently is', () => {
            Onyx.set(ONYXKEYS.COLLECTION.REPORT, {
                report_1: {
                    lastMessageTimestamp: 1668562273702,
                },
                report_2: {
                    lastMessageTimestamp: 1668562314821,
                },
            })
                .then(AddLastActionCreated)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] Adding lastActionCreated field to 2 reports');
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT,
                        waitForCollectionCallbacks: true,
                        callback: (allReports) => {
                            Onyx.disconnect(connectionID);
                            expect(_.keys(allReports).length).toBe(2);
                            _.each(allReports, (report) => {
                                expect(_.has(report, 'lastActionCreated')).toBe(true);
                            });
                            expect(allReports.report_1.lastActionCreated).toBe('2022-11-16 01:31:13.702');
                            expect(allReports.report_2.lastActionCreated).toBe('2022-11-16 01:31:54.821');
                        },
                    });
                });
        });

        it('Should skip if the report data already has the correct fields', () => {
            Onyx.set(ONYXKEYS.COLLECTION.REPORT, {
                report_1: {
                    lastActionCreated: '2022-11-16 01:31:13.702',
                },
                report_2: {
                    lastActionCreated: '2022-11-16 01:31:54.821',
                },
            })
                .then(AddLastActionCreated)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] Skipped migration AddLastActionCreated');
                });
        });

        it('Should work even if there is no report data', () => {
            AddLastActionCreated()
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] Skipped migration AddLastActionCreated');
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT,
                        waitForCollectionCallbacks: true,
                        callback: (allReports) => {
                            Onyx.disconnect(connectionID);
                            expect(allReports).toBeEmpty();
                        },
                    });
                });
        });
    });
});
