import {getMoneyRequestReportButtonType, getTotalAmountOfButton, IOU_PREVIEW_BUTTON} from '@components/ReportActionItem/MoneyRequestReportPreview/MoneyRequestReportButtonUtils';
// eslint-disable-next-line no-restricted-syntax
import * as CurrencyUtils from '@libs/CurrencyUtils';
// eslint-disable-next-line no-restricted-syntax
import * as ReportUtils from '@libs/ReportUtils';
import {policy420A as mockPolicy} from '../../__mocks__/reportData/policies';
import {iouReportR14932 as mockReport} from '../../__mocks__/reportData/reports';

const TOTAL = 100;
const NON_HELD_VALUE = 50;

jest.mock('@libs/ReportUtils', () => ({
    getNonHeldAndFullAmount: jest.fn(),
    hasOnlyHeldExpenses: jest.fn(),
    hasUpdatedTotal: jest.fn(),
    getMoneyRequestSpendBreakdown: jest.fn(),
    hasHeldExpenses: jest.fn(),
}));

jest.mock('@libs/CurrencyUtils', () => ({
    convertToDisplayString: jest.fn(),
}));

const nonHeldDetails = {nonHeldAmount: `$${NON_HELD_VALUE}.00`, hasValidNonHeldAmount: true, fullAmount: `$${TOTAL}.00`, currency: 'USD'};
const spendBreakdown = {
    nonReimbursableSpend: NON_HELD_VALUE,
    reimbursableSpend: NON_HELD_VALUE,
    totalDisplaySpend: TOTAL,
};

const mockConvertToDisplayString = (amountInCents = 0): string => `$${amountInCents}.00`;

const mockReportUtilsMethods = () => {
    jest.spyOn(ReportUtils, 'hasOnlyHeldExpenses').mockReturnValue(false);
    jest.spyOn(ReportUtils, 'hasHeldExpenses').mockReturnValue(true);
    jest.spyOn(ReportUtils, 'hasUpdatedTotal').mockReturnValue(true);
    jest.spyOn(ReportUtils, 'getNonHeldAndFullAmount').mockReturnValue(nonHeldDetails);
    jest.spyOn(ReportUtils, 'getMoneyRequestSpendBreakdown').mockReturnValue(spendBreakdown);
    jest.spyOn(CurrencyUtils, 'convertToDisplayString').mockImplementation(mockConvertToDisplayString);
};

describe('ReportButtonUtils', () => {
    describe('getTotalAmountOfButton', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('returns empty string for NONE and EXPORT button types', () => {
            expect(getTotalAmountOfButton(mockReport, mockPolicy, IOU_PREVIEW_BUTTON.NONE)).toBe('');
            expect(getTotalAmountOfButton(mockReport, mockPolicy, IOU_PREVIEW_BUTTON.EXPORT)).toBe('');
        });

        it('returns nonHeldValue for PAY & total value for other buttons', () => {
            mockReportUtilsMethods();

            expect(getTotalAmountOfButton(mockReport, mockPolicy, IOU_PREVIEW_BUTTON.PAY)).toBe(`$${NON_HELD_VALUE}.00`);
            expect(getTotalAmountOfButton(mockReport, mockPolicy, IOU_PREVIEW_BUTTON.REVIEW)).toBe(`$${TOTAL}.00`);
            expect(getTotalAmountOfButton(mockReport, mockPolicy, IOU_PREVIEW_BUTTON.APPROVE)).toBe(`$${TOTAL}.00`);
            expect(getTotalAmountOfButton(mockReport, mockPolicy, IOU_PREVIEW_BUTTON.SUBMIT)).toBe(`$${TOTAL}.00`);
        });
    });

    describe('getMoneyRequestReportButtonType', () => {
        it('returns review button type if there are errors and can show settlement button', () => {
            expect(
                getMoneyRequestReportButtonType({
                    shouldShowSubmitButton: false,
                    shouldShowExportIntegrationButton: true,
                    shouldShowApproveButton: false,
                    shouldShowSettlementButton: true,
                    shouldShowPayButton: false,
                    shouldShowRBR: true,
                }),
            ).toBe(IOU_PREVIEW_BUTTON.REVIEW);
        });

        it('returns export button type when export integrations can be shown', () => {
            expect(
                getMoneyRequestReportButtonType({
                    shouldShowSubmitButton: false,
                    shouldShowExportIntegrationButton: true,
                    shouldShowApproveButton: false,
                    shouldShowSettlementButton: false,
                    shouldShowPayButton: false,
                    shouldShowRBR: false,
                }),
            ).toBe(IOU_PREVIEW_BUTTON.EXPORT);
        });

        it('returns pay button type when settlement and pay options are shown', () => {
            expect(
                getMoneyRequestReportButtonType({
                    shouldShowSubmitButton: false,
                    shouldShowExportIntegrationButton: false,
                    shouldShowApproveButton: false,
                    shouldShowSettlementButton: true,
                    shouldShowPayButton: true,
                    shouldShowRBR: false,
                }),
            ).toBe(IOU_PREVIEW_BUTTON.PAY);
        });

        it('returns approve button type when settlement & approve is allowed without RBR', () => {
            expect(
                getMoneyRequestReportButtonType({
                    shouldShowSubmitButton: false,
                    shouldShowExportIntegrationButton: false,
                    shouldShowApproveButton: true,
                    shouldShowSettlementButton: true,
                    shouldShowPayButton: false,
                    shouldShowRBR: false,
                }),
            ).toBe(IOU_PREVIEW_BUTTON.APPROVE);
        });

        it('returns submit button type if user can submit even if other buttons can be shown', () => {
            expect(
                getMoneyRequestReportButtonType({
                    shouldShowSubmitButton: true,
                    shouldShowExportIntegrationButton: false,
                    shouldShowApproveButton: false,
                    shouldShowSettlementButton: true,
                    shouldShowPayButton: true,
                    shouldShowRBR: true,
                }),
            ).toBe(IOU_PREVIEW_BUTTON.SUBMIT);
        });
    });
});
