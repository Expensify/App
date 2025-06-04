import Onyx from 'react-native-onyx';
import {getTotalAmountForIOUReportPreviewButton} from '@libs/MoneyRequestReportUtils';
// Import after mocks so we get the mocked versions
import {getMoneyRequestSpendBreakdown, getNonHeldAndFullAmount, hasHeldExpenses} from '@libs/ReportUtils';
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
            (getMoneyRequestSpendBreakdown as jest.Mock).mockImplementation(() => ({
                nonReimbursableSpend: 50,
                reimbursableSpend: 50,
                totalDisplaySpend: 100,
            }));

            (getNonHeldAndFullAmount as jest.Mock).mockImplementation(() => ({
                hasValidNonHeldAmount: true,
                nonHeldAmount: `$${50}.00`,
                fullAmount: `$100.00`,
                currency: 'USD',
            }));

            (hasHeldExpenses as jest.Mock).mockImplementation(() => true);

            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY)).toBe(`$50.00`);
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW)).toBe(`$100.00`);
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE)).toBe(`$50.00`);
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT)).toBe(`$100.00`);
        });

        it('returns reimbursable spend for PAY & spend for other buttons when reimbursableSpend and nonHeldAmount is 0', () => {
            (getMoneyRequestSpendBreakdown as jest.Mock).mockImplementation(() => ({
                nonReimbursableSpend: 100,
                reimbursableSpend: 0,
                totalDisplaySpend: 100,
            }));

            (getNonHeldAndFullAmount as jest.Mock).mockImplementation(() => ({
                hasValidNonHeldAmount: true,
                nonHeldAmount: `$${0}.00`,
                fullAmount: `$100.00`,
                currency: 'USD',
            }));

            (hasHeldExpenses as jest.Mock).mockImplementation(() => false);

            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY)).toBe(`$0.00`);
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW)).toBe(`$100.00`);
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE)).toBe(`$100.00`);
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT)).toBe(`$100.00`);
        });
    });
});
