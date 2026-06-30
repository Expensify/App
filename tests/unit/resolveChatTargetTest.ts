import {getChatByParticipants, getReportOrDraftReport, isDeprecatedGroupDM, isGroupChat, isMoneyRequestReport, isPolicyExpenseChat, isSelfDM} from '@libs/ReportUtils';
import {resolveChatTargetForSubmitCleanup} from '@pages/iou/request/step/resolveChatTarget';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

jest.mock('@libs/ReportUtils', () => ({
    getChatByParticipants: jest.fn(),
    getReportOrDraftReport: jest.fn(),
    isMoneyRequestReport: jest.fn(),
    isPolicyExpenseChat: jest.fn(),
    isSelfDM: jest.fn(),
    isGroupChat: jest.fn(),
    isDeprecatedGroupDM: jest.fn(),
}));

// Stub IOUUtils (only resolveChatTargetForScan reaches it) to keep the test bundle light.
jest.mock('@libs/IOUUtils', () => ({
    resolveOptimisticChatReportID: jest.fn(),
}));

const CURRENT_USER_ACCOUNT_ID = 1;
const PARTICIPANT_ACCOUNT_ID = 42;
const OTHER_PARTICIPANT_ACCOUNT_ID = 99;
const FALLBACK = 'fallback-optimistic-id';

describe('resolveChatTargetForSubmitCleanup', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getChatByParticipants as jest.Mock).mockReturnValue(undefined);
        (getReportOrDraftReport as jest.Mock).mockReturnValue({reportID: 'cached'});
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

        const result = resolveChatTargetForSubmitCleanup({
            participant,
            currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            report,
            fallbackOptimisticChatReportID: FALLBACK,
            action: CONST.IOU.ACTION.CREATE,
        });

        expect(isMoneyRequestReport).toHaveBeenCalledWith(report);
        expect(getChatByParticipants).not.toHaveBeenCalled();
        expect(result).toEqual({report, chatReportID: FALLBACK, optimisticChatReportID: undefined});
    });

    it('should keep the source report when participants match (action keeps parentChatReport even if getChatByParticipants returns no match)', () => {
        const participant: Participant = {accountID: PARTICIPANT_ACCOUNT_ID};
        const report = {reportID: 'chat-A', participants: {[PARTICIPANT_ACCOUNT_ID]: {}, [CURRENT_USER_ACCOUNT_ID]: {}}} as unknown as Report;
        (getChatByParticipants as jest.Mock).mockReturnValue(undefined);

        const result = resolveChatTargetForSubmitCleanup({
            participant,
            currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            report,
            fallbackOptimisticChatReportID: FALLBACK,
            action: CONST.IOU.ACTION.CREATE,
        });

        expect(result).toEqual({report, chatReportID: FALLBACK, optimisticChatReportID: undefined});
    });

    it('should keep the source report for special chat types (policyExpenseChat / selfDM / groupChat / deprecatedGroupDM) regardless of participant match', () => {
        const participant: Participant = {accountID: PARTICIPANT_ACCOUNT_ID};
        const report = {reportID: 'self-dm-1'} as Report;
        (isSelfDM as jest.Mock).mockReturnValue(true);

        const result = resolveChatTargetForSubmitCleanup({
            participant,
            currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            report,
            fallbackOptimisticChatReportID: FALLBACK,
            action: CONST.IOU.ACTION.CREATE,
        });

        expect(result).toEqual({report, chatReportID: FALLBACK, optimisticChatReportID: undefined});
    });

    it('should keep the source report when participant.isPolicyExpenseChat=true (action skips participant validation)', () => {
        const participant: Participant = {isPolicyExpenseChat: true, reportID: 'workspace-1'};
        const report = {reportID: 'some-report'} as Report;

        const result = resolveChatTargetForSubmitCleanup({
            participant,
            currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            report,
            fallbackOptimisticChatReportID: FALLBACK,
            action: CONST.IOU.ACTION.CREATE,
        });

        expect(result).toEqual({report, chatReportID: FALLBACK, optimisticChatReportID: undefined});
    });

    it('should resolve to participant.reportID when participant is policyExpenseChat and no source report', () => {
        const participant: Participant = {isPolicyExpenseChat: true, reportID: 'workspace-1'};

        const result = resolveChatTargetForSubmitCleanup({
            participant,
            currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            report: undefined,
            fallbackOptimisticChatReportID: FALLBACK,
            action: CONST.IOU.ACTION.CREATE,
        });

        expect(result).toEqual({report: undefined, chatReportID: 'workspace-1', optimisticChatReportID: undefined});
    });

    it('should fall back to optimisticChatReportID when participant.isPolicyExpenseChat targets a report not present in the Onyx cache (mirrors action behavior)', () => {
        const participant: Participant = {isPolicyExpenseChat: true, reportID: 'workspace-uncached'};
        (getReportOrDraftReport as jest.Mock).mockReturnValue(undefined);

        const result = resolveChatTargetForSubmitCleanup({
            participant,
            currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            report: undefined,
            fallbackOptimisticChatReportID: FALLBACK,
            action: CONST.IOU.ACTION.CREATE,
        });

        expect(result).toEqual({report: undefined, chatReportID: FALLBACK, optimisticChatReportID: undefined});
    });

    it('should resolve to the existing 1:1 DM via getChatByParticipants when participant differs from source report', () => {
        const participant: Participant = {accountID: OTHER_PARTICIPANT_ACCOUNT_ID};
        const report = {reportID: 'chat-A', participants: {[PARTICIPANT_ACCOUNT_ID]: {}, [CURRENT_USER_ACCOUNT_ID]: {}}} as unknown as Report;
        (getChatByParticipants as jest.Mock).mockReturnValue({reportID: 'chat-B'});

        const result = resolveChatTargetForSubmitCleanup({
            participant,
            currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            report,
            fallbackOptimisticChatReportID: FALLBACK,
            action: CONST.IOU.ACTION.CREATE,
        });

        expect(getChatByParticipants).toHaveBeenCalledWith([OTHER_PARTICIPANT_ACCOUNT_ID, CURRENT_USER_ACCOUNT_ID]);
        expect(result).toEqual({report: undefined, chatReportID: 'chat-B', optimisticChatReportID: undefined});
    });

    it('should fall back to optimisticChatReportID and discard report when participant changed to a brand-new contact (no existing chat)', () => {
        const participant: Participant = {accountID: OTHER_PARTICIPANT_ACCOUNT_ID};
        const report = {reportID: 'chat-A', participants: {[PARTICIPANT_ACCOUNT_ID]: {}, [CURRENT_USER_ACCOUNT_ID]: {}}} as unknown as Report;
        (getChatByParticipants as jest.Mock).mockReturnValue(undefined);

        const result = resolveChatTargetForSubmitCleanup({
            participant,
            currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            report,
            fallbackOptimisticChatReportID: FALLBACK,
            action: CONST.IOU.ACTION.CREATE,
        });

        expect(result).toEqual({report: undefined, chatReportID: FALLBACK, optimisticChatReportID: undefined});
    });

    it('should fall back to optimisticChatReportID when both report and participant are empty', () => {
        const participant: Participant = {};

        const result = resolveChatTargetForSubmitCleanup({
            participant,
            currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            report: undefined,
            fallbackOptimisticChatReportID: FALLBACK,
            action: CONST.IOU.ACTION.CREATE,
        });

        expect(result).toEqual({report: undefined, chatReportID: FALLBACK, optimisticChatReportID: undefined});
    });

    describe('tracked-expense submit (action === SUBMIT)', () => {
        it('should NOT keep the self-DM source — the action writes to the participant 1:1 chat, not back to self-DM', () => {
            const participant: Participant = {accountID: PARTICIPANT_ACCOUNT_ID};
            const report = {reportID: 'self-dm-1'} as Report;
            (isSelfDM as jest.Mock).mockReturnValue(true);
            (getChatByParticipants as jest.Mock).mockReturnValue({reportID: 'one-on-one-chat'});

            const result = resolveChatTargetForSubmitCleanup({
                participant,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                fallbackOptimisticChatReportID: FALLBACK,
                action: CONST.IOU.ACTION.SUBMIT,
            });

            expect(getChatByParticipants).toHaveBeenCalledWith([PARTICIPANT_ACCOUNT_ID, CURRENT_USER_ACCOUNT_ID]);
            expect(result).toEqual({report: undefined, chatReportID: 'one-on-one-chat', optimisticChatReportID: undefined});
        });

        it('should resolve to the participant policy-expense chat (not the self-DM source) for a workspace submit', () => {
            const participant: Participant = {isPolicyExpenseChat: true, reportID: 'workspace-1'};
            const report = {reportID: 'self-dm-1'} as Report;
            (isSelfDM as jest.Mock).mockReturnValue(true);

            const result = resolveChatTargetForSubmitCleanup({
                participant,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                fallbackOptimisticChatReportID: FALLBACK,
                action: CONST.IOU.ACTION.SUBMIT,
            });

            expect(result).toEqual({report: undefined, chatReportID: 'workspace-1', optimisticChatReportID: undefined});
        });

        it('should still keep the source when it is a money-request report even for SUBMIT (mirrors action: isMoneyRequestReport ? report.reportID)', () => {
            const participant: Participant = {accountID: PARTICIPANT_ACCOUNT_ID};
            const report = {reportID: 'iou-report-1'} as Report;
            (isMoneyRequestReport as jest.Mock).mockReturnValue(true);

            const result = resolveChatTargetForSubmitCleanup({
                participant,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                fallbackOptimisticChatReportID: FALLBACK,
                action: CONST.IOU.ACTION.SUBMIT,
            });

            expect(result).toEqual({report, chatReportID: FALLBACK, optimisticChatReportID: undefined});
        });
    });
});
