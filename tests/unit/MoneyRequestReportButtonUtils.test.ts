import Onyx from 'react-native-onyx';
import {getIOUReportPreviewButtonType, getTotalAmountForIOUReportPreviewButton, IOU_REPORT_PREVIEW_BUTTON} from '@libs/MoneyRequestReportUtils';
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

        it('returns empty string for NONE and EXPORT button types', () => {
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, IOU_REPORT_PREVIEW_BUTTON.NONE)).toBe('');
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, IOU_REPORT_PREVIEW_BUTTON.EXPORT)).toBe('');
        });

        it('returns nonHeldValue for PAY & total value for other buttons', () => {
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, IOU_REPORT_PREVIEW_BUTTON.PAY)).toBe(`$50.00`);
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, IOU_REPORT_PREVIEW_BUTTON.REVIEW)).toBe(`$100.00`);
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, IOU_REPORT_PREVIEW_BUTTON.APPROVE)).toBe(`$100.00`);
            expect(getTotalAmountForIOUReportPreviewButton(mockReport, mockPolicy, IOU_REPORT_PREVIEW_BUTTON.SUBMIT)).toBe(`$100.00`);
        });
    });

    describe('getIOUReportPreviewButtonType', () => {
        it('returns review button type if there are errors and can show settlement button', () => {
            expect(
                getIOUReportPreviewButtonType({
                    shouldShowSubmitButton: false,
                    shouldShowExportIntegrationButton: true,
                    shouldShowApproveButton: false,
                    shouldShowSettlementButton: true,
                    shouldShowPayButton: false,
                    shouldShowRBR: true,
                }),
            ).toBe(IOU_REPORT_PREVIEW_BUTTON.REVIEW);
        });

        it('returns export button type when export integrations can be shown', () => {
            expect(
                getIOUReportPreviewButtonType({
                    shouldShowSubmitButton: false,
                    shouldShowExportIntegrationButton: true,
                    shouldShowApproveButton: false,
                    shouldShowSettlementButton: false,
                    shouldShowPayButton: false,
                    shouldShowRBR: false,
                }),
            ).toBe(IOU_REPORT_PREVIEW_BUTTON.EXPORT);
        });

        it('returns pay button type when settlement and pay options are shown', () => {
            expect(
                getIOUReportPreviewButtonType({
                    shouldShowSubmitButton: false,
                    shouldShowExportIntegrationButton: false,
                    shouldShowApproveButton: false,
                    shouldShowSettlementButton: true,
                    shouldShowPayButton: true,
                    shouldShowRBR: false,
                }),
            ).toBe(IOU_REPORT_PREVIEW_BUTTON.PAY);
        });

        it('returns approve button type when settlement & approve is allowed without RBR', () => {
            expect(
                getIOUReportPreviewButtonType({
                    shouldShowSubmitButton: false,
                    shouldShowExportIntegrationButton: false,
                    shouldShowApproveButton: true,
                    shouldShowSettlementButton: true,
                    shouldShowPayButton: false,
                    shouldShowRBR: false,
                }),
            ).toBe(IOU_REPORT_PREVIEW_BUTTON.APPROVE);
        });

        it('returns submit button type if user can submit even if other buttons can be shown', () => {
            expect(
                getIOUReportPreviewButtonType({
                    shouldShowSubmitButton: true,
                    shouldShowExportIntegrationButton: false,
                    shouldShowApproveButton: false,
                    shouldShowSettlementButton: true,
                    shouldShowPayButton: true,
                    shouldShowRBR: true,
                }),
            ).toBe(IOU_REPORT_PREVIEW_BUTTON.SUBMIT);
        });
    });
});
