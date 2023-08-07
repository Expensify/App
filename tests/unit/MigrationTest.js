import Onyx from 'react-native-onyx';
import _ from 'underscore';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import CONST from '../../src/CONST';
import Log from '../../src/libs/Log';
import getPlatform from '../../src/libs/getPlatform';
import AddLastVisibleActionCreated from '../../src/libs/migrations/AddLastVisibleActionCreated';
import MoveToIndexedDB from '../../src/libs/migrations/MoveToIndexedDB';
import KeyReportActionsByReportActionID from '../../src/libs/migrations/KeyReportActionsByReportActionID';
import PersonalDetailsByAccountID from '../../src/libs/migrations/PersonalDetailsByAccountID';
import CheckForPreviousReportActionID from '../../src/libs/migrations/CheckForPreviousReportActionID';
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
            return MoveToIndexedDB().then(() => {
                // Then we don't expect any storage calls
                expect(Onyx.multiSet).not.toHaveBeenCalled();
            });
        });

        it('Should do nothing when there is no old session data', () => {
            // Given no session in old storage medium (localStorage)
            localStorage.removeItem(ONYXKEYS.SESSION);

            // When the migration runs
            return MoveToIndexedDB().then(() => {
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
            return MoveToIndexedDB().then(() => {
                // Then multiset should be called with all the data available in localStorage
                expect(Onyx.multiSet).toHaveBeenCalledWith(data);
            });
        });

        it('Should not clear non Onyx keys from localStorage', () => {
            // Given some Onyx and non-Onyx data exists in localStorage
            localStorage.setItem(ONYXKEYS.SESSION, JSON.stringify({authToken: 'mock-token'}));
            localStorage.setItem('non-onyx-item', 'MOCK');

            // When the migration runs
            return MoveToIndexedDB().then(() => {
                // Then non-Onyx data should remain in localStorage
                expect(localStorage.getItem('non-onyx-item')).toEqual('MOCK');
            });
        });
    });

    describe('AddLastVisibleActionCreated', () => {
        it('Should add lastVisibleActionCreated wherever lastActionCreated currently is', () =>
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
                }));

        it('Should skip if the report data already has the correct fields', () =>
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
                }));

        it('Should work even if there is no report data', () =>
            AddLastVisibleActionCreated().then(() => {
                expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] Skipped migration AddLastVisibleActionCreated');
                const connectionID = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (allReports) => {
                        Onyx.disconnect(connectionID);
                        expect(_.compact(_.values(allReports))).toEqual([]);
                    },
                });
            }));
    });

    describe('KeyReportActionsByReportActionID', () => {
        // Warning: this test has to come before the others in this suite because Onyx.clear leaves traces and keys with null values aren't cleared out between tests
        it("Should work even if there's no reportAction data in Onyx", () =>
            KeyReportActionsByReportActionID().then(() =>
                expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] Skipped migration KeyReportActionsByReportActionID because there were no reportActions'),
            ));

        it("Should work even if there's zombie reportAction data in Onyx", () =>
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
                            _.each(allReportActions, (reportActionsForReport) => expect(reportActionsForReport).toBeNull());
                        },
                    });
                }));

        it('Should migrate reportActions to be keyed by reportActionID instead of sequenceNumber', () =>
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
                }));

        it('Should return early if the migration has already happened', () =>
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
                }));
    });

    describe('PersonalDetailsByAccountID', () => {
        const DEPRECATED_ONYX_KEYS = {
            // Deprecated personal details object which was keyed by login instead of accountID.
            PERSONAL_DETAILS: 'personalDetails',
        };

        it('Should skip any zombie reportAction collections that have no reportAction data in Onyx', () =>
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: null,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: null,
            })
                .then(PersonalDetailsByAccountID)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith(
                        `[Migrate Onyx] Skipped migration PersonalDetailsByAccountID for ${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1 because there were no reportActions`,
                    );
                    expect(LogSpy).toHaveBeenCalledWith(
                        `[Migrate Onyx] Skipped migration PersonalDetailsByAccountID for ${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2 because there were no reportActions`,
                    );
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);
                            _.each(allReportActions, (reportActionsForReport) => expect(reportActionsForReport).toBeNull());
                        },
                    });
                }));

        it('Should remove any individual reportActions that have no data in Onyx', () =>
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: {
                    1: null,
                    2: null,
                },
            })
                .then(PersonalDetailsByAccountID)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction 1 because the reportAction was empty');
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction 2 because the reportAction was empty');
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);
                            _.each(allReportActions, (reportActionsForReport) => expect(reportActionsForReport).toMatchObject({}));
                        },
                    });
                }));

        it('Should remove any individual reportActions that have originalMessage.oldLogin but not originalMessage.oldAccountID', () =>
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: {
                    1: {
                        originalMessage: {
                            oldLogin: 'test1@account.com',
                            oldAccountID: 100,
                        },
                    },
                    2: {
                        originalMessage: {
                            oldLogin: 'test1@account.com',
                        },
                    },
                },
            })
                .then(PersonalDetailsByAccountID)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction 2 because originalMessage.oldAccountID not found');
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).toHaveProperty('1');
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).not.toHaveProperty('2');
                        },
                    });
                }));

        it('Should remove any individual reportActions that have originalMessage.newLogin but not originalMessage.newAccountID', () =>
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: {
                    1: {
                        originalMessage: {
                            newLogin: 'test2@account.com',
                            newAccountID: 101,
                        },
                    },
                    2: {
                        originalMessage: {
                            newLogin: 'test2@account.com',
                        },
                    },
                },
            })
                .then(PersonalDetailsByAccountID)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction 2 because originalMessage.newAccountID not found');
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).toHaveProperty('1');
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).not.toHaveProperty('2');
                        },
                    });
                }));

        it('Should remove any individual reportActions that have accountEmail but not accountID', () =>
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: {
                    1: {
                        accountEmail: 'test2@account.com',
                        accountID: 101,
                    },
                    2: {
                        accountEmail: 'test2@account.com',
                    },
                },
            })
                .then(PersonalDetailsByAccountID)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction 2 because accountID not found');
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).toHaveProperty('1');
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).not.toHaveProperty('2');
                        },
                    });
                }));

        it('Should remove any individual reportActions that have actorEmail but not actorAccountID', () =>
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: {
                    1: {
                        actorEmail: 'test2@account.com',
                        actorAccountID: 101,
                    },
                    2: {
                        actorEmail: 'test2@account.com',
                    },
                },
            })
                .then(PersonalDetailsByAccountID)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction 2 because actorAccountID not found');
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).toHaveProperty('1');
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).not.toHaveProperty('2');
                        },
                    });
                }));

        it('Should remove any individual reportActions that have childManagerEmail but not childManagerAccountID', () =>
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: {
                    1: {
                        childManagerEmail: 'test2@account.com',
                        childManagerAccountID: 101,
                    },
                    2: {
                        childManagerEmail: 'test2@account.com',
                    },
                },
            })
                .then(PersonalDetailsByAccountID)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction 2 because childManagerAccountID not found');
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).toHaveProperty('1');
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).not.toHaveProperty('2');
                        },
                    });
                }));

        it('Should remove any individual reportActions that have whisperedTo but not whisperedToAccountIDs', () =>
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: {
                    1: {
                        whisperedTo: ['test1@account.com', 'test2@account.com'],
                        whisperedToAccountIDs: [100, 101],
                    },
                    2: {
                        whisperedTo: ['test1@account.com', 'test2@account.com'],
                    },
                },
            })
                .then(PersonalDetailsByAccountID)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction 2 because whisperedToAccountIDs not found');
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).toHaveProperty('1');
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).not.toHaveProperty('2');
                        },
                    });
                }));

        it('Should remove any individual reportActions that have childOldestFourEmails but not childOldestFourAccountIDs', () =>
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: {
                    1: {
                        childOldestFourEmails: 'test1@account.com, test2@account.com',
                        childOldestFourAccountIDs: '100,101',
                    },
                    2: {
                        childOldestFourEmails: 'test1@account.com, test2@account.com',
                    },
                },
            })
                .then(PersonalDetailsByAccountID)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction 2 because childOldestFourAccountIDs not found');
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).toHaveProperty('1');
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).not.toHaveProperty('2');
                        },
                    });
                }));

        it('Should remove any individual reportActions that have originalMessage.participants but not originalMessage.participantAccountIDs', () =>
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: {
                    1: {
                        originalMessage: {
                            participants: ['test1@account.com', 'test2@account.com'],
                            participantAccountIDs: [100, 101],
                        },
                    },
                    2: {
                        originalMessage: {
                            participants: ['test1@account.com', 'test2@account.com'],
                        },
                    },
                },
            })
                .then(PersonalDetailsByAccountID)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith(
                        '[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction 2 because originalMessage.participantAccountIDs not found',
                    );
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).toHaveProperty('1');
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).not.toHaveProperty('2');
                        },
                    });
                }));

        it('Should succeed in removing all email data when equivalent accountID data exists', () =>
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: {
                    1: {
                        originalMessage: {
                            oldLogin: 'test1@account.com',
                            oldAccountID: 100,
                            newLogin: 'test2@account.com',
                            newAccountID: 101,
                            participants: ['test1@account.com', 'test2@account.com'],
                            participantAccountIDs: [100, 101],
                        },
                        actorEmail: 'test2@account.com',
                        actorAccountID: 101,
                        accountEmail: 'test2@account.com',
                        accountID: 101,
                        childManagerEmail: 'test2@account.com',
                        childManagerAccountID: 101,
                        whisperedTo: ['test1@account.com', 'test2@account.com'],
                        whisperedToAccountIDs: [100, 101],
                        childOldestFourEmails: 'test1@account.com, test2@account.com',
                        childOldestFourAccountIDs: '100,101',
                    },
                },
            })
                .then(PersonalDetailsByAccountID)
                .then(() => {
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);
                            const expectedReportAction = {
                                originalMessage: {
                                    oldAccountID: 100,
                                    newAccountID: 101,
                                    participantAccountIDs: [100, 101],
                                },
                                actorAccountID: 101,
                                accountID: 101,
                                childManagerAccountID: 101,
                                whisperedToAccountIDs: [100, 101],
                                childOldestFourAccountIDs: '100,101',
                            };
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`][1]).toMatchObject(expectedReportAction);
                        },
                    });
                }));

        it('Should succeed in removing any policyMemberList objects it finds in Onyx', () =>
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.DEPRECATED_POLICY_MEMBER_LIST}1`]: {
                    'admin@company1.com': {
                        role: 'admin',
                    },
                    'employee@company1.com': {
                        role: 'user',
                    },
                },
                [`${ONYXKEYS.COLLECTION.DEPRECATED_POLICY_MEMBER_LIST}2`]: {
                    'admin@company2.com': {
                        role: 'admin',
                    },
                    'employee@company2.com': {
                        role: 'user',
                    },
                },
            })
                .then(PersonalDetailsByAccountID)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith(
                        `[Migrate Onyx] PersonalDetailsByAccountID migration: removing policyMemberList ${ONYXKEYS.COLLECTION.DEPRECATED_POLICY_MEMBER_LIST}1`,
                    );
                    expect(LogSpy).toHaveBeenCalledWith(
                        `[Migrate Onyx] PersonalDetailsByAccountID migration: removing policyMemberList ${ONYXKEYS.COLLECTION.DEPRECATED_POLICY_MEMBER_LIST}2`,
                    );
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.DEPRECATED_POLICY_MEMBER_LIST,
                        waitForCollectionCallback: true,
                        callback: (allPolicyMemberLists) => {
                            Onyx.disconnect(connectionID);
                            expect(allPolicyMemberLists[`${ONYXKEYS.COLLECTION.DEPRECATED_POLICY_MEMBER_LIST}1`]).toBeNull();
                            expect(allPolicyMemberLists[`${ONYXKEYS.COLLECTION.DEPRECATED_POLICY_MEMBER_LIST}2`]).toBeNull();
                        },
                    });
                }));

        it('Should succeed in removing the personalDetails object if found in Onyx', () =>
            Onyx.multiSet({
                [`${DEPRECATED_ONYX_KEYS.PERSONAL_DETAILS}`]: {
                    'test1@account.com': {
                        accountID: 100,
                        login: 'test1@account.com',
                    },
                    'test2@account.com': {
                        accountID: 101,
                        login: 'test2@account.com',
                    },
                },
            })
                .then(PersonalDetailsByAccountID)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] PersonalDetailsByAccountID migration: removing personalDetails');
                    const connectionID = Onyx.connect({
                        key: DEPRECATED_ONYX_KEYS.PERSONAL_DETAILS,
                        callback: (allPersonalDetails) => {
                            Onyx.disconnect(connectionID);
                            expect(allPersonalDetails).toBeNull();
                        },
                    });
                }));
    });

    describe('CheckForPreviousReportActionID', () => {
        it("Should work even if there's no reportAction data in Onyx", () =>
            CheckForPreviousReportActionID().then(() =>
                expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] Skipped migration CheckForPreviousReportActionID because there were no reportActions'),
            ));

        it('Should remove all report actions given that a previousReportActionID does not exist', () =>
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: {
                    1: {
                        reportActionID: 1,
                    },
                    2: {
                        reportActionID: 2,
                    },
                },
            })
                .then(CheckForPreviousReportActionID)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith(
                        '[Migrate Onyx] CheckForPreviousReportActionID Migration: removing all reportActions because previousReportActionID not found in the first valid reportAction',
                    );
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);
                            const expectedReportAction = {};
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).toMatchObject(expectedReportAction);
                        },
                    });
                }));

        it('Should not remove any report action given that previousReportActionID exists in first valid report action', () =>
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: {
                    1: {
                        reportActionID: 1,
                        previousReportActionID: 0,
                    },
                    2: {
                        reportActionID: 2,
                        previousReportActionID: 1,
                    },
                },
            })
                .then(CheckForPreviousReportActionID)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] CheckForPreviousReportActionID Migration: previousReportActionID found. Migration complete');
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);
                            const expectedReportAction = {
                                1: {
                                    reportActionID: 1,
                                    previousReportActionID: 0,
                                },
                                2: {
                                    reportActionID: 2,
                                    previousReportActionID: 1,
                                },
                            };
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).toMatchObject(expectedReportAction);
                        },
                    });
                }));

        it('Should skip zombie report actions and proceed to remove all reportActions given that a previousReportActionID does not exist', () =>
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: null,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}3`]: null,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}4`]: {
                    1: {
                        reportActionID: 1,
                    },
                    2: {
                        reportActionID: 2,
                    },
                },
            })
                .then(CheckForPreviousReportActionID)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith(
                        '[Migrate Onyx] CheckForPreviousReportActionID Migration: removing all reportActions because previousReportActionID not found in the first valid reportAction',
                    );
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);
                            const expectedReportAction = {};
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).toMatchObject(expectedReportAction);
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]).toMatchObject(expectedReportAction);
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}3`]).toMatchObject(expectedReportAction);
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}4`]).toMatchObject(expectedReportAction);
                        },
                    });
                }));

        it('Should skip zombie report actions and should not remove any report action given that previousReportActionID exists in first valid report action', () =>
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: null,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}3`]: null,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}4`]: {
                    1: {
                        reportActionID: 1,
                        previousReportActionID: 10,
                    },
                    2: {
                        reportActionID: 2,
                        previousReportActionID: 23,
                    },
                },
            })
                .then(CheckForPreviousReportActionID)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] CheckForPreviousReportActionID Migration: previousReportActionID found. Migration complete');
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);
                            const expectedReportAction1 = {};
                            const expectedReportAction4 = {
                                1: {
                                    reportActionID: 1,
                                    previousReportActionID: 10,
                                },
                                2: {
                                    reportActionID: 2,
                                    previousReportActionID: 23,
                                },
                            };
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).toMatchObject(expectedReportAction1);
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]).toBeNull();
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}3`]).toBeNull();
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}4`]).toMatchObject(expectedReportAction4);
                        },
                    });
                }));

        it('Should skip if no valid reportActions', () =>
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: null,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}3`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}4`]: null,
            })
                .then(CheckForPreviousReportActionID)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] Skipped migration CheckForPreviousReportActionID because there were no valid reportActions');
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);
                            const expectedReportAction = {};
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).toBeNull();
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]).toMatchObject(expectedReportAction);
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}3`]).toMatchObject(expectedReportAction);
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}4`]).toBeNull();
                        },
                    });
                }));
    });
});
