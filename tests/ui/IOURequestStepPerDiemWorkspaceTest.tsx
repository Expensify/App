import {act, render, waitFor} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SelectionList from '@components/SelectionList';

import useRequestStepWorkspaceList from '@hooks/useRequestStepWorkspaceList';

import {fetchPerDiemRates} from '@libs/actions/Policy/PerDiem';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';

import {IOURequestStepPerDiemWorkspaceContent as IOURequestStepPerDiemWorkspace} from '@pages/iou/request/step/IOURequestStepPerDiemWorkspace';

import {setCustomUnitID} from '@userActions/IOU/MoneyRequest';
import {resetPerDiemCustomUnit} from '@userActions/IOU/PerDiem';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy, Report, Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import {createRandomReport} from '../utils/collections/reports';
import createMock from '../utils/createMock';
import {signInWithTestUser} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// The list and its hook have their own tests. The hook stub only hands the page's select handler back to the test.
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@hooks/useRequestStepWorkspaceList', () => jest.fn());

// The workspace chats are looked up from a report cache filled outside of render, so the test hands them over directly
const mockPolicyExpenseChats: Record<string, Report> = {};
jest.mock('@libs/ReportUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/ReportUtils'),
    getPolicyExpenseChat: jest.fn((_ownerAccountID: number | undefined, policyID: string | undefined) => (policyID ? mockPolicyExpenseChats[policyID] : undefined)),
    findSelfDMReportID: jest.fn(() => 'self-dm'),
}));

// The test plays the server's part by setting the loading flag and the workspace's per diem unit itself
jest.mock('@libs/actions/Policy/PerDiem', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/Policy/PerDiem'),
    fetchPerDiemRates: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
}));

jest.mock('@userActions/IOU/MoneyRequest', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/IOU/MoneyRequest'),
    setCustomUnitID: jest.fn(),
    setMoneyRequestCategory: jest.fn(),
    setMoneyRequestParticipants: jest.fn(),
    setMoneyRequestParticipantsFromReport: jest.fn(),
}));

jest.mock('@userActions/IOU/PerDiem', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/IOU/PerDiem'),
    resetPerDiemCustomUnit: jest.fn(),
}));

jest.mock('@userActions/Transaction', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/Transaction'),
    setTransactionReport: jest.fn(),
}));

const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'test@user.com';
const TRANSACTION_ID = CONST.IOU.OPTIMISTIC_TRANSACTION_ID;
const POLICY_A_ID = 'policy-a';
const POLICY_B_ID = 'policy-b';
const UNIT_A_ID = 'per-diem-unit-a';
const UNIT_B_ID = 'per-diem-unit-b';
const SELF_DM_REPORT_ID = 'self-dm';

function createPerDiemPolicy(id: string, customUnitID: string): Policy {
    return {
        ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE, id),
        id,
        customUnits: {
            [customUnitID]: {
                customUnitID,
                name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                enabled: true,
                rates: {},
            },
        },
    };
}

function createPolicyExpenseChat(reportID: string, policyID: string): Report {
    return {
        ...createRandomReport(Number(reportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
        reportID,
        policyID,
        type: CONST.REPORT.TYPE.CHAT,
        parentReportID: undefined,
        parentReportActionID: undefined,
        ownerAccountID: ACCOUNT_ID,
        isOwnPolicyExpenseChat: true,
    };
}

/** A draft already filled in for workspace A, with a destination and a subrate from A's rates */
function createDraftFilledForWorkspaceA(): Transaction {
    return {
        transactionID: TRANSACTION_ID,
        reportID: '1',
        amount: 0,
        currency: CONST.CURRENCY.USD,
        created: '',
        merchant: '',
        iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
        participants: [{policyID: POLICY_A_ID, isPolicyExpenseChat: true, selected: true, reportID: '1'}],
        comment: {
            customUnit: {
                customUnitID: UNIT_A_ID,
                customUnitRateID: 'rate-a',
                name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                subRates: [{id: 'subrate-a', name: 'Breakfast', quantity: 1, rate: 10}],
            },
        },
    };
}

/** Workspace A before its per diem rates are loaded, so it has no per diem unit yet */
function createPolicyWithoutRates(id: string): Policy {
    return {...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE, id), id, customUnits: {}};
}

/** A draft from global create without auto reporting, filled in for workspace A while it sits on the self DM */
function createSelfDMDraftFilledForWorkspaceA(): Transaction {
    return {
        ...createDraftFilledForWorkspaceA(),
        reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
        isFromGlobalCreate: true,
        participants: [{accountID: ACCOUNT_ID, reportID: SELF_DM_REPORT_ID, selected: true}],
    };
}

/** A new draft that no workspace was picked for yet */
function createEmptyDraft(): Transaction {
    return {
        transactionID: TRANSACTION_ID,
        reportID: '1',
        amount: 0,
        currency: CONST.CURRENCY.USD,
        created: '',
        merchant: '',
        iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
    };
}

async function setPerDiemRatesLoading(isLoading: boolean) {
    await act(async () => {
        await Onyx.set(ONYXKEYS.RAM_ONLY_IS_LOADING_PER_DIEM_RATES, isLoading);
    });
    await waitForBatchedUpdatesWithAct();
}

async function setOffline(isOffline: boolean) {
    await act(async () => {
        await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: isOffline});
    });
    await waitForBatchedUpdatesWithAct();
}

type WorkspaceScreenProps = PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.CREATE>;

/** Renders the page and returns the handler it gives the workspace list, which runs when a workspace is confirmed */
async function renderPage(transaction: Transaction) {
    let onSelectWorkspace: ((policy: OnyxEntry<Policy>) => void) | undefined;
    jest.mocked(useRequestStepWorkspaceList).mockImplementation((params) => {
        onSelectWorkspace = params.onSelectWorkspace;
        return {
            initiallyFocusedKey: undefined,
            selectedPolicyID: undefined,
            workspaceOptions: [],
            filteredWorkspaceOptions: [],
            inputValue: '',
            setInputValue: jest.fn(),
            selectWorkspace: jest.fn(),
        };
    });

    render(
        <OnyxListItemProvider>
            <CurrentUserPersonalDetailsProvider>
                <LocaleContextProvider>
                    <IOURequestStepPerDiemWorkspace
                        route={createMock<WorkspaceScreenProps['route']>({
                            key: 'IOURequestStepPerDiemWorkspace',
                            name: SCREENS.MONEY_REQUEST.CREATE,
                            params: {iouType: CONST.IOU.TYPE.CREATE, transactionID: TRANSACTION_ID, reportID: '1'},
                        })}
                        navigation={createMock<WorkspaceScreenProps['navigation']>({})}
                        transaction={transaction}
                    />
                </LocaleContextProvider>
            </CurrentUserPersonalDetailsProvider>
        </OnyxListItemProvider>,
    );
    await waitForBatchedUpdatesWithAct();
    return (policy: OnyxEntry<Policy>) => act(() => onSelectWorkspace?.(policy));
}

describe('IOURequestStepPerDiemWorkspace', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);
        mockPolicyExpenseChats[POLICY_A_ID] = createPolicyExpenseChat('1', POLICY_A_ID);
        mockPolicyExpenseChats[POLICY_B_ID] = createPolicyExpenseChat('2', POLICY_B_ID);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('clears the destination and subrates when the user goes back and picks another workspace', async () => {
        // Given a draft filled in for workspace A
        const selectWorkspace = await renderPage(createDraftFilledForWorkspaceA());

        // When the user goes back to the workspace list and picks workspace B
        selectWorkspace(createPerDiemPolicy(POLICY_B_ID, UNIT_B_ID));
        await waitForBatchedUpdatesWithAct();

        // Then the draft moves to B's per diem unit with A's destination and subrates cleared, since they are A's rates
        expect(resetPerDiemCustomUnit).toHaveBeenCalledWith(TRANSACTION_ID, UNIT_B_ID);
        expect(setCustomUnitID).not.toHaveBeenCalled();
    });

    it('keeps the destination and subrates when the user picks the same workspace again', async () => {
        // Given a draft filled in for workspace A
        const selectWorkspace = await renderPage(createDraftFilledForWorkspaceA());

        // When the user goes back to the workspace list and confirms workspace A again
        selectWorkspace(createPerDiemPolicy(POLICY_A_ID, UNIT_A_ID));
        await waitForBatchedUpdatesWithAct();

        // Then what they filled in stays, since A's rates still apply
        expect(resetPerDiemCustomUnit).not.toHaveBeenCalled();
        expect(setCustomUnitID).toHaveBeenCalledWith(TRANSACTION_ID, UNIT_A_ID);
    });

    it('keeps the destination and subrates when the user picks the same workspace again for a draft on the self DM', async () => {
        // Given a draft from global create without auto reporting, filled in for workspace A, which sits on the self DM
        // so its participant has no policyID to tell the workspace from
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${SELF_DM_REPORT_ID}`, {
                reportID: SELF_DM_REPORT_ID,
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                type: CONST.REPORT.TYPE.CHAT,
            });
        });
        const selectWorkspace = await renderPage(createSelfDMDraftFilledForWorkspaceA());

        // When the user goes back to the workspace list and confirms workspace A again
        selectWorkspace(createPerDiemPolicy(POLICY_A_ID, UNIT_A_ID));
        await waitForBatchedUpdatesWithAct();

        // Then what they filled in stays, since the per diem unit still belongs to A
        expect(resetPerDiemCustomUnit).not.toHaveBeenCalled();
        expect(setCustomUnitID).toHaveBeenCalledWith(TRANSACTION_ID, UNIT_A_ID);
    });

    it('stops waiting on a workspace whose rates fetch failed', async () => {
        // Given a workspace whose per diem rates aren't loaded yet
        const policy = createPolicyWithoutRates(POLICY_A_ID);
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_A_ID}`, policy);
        });
        const selectWorkspace = await renderPage(createEmptyDraft());

        // When the user confirms it and the fetch for its rates ends without giving it a per diem unit
        selectWorkspace(policy);
        await setPerDiemRatesLoading(true);
        expect(fetchPerDiemRates).toHaveBeenCalledWith(POLICY_A_ID);
        jest.mocked(SelectionList).mockClear();
        await setPerDiemRatesLoading(false);

        // Then the list shows again so the user can pick a workspace
        expect(SelectionList).toHaveBeenCalled();

        // When the user goes offline
        jest.mocked(SelectionList).mockClear();
        await setOffline(true);

        // Then the list stays instead of the offline view, since the page no longer waits on that workspace
        expect(SelectionList).toHaveBeenCalled();

        // When the user comes back online and the workspace gets its rates some other way
        jest.mocked(fetchPerDiemRates).mockClear();
        await setOffline(false);
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_A_ID}`, createPerDiemPolicy(POLICY_A_ID, UNIT_A_ID));
        });
        await waitForBatchedUpdatesWithAct();

        // Then the page neither refetches nor opens that workspace, because the user may have marked another one by now
        expect(fetchPerDiemRates).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('fetches the rates again once back online and opens the workspace when they load', async () => {
        // Given the user is offline and picks a workspace whose per diem rates aren't loaded yet
        const policy = createPolicyWithoutRates(POLICY_A_ID);
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_A_ID}`, policy);
        });
        const selectWorkspace = await renderPage(createEmptyDraft());
        await setOffline(true);
        jest.mocked(SelectionList).mockClear();
        selectWorkspace(policy);
        await waitForBatchedUpdatesWithAct();

        // When the fetch is dropped because the user is offline
        await setPerDiemRatesLoading(true);
        await setPerDiemRatesLoading(false);

        // Then the page keeps waiting on the workspace rather than showing the list, since the rates were never asked for
        expect(SelectionList).not.toHaveBeenCalled();

        // When the user comes back online
        jest.mocked(fetchPerDiemRates).mockClear();
        await setOffline(false);

        // Then the rates are asked for again
        expect(fetchPerDiemRates).toHaveBeenCalledWith(POLICY_A_ID);

        // When they load
        await setPerDiemRatesLoading(true);
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_A_ID}`, createPerDiemPolicy(POLICY_A_ID, UNIT_A_ID));
        });
        await setPerDiemRatesLoading(false);

        // Then the draft moves to the workspace's per diem unit and the confirmation page opens
        await waitFor(() => expect(Navigation.navigate).toHaveBeenCalled());
        expect(resetPerDiemCustomUnit).toHaveBeenCalledWith(TRANSACTION_ID, UNIT_A_ID);
    });
});
