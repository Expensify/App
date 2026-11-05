import {act, renderHook} from '@testing-library/react-native';

import useResetIOUType from '@hooks/useResetIOUType';

import {initMoneyRequest} from '@userActions/IOU/MoneyRequest';
import type * as MoneyRequestActions from '@userActions/IOU/MoneyRequest';
import type * as TransactionActions from '@userActions/Transaction';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

import type * as ReactNavigation from '@react-navigation/native';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const WORKSPACE_POLICY_ID = 'workspacePolicy1';
const WORKSPACE_CHAT_REPORT_ID = '100';

const workspacePolicy: Policy = {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), id: WORKSPACE_POLICY_ID, outputCurrency: 'GBP'};
const mockPersonalPolicy = {id: 'personalPolicy1', type: CONST.POLICY.TYPE.PERSONAL, autoReporting: true, outputCurrency: 'USD'};

const workspaceChatParticipant: Participant = {
    accountID: 0,
    reportID: WORKSPACE_CHAT_REPORT_ID,
    isPolicyExpenseChat: true,
    selected: true,
    policyID: WORKSPACE_POLICY_ID,
    isSelfDM: false,
};
const selfDMParticipant: Participant = {accountID: 0, reportID: '200', isPolicyExpenseChat: false, selected: true, isSelfDM: true};

let mockDefaultParticipants: Participant[] = [];
let mockDefaultPolicy: Policy | undefined;

jest.mock('@hooks/useDefaultParticipants', () => ({
    __esModule: true,
    default: () => ({participants: mockDefaultParticipants, defaultPolicy: mockDefaultPolicy, isLoading: false}),
}));

jest.mock('@hooks/usePersonalPolicy', () => ({
    __esModule: true,
    default: () => mockPersonalPolicy,
}));

jest.mock('@hooks/useOdometerDraftHydrator', () => ({
    __esModule: true,
    default: () => jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigation>('@react-navigation/native'),
    useFocusEffect: jest.fn(),
}));

jest.mock('@userActions/IOU/MoneyRequest', () => ({
    ...jest.requireActual<typeof MoneyRequestActions>('@userActions/IOU/MoneyRequest'),
    initMoneyRequest: jest.fn(),
}));

jest.mock('@userActions/Transaction', () => ({
    ...jest.requireActual<typeof TransactionActions>('@userActions/Transaction'),
    setTransactionReport: jest.fn(),
}));

const mockedInitMoneyRequest = jest.mocked(initMoneyRequest);

async function selectManualTabFromGlobalCreate() {
    const {result} = renderHook(() =>
        useResetIOUType({
            reportID: '1',
            report: undefined,
            transaction: undefined,
            transactionRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            iouType: CONST.IOU.TYPE.CREATE,
            policy: undefined,
        }),
    );
    await act(waitForBatchedUpdates);
    act(() => result.current(CONST.IOU.REQUEST_TYPE.MANUAL));
}

describe('useResetIOUType', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockedInitMoneyRequest.mockClear();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('passes the default workspace policy to initMoneyRequest when the expense starts from global create', async () => {
        // Given an expense started from global create (no report) whose default participant is a GBP workspace chat
        mockDefaultParticipants = [workspaceChatParticipant];
        mockDefaultPolicy = workspacePolicy;

        // When the member selects the Manual tab
        await selectManualTabFromGlobalCreate();

        // Then the draft is built with the workspace policy, so its currency is the workspace currency (GBP) and not the Payment currency (USD)
        expect(mockedInitMoneyRequest).toHaveBeenCalledTimes(1);
        expect(mockedInitMoneyRequest.mock.calls.at(0)?.at(0)?.policy?.outputCurrency).toBe('GBP');
    });

    it('passes no policy to initMoneyRequest when the default participant is the self DM', async () => {
        // Given an expense started from global create whose default participant is the self DM
        mockDefaultParticipants = [selfDMParticipant];
        mockDefaultPolicy = undefined;

        // When the member selects the Manual tab
        await selectManualTabFromGlobalCreate();

        // Then no workspace policy is passed, so the draft keeps the Payment currency from the personal policy
        expect(mockedInitMoneyRequest).toHaveBeenCalledTimes(1);
        expect(mockedInitMoneyRequest.mock.calls.at(0)?.at(0)?.policy).toBeUndefined();
    });
});
