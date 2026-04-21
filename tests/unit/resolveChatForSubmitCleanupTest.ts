import {getChatByParticipants} from '@libs/ReportUtils';
import resolveChatForSubmitCleanup from '@pages/iou/request/step/confirmation/resolveChatForSubmitCleanup';
import type {Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

jest.mock('@libs/ReportUtils', () => ({
    getChatByParticipants: jest.fn(),
}));

const CURRENT_USER_ACCOUNT_ID = 1;
const FALLBACK = 'fallback-optimistic-id';

describe('resolveChatForSubmitCleanup', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getChatByParticipants as jest.Mock).mockReturnValue(undefined);
    });

    it('should use participant.reportID and drop report when the participant is a policy expense chat different from the source report', () => {
        const participant: Participant = {isPolicyExpenseChat: true, reportID: 'workspace-1'};
        const report = {reportID: 'self-dm-1'} as Report;

        const result = resolveChatForSubmitCleanup({participant, currentUserAccountID: CURRENT_USER_ACCOUNT_ID, report, fallbackOptimisticChatReportID: FALLBACK});

        expect(result).toEqual({report: undefined, optimisticChatReportID: 'workspace-1'});
    });

    it('should keep report when the participant is a policy expense chat matching the source report', () => {
        const participant: Participant = {isPolicyExpenseChat: true, reportID: 'workspace-1'};
        const report = {reportID: 'workspace-1'} as Report;

        const result = resolveChatForSubmitCleanup({participant, currentUserAccountID: CURRENT_USER_ACCOUNT_ID, report, fallbackOptimisticChatReportID: FALLBACK});

        expect(result).toEqual({report, optimisticChatReportID: 'workspace-1'});
    });

    it('should use the existing 1:1 DM reportID and drop report when the resolved DM differs from the source report', () => {
        const participant: Participant = {accountID: 42};
        const report = {reportID: 'original-report'} as Report;
        (getChatByParticipants as jest.Mock).mockReturnValue({reportID: 'existing-dm-99'});

        const result = resolveChatForSubmitCleanup({participant, currentUserAccountID: CURRENT_USER_ACCOUNT_ID, report, fallbackOptimisticChatReportID: FALLBACK});

        expect(getChatByParticipants).toHaveBeenCalledWith([42, CURRENT_USER_ACCOUNT_ID]);
        expect(result).toEqual({report: undefined, optimisticChatReportID: 'existing-dm-99'});
    });

    it('should fall back to optimisticChatReportID and keep report when no participant resolution is possible', () => {
        const participant: Participant = {accountID: 42};
        const report = {reportID: 'chat-1'} as Report;
        (getChatByParticipants as jest.Mock).mockReturnValue(undefined);

        const result = resolveChatForSubmitCleanup({participant, currentUserAccountID: CURRENT_USER_ACCOUNT_ID, report, fallbackOptimisticChatReportID: FALLBACK});

        expect(result).toEqual({report, optimisticChatReportID: FALLBACK});
    });

    it('should fall back to optimisticChatReportID and keep (undefined) report when both report and participant are empty', () => {
        const participant: Participant = {};

        const result = resolveChatForSubmitCleanup({participant, currentUserAccountID: CURRENT_USER_ACCOUNT_ID, report: undefined, fallbackOptimisticChatReportID: FALLBACK});

        expect(result).toEqual({report: undefined, optimisticChatReportID: FALLBACK});
    });
});
