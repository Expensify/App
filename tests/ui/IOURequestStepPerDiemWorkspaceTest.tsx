import {act, render} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useRequestStepWorkspaceList from '@hooks/useRequestStepWorkspaceList';

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
                            params: {action: CONST.IOU.ACTION.CREATE, iouType: CONST.IOU.TYPE.CREATE, transactionID: TRANSACTION_ID, reportID: '1'},
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
        await act(async () => {
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.POLICY}${POLICY_A_ID}`]: createPerDiemPolicy(POLICY_A_ID, UNIT_A_ID),
                [`${ONYXKEYS.COLLECTION.POLICY}${POLICY_B_ID}`]: createPerDiemPolicy(POLICY_B_ID, UNIT_B_ID),
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: createPolicyExpenseChat('1', POLICY_A_ID),
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: createPolicyExpenseChat('2', POLICY_B_ID),
            });
        });
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
});
