import Onyx from 'react-native-onyx';
import _ from 'underscore';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import CONST from '../../src/CONST';
import Log from '../../src/libs/Log';
import getPlatform from '../../src/libs/getPlatform';
import AddLastVisibleActionCreated from '../../src/libs/migrations/AddLastVisibleActionCreated';
import MoveToIndexedDB from '../../src/libs/migrations/MoveToIndexedDB';
import KeyReportActionsByReportActionID from '../../src/libs/migrations/KeyReportActionsByReportActionID';
import ONYXKEYS from '../../src/ONYXKEYS';

jest.mock('../../src/libs/getPlatform');

let LogSpy;

describe('Migrations', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        LogSpy = jest.spyOn(Log, 'info');
        Log.serverLoggingCallback = () => {};
        return waitForPromisesToResolve();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        Onyx.clear();
        return waitForPromisesToResolve();
    });

    describe('MoveToIndexedDb', () => {
        let mockMultiSet;
        beforeEach(() => {
            getPlatform.mockImplementation(() => CONST.PLATFORM.WEB);
            mockMultiSet = jest.spyOn(Onyx, 'multiSet').mockImplementation(() => Promise.resolve());
            localStorage.clear();
        });

        afterAll(() => {
            mockMultiSet.mockRestore(Onyx, 'multiSet');
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

    describe('AddLastVisibleActionCreated', () => {
        it('Should add lastVisibleActionCreated wherever lastActionCreated currently is', () => (
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: {
                    lastActionCreated: '2022-11-16 01:31:13.702',
                },
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: {
                    lastActionCreated: '2022-11-16 01:31:54.821',
                },
            })
                .then(AddLastVisibleActionCreated)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] Adding lastVisibleActionCreated field to 2 reports');
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT,
                        waitForCollectionCallback: true,
                        callback: (allReports) => {
                            Onyx.disconnect(connectionID);
                            expect(_.keys(allReports).length).toBe(2);
                            _.each(allReports, (report) => {
                                expect(_.has(report, 'lastVisibleActionCreated')).toBe(true);
                            });
                            expect(allReports.report_1.lastVisibleActionCreated).toBe('2022-11-16 01:31:13.702');
                            expect(allReports.report_2.lastVisibleActionCreated).toBe('2022-11-16 01:31:54.821');
                        },
                    });
                })
        ));

        it('Should skip if the report data already has the correct fields', () => (
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: {
                    lastVisibleActionCreated: '2022-11-16 01:31:13.702',
                },
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: {
                    lastVisibleActionCreated: '2022-11-16 01:31:54.821',
                },
            })
                .then(AddLastVisibleActionCreated)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] Skipped migration AddLastVisibleActionCreated');
                })
        ));

        it('Should work even if there is no report data', () => (
            AddLastVisibleActionCreated()
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] Skipped migration AddLastVisibleActionCreated');
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT,
                        waitForCollectionCallback: true,
                        callback: (allReports) => {
                            Onyx.disconnect(connectionID);
                            expect(_.compact(_.values(allReports))).toEqual([]);
                        },
                    });
                })
        ));
    });

    describe('KeyReportActionsByReportActionID', () => {
        // Warning: this test has to come before the others in this suite because Onyx.clear leaves traces and keys with null values aren't cleared out between tests
        it("Should work even if there's no reportAction data in Onyx", () => (
            KeyReportActionsByReportActionID()
                .then(() => expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] Skipped migration KeyReportActionsByReportActionID because there were no reportActions'))
        ));

        it("Should work even if there's zombie reportAction data in Onyx", () => (
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: null,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: null,
            })
                .then(KeyReportActionsByReportActionID)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] Skipped migration KeyReportActionsByReportActionID because there are no actions to migrate');
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);
                            _.each(allReportActions, reportActionsForReport => expect(reportActionsForReport).toBeNull());
                        },
                    });
                })
        ));

        it('Should migrate reportActions to be keyed by reportActionID instead of sequenceNumber', () => (
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: {
                    1: {
                        reportActionID: '1000',
                        sequenceNumber: 1,
                    },
                    2: {
                        reportActionID: '2000',
                        sequenceNumber: 2,
                    },
                },
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: {
                    1: {
                        reportActionID: '3000',
                        sequenceNumber: 1,
                    },
                    2: {
                        reportActionID: '4000',
                        sequenceNumber: 2,
                    },
                },
            })
                .then(KeyReportActionsByReportActionID)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] Re-keying reportActions by reportActionID for 2 reports');
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);
                            expect(_.keys(allReportActions).length).toBe(2);
                            _.each(allReportActions, (reportActionsForReport) => {
                                _.each(reportActionsForReport, (reportAction, key) => {
                                    expect(key).toBe(reportAction.reportActionID);
                                });
                            });
                        },
                    });
                })
        ));

        it('Should return early if the migration has already happened', () => (
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: {
                    1000: {
                        reportActionID: '1000',
                        sequenceNumber: 1,
                    },
                    2000: {
                        reportActionID: '2000',
                        sequenceNumber: 2,
                    },
                },
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: {
                    3000: {
                        reportActionID: '3000',
                    },
                    4000: {
                        reportActionID: '4000',
                    },
                },
            })
                .then(KeyReportActionsByReportActionID)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] Skipped migration KeyReportActionsByReportActionID because we already migrated it');
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);
                            expect(_.keys(allReportActions).length).toBe(2);
                            _.each(allReportActions, (reportActionsForReport) => {
                                _.each(reportActionsForReport, (reportAction, key) => {
                                    expect(key).toBe(reportAction.reportActionID);
                                });
                            });
                        },
                    });
                })
        ));
    });
});
