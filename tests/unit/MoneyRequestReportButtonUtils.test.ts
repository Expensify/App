import Onyx from 'react-native-onyx';
import {getTotalAmountForIOUReportPreviewButton} from '@libs/MoneyRequestReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {policy420A as mockPolicy} from '../../__mocks__/reportData/policies';
import {iouReportR14932 as mockReport} from '../../__mocks__/reportData/reports';
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
    hasHeldExpenses: jest.fn().mockReturnValue(false),
    parseReportRouteParams: jest.fn().mockReturnValue({
        reportID: mockedReportID,
        isSubReportPageRoute: false,
    }),
}));

jest.mock('@libs/CurrencyUtils', () => ({
    convertToDisplayString: jest.fn().mockImplementation((amountInCents = 0): string => `$${amountInCents}.00`),
}));

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
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY)).toBe(`$50.00`);
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE)).toBe(`$100.00`);
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT)).toBe(`$100.00`);
        });
    });
});
