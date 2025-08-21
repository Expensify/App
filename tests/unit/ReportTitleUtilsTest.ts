import Onyx from 'react-native-onyx';
import * as ReportTitleUtils from '@libs/ReportTitleUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('ReportTitleUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('updateTitleFieldToMatchPolicy', () => {
        it('should return empty array for invalid inputs', () => {
            const result1 = ReportTitleUtils.updateTitleFieldToMatchPolicy('', undefined);
            expect(result1).toEqual([]);

            const result2 = ReportTitleUtils.updateTitleFieldToMatchPolicy('123', undefined);
            expect(result2).toEqual([]);

            const result3 = ReportTitleUtils.updateTitleFieldToMatchPolicy('', {} as Policy);
            expect(result3).toEqual([]);
        });

        it('should return empty array when policy has no title field', () => {
            const policy: Policy = {
                id: 'policy123',
                fieldList: {
                    text_category: {
                        name: 'Category',
                        type: 'text',
                        fieldID: 'text_category',
                        defaultValue: '',
                        deleteable: true,
                    },
                },
            } as Policy;

            const result = ReportTitleUtils.updateTitleFieldToMatchPolicy('report123', policy);
            expect(result).toEqual([]);
        });

        it('should create title field update when policy has title field', () => {
            const policy: Policy = {
                id: 'policy123',
                fieldList: {
                    [CONST.REPORT_FIELD_TITLE_FIELD_ID]: {
                        name: 'Title',
                        type: 'formula',
                        fieldID: CONST.REPORT_FIELD_TITLE_FIELD_ID,
                        defaultValue: 'Policy: {report:policyname}',
                        deleteable: false,
                    },
                },
            } as Policy;

            const result = ReportTitleUtils.updateTitleFieldToMatchPolicy('report123', policy);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}report123`,
                value: {
                    [CONST.REPORT_FIELD_TITLE_FIELD_ID]: {
                        defaultValue: 'Policy: {report:policyname}',
                        deleteable: false,
                    },
                },
            });
        });
    });

    describe('removeTitleFieldFromReport', () => {
        it('should return empty array for invalid reportID', () => {
            const result = ReportTitleUtils.removeTitleFieldFromReport('');
            expect(result).toEqual([]);
        });

        it('should create title field removal update', () => {
            const result = ReportTitleUtils.removeTitleFieldFromReport('report123');

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}report123`,
                value: {
                    [CONST.REPORT_FIELD_TITLE_FIELD_ID]: null,
                },
            });
        });
    });

    describe('shouldUpdateTitleField', () => {
        it('should return false for invalid inputs', () => {
            const result1 = ReportTitleUtils.shouldUpdateTitleField(undefined as any, undefined);
            expect(result1).toBe(false);

            const result2 = ReportTitleUtils.shouldUpdateTitleField({} as Report, undefined);
            expect(result2).toBe(false);

            const result3 = ReportTitleUtils.shouldUpdateTitleField(undefined as any, {} as Policy);
            expect(result3).toBe(false);
        });

        it('should return false for chat reports', () => {
            const chatReport: Report = {
                reportID: 'report123',
                type: CONST.REPORT.TYPE.CHAT,
            } as Report;

            const policy: Policy = {
                id: 'policy123',
                fieldList: {
                    [CONST.REPORT_FIELD_TITLE_FIELD_ID]: {
                        name: 'Title',
                        type: 'formula',
                        fieldID: CONST.REPORT_FIELD_TITLE_FIELD_ID,
                        defaultValue: 'Policy: {report:policyname}',
                        deleteable: false,
                    },
                },
            } as Policy;

            const result = ReportTitleUtils.shouldUpdateTitleField(chatReport, policy);
            expect(result).toBe(false);
        });

        it('should return false when policy has no title field', () => {
            const expenseReport: Report = {
                reportID: 'report123',
                type: CONST.REPORT.TYPE.EXPENSE,
            } as Report;

            const policy: Policy = {
                id: 'policy123',
                fieldList: {},
            } as Policy;

            const result = ReportTitleUtils.shouldUpdateTitleField(expenseReport, policy);
            expect(result).toBe(false);
        });

        it('should return true for expense report with policy title field', () => {
            const expenseReport: Report = {
                reportID: 'report123',
                type: CONST.REPORT.TYPE.EXPENSE,
            } as Report;

            const policy: Policy = {
                id: 'policy123',
                fieldList: {
                    [CONST.REPORT_FIELD_TITLE_FIELD_ID]: {
                        name: 'Title',
                        type: 'formula',
                        fieldID: CONST.REPORT_FIELD_TITLE_FIELD_ID,
                        defaultValue: 'Policy: {report:policyname}',
                        deleteable: false,
                    },
                },
            } as Policy;

            const result = ReportTitleUtils.shouldUpdateTitleField(expenseReport, policy);
            expect(result).toBe(true);
        });

        it('should return true for invoice report with policy title field', () => {
            const invoiceReport: Report = {
                reportID: 'report123',
                type: CONST.REPORT.TYPE.INVOICE,
            } as Report;

            const policy: Policy = {
                id: 'policy123',
                fieldList: {
                    [CONST.REPORT_FIELD_TITLE_FIELD_ID]: {
                        name: 'Title',
                        type: 'formula',
                        fieldID: CONST.REPORT_FIELD_TITLE_FIELD_ID,
                        defaultValue: 'Policy: {report:policyname}',
                        deleteable: false,
                    },
                },
            } as Policy;

            const result = ReportTitleUtils.shouldUpdateTitleField(invoiceReport, policy);
            expect(result).toBe(true);
        });
    });
});