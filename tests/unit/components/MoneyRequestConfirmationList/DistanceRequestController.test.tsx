import {render} from '@testing-library/react-native';

import ConfirmationDataContext from '@components/MoneyRequestConfirmationList/ConfirmationDataContext';
import type {ConfirmationData} from '@components/MoneyRequestConfirmationList/ConfirmationDataContext';
import DistanceRequestController from '@components/MoneyRequestConfirmationList/DistanceRequestController';
import type useDistanceRequestState from '@components/MoneyRequestConfirmationList/hooks/useDistanceRequestState';

import DistanceRequestUtils from '@libs/DistanceRequestUtils';

import CONST from '@src/CONST';
import type {Policy, Transaction} from '@src/types/onyx';

import React from 'react';

import createMock from '../../../utils/createMock';

const mockSetMoneyRequestAmount = jest.fn();
const mockSetMoneyRequestCommuterExclusionFields = jest.fn();
const mockSetMoneyRequestMerchant = jest.fn();
const mockSetMoneyRequestPendingFields = jest.fn();

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({
        getCurrencySymbol: (currency: string) => (currency === 'USD' ? '$' : undefined),
    }),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: (key: string) => key,
        toLocaleDigit: (digit: string) => digit,
    }),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [undefined],
}));

jest.mock('@hooks/usePrevious', () => ({
    __esModule: true,
    default: () => undefined,
}));

jest.mock('@libs/actions/IOU/MoneyRequest', () => ({
    clearMoneyRequestRateAutoUpdated: jest.fn(),
    setCustomUnitRateID: jest.fn(),
    setMoneyRequestAmount: (...args: unknown[]) => {
        mockSetMoneyRequestAmount(...args);
    },
    setMoneyRequestCommuterExclusionFields: (...args: unknown[]) => {
        mockSetMoneyRequestCommuterExclusionFields(...args);
    },
    setMoneyRequestMerchant: (...args: unknown[]) => {
        mockSetMoneyRequestMerchant(...args);
    },
    setMoneyRequestPendingFields: (...args: unknown[]) => {
        mockSetMoneyRequestPendingFields(...args);
    },
}));

jest.mock('@libs/actions/IOU/Split', () => ({
    setSplitShares: jest.fn(),
}));

const transaction = createMock<Transaction>({
    transactionID: 'txn1',
    currency: CONST.CURRENCY.USD,
    comment: {customUnit: {}},
});

describe('DistanceRequestController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('updates the base distance merchant and delegates commuter fields to the commuter action', () => {
        // Given the confirmation data the controller reads from context, and the distance state it takes directly
        const confirmationData = createMock<ConfirmationData>({
            transactionID: 'txn1',
            transaction,
            policy: undefined,
            isDistanceRequest: true,
            isPolicyExpenseChat: false,
            isMovingTransactionFromTrackExpense: false,
            isReadOnly: false,
            isTypeSplit: false,
            customUnitRateID: '',
            currentUserAccountID: 1,
            selectedParticipants: [],
            selectedParticipantsProp: [],
            setFormError: jest.fn(),
            clearFormErrors: jest.fn(),
        });

        const distanceState = createMock<ReturnType<typeof useDistanceRequestState>>({
            mileageRate: {rate: 67, unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, currency: CONST.CURRENCY.USD},
            rate: 67,
            unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
            currency: CONST.CURRENCY.USD,
            distance: DistanceRequestUtils.convertToDistanceInMeters(4, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES),
            distanceRequestAmount: 201,
            shouldCalculateDistanceAmount: false,
            isDistanceRequestWithPendingRoute: false,
            hasRoute: true,
            defaultRate: undefined,
        });

        render(
            <ConfirmationDataContext.Provider value={confirmationData}>
                <DistanceRequestController distanceState={distanceState} />
            </ConfirmationDataContext.Provider>,
        );

        expect(mockSetMoneyRequestMerchant).toHaveBeenCalledWith('txn1', '4.00 mi @ $0.67 / mi', true);
        expect(mockSetMoneyRequestCommuterExclusionFields).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionID: 'txn1',
                transaction,
                policy: undefined,
                isPolicyExpenseChat: false,
                customUnitRateID: '',
                routeDistanceMeters: DistanceRequestUtils.convertToDistanceInMeters(4, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES),
                distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
            }),
        );
    });

    describe('rate validation when the selected workspace changes', () => {
        const RATE_ERROR = 'iou.error.invalidRate';

        /** A workspace whose distance rates have not arrived from Onyx yet. */
        const policyWithoutRates = createMock<Policy>({id: 'workspaceB', customUnits: {}});

        /** A loaded workspace whose only rate matches neither the selected rate ID nor its value/unit (the unit comes from the custom unit attributes). */
        const policyWithUnrelatedRate = createMock<Policy>({
            id: 'workspaceB',
            customUnits: {
                unitID: {
                    customUnitID: 'unitID',
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS},
                    enabled: true,
                    rates: {
                        rateB: {customUnitRateID: 'rateB', rate: 999, currency: CONST.CURRENCY.USD, enabled: true, name: 'Other rate'},
                    },
                },
            },
        });

        const renderController = ({
            policy,
            isPolicyExpenseChat,
            setFormError,
            clearFormErrors,
        }: {
            policy: Policy | undefined;
            isPolicyExpenseChat: boolean;
            setFormError: jest.Mock;
            clearFormErrors: jest.Mock;
        }) =>
            render(
                <DistanceRequestController
                    transactionID="txn1"
                    transaction={transaction}
                    policy={policy}
                    isDistanceRequest
                    isManualDistanceRequest={false}
                    isPolicyExpenseChat={isPolicyExpenseChat}
                    isMovingTransactionFromTrackExpense={false}
                    isReadOnly={false}
                    isTypeSplit={false}
                    customUnitRateID="rateFromAnotherWorkspace"
                    mileageRate={{rate: 67, unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, currency: CONST.CURRENCY.USD}}
                    rate={67}
                    unit={CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES}
                    currency={CONST.CURRENCY.USD}
                    distance={DistanceRequestUtils.convertToDistanceInMeters(4, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES)}
                    distanceRequestAmount={201}
                    shouldCalculateDistanceAmount={false}
                    currentUserAccountID={1}
                    isDistanceRequestWithPendingRoute={false}
                    hasRoute
                    defaultMileageRateCustomUnitRateID={undefined}
                    selectedParticipants={[]}
                    selectedParticipantsProp={[]}
                    setFormError={setFormError}
                    clearFormErrors={clearFormErrors}
                />,
            );

        it('does not flag the rate while the newly selected workspace still has no rates loaded', () => {
            const setFormError = jest.fn();
            renderController({policy: policyWithoutRates, isPolicyExpenseChat: true, setFormError, clearFormErrors: jest.fn()});

            expect(setFormError).not.toHaveBeenCalled();
        });

        it('still flags the rate once the workspace rates are loaded and none of them match', () => {
            const setFormError = jest.fn();
            renderController({policy: policyWithUnrelatedRate, isPolicyExpenseChat: true, setFormError, clearFormErrors: jest.fn()});

            expect(setFormError).toHaveBeenCalledWith(RATE_ERROR);
        });

        it('clears a workspace rate error once the expense is no longer on a workspace chat', () => {
            const clearFormErrors = jest.fn();
            renderController({policy: undefined, isPolicyExpenseChat: false, setFormError: jest.fn(), clearFormErrors});

            expect(clearFormErrors).toHaveBeenCalledWith([RATE_ERROR]);
        });
    });
});
