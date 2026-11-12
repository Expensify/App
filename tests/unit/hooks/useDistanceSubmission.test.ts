import {act, renderHook} from '@testing-library/react-native';

import type {WriteReadyBarrier} from '@libs/API';
import cleanupAndNavigateAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate';

import useDistanceSubmission from '@pages/iou/request/step/confirmation/submission/useDistanceSubmission';
import {resolveChatTargetForSubmitCleanup} from '@pages/iou/request/step/resolveChatTarget';
import type * as ResolveChatTarget from '@pages/iou/request/step/resolveChatTarget';

import {commitDistanceRequest, planDistanceRequest} from '@userActions/IOU/Split';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import {
    buildChatReport,
    buildOverriddenMapDistanceTransaction,
    buildTransaction,
    CURRENT_USER_PERSONAL_DETAILS,
    DRAFT_ID,
    NO_TAX_VALUES,
    OTHER_USER_PARTICIPANT,
    renderAndSubmit,
} from '../../utils/expenseSubmissionTestUtils';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@userActions/IOU/Split', () => ({planDistanceRequest: jest.fn(), commitDistanceRequest: jest.fn()}));
jest.mock('@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@pages/iou/request/step/resolveChatTarget', () => {
    const actual = jest.requireActual<typeof ResolveChatTarget>('@pages/iou/request/step/resolveChatTarget');
    return {...actual, resolveChatTargetForSubmitCleanup: jest.fn(actual.resolveChatTargetForSubmitCleanup)};
});

const mockPlanDistanceRequest = jest.mocked(planDistanceRequest);
const mockCommitDistanceRequest = jest.mocked(commitDistanceRequest);
const mockCleanupAndNavigateAfterExpenseCreate = jest.mocked(cleanupAndNavigateAfterExpenseCreate);
const mockResolveChatTargetForSubmitCleanup = jest.mocked(resolveChatTargetForSubmitCleanup);

type UseDistanceSubmissionParams = Parameters<typeof useDistanceSubmission>[0];

function buildParams(overrides: Partial<UseDistanceSubmissionParams> = {}): UseDistanceSubmissionParams {
    const transaction = buildTransaction({iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL});
    return {
        transaction,
        transactions: [transaction],
        receiptFiles: {},
        report: buildChatReport(),
        reportDrafts: {},
        policy: createMock<Policy>({id: 'policy-1'}),
        policyCategories: {},
        personalDetails: {},
        currentUserPersonalDetails: CURRENT_USER_PERSONAL_DETAILS,
        selectedParticipants: [OTHER_USER_PARTICIPANT],
        iouType: CONST.IOU.TYPE.SUBMIT,
        isGPSDistanceRequest: false,
        isManualDistanceRequest: false,
        isOdometerDistanceRequest: false,
        draftTransactionIDs: [DRAFT_ID],
        isSelfDMDestination: false,
        action: CONST.IOU.ACTION.CREATE,
        ...NO_TAX_VALUES,
        ...overrides,
    };
}

function submit(params: UseDistanceSubmissionParams) {
    return renderAndSubmit(() => useDistanceSubmission(params), true);
}

function buildCommuterExclusionTransaction(commuterExclusion: number) {
    return buildTransaction({
        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL,
        modifiedAmount: 80,
        modifiedMerchant: '8 mi @ $0.50 / mi',
        comment: {comment: '', customUnit: {commuterExclusion, reimbursableDistance: 8, distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES}},
    });
}

function getSubmittedTransactionParams() {
    return mockPlanDistanceRequest.mock.calls.at(-1)?.at(0)?.transactionParams;
}

describe('useDistanceSubmission', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        mockPlanDistanceRequest.mockReturnValue(
            createMock<ReturnType<typeof planDistanceRequest>>({
                iouReport: buildChatReport({reportID: 'distance-iou-1'}),
                chatReportID: 'distance-chat-1',
                transactionID: 'distance-transaction-1',
            }),
        );
    });

    it('omits the modified fields when no commuter exclusion is applied', async () => {
        // Given a distance expense with old modified values and no commuter exclusion
        const distanceTransaction = buildCommuterExclusionTransaction(0);

        // When it is submitted
        await submit(buildParams({transaction: distanceTransaction, transactions: [distanceTransaction], isManualDistanceRequest: true}));

        // Then the old values are not sent, so they can't override the server's amount
        const transactionParams = getSubmittedTransactionParams();
        expect(transactionParams).not.toHaveProperty('modifiedAmount');
        expect(transactionParams).not.toHaveProperty('modifiedMerchant');
    });

    it('sends the modified fields when a commuter exclusion is applied', async () => {
        // Given a distance expense whose modified values come from a commuter exclusion
        const distanceTransaction = buildCommuterExclusionTransaction(2);

        // When it is submitted
        await submit(buildParams({transaction: distanceTransaction, transactions: [distanceTransaction], isManualDistanceRequest: true}));

        // Then the modified values are sent
        expect(getSubmittedTransactionParams()).toEqual(expect.objectContaining({modifiedAmount: 80, modifiedMerchant: '8 mi @ $0.50 / mi'}));
    });

    it('uses the transaction report ID for a brand-new P2P recipient even when a page-level report is still set', async () => {
        // Given a distance expense whose brand-new P2P recipient already reserved an optimistic report ID,
        // while the page-level report still points at the flow's origin report
        const optimisticP2PReportID = 'reused-p2p-distance-1';
        const distanceTransaction = buildTransaction({reportID: optimisticP2PReportID, iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL});

        // When the distance request is submitted
        await submit(buildParams({transaction: distanceTransaction, transactions: [distanceTransaction], isManualDistanceRequest: true}));

        // Then the reserved ID is forwarded, so the chat is built at the ID the screen subscribes to
        expect(mockPlanDistanceRequest).toHaveBeenCalledWith(expect.objectContaining({optimisticChatReportID: optimisticP2PReportID}));
    });

    it('sends the overridden distance when submitting a map distance expense through CreateDistanceRequest', async () => {
        // Given a map distance draft whose quantity the user replaced on the Manual tab, sent to another person through CreateDistanceRequest
        const mapDistance = buildOverriddenMapDistanceTransaction();

        // When the expense is submitted
        await submit(buildParams({transaction: mapDistance, transactions: [mapDistance]}));

        // Then the typed distance is sent under the map type, the same shape the track path stores
        expect(getSubmittedTransactionParams()).toEqual(
            expect.objectContaining({
                distance: 29,
                distanceRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
            }),
        );
    });

    it('sends the manual distance when the map route has not been fetched yet', async () => {
        // Given a map draft picked offline, so it carries a typed quantity but no route to compare it against
        const mapDistance = buildTransaction({
            iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
            comment: {
                customUnit: {quantity: 1, distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                waypoints: {
                    waypoint0: {address: 'Aspen', lat: 39.1911, lng: -106.8175},
                    waypoint1: {address: 'Breckenridge', lat: 39.4817, lng: -106.0384},
                },
            },
        });

        // When the expense is submitted
        await submit(buildParams({transaction: mapDistance, transactions: [mapDistance]}));

        // Then the quantity is still treated as an override, because offline a map draft can only get one from the Manual tab,
        // otherwise the queued request would carry no distance and the server would use the route
        expect(getSubmittedTransactionParams()).toEqual(
            expect.objectContaining({
                distance: 1,
                distanceRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
            }),
        );
    });

    it('navigates to the chat its plan writes to instead of resolving the chat again', async () => {
        // Given a distance expense whose plan names the chat it writes to
        const distanceTransaction = buildTransaction({iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL});

        // When it is submitted from the confirmation page, leaving navigation to cleanup
        await submit(buildParams({transaction: distanceTransaction, transactions: [distanceTransaction], isManualDistanceRequest: true}));

        // Then cleanup opens that chat, because only the planner knows which chat it found or built, such as a workspace chat
        expect(mockResolveChatTargetForSubmitCleanup).not.toHaveBeenCalled();
        expect(mockCleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledWith(expect.objectContaining({optimisticChatReportID: 'distance-chat-1'}));
    });

    it('commits the plan it built and gives cleanup the transaction ID from that plan', async () => {
        // Given a distance expense, which the plan writes under a new transaction ID rather than the draft's
        const distanceTransaction = buildTransaction({iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL});

        // When it is submitted from the confirmation page, leaving navigation to cleanup
        await submit(buildParams({transaction: distanceTransaction, transactions: [distanceTransaction], isManualDistanceRequest: true}));

        // Then the plan that is written is the one cleanup reads, so the highlight and growl target the transaction that was written
        expect(mockCommitDistanceRequest).toHaveBeenCalledWith(mockPlanDistanceRequest.mock.results.at(0)?.value, undefined);
        expect(mockCleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledWith(expect.objectContaining({transactionID: 'distance-transaction-1'}));
    });

    it('passes the write barrier from the caller to the commit', async () => {
        // Given a distance expense submitted after the screen started navigating, so the caller hands in a barrier
        const writeBarrier: WriteReadyBarrier = () => Promise.resolve();
        const distanceTransaction = buildTransaction({iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL});
        const {result} = renderHook(() => useDistanceSubmission(buildParams({transaction: distanceTransaction, transactions: [distanceTransaction], isManualDistanceRequest: true})));
        await waitForBatchedUpdatesWithAct();

        // When it is submitted with that barrier
        await act(async () => {
            result.current.createTransaction({locationPermissionGranted: false, shouldHandleNavigation: false, writeBarrier});
        });

        // Then the write waits on it, so it doesn't land in the middle of the transition
        expect(mockCommitDistanceRequest).toHaveBeenCalledWith(expect.anything(), writeBarrier);
    });
});
