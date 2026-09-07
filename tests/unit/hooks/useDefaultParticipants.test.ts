import {act, renderHook} from '@testing-library/react-native';

import useDefaultParticipants from '@hooks/useDefaultParticipants';
import type {ResolvedSelfDMReport} from '@hooks/useSelfDMReport';

import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import {createPolicyExpenseChat, createSelfDM} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const ACCOUNT_ID = 1;
const POLICY_ID = 'policy1';

const mockSelfDMReport: Report = createSelfDM(1, ACCOUNT_ID);

const workspaceChat: Report = {...createPolicyExpenseChat(2), policyID: POLICY_ID, ownerAccountID: ACCOUNT_ID};

// Auto-reporting is on, so without the track-expense carve-out the default target resolves to the workspace chat.
const mockDefaultExpensePolicy: Policy = {...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM), id: POLICY_ID, autoReporting: true};

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: ACCOUNT_ID, login: 'test@test.com'}),
}));

jest.mock('@hooks/useDefaultExpensePolicy', () => ({
    __esModule: true,
    default: () => mockDefaultExpensePolicy,
}));

jest.mock('@hooks/usePersonalPolicy', () => ({
    __esModule: true,
    default: () => undefined,
}));

let mockResolvedSelfDMReport: ResolvedSelfDMReport = {selfDMReport: mockSelfDMReport, isLoading: false};

jest.mock('@hooks/useSelfDMReport', () => ({
    __esModule: true,
    default: () => mockSelfDMReport,
    useResolvedSelfDMReport: () => mockResolvedSelfDMReport,
}));

const globalCreateTransaction: Transaction = {...createRandomTransaction(1), isFromGlobalCreate: true};

function renderDefaultParticipantsHook(iouType: IOUType, transaction: Transaction = globalCreateTransaction, isNewManualExpenseFlowEnabled = true) {
    return renderHook(() => useDefaultParticipants({sourceReport: undefined, transaction, iouType, isNewManualExpenseFlowEnabled}));
}

// The hook reads the billing NVPs through `useOnyx`, so the result is only settled once those subscriptions have.
async function renderDefaultParticipantsResult(iouType: IOUType, transaction: Transaction = globalCreateTransaction, isNewManualExpenseFlowEnabled = true) {
    const {result} = renderDefaultParticipantsHook(iouType, transaction, isNewManualExpenseFlowEnabled);
    await act(waitForBatchedUpdates);
    return result.current;
}

async function renderDefaultParticipants(iouType: IOUType, transaction: Transaction = globalCreateTransaction, isNewManualExpenseFlowEnabled = true) {
    return (await renderDefaultParticipantsResult(iouType, transaction, isNewManualExpenseFlowEnabled)).participants;
}

describe('useDefaultParticipants', () => {
    beforeEach(() => {
        mockResolvedSelfDMReport = {selfDMReport: mockSelfDMReport, isLoading: false};
    });

    beforeAll(async () => {
        // `getPolicyExpenseChat` scans the report collection, so the default workspace chat has to exist in Onyx.
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${workspaceChat.reportID}`, workspaceChat);
        await waitForBatchedUpdates();
    });

    it('should seed the default workspace chat for a global create expense', async () => {
        const participants = await renderDefaultParticipants(CONST.IOU.TYPE.CREATE);

        expect(participants).toEqual([expect.objectContaining({reportID: workspaceChat.reportID, policyID: POLICY_ID, isPolicyExpenseChat: true, selected: true})]);
    });

    it('should seed the self DM for a track expense instead of the default workspace chat', async () => {
        const participants = await renderDefaultParticipants(CONST.IOU.TYPE.TRACK);

        expect(participants).toEqual([expect.objectContaining({reportID: mockSelfDMReport.reportID, isSelfDM: true, selected: true})]);
    });

    it('should not seed a track expense until the real self DM resolves', async () => {
        // `useSelfDMReport` would hand back an optimistic report with a randomly generated reportID here, which must
        // never reach the transaction's participants. Report loading instead so callers wait.
        mockResolvedSelfDMReport = {selfDMReport: undefined, isLoading: true};

        const {participants, isLoading} = await renderDefaultParticipantsResult(CONST.IOU.TYPE.TRACK);

        expect(participants).toEqual([]);
        expect(isLoading).toBe(true);
    });

    it('should report loading until the billing NVPs the default policy check depends on resolve', async () => {
        // Starting the merge without awaiting it leaves a pending merge on the key, which `useOnyx` reports as loading.
        const pendingAmountOwed = Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 0);

        const {result} = renderDefaultParticipantsHook(CONST.IOU.TYPE.CREATE);

        expect(result.current.isLoading).toBe(true);

        await act(async () => {
            await pendingAmountOwed;
            await waitForBatchedUpdates();
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.participants).toEqual([expect.objectContaining({reportID: workspaceChat.reportID, selected: true})]);
    });

    it('should not seed anything when the expense is not started from global create', async () => {
        const participants = await renderDefaultParticipants(CONST.IOU.TYPE.TRACK, {...createRandomTransaction(1), isFromGlobalCreate: false});

        expect(participants).toEqual([]);
    });

    it('should not seed anything when the new manual expense flow beta is disabled', async () => {
        const participants = await renderDefaultParticipants(CONST.IOU.TYPE.TRACK, globalCreateTransaction, false);

        expect(participants).toEqual([]);
    });
});
