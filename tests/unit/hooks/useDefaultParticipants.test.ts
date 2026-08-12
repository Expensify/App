import {renderHook} from '@testing-library/react-native';

import useDefaultParticipants from '@hooks/useDefaultParticipants';

import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomTransaction from '../../utils/collections/transaction';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const ACCOUNT_ID = 1;
const POLICY_ID = 'policy1';

const mockSelfDMReport = {
    reportID: 'selfDM1',
    type: CONST.REPORT.TYPE.CHAT,
    chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
} as Report;

const workspaceChat = {
    reportID: 'workspaceChat1',
    type: CONST.REPORT.TYPE.CHAT,
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
    policyID: POLICY_ID,
    ownerAccountID: ACCOUNT_ID,
} as Report;

// Auto-reporting is on, so without the track-expense carve-out the default target resolves to the workspace chat.
const mockDefaultExpensePolicy = {
    id: POLICY_ID,
    type: CONST.POLICY.TYPE.TEAM,
    isPolicyExpenseChatEnabled: true,
    autoReporting: true,
};

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: 1, login: 'test@test.com'}),
}));

jest.mock('@hooks/useDefaultExpensePolicy', () => ({
    __esModule: true,
    default: () => mockDefaultExpensePolicy,
}));

jest.mock('@hooks/usePersonalPolicy', () => ({
    __esModule: true,
    default: () => undefined,
}));

// The hook only reads billing NVPs through useOnyx, none of which are set in these scenarios. Stubbing them keeps the
// render synchronous instead of settling Onyx subscriptions after the assertions.
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [undefined, {status: 'loaded'}],
}));

jest.mock('@hooks/useSelfDMReport', () => ({
    __esModule: true,
    default: () => mockSelfDMReport,
}));

const globalCreateTransaction: Transaction = {...createRandomTransaction(1), isFromGlobalCreate: true};

function renderDefaultParticipants(iouType: IOUType, transaction: Transaction = globalCreateTransaction, isNewManualExpenseFlowEnabled = true) {
    return renderHook(() => useDefaultParticipants({sourceReport: undefined, transaction, iouType, isNewManualExpenseFlowEnabled})).result.current.participants;
}

describe('useDefaultParticipants', () => {
    beforeAll(async () => {
        // `getPolicyExpenseChat` scans the report collection, so the default workspace chat has to exist in Onyx.
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${workspaceChat.reportID}`, workspaceChat);
        await waitForBatchedUpdates();
    });

    it('should seed the default workspace chat for a global create expense', () => {
        const participants = renderDefaultParticipants(CONST.IOU.TYPE.CREATE);

        expect(participants).toEqual([expect.objectContaining({reportID: workspaceChat.reportID, policyID: POLICY_ID, isPolicyExpenseChat: true, selected: true})]);
    });

    it('should seed the self DM for a track expense instead of the default workspace chat', () => {
        const participants = renderDefaultParticipants(CONST.IOU.TYPE.TRACK);

        expect(participants).toEqual([expect.objectContaining({reportID: mockSelfDMReport.reportID, isSelfDM: true, selected: true})]);
    });

    it('should not seed anything when the expense is not started from global create', () => {
        const participants = renderDefaultParticipants(CONST.IOU.TYPE.TRACK, {...createRandomTransaction(1), isFromGlobalCreate: false});

        expect(participants).toEqual([]);
    });

    it('should not seed anything when the new manual expense flow beta is disabled', () => {
        const participants = renderDefaultParticipants(CONST.IOU.TYPE.TRACK, globalCreateTransaction, false);

        expect(participants).toEqual([]);
    });
});
