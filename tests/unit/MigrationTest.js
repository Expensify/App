import Onyx from 'react-native-onyx';
import Log from '../../src/libs/Log';
import CheckForPreviousReportActionID from '../../src/libs/migrations/CheckForPreviousReportActionID';
import KeyReportActionsDraftByReportActionID from '../../src/libs/migrations/KeyReportActionsDraftByReportActionID';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('../../src/libs/getPlatform');

let LogSpy;

describe('Migrations', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        LogSpy = jest.spyOn(Log, 'info');
        Log.serverLoggingCallback = () => {};
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        Onyx.clear();
        return waitForBatchedUpdates();
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
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]).toBeUndefined();
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}3`]).toBeUndefined();
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
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]).toBeUndefined();
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}3`]).toBeUndefined();
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
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).toBeUndefined();
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]).toMatchObject(expectedReportAction);
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}3`]).toMatchObject(expectedReportAction);
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}4`]).toBeUndefined();
                        },
                    });
                }));
    });

    describe('KeyReportActionsDraftByReportActionID', () => {
        it("Should work even if there's no reportActionsDrafts data in Onyx", () =>
            KeyReportActionsDraftByReportActionID().then(() =>
                expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] Skipped migration KeyReportActionsDraftByReportActionID because there were no reportActionsDrafts'),
            ));

        it('Should move individual draft to a draft collection of report', () =>
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1_1`]: 'a',
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1_2`]: 'b',
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}2`]: {3: 'c'},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}2_4`]: 'd',
            })
                .then(KeyReportActionsDraftByReportActionID)
                .then(() => {
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS,
                        waitForCollectionCallback: true,
                        callback: (allReportActionsDrafts) => {
                            Onyx.disconnect(connectionID);
                            const expectedReportActionDraft1 = {
                                1: 'a',
                                2: 'b',
                            };
                            const expectedReportActionDraft2 = {
                                3: 'c',
                                4: 'd',
                            };
                            expect(allReportActionsDrafts[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1_1`]).toBeUndefined();
                            expect(allReportActionsDrafts[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1_2`]).toBeUndefined();
                            expect(allReportActionsDrafts[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}2_4`]).toBeUndefined();
                            expect(allReportActionsDrafts[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1`]).toMatchObject(expectedReportActionDraft1);
                            expect(allReportActionsDrafts[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}2`]).toMatchObject(expectedReportActionDraft2);
                        },
                    });
                }));

        it('Should skip if nothing to migrate', () =>
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1_1`]: null,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1_2`]: null,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}2`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}2_4`]: null,
            })
                .then(KeyReportActionsDraftByReportActionID)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] Skipped migration KeyReportActionsDraftByReportActionID because there are no actions drafts to migrate');
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);
                            const expectedReportActionDraft = {};
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1_1`]).toBeUndefined();
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1_2`]).toBeUndefined();
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}2_4`]).toBeUndefined();
                            expect(allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}2`]).toMatchObject(expectedReportActionDraft);
                        },
                    });
                }));

        it("Shouldn't move empty individual draft to a draft collection of report", () =>
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1_1`]: '',
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1`]: {},
            })
                .then(KeyReportActionsDraftByReportActionID)
                .then(() => {
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS,
                        waitForCollectionCallback: true,
                        callback: (allReportActionsDrafts) => {
                            Onyx.disconnect(connectionID);
                            expect(allReportActionsDrafts[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1_1`]).toBeUndefined();
                        },
                    });
                }));
    });
});
