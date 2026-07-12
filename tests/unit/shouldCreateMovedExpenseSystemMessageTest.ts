import CONST from '../../src/CONST';
import shouldCreateMovedExpenseSystemMessage, {
    isDraftExpenseReport,
} from '../../src/libs/shouldCreateMovedExpenseSystemMessage';
import type {Report} from '../../src/types/onyx';

const baseExpenseReport = {
    reportID: '1',
    type: CONST.REPORT.TYPE.EXPENSE,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    isSubmitted: false,
} as Report;

const submittedExpenseReport = {
    ...baseExpenseReport,
    reportID: '2',
    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
    isSubmitted: true,
} as Report;

describe('isDraftExpenseReport', () => {
    it('returns true for open unsubmitted expense report', () => {
        expect(isDraftExpenseReport(baseExpenseReport)).toBe(true);
    });

    it('returns false for submitted expense report', () => {
        expect(isDraftExpenseReport(submittedExpenseReport)).toBe(false);
    });

    it('returns false for undefined', () => {
        expect(isDraftExpenseReport(undefined)).toBe(false);
    });
});

describe('shouldCreateMovedExpenseSystemMessage', () => {
    it('returns false when source report is missing', () => {
        expect(shouldCreateMovedExpenseSystemMessage(undefined)).toBe(false);
    });

    it('returns false for Draft source report', () => {
        expect(shouldCreateMovedExpenseSystemMessage(baseExpenseReport)).toBe(false);
    });

    it('returns false when isDraftAction is true even if report looks submitted', () => {
        expect(
            shouldCreateMovedExpenseSystemMessage(submittedExpenseReport, {isDraftAction: true}),
        ).toBe(false);
    });

    it('returns false in reject flow', () => {
        expect(
            shouldCreateMovedExpenseSystemMessage(submittedExpenseReport, {isRejectFlow: true}),
        ).toBe(false);
    });

    it('returns false when held expense is moved on approve', () => {
        expect(
            shouldCreateMovedExpenseSystemMessage(submittedExpenseReport, {
                isHeldExpenseMovedOnApprove: true,
            }),
        ).toBe(false);
    });

    it('returns true for a normal move from a non-draft report', () => {
        expect(shouldCreateMovedExpenseSystemMessage(submittedExpenseReport)).toBe(true);
    });
});
