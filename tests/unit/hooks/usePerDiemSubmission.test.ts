import Log from '@libs/Log';
import cleanupAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAfterExpenseCreate';
import dismissModalAndOpenReportInInboxTab from '@libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab';
import navigateAfterExpenseCreate from '@libs/Navigation/helpers/navigateAfterExpenseCreate';
import Navigation from '@libs/Navigation/Navigation';

import usePerDiemSubmission from '@pages/iou/request/step/confirmation/submission/usePerDiemSubmission';

import {hasCompletePerDiemCustomUnit, submitPerDiemExpense, submitPerDiemExpenseForSelfDM} from '@userActions/IOU/PerDiem';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import {buildChatReport, buildPerDiemTransaction, CURRENT_USER_PERSONAL_DETAILS, OTHER_USER_PARTICIPANT, renderAndSubmit} from '../../utils/expenseSubmissionTestUtils';

jest.mock('@userActions/IOU/PerDiem', () => ({
    submitPerDiemExpense: jest.fn(),
    submitPerDiemExpenseForSelfDM: jest.fn(),
    hasCompletePerDiemCustomUnit: jest.fn(),
    getPerDiemExpensePolicyID: jest.fn(),
}));
jest.mock('@libs/Navigation/helpers/cleanupAfterExpenseCreate', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@libs/Navigation/helpers/navigateAfterExpenseCreate', () => ({__esModule: true, default: jest.fn()}));

const EXPENSE_REPORT_ID = 'expense-1';
const PER_DIEM_TRANSACTION_ID = 'per-diem-transaction';

const mockNavigateAfterExpenseCreate = jest.mocked(navigateAfterExpenseCreate);
const mockSubmitPerDiemExpenseAction = jest.mocked(submitPerDiemExpense);
const mockSubmitPerDiemExpenseForSelfDMAction = jest.mocked(submitPerDiemExpenseForSelfDM);
const mockHasCompletePerDiemCustomUnit = jest.mocked(hasCompletePerDiemCustomUnit);
const mockCleanupAfterExpenseCreate = jest.mocked(cleanupAfterExpenseCreate);
const mockDismissModalAndOpenReportInInboxTab = jest.mocked(dismissModalAndOpenReportInInboxTab);

type UsePerDiemSubmissionParams = Parameters<typeof usePerDiemSubmission>[0];

function buildParams(overrides: Partial<UsePerDiemSubmissionParams> = {}): UsePerDiemSubmissionParams {
    return {
        transaction: buildPerDiemTransaction(),
        report: buildChatReport(),
        reportDrafts: {},
        policy: createMock<Policy>({id: 'policy-1'}),
        policyCategories: {},
        personalDetails: {},
        currentUserPersonalDetails: CURRENT_USER_PERSONAL_DETAILS,
        selectedParticipants: [OTHER_USER_PARTICIPANT],
        isTrackExpense: false,
        isSelfDMDestination: false,
        ...overrides,
    };
}

function submit(params: UsePerDiemSubmissionParams, shouldHandleNavigation: boolean) {
    return renderAndSubmit(() => usePerDiemSubmission(params), shouldHandleNavigation);
}

describe('usePerDiemSubmission', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        mockHasCompletePerDiemCustomUnit.mockReturnValue(true);
    });

    describe('expense report destination', () => {
        // The hook resolves the destination chat from the expense report before calling submitPerDiemExpense. When that
        // chat only exists in REPORT_DRAFT, the draft has to arrive through the reportDrafts param.
        let getTopmostReportIdSpy: jest.SpyInstance;

        beforeEach(() => {
            // The expense report path reads the topmost report, and no navigator is mounted here
            getTopmostReportIdSpy = jest.spyOn(Navigation, 'getTopmostReportId').mockReturnValue(undefined);
            mockSubmitPerDiemExpenseAction.mockReturnValue({iouReport: buildChatReport({reportID: EXPENSE_REPORT_ID}), transactionID: PER_DIEM_TRANSACTION_ID});
        });

        afterEach(() => {
            getTopmostReportIdSpy.mockRestore();
        });

        function buildExpenseReportParams(reportDrafts: UsePerDiemSubmissionParams['reportDrafts']) {
            return buildParams({
                report: {reportID: EXPENSE_REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE, chatReportID: 'draft-chat-1'},
                reportDrafts,
            });
        }

        it('resolves the destination chat from the supplied reportDrafts when it has no real report', async () => {
            // Given an expense report whose chat only exists as a draft that is passed in
            const draftChat = {reportID: 'draft-chat-1', chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT};

            // When the per diem expense is submitted
            await submit(buildExpenseReportParams({[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}draft-chat-1`]: draftChat}), true);

            // Then the draft chat resolved, so no optimistic chat report has to be generated for it
            expect(mockSubmitPerDiemExpenseAction).toHaveBeenCalledWith(expect.objectContaining({optimisticChatReportID: undefined}));
        });

        it('ignores a draft that is only in Onyx and not in the supplied reportDrafts', async () => {
            // Given the two sources disagree on purpose: Onyx has the draft chat, the param does not
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}draft-chat-1`, {
                reportID: 'draft-chat-1',
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            });

            // When the per diem expense is submitted
            await submit(buildExpenseReportParams({}), true);

            // Then the chat is not found, so a new chat ID is generated
            const optimisticChatReportID = mockSubmitPerDiemExpenseAction.mock.calls.at(0)?.at(0)?.optimisticChatReportID;
            expect(typeof optimisticChatReportID).toBe('string');
            expect(optimisticChatReportID).not.toBe('');
        });

        it('removes the draft and opens the expense report when shouldHandleNavigation=true', async () => {
            // Given a per diem expense sent to a workspace
            const params = buildExpenseReportParams({});

            // When it is submitted and the hook handles navigation
            await submit(params, true);

            // Then the draft is removed after the transition and the expense report is opened
            expect(mockCleanupAfterExpenseCreate).toHaveBeenCalledWith({draftTransactionIDs: [CONST.IOU.OPTIMISTIC_TRANSACTION_ID], shouldWaitForUpcomingTransition: true});
            expect(mockNavigateAfterExpenseCreate).toHaveBeenCalledWith(
                expect.objectContaining({activeReportID: EXPENSE_REPORT_ID, transactionID: PER_DIEM_TRANSACTION_ID, shouldNavigate: true}),
            );
        });

        it('removes the draft without navigating when shouldHandleNavigation=false', async () => {
            // Given a per diem expense sent to a workspace, after the orchestrator already navigated
            const params = buildExpenseReportParams({});

            // When it is submitted
            await submit(params, false);

            // Then the draft is removed right away and there is no second navigation
            expect(mockCleanupAfterExpenseCreate).toHaveBeenCalledWith({draftTransactionIDs: [CONST.IOU.OPTIMISTIC_TRANSACTION_ID], shouldWaitForUpcomingTransition: false});
            expect(mockNavigateAfterExpenseCreate).toHaveBeenCalledWith(
                expect.objectContaining({activeReportID: EXPENSE_REPORT_ID, transactionID: PER_DIEM_TRANSACTION_ID, shouldNavigate: false}),
            );
        });
    });

    describe('self DM tracking', () => {
        it('tracks the per diem expense through submitPerDiemExpenseForSelfDM', async () => {
            // Given a per diem expense being tracked in the self DM

            // When it is submitted
            await submit(buildParams({isTrackExpense: true}), true);

            // Then the self DM command is used, not the workspace one
            expect(mockSubmitPerDiemExpenseForSelfDMAction).toHaveBeenCalledTimes(1);
            expect(mockSubmitPerDiemExpenseAction).not.toHaveBeenCalled();
        });

        it('removes the draft and dismisses to the self DM when shouldHandleNavigation=true', async () => {
            // Given a per diem expense being tracked in the self DM

            // When it is submitted and the hook owns the navigation
            await submit(buildParams({isTrackExpense: true}), true);

            // Then the draft is removed once the transition ends and the self DM the expense was written to is opened
            const selfDMReportID = mockSubmitPerDiemExpenseForSelfDMAction.mock.calls.at(0)?.at(0)?.optimisticChatReportID;
            expect(mockCleanupAfterExpenseCreate).toHaveBeenCalledWith({draftTransactionIDs: [CONST.IOU.OPTIMISTIC_TRANSACTION_ID], shouldWaitForUpcomingTransition: true});
            expect(selfDMReportID).toBeTruthy();
            expect(mockDismissModalAndOpenReportInInboxTab).toHaveBeenCalledTimes(1);
            expect(mockDismissModalAndOpenReportInInboxTab).toHaveBeenCalledWith(selfDMReportID, false, false);
        });

        it('removes the draft without dismissing when shouldHandleNavigation=false, because the orchestrator already navigated', async () => {
            // Given a per diem expense being tracked in the self DM

            // When it is submitted after the orchestrator navigated away
            await submit(buildParams({isTrackExpense: true}), false);

            // Then only the draft is removed
            expect(mockCleanupAfterExpenseCreate).toHaveBeenCalledWith({draftTransactionIDs: [CONST.IOU.OPTIMISTIC_TRANSACTION_ID]});
            expect(mockDismissModalAndOpenReportInInboxTab).not.toHaveBeenCalled();
        });

        it('does not submit, remove the draft, or navigate when the custom unit is incomplete', async () => {
            // Given a custom unit the action would refuse, so the UI has to apply the same check or it would drop the draft for nothing
            mockHasCompletePerDiemCustomUnit.mockReturnValue(false);
            const logAlertSpy = jest.spyOn(Log, 'alert').mockImplementation(() => {});

            try {
                // When it is submitted
                await submit(buildParams({isTrackExpense: true}), true);

                // Then nothing is written, the draft survives, and the skip is logged
                expect(mockSubmitPerDiemExpenseForSelfDMAction).not.toHaveBeenCalled();
                expect(mockCleanupAfterExpenseCreate).not.toHaveBeenCalled();
                expect(mockDismissModalAndOpenReportInInboxTab).not.toHaveBeenCalled();
                expect(logAlertSpy).toHaveBeenCalledTimes(1);
            } finally {
                logAlertSpy.mockRestore();
            }
        });
    });
});
