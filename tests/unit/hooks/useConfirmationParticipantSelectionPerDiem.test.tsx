import {act, renderHook} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useConfirmationParticipantSelection from '@hooks/useConfirmationParticipantSelection';

import {setMoneyRequestCategory} from '@userActions/IOU/MoneyRequest';
import {resetPerDiemCustomUnit} from '@userActions/IOU/PerDiem';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Transaction} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

import type {ReactNode} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const TRANSACTION_ID = 'transaction-1';
const SOURCE_POLICY_ID = 'source-policy';
const DESTINATION_POLICY_ID = 'destination-policy';
const DESTINATION_CHAT_REPORT_ID = 'destination-chat';
const DESTINATION_UNIT_ID = 'destination-per-diem-unit';
const DESTINATION_CATEGORY = 'Per diem';

const mockTransaction: Transaction = {
    transactionID: TRANSACTION_ID,
    reportID: 'source-chat',
    amount: 0,
    currency: CONST.CURRENCY.USD,
    created: '',
    merchant: '',
    iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
    isFromGlobalCreate: true,
    comment: {
        customUnit: {
            customUnitID: 'source-per-diem-unit',
            customUnitRateID: 'source-destination',
            name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
        },
    },
} as Transaction;

// The hook updates every receipt of a multi-scan batch. A per diem expense is a single one.
jest.mock('@hooks/useOptimisticDraftTransactions', () => () => [[mockTransaction]]);

jest.mock('@userActions/IOU/PerDiem', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/IOU/PerDiem'),
    resetPerDiemCustomUnit: jest.fn(),
}));

jest.mock('@userActions/IOU/MoneyRequest', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/IOU/MoneyRequest'),
    setMoneyRequestCategory: jest.fn(),
    setMoneyRequestTag: jest.fn(),
    setMoneyRequestParticipants: jest.fn(),
}));

function createDestinationPolicy(): Policy {
    return {
        ...createRandomPolicy(2, CONST.POLICY.TYPE.CORPORATE, 'Destination'),
        id: DESTINATION_POLICY_ID,
        customUnits: {
            [DESTINATION_UNIT_ID]: {
                customUnitID: DESTINATION_UNIT_ID,
                name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                enabled: true,
                defaultCategory: DESTINATION_CATEGORY,
                rates: {},
            },
        },
    };
}

function createWorkspaceParticipant(policyID: string): Participant {
    return {accountID: 0, reportID: DESTINATION_CHAT_REPORT_ID, policyID, isPolicyExpenseChat: true, selected: true};
}

function renderSelection() {
    return renderHook(
        () =>
            useConfirmationParticipantSelection({
                transaction: mockTransaction,
                iouType: CONST.IOU.TYPE.CREATE,
                reportID: 'source-chat',
                policyID: SOURCE_POLICY_ID,
                isDistanceRequest: false,
                blockDistanceRequestIfNeeded: () => false,
                onIOUTypeChange: jest.fn(),
            }),
        {
            wrapper: ({children}: {children: ReactNode}) => (
                <OnyxListItemProvider>
                    <CurrentUserPersonalDetailsProvider>{children}</CurrentUserPersonalDetailsProvider>
                </OnyxListItemProvider>
            ),
        },
    );
}

describe('useConfirmationParticipantSelection for per diem', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('starts the per diem form over on the new workspace when the expense moves to another workspace', async () => {
        // Given a per diem expense with a destination picked from the source workspace's rates
        const {result} = renderSelection();

        // When another workspace with per diem is picked in the "To" row
        act(() => {
            result.current.handleParticipantsAdded([createWorkspaceParticipant(DESTINATION_POLICY_ID)], createDestinationPolicy());
        });
        await waitForBatchedUpdatesWithAct();

        // Then the draft moves to the new workspace's per diem unit, which clears the destination and subrates the old
        // workspace's rates were picked from, and the category becomes the new unit's default
        expect(resetPerDiemCustomUnit).toHaveBeenCalledWith(TRANSACTION_ID, DESTINATION_UNIT_ID);
        expect(setMoneyRequestCategory).toHaveBeenCalledWith(TRANSACTION_ID, DESTINATION_CATEGORY, undefined, expect.any(Function));
    });

    it('keeps the per diem form when the same workspace is picked again', async () => {
        // Given a per diem expense on the source workspace
        const {result} = renderSelection();

        // When the same workspace is picked again
        act(() => {
            result.current.handleParticipantsAdded([createWorkspaceParticipant(SOURCE_POLICY_ID)], createDestinationPolicy());
        });
        await waitForBatchedUpdatesWithAct();

        // Then nothing the user filled in is cleared, since the rates still apply
        expect(resetPerDiemCustomUnit).not.toHaveBeenCalled();
    });
});
