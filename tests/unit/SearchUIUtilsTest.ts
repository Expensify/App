import {getSearchColumnTranslationKey} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';

describe('SearchUIUtils', () => {
    describe('getSearchColumnTranslationKey', () => {
        it('should return correct translation key for DATE column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.DATE)).toBe('common.date');
        });

        it('should return correct translation key for SUBMITTED column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.SUBMITTED)).toBe('common.submitted');
        });

        it('should return correct translation key for APPROVED column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.APPROVED)).toBe('search.filters.approved');
        });

        it('should return correct translation key for POSTED column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.POSTED)).toBe('search.filters.posted');
        });

        it('should return correct translation key for EXPORTED column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.EXPORTED)).toBe('search.filters.exported');
        });

        it('should return correct translation key for MERCHANT column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.MERCHANT)).toBe('common.merchant');
        });

        it('should return correct translation key for DESCRIPTION column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION)).toBe('common.description');
        });

        it('should return correct translation key for FROM column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.FROM)).toBe('common.from');
        });

        it('should return correct translation key for TO column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.TO)).toBe('common.to');
        });

        it('should return correct translation key for CATEGORY column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.CATEGORY)).toBe('common.category');
        });

        it('should return correct translation key for RECEIPT column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.RECEIPT)).toBe('common.receipt');
        });

        it('should return correct translation key for TAG column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.TAG)).toBe('common.tag');
        });

        it('should return correct translation key for ORIGINAL_AMOUNT column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT)).toBe('common.originalAmount');
        });

        it('should return correct translation key for REIMBURSABLE column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE)).toBe('common.reimbursable');
        });

        it('should return correct translation key for BILLABLE column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.BILLABLE)).toBe('common.billable');
        });

        it('should return correct translation key for ACTION column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.ACTION)).toBe('common.action');
        });

        it('should return correct translation key for TITLE column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.TITLE)).toBe('common.title');
        });

        it('should return correct translation key for STATUS column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.STATUS)).toBe('common.status');
        });

        it('should return correct translation key for EXCHANGE_RATE column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE)).toBe('common.exchangeRate');
        });

        it('should return correct translation key for POLICY_NAME column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME)).toBe('workspace.common.workspace');
        });

        it('should return correct translation key for CARD column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.CARD)).toBe('common.card');
        });

        it('should return correct translation key for REIMBURSABLE_TOTAL column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE_TOTAL)).toBe('common.reimbursableTotal');
        });

        it('should return correct translation key for NON_REIMBURSABLE_TOTAL column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.NON_REIMBURSABLE_TOTAL)).toBe('common.nonReimbursableTotal');
        });

        it('should return correct translation key for TAX_AMOUNT column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT)).toBe('common.tax');
        });

        it('should return correct translation key for TAX_RATE column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.TAX_RATE)).toBe('iou.taxRate');
        });

        it('should return correct translation key for REPORT_ID column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.REPORT_ID)).toBe('common.longReportID');
        });

        it('should return correct translation key for TOTAL_AMOUNT column', () => {
            expect(getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT)).toBe('iou.amount');
        });
    });
});
