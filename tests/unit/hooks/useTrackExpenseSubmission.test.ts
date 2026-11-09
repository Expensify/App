import {isSelfDMSoleDestination} from '@libs/IOUUtils';
import cleanupAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAfterExpenseCreate';
import cleanupAndNavigateAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate';

import useTrackExpenseSubmission from '@pages/iou/request/step/confirmation/submission/useTrackExpenseSubmission';

import {trackExpense} from '@userActions/IOU/TrackExpense';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import {
    buildChatReport,
    buildOverriddenMapDistanceTransaction,
    buildTransaction,
    CURRENT_USER_ACCOUNT_ID,
    CURRENT_USER_PARTICIPANT,
    CURRENT_USER_PERSONAL_DETAILS,
    DRAFT_ID,
    NO_TAX_VALUES,
    OTHER_USER_PARTICIPANT,
    renderAndSubmit,
    REPORT_ID,
} from '../../utils/expenseSubmissionTestUtils';

jest.mock('@userActions/IOU/TrackExpense', () => ({trackExpense: jest.fn()}));
jest.mock('@libs/Navigation/helpers/cleanupAfterExpenseCreate', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate', () => ({__esModule: true, default: jest.fn()}));

const mockTrackExpenseAction = jest.mocked(trackExpense);
const mockCleanupAfterExpenseCreate = jest.mocked(cleanupAfterExpenseCreate);
const mockCleanupAndNavigateAfterExpenseCreate = jest.mocked(cleanupAndNavigateAfterExpenseCreate);

type UseTrackExpenseSubmissionParams = Parameters<typeof useTrackExpenseSubmission>[0];

function buildParams(overrides: Partial<UseTrackExpenseSubmissionParams> = {}): UseTrackExpenseSubmissionParams {
    const transaction = buildTransaction();
    return {
        transaction,
        transactions: [transaction],
        receiptFiles: {},
        canEnterScanFieldsManually: false,
        isPolicyExpenseChat: false,
        report: buildChatReport(),
        reportDrafts: {},
        policy: createMock<Policy>({id: 'policy-1'}),
        policyCategories: {},
        isDraftPolicy: false,
        personalDetails: {},
        currentUserPersonalDetails: CURRENT_USER_PERSONAL_DETAILS,
        selectedParticipants: [OTHER_USER_PARTICIPANT],
        iouType: CONST.IOU.TYPE.TRACK,
        action: CONST.IOU.ACTION.CREATE,
        isGPSDistanceRequest: false,
        isManualDistanceRequest: false,
        isOdometerDistanceRequest: false,
        isCategorizingTrackExpense: false,
        isSharingTrackExpense: false,
        isSubmittingExpenseToDraftWorkspace: false,
        isSelfDMDestination: false,
        draftTransactionIDs: [DRAFT_ID],
        privateIsArchivedMap: {},
        ...NO_TAX_VALUES,
        ...overrides,
    };
}

function submit(params: UseTrackExpenseSubmissionParams, shouldHandleNavigation: boolean) {
    return renderAndSubmit(() => useTrackExpenseSubmission(params), shouldHandleNavigation);
}

describe('useTrackExpenseSubmission', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it('only cleans up when shouldHandleNavigation=false, because the orchestrator already navigated', async () => {
        // Given a tracked expense whose confirmation already navigated away before the write, as dismiss-first submits do

        // When it is submitted after the orchestrator navigated away
        await submit(buildParams(), false);

        // Then the drafts are cleaned up without navigating a second time
        expect(mockTrackExpenseAction).toHaveBeenCalledTimes(1);
        expect(mockCleanupAfterExpenseCreate).toHaveBeenCalledTimes(1);
        expect(mockCleanupAfterExpenseCreate).toHaveBeenCalledWith(expect.objectContaining({draftTransactionIDs: [DRAFT_ID]}));
        expect(mockCleanupAndNavigateAfterExpenseCreate).not.toHaveBeenCalled();
    });

    it('cleans up and navigates when shouldHandleNavigation=true', async () => {
        // Given a tracked expense whose confirmation is still on screen, so the hook has to take the user to the result

        // When it is submitted and the hook owns the navigation
        await submit(buildParams(), true);

        // Then cleanupAndNavigateAfterExpenseCreate runs, which does the cleanup itself, so the plain cleanup is not called on top of it
        expect(mockTrackExpenseAction).toHaveBeenCalledTimes(1);
        expect(mockCleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledTimes(1);
        expect(mockCleanupAfterExpenseCreate).not.toHaveBeenCalled();
    });

    it('forwards the per-iteration draft as existingTransaction so getTrackExpenseInformation finds it', async () => {
        // Given a draft being submitted that differs from the page-level transaction, as in a multi-scan batch
        const draft = buildTransaction({transactionID: 'draft-transaction'});
        const params = buildParams({transaction: buildTransaction({transactionID: 'page-level-transaction'}), transactions: [draft]});

        // When it is submitted
        await submit(params, true);

        // Then the action receives the draft, since getTrackExpenseInformation looks up the transaction being written, not the page-level one
        expect(mockTrackExpenseAction).toHaveBeenCalledWith(expect.objectContaining({existingTransaction: draft}));
    });

    it('sends the overridden distance and keeps the waypoints when tracking a map distance expense', async () => {
        // Given a map distance draft whose quantity the user replaced on the Manual tab, so it no longer matches its route
        const mapDistance = buildOverriddenMapDistanceTransaction();

        // When the expense is tracked
        await submit(buildParams({transaction: mapDistance, transactions: [mapDistance]}), true);

        // Then the typed distance goes to the server and the waypoints go with it, because dropping them would trade the map receipt
        // away for the number, and the request stays a map expense so the created expense still edits and renders as one
        expect(mockTrackExpenseAction).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionParams: expect.objectContaining({
                    distance: 29,
                    distanceRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
                    validWaypoints: mapDistance.comment?.waypoints,
                }),
            }),
        );
    });

    it('tracks against the self DM when the current user is the only participant', async () => {
        // Given a manual expense where the user picked themselves
        const selectedParticipants = [CURRENT_USER_PARTICIPANT];
        const isSelfDMDestination = isSelfDMSoleDestination(selectedParticipants, CONST.IOU.TYPE.CREATE, CURRENT_USER_ACCOUNT_ID);

        // When it is submitted
        await submit(buildParams({iouType: CONST.IOU.TYPE.CREATE, selectedParticipants, isSelfDMDestination}), true);

        // Then it is tracked in the self DM, not in the route report
        expect(isSelfDMDestination).toBe(true);
        expect(mockTrackExpenseAction).toHaveBeenCalledTimes(1);
        expect(mockTrackExpenseAction).toHaveBeenCalledWith(expect.objectContaining({report: undefined}));
    });

    it('reports isDraftChatReport=false for a self DM destination even when the route report is a draft', async () => {
        // Given a route report that only exists as a draft, while the expense goes to the self DM.
        // Reporting the route report's draft state would make getTrackExpenseInformation build a workspace whose expense chat overwrites the self DM.
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${REPORT_ID}`, {reportID: REPORT_ID, chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT});

        // When the expense is submitted
        await submit(buildParams({isSelfDMDestination: true}), true);

        // Then the flag follows the self DM, which is never a draft
        expect(mockTrackExpenseAction).toHaveBeenCalledWith(expect.objectContaining({report: undefined, isDraftChatReport: false}));
    });

    it('reports isDraftChatReport=true when the draft route report is the chat the expense is tracked against', async () => {
        // Given a route report that only exists as a draft and is the chat the expense goes to
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${REPORT_ID}`, {reportID: REPORT_ID, chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT});

        // When the expense is submitted
        await submit(buildParams(), true);

        // Then the action is told the chat is a draft, so it creates it
        expect(mockTrackExpenseAction).toHaveBeenCalledWith(expect.objectContaining({isDraftChatReport: true}));
    });

    it('skips trackExpense entirely when CATEGORIZE is missing linked-track metadata', async () => {
        // Given a CATEGORIZE whose transaction has no linked tracked expense, which the action would only reject per item, too late for the UI to keep the draft
        const params = buildParams({action: CONST.IOU.ACTION.CATEGORIZE, isCategorizingTrackExpense: true});

        // When it is submitted
        await submit(params, true);

        // Then the batch is rejected up front, so nothing is written and the draft is left for a retry
        expect(mockTrackExpenseAction).not.toHaveBeenCalled();
        expect(mockCleanupAfterExpenseCreate).not.toHaveBeenCalled();
        expect(mockCleanupAndNavigateAfterExpenseCreate).not.toHaveBeenCalled();
    });
});
