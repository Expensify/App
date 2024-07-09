/* eslint-disable @typescript-eslint/naming-convention */
import Onyx from 'react-native-onyx';
import type {OnyxInputValue} from 'react-native-onyx';
import Log from '@src/libs/Log';
import KeyReportActionsDraftByReportActionID from '@src/libs/migrations/KeyReportActionsDraftByReportActionID';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {ReportActionsDraftCollectionDataSet} from '@src/types/onyx/ReportActionsDrafts';
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

    describe('KeyReportActionsDraftByReportActionID', () => {
        it("Should work even if there's no reportActionsDrafts data in Onyx", () =>
            KeyReportActionsDraftByReportActionID().then(() =>
                expect(LogSpy).toHaveBeenCalledWith('[Migrate Onyx] Skipped migration KeyReportActionsDraftByReportActionID because there were no reportActionsDrafts'),
            ));

        it('Should move individual draft to a draft collection of report', () => {
            const setQueries: ReportActionsDraftCollectionDataSet = {};

            setQueries[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1_1`] = 'a' as unknown as OnyxInputValue<OnyxTypes.ReportActionsDrafts>;
            setQueries[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1_2`] = 'b' as unknown as OnyxInputValue<OnyxTypes.ReportActionsDrafts>;
            setQueries[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}2`] = {3: 'c'};
            setQueries[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}2_4`] = 'd' as unknown as OnyxInputValue<OnyxTypes.ReportActionsDrafts>;

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

            setQueries[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}1_1`] = '' as unknown as OnyxInputValue<OnyxTypes.ReportActionsDrafts>;
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
