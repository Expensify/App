import Onyx from 'react-native-onyx';
import {getTotalAmountForIOUReportPreviewButton} from '@libs/MoneyRequestReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {policy420A as mockPolicy} from '../../__mocks__/reportData/policies';
import {iouReportR14932 as mockReport} from '../../__mocks__/reportData/reports';
import * as TestHelper from '../utils/TestHelper';

const mockedReportID = mockReport.reportID;

// Get access to the mocked function
jest.mock('@libs/ReportUtils', () => ({
    getNonHeldAndFullAmount: jest.fn(),
    hasOnlyHeldExpenses: jest.fn().mockReturnValue(false),
    hasUpdatedTotal: jest.fn().mockReturnValue(true),
    getMoneyRequestSpendBreakdown: jest.fn(),
    hasHeldExpenses: jest.fn(),
    parseReportRouteParams: jest.fn().mockReturnValue({
        reportID: mockedReportID,
        isSubReportPageRoute: false,
    }),
}));

jest.mock('@libs/CurrencyUtils', () => ({
    convertToDisplayString: jest.fn().mockImplementation((amountInCents = 0): string => `$${amountInCents}.00`),
}));

// Import after mocks so we get the mocked versions
const ReportUtils = require('@libs/ReportUtils');

describe('ReportButtonUtils', () => {
    describe('getTotalAmountForIOUReportPreviewButton', () => {
        beforeAll(async () => {
            Onyx.init({keys: ONYXKEYS});
            await TestHelper.signInWithTestUser();
        });

        beforeEach(() => {
            jest.clearAllMocks(); // Reset mocks between tests
        });

        it('returns total reimbursable spend for PAY & total value for other buttons', () => {
            ReportUtils.getMoneyRequestSpendBreakdown.mockImplementation(() => ({
                nonReimbursableSpend: 50,
                reimbursableSpend: 50,
                totalDisplaySpend: 100,
            }));

            ReportUtils.getNonHeldAndFullAmount.mockImplementation(() => ({
                hasValidNonHeldAmount: true,
                nonHeldAmount: `$${50}.00`,
                fullAmount: `$100.00`,
                currency: 'USD',
            }));

            ReportUtils.hasHeldExpenses.mockImplementation(() => true);

            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY)).toBe(`$50.00`);
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW)).toBe(`$100.00`);
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE)).toBe(`$50.00`);
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT)).toBe(`$100.00`);
        });

        it('returns $0.00 for PAY and full total for other buttons when reimbursableSpend is 0', () => {
            ReportUtils.getMoneyRequestSpendBreakdown.mockImplementation(() => ({
                nonReimbursableSpend: 100,
                reimbursableSpend: 0,
                totalDisplaySpend: 100,
            }));

            ReportUtils.getNonHeldAndFullAmount.mockImplementation(() => ({
                hasValidNonHeldAmount: true,
                nonHeldAmount: `$${0}.00`,
                fullAmount: `$100.00`,
                currency: 'USD',
            }));

            ReportUtils.hasHeldExpenses.mockImplementation(() => false);

            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY)).toBe(`$0.00`);
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW)).toBe(`$100.00`);
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE)).toBe(`$100.00`);
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT)).toBe(`$100.00`);
        });
    });
});
