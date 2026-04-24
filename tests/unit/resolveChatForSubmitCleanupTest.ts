import {getChatByParticipants, isDeprecatedGroupDM, isGroupChat, isMoneyRequestReport, isPolicyExpenseChat, isSelfDM} from '@libs/ReportUtils';
import resolveChatForSubmitCleanup from '@pages/iou/request/step/confirmation/resolveChatForSubmitCleanup';
import type {Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

jest.mock('@libs/ReportUtils', () => ({
    getChatByParticipants: jest.fn(),
    isMoneyRequestReport: jest.fn(),
    isPolicyExpenseChat: jest.fn(),
    isSelfDM: jest.fn(),
    isGroupChat: jest.fn(),
    isDeprecatedGroupDM: jest.fn(),
}));

const CURRENT_USER_ACCOUNT_ID = 1;
const PARTICIPANT_ACCOUNT_ID = 42;
const OTHER_PARTICIPANT_ACCOUNT_ID = 99;
const FALLBACK = 'fallback-optimistic-id';

describe('resolveChatForSubmitCleanup', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getChatByParticipants as jest.Mock).mockReturnValue(undefined);
        (isMoneyRequestReport as jest.Mock).mockReturnValue(false);
        (isPolicyExpenseChat as jest.Mock).mockReturnValue(false);
        (isSelfDM as jest.Mock).mockReturnValue(false);
        (isGroupChat as jest.Mock).mockReturnValue(false);
        (isDeprecatedGroupDM as jest.Mock).mockReturnValue(false);
    });

    it('should keep the source report when it is a money-request (IOU/expense) report so navigation lands back on it', () => {
        const participant: Participant = {accountID: PARTICIPANT_ACCOUNT_ID};
        const report = {reportID: 'iou-report-1'} as Report;
        (isMoneyRequestReport as jest.Mock).mockReturnValue(true);

        const result = resolveChatForSubmitCleanup({participant, currentUserAccountID: CURRENT_USER_ACCOUNT_ID, report, fallbackOptimisticChatReportID: FALLBACK});

        expect(isMoneyRequestReport).toHaveBeenCalledWith(report);
        expect(getChatByParticipants).not.toHaveBeenCalled();
        expect(result).toEqual({report, optimisticChatReportID: FALLBACK});
    });

    it('should keep the source report when participants match (action keeps parentChatReport even if getChatByParticipants returns no match)', () => {
        const participant: Participant = {accountID: PARTICIPANT_ACCOUNT_ID};
        const report = {reportID: 'chat-A', participants: {[PARTICIPANT_ACCOUNT_ID]: {}, [CURRENT_USER_ACCOUNT_ID]: {}}} as unknown as Report;
        (getChatByParticipants as jest.Mock).mockReturnValue(undefined);

        const result = resolveChatForSubmitCleanup({participant, currentUserAccountID: CURRENT_USER_ACCOUNT_ID, report, fallbackOptimisticChatReportID: FALLBACK});

        expect(result).toEqual({report, optimisticChatReportID: FALLBACK});
    });

    it('should keep the source report for special chat types (policyExpenseChat / selfDM / groupChat / deprecatedGroupDM) regardless of participant match', () => {
        const participant: Participant = {accountID: PARTICIPANT_ACCOUNT_ID};
        const report = {reportID: 'self-dm-1'} as Report;
        (isSelfDM as jest.Mock).mockReturnValue(true);

        const result = resolveChatForSubmitCleanup({participant, currentUserAccountID: CURRENT_USER_ACCOUNT_ID, report, fallbackOptimisticChatReportID: FALLBACK});

        expect(result).toEqual({report, optimisticChatReportID: FALLBACK});
    });

    it('should keep the source report when participant.isPolicyExpenseChat=true (action skips participant validation)', () => {
        const participant: Participant = {isPolicyExpenseChat: true, reportID: 'workspace-1'};
        const report = {reportID: 'some-report'} as Report;

        const result = resolveChatForSubmitCleanup({participant, currentUserAccountID: CURRENT_USER_ACCOUNT_ID, report, fallbackOptimisticChatReportID: FALLBACK});

        expect(result).toEqual({report, optimisticChatReportID: FALLBACK});
    });

    it('should resolve to participant.reportID when participant is policyExpenseChat and no source report', () => {
        const participant: Participant = {isPolicyExpenseChat: true, reportID: 'workspace-1'};

        const result = resolveChatForSubmitCleanup({participant, currentUserAccountID: CURRENT_USER_ACCOUNT_ID, report: undefined, fallbackOptimisticChatReportID: FALLBACK});

        expect(result).toEqual({report: undefined, optimisticChatReportID: 'workspace-1'});
    });

    it('should resolve to the existing 1:1 DM via getChatByParticipants when participant differs from source report', () => {
        const participant: Participant = {accountID: OTHER_PARTICIPANT_ACCOUNT_ID};
        const report = {reportID: 'chat-A', participants: {[PARTICIPANT_ACCOUNT_ID]: {}, [CURRENT_USER_ACCOUNT_ID]: {}}} as unknown as Report;
        (getChatByParticipants as jest.Mock).mockReturnValue({reportID: 'chat-B'});

        const result = resolveChatForSubmitCleanup({participant, currentUserAccountID: CURRENT_USER_ACCOUNT_ID, report, fallbackOptimisticChatReportID: FALLBACK});

        expect(getChatByParticipants).toHaveBeenCalledWith([OTHER_PARTICIPANT_ACCOUNT_ID, CURRENT_USER_ACCOUNT_ID]);
        expect(result).toEqual({report: undefined, optimisticChatReportID: 'chat-B'});
    });

    it('should fall back to optimisticChatReportID and discard report when participant changed to a brand-new contact (no existing chat)', () => {
        const participant: Participant = {accountID: OTHER_PARTICIPANT_ACCOUNT_ID};
        const report = {reportID: 'chat-A', participants: {[PARTICIPANT_ACCOUNT_ID]: {}, [CURRENT_USER_ACCOUNT_ID]: {}}} as unknown as Report;
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
