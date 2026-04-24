import {getChatByParticipants, isMoneyRequestReport} from '@libs/ReportUtils';
import resolveChatForSubmitCleanup from '@pages/iou/request/step/confirmation/resolveChatForSubmitCleanup';
import type {Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

jest.mock('@libs/ReportUtils', () => ({
    getChatByParticipants: jest.fn(),
    isMoneyRequestReport: jest.fn(),
}));

const CURRENT_USER_ACCOUNT_ID = 1;
const FALLBACK = 'fallback-optimistic-id';

describe('resolveChatForSubmitCleanup', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getChatByParticipants as jest.Mock).mockReturnValue(undefined);
        (isMoneyRequestReport as jest.Mock).mockReturnValue(false);
    });

    it('should keep the source report when it is a money-request (IOU/expense) report so navigation lands back on it', () => {
        const participant: Participant = {accountID: 42};
        const report = {reportID: 'iou-report-1'} as Report;
        (isMoneyRequestReport as jest.Mock).mockReturnValue(true);

        const result = resolveChatForSubmitCleanup({participant, currentUserAccountID: CURRENT_USER_ACCOUNT_ID, report, fallbackOptimisticChatReportID: FALLBACK});

        expect(isMoneyRequestReport).toHaveBeenCalledWith(report);
        expect(getChatByParticipants).not.toHaveBeenCalled();
        expect(result).toEqual({report, optimisticChatReportID: FALLBACK});
    });

    it('should resolve to participant.reportID and discard report when participant is a policy expense chat', () => {
        const participant: Participant = {isPolicyExpenseChat: true, reportID: 'workspace-1'};
        const report = {reportID: 'self-dm-1'} as Report;

        const result = resolveChatForSubmitCleanup({participant, currentUserAccountID: CURRENT_USER_ACCOUNT_ID, report, fallbackOptimisticChatReportID: FALLBACK});

        expect(result).toEqual({report: undefined, optimisticChatReportID: 'workspace-1'});
    });

    it('should resolve to the existing 1:1 DM via getChatByParticipants and discard report', () => {
        const participant: Participant = {accountID: 42};
        const report = {reportID: 'original-report'} as Report;
        (getChatByParticipants as jest.Mock).mockReturnValue({reportID: 'existing-dm-99'});

        const result = resolveChatForSubmitCleanup({participant, currentUserAccountID: CURRENT_USER_ACCOUNT_ID, report, fallbackOptimisticChatReportID: FALLBACK});

        expect(getChatByParticipants).toHaveBeenCalledWith([42, CURRENT_USER_ACCOUNT_ID]);
        expect(result).toEqual({report: undefined, optimisticChatReportID: 'existing-dm-99'});
    });

    it('should fall back to optimisticChatReportID and discard report when participant has no existing chat (brand-new contact)', () => {
        const participant: Participant = {accountID: 42};
        const report = {reportID: 'chat-1'} as Report;
        (getChatByParticipants as jest.Mock).mockReturnValue(undefined);

        const result = resolveChatForSubmitCleanup({participant, currentUserAccountID: CURRENT_USER_ACCOUNT_ID, report, fallbackOptimisticChatReportID: FALLBACK});

        expect(result).toEqual({report: undefined, optimisticChatReportID: FALLBACK});
    });

    it('should fall back to optimisticChatReportID when both report and participant are empty', () => {
        const participant: Participant = {};

        const result = resolveChatForSubmitCleanup({participant, currentUserAccountID: CURRENT_USER_ACCOUNT_ID, report: undefined, fallbackOptimisticChatReportID: FALLBACK});

        expect(result).toEqual({report: undefined, optimisticChatReportID: FALLBACK});
    });
});
