import {getTotalAmountForIOUReportPreviewButton} from '@libs/MoneyRequestReportUtils';
import {hasOnlyNonReimbursableTransactions, hasUpdatedTotal} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import {policy420A as mockPolicy} from '../../__mocks__/reportData/policies';
import {iouReportR14932 as mockReport} from '../../__mocks__/reportData/reports';
import createRandomTransaction from '../utils/collections/transaction';
import * as TestHelper from '../utils/TestHelper';

const mockedReportID = mockReport.reportID;

jest.mock('@libs/ReportUtils', () => ({
    getNonHeldAndFullAmount: jest.fn().mockReturnValue({nonHeldAmount: `$${50}.00`, hasValidNonHeldAmount: true, fullAmount: `$100.00`, currency: 'USD'}),
    hasOnlyHeldExpenses: jest.fn().mockReturnValue(false),
    hasUpdatedTotal: jest.fn().mockReturnValue(true),
    getMoneyRequestSpendBreakdown: jest.fn().mockReturnValue({
        nonReimbursableSpend: 50,
        reimbursableSpend: 50,
        totalDisplaySpend: 100,
    }),
    hasOnlyNonReimbursableTransactions: jest.fn().mockReturnValue(false),
    hasHeldExpenses: jest.fn().mockReturnValue(false),
    parseReportRouteParams: jest.fn().mockReturnValue({
        reportID: mockedReportID,
        isSubReportPageRoute: false,
    }),
}));

const convertToDisplayString = jest.fn().mockImplementation((amountInCents: number | undefined = 0): string => `$${amountInCents}.00`);

describe('ReportButtonUtils', () => {
    describe('getTotalAmountForIOUReportPreviewButton', () => {
        beforeAll(async () => {
            Onyx.init({
                keys: ONYXKEYS,
            });

            await TestHelper.signInWithTestUser();
        });

        afterAll(() => {
            jest.clearAllMocks();
        });

        it('returns total reimbursable spend for PAY & total value for other buttons', () => {
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY, [], convertToDisplayString)).toBe(`$50.00`);
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE, [], convertToDisplayString)).toBe(`$100.00`);
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT, [], convertToDisplayString)).toBe(`$100.00`);
        });

        it('returns total display spend for PAY when report has only non-reimbursable transactions', () => {
            jest.mocked(hasOnlyNonReimbursableTransactions).mockReturnValueOnce(true);

            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY, [], convertToDisplayString)).toBe(`$100.00`);
        });

        it('checks whether the total is updated against the transactions it is given', () => {
            // Given the transactions of the report the button is shown for
            const transactions = [{...createRandomTransaction(1), reportID: mockedReportID}];
            jest.mocked(hasUpdatedTotal).mockClear();

            // When getting the amount for the Pay button
            getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY, transactions, convertToDisplayString);

            // Then the total is checked against those transactions, so the caller's data is used instead of a global lookup
            expect(hasUpdatedTotal).toHaveBeenCalledWith(mockReport, mockPolicy, transactions);
        });
    });
});
