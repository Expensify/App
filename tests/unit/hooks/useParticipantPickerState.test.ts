import {act, renderHook} from '@testing-library/react-native';

import type useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';

import type {IOURequestStepConfirmationProps} from '@pages/iou/request/step/IOURequestStepConfirmation/types';
import useParticipantPickerState from '@pages/iou/request/step/IOURequestStepConfirmation/useParticipantPickerState';

import {setMoneyRequestCurrency, setMoneyRequestParticipants} from '@userActions/IOU/MoneyRequest';
import type * as MoneyRequestActions from '@userActions/IOU/MoneyRequest';
import type * as TransactionActions from '@userActions/Transaction';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Transaction} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const TRANSACTION_ID = 'txn1';
const REPORT_ID = '1';
const WORKSPACE_POLICY_ID = 'workspacePolicy1';

const workspacePolicy: Policy = {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), id: WORKSPACE_POLICY_ID, outputCurrency: 'GBP'};
const mockPersonalPolicy = {id: 'personalPolicy1', type: CONST.POLICY.TYPE.PERSONAL, outputCurrency: 'USD'};

const workspaceChatParticipant: Participant = {
    accountID: 0,
    reportID: '100',
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

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({
        getCurrencyDecimals: () => 2,
    }),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: 1, login: 'test@test.com'}),
}));

jest.mock('@hooks/usePersonalPolicy', () => ({
    __esModule: true,
    default: () => mockPersonalPolicy,
}));

jest.mock('@hooks/usePolicyForMovingExpenses', () => ({
    __esModule: true,
    default: () => ({policyForMovingExpenses: undefined}),
}));

jest.mock('@hooks/useSelfDMReport', () => ({
    __esModule: true,
    default: () => undefined,
}));

jest.mock('@userActions/IOU/MoneyRequest', () => ({
    ...jest.requireActual<typeof MoneyRequestActions>('@userActions/IOU/MoneyRequest'),
    setMoneyRequestCurrency: jest.fn(),
    setMoneyRequestParticipants: jest.fn(),
}));

jest.mock('@userActions/Transaction', () => ({
    ...jest.requireActual<typeof TransactionActions>('@userActions/Transaction'),
    setTransactionReport: jest.fn(),
}));

const mockedSetMoneyRequestCurrency = jest.mocked(setMoneyRequestCurrency);
const mockedSetMoneyRequestParticipants = jest.mocked(setMoneyRequestParticipants);

const navigation = createMock<IOURequestStepConfirmationProps['navigation']>({addListener: jest.fn(() => jest.fn()), setParams: jest.fn()});
const blockDistanceRequestIfNeeded: ReturnType<typeof useBlockDistanceRequest> = jest.fn(() => false);

// A draft started from global create before its participants are known, so it still holds the member's Payment currency.
function createDraftWithoutParticipants(overrides: Partial<Transaction> = {}): Transaction {
    return {
        transactionID: TRANSACTION_ID,
        reportID: REPORT_ID,
        amount: 0,
        currency: 'USD',
        created: '2026-01-15',
        merchant: '',
        comment: {},
        participants: [],
        isFromGlobalCreate: true,
        iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
        ...overrides,
    };
}

async function renderParticipantPickerState(transaction: Transaction) {
    renderHook(() =>
        useParticipantPickerState({
            transaction,
            transactions: [transaction],
            iouType: CONST.IOU.TYPE.CREATE,
            reportID: REPORT_ID,
            reportDrafts: undefined,
            navigation,
            policyID: undefined,
            isDistanceRequest: transaction.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE,
            isManualRequest: transaction.iouRequestType === CONST.IOU.REQUEST_TYPE.MANUAL,
            blockDistanceRequestIfNeeded,
        }),
    );
    await act(waitForBatchedUpdates);
}

describe('useParticipantPickerState', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockDefaultParticipants = [workspaceChatParticipant];
        mockDefaultPolicy = workspacePolicy;
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('switches the draft to the default workspace currency when it auto-assigns the workspace chat', async () => {
        // Given a participant-less USD draft whose default participant is a GBP workspace chat
        // When the confirmation auto-assigns the default participant
        await renderParticipantPickerState(createDraftWithoutParticipants());

        // Then the workspace chat is assigned and the draft currency is corrected to the workspace currency
        expect(mockedSetMoneyRequestParticipants).toHaveBeenCalledWith(TRANSACTION_ID, [workspaceChatParticipant]);
        expect(mockedSetMoneyRequestCurrency).toHaveBeenCalledTimes(1);
        expect(mockedSetMoneyRequestCurrency).toHaveBeenCalledWith(TRANSACTION_ID, 'GBP');
    });

    it('keeps the draft currency when an amount was already entered', async () => {
        // Given a draft where the member already entered an amount in their chosen currency
        // When the confirmation auto-assigns the default participant
        await renderParticipantPickerState(createDraftWithoutParticipants({amount: 1000, isAmountSet: true}));

        // Then the participants are still assigned, but the currency the member chose is left alone
        expect(mockedSetMoneyRequestParticipants).toHaveBeenCalledWith(TRANSACTION_ID, [workspaceChatParticipant]);
        expect(mockedSetMoneyRequestCurrency).not.toHaveBeenCalled();
    });

    it('keeps the draft currency for distance requests', async () => {
        // Given a distance draft, whose currency comes from the selected mileage rate
        // When the confirmation auto-assigns the default participant
        await renderParticipantPickerState(createDraftWithoutParticipants({iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE}));

        // Then the currency is not overwritten with the workspace output currency
        expect(mockedSetMoneyRequestCurrency).not.toHaveBeenCalled();
    });

    it('keeps the draft currency for per diem requests', async () => {
        // Given a per diem draft, whose currency comes from the destination and which never sets isAmountSet
        // When the confirmation auto-assigns the default participant
        await renderParticipantPickerState(createDraftWithoutParticipants({iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM}));

        // Then the currency is not overwritten with the workspace output currency
        expect(mockedSetMoneyRequestCurrency).not.toHaveBeenCalled();
    });

    it('does not set the currency when the draft already uses the workspace currency', async () => {
        // Given a draft that already uses the workspace currency
        // When the confirmation auto-assigns the default participant
        await renderParticipantPickerState(createDraftWithoutParticipants({currency: 'GBP'}));

        // Then no redundant currency update is written
        expect(mockedSetMoneyRequestCurrency).not.toHaveBeenCalled();
    });

    it('keeps the Payment currency when the default participant is the self DM', async () => {
        // Given a draft whose default participant is the self DM, which has no workspace
        mockDefaultParticipants = [selfDMParticipant];
        mockDefaultPolicy = undefined;

        // When the confirmation auto-assigns the default participant
        await renderParticipantPickerState(createDraftWithoutParticipants());

        // Then the self DM is assigned and the draft keeps the member's Payment currency
        expect(mockedSetMoneyRequestParticipants).toHaveBeenCalledWith(TRANSACTION_ID, [selfDMParticipant]);
        expect(mockedSetMoneyRequestCurrency).not.toHaveBeenCalled();
    });
});
