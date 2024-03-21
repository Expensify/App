/* eslint-disable @typescript-eslint/naming-convention */
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import Log from '@src/libs/Log';
import CheckForPreviousReportActionID from '@src/libs/migrations/CheckForPreviousReportActionID';
import KeyReportActionsDraftByReportActionID from '@src/libs/migrations/KeyReportActionsDraftByReportActionID';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActionsDraftCollectionDataSet} from '@src/types/onyx/ReportActionsDrafts';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
import type CollectionDataSet from '@src/types/utils/CollectionDataSet';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@src/libs/getPlatform');

let LogSpy: jest.SpyInstance<void, Parameters<(typeof Log)['info']>>;

describe('Migrations', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        LogSpy = jest.spyOn(Log, 'info');
        Log.serverLoggingCallback = () => Promise.resolve({requestID: '123'});
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

        it('Should remove all report actions given that a previousReportActionID does not exist', () => {
            const reportActionsCollectionDataSet = toCollectionDataSet(
                ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                [
                    {
                        1: {
                            reportActionID: '1',
                            created: '',
                            actionName: CONST.REPORT.ACTIONS.TYPE.MARKEDREIMBURSED,
                            reportID: '1',
                        },
                        2: {reportActionID: '2', created: '', actionName: CONST.REPORT.ACTIONS.TYPE.MARKEDREIMBURSED, reportID: '1'},
                    },
                ],
                (item) => item[1].reportID ?? '',
            );

            return Onyx.multiSet(reportActionsCollectionDataSet)
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
                            expect(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).toMatchObject(expectedReportAction);
                        },
                    });
                });
        });

        it('Should not remove any report action given that previousReportActionID exists in first valid report action', () => {
            const reportActionsCollectionDataSet = toCollectionDataSet(
                ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                [
                    {
                        1: {
                            reportActionID: '1',
                            previousReportActionID: '0',
                            created: '',
                            actionName: CONST.REPORT.ACTIONS.TYPE.MARKEDREIMBURSED,
                            reportID: '1',
                        },
                        2: {
                            reportActionID: '2',
                            previousReportActionID: '1',
                            created: '',
                            actionName: CONST.REPORT.ACTIONS.TYPE.MARKEDREIMBURSED,
                            reportID: '1',
                        },
                    },
                ],
                (item) => item[1].reportID ?? '',
            );

            return Onyx.multiSet(reportActionsCollectionDataSet)
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
                                    reportActionID: '1',
                                    previousReportActionID: '0',
                                },
                                2: {
                                    reportActionID: '2',
                                    previousReportActionID: '1',
                                },
                            };
                            expect(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).toMatchObject(expectedReportAction);
                        },
                    });
                });
        });

        it('Should skip zombie report actions and proceed to remove all reportActions given that a previousReportActionID does not exist', () => {
            const reportActionsCollectionDataSet = toCollectionDataSet(
                ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                [
                    {
                        1: {
                            reportActionID: '1',
                            created: '',
                            actionName: CONST.REPORT.ACTIONS.TYPE.MARKEDREIMBURSED,
                            reportID: '4',
                        },
                        2: {
                            reportActionID: '2',
                            created: '',
                            actionName: CONST.REPORT.ACTIONS.TYPE.MARKEDREIMBURSED,
                            reportID: '4',
                        },
                    },
                ],
                (item) => item[1].reportID ?? '',
            );

            return Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: null,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}3`]: null,
                ...reportActionsCollectionDataSet,
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
                            expect(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).toMatchObject(expectedReportAction);
                            expect(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]).toBeUndefined();
                            expect(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}3`]).toBeUndefined();
                            expect(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}4`]).toMatchObject(expectedReportAction);
                        },
                    });
                });
        });

        it('Should skip zombie report actions and should not remove any report action given that previousReportActionID exists in first valid report action', () => {
            const reportActionsCollectionDataSet = toCollectionDataSet(
                ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                [
                    {
                        1: {
                            reportActionID: '1',
                            previousReportActionID: '10',
                            created: '',
                            actionName: CONST.REPORT.ACTIONS.TYPE.MARKEDREIMBURSED,
                            reportID: '4',
                        },
                        2: {
                            reportActionID: '2',
                            previousReportActionID: '23',
                            created: '',
                            actionName: CONST.REPORT.ACTIONS.TYPE.MARKEDREIMBURSED,
                            reportID: '4',
                        },
                    },
                ],
                (item) => item[1].reportID ?? '',
            );

            return Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: null,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}3`]: null,
                ...reportActionsCollectionDataSet,
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
                                    reportActionID: '1',
                                    previousReportActionID: '10',
                                },
                                2: {
                                    reportActionID: '2',
                                    previousReportActionID: '23',
                                },
                            };
                            expect(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).toMatchObject(expectedReportAction1);
                            expect(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]).toBeUndefined();
                            expect(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}3`]).toBeUndefined();
                            expect(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}4`]).toMatchObject(expectedReportAction4);
                        },
                    });
                });
        });

        it('Should skip if no valid reportActions', () => {
            const setQueries: CollectionDataSet<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: null,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}3`]: {},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}4`]: null,
            };
            return Onyx.multiSet(setQueries)
                .then(CheckForPreviousReportActionID)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] Skipped migration CheckForPreviousReportActionID because there were no valid reportActions');
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            const expectedReportAction = {};
                            Onyx.disconnect(connectionID);
                            expect(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).toBeUndefined();
                            expect(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]).toMatchObject(expectedReportAction);
                            expect(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}3`]).toMatchObject(expectedReportAction);
                            expect(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}4`]).toBeUndefined();
                        },
                    });
                });
        });
    });

    describe('KeyReportActionsDraftByReportActionID', () => {
        it("Should work even if there's no reportActionsDrafts data in Onyx", () =>
            KeyReportActionsDraftByReportActionID().then(() =>
                expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] Skipped migration KeyReportActionsDraftByReportActionID because there were no reportActionsDrafts'),
            ));

        it('Should move individual draft to a draft collection of report', () => {
            const setQueries: ReportActionsDraftCollectionDataSet = {};

            // @ts-expect-error preset invalid value
            setQueries[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1_1`] = 'a';
            // @ts-expect-error preset invalid value
            setQueries[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1_2`] = 'b';
            setQueries[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}2`] = {3: 'c'};
            // @ts-expect-error preset invalid value
            setQueries[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}2_4`] = 'd';

            return Onyx.multiSet(setQueries)
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
                            expect(allReportActionsDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1_1`]).toBeUndefined();
                            expect(allReportActionsDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1_2`]).toBeUndefined();
                            expect(allReportActionsDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}2_4`]).toBeUndefined();
                            expect(allReportActionsDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1`]).toMatchObject(expectedReportActionDraft1);
                            expect(allReportActionsDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}2`]).toMatchObject(expectedReportActionDraft2);
                        },
                    });
                });
        });

        it('Should skip if nothing to migrate', () => {
            const setQueries: ReportActionsDraftCollectionDataSet = {};

            setQueries[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}2`] = {};

            return Onyx.multiSet(setQueries)
                .then(KeyReportActionsDraftByReportActionID)
                .then(() => {
                    expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] Skipped migration KeyReportActionsDraftByReportActionID because there are no actions drafts to migrate');
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);
                            const expectedReportActionDraft = {};
                            expect(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1_1`]).toBeUndefined();
                            expect(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1_2`]).toBeUndefined();
                            expect(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}2_4`]).toBeUndefined();
                            expect(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}2`]).toMatchObject(expectedReportActionDraft);
                        },
                    });
                });
        });

        it("Shouldn't move empty individual draft to a draft collection of report", () => {
            const setQueries: ReportActionsDraftCollectionDataSet = {};

            // @ts-expect-error preset empty string value
            setQueries[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1_1`] = '';
            setQueries[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1`] = {};

            return Onyx.multiSet(setQueries)
                .then(KeyReportActionsDraftByReportActionID)
                .then(() => {
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS,
                        waitForCollectionCallback: true,
                        callback: (allReportActionsDrafts) => {
                            Onyx.disconnect(connectionID);
                            expect(allReportActionsDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1_1`]).toBeUndefined();
                        },
                    });
                });
        });
    });
});
