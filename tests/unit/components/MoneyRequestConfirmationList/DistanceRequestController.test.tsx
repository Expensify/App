import {render} from '@testing-library/react-native';

import DistanceRequestController from '@components/MoneyRequestConfirmationList/DistanceRequestController';

import DistanceRequestUtils from '@libs/DistanceRequestUtils';

import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

import React from 'react';

import createMock from '../../../utils/createMock';

const mockSetMoneyRequestAmount = jest.fn();
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

    it('uses commuter exclusion data when updating the distance merchant', () => {
        render(
            <DistanceRequestController
                transactionID="txn1"
                transaction={transaction}
                policy={undefined}
                isDistanceRequest
                isManualDistanceRequest={false}
                isPolicyExpenseChat={false}
                isMovingTransactionFromTrackExpense={false}
                isReadOnly={false}
                isTypeSplit={false}
                customUnitRateID=""
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
                setFormError={jest.fn()}
                clearFormErrors={jest.fn()}
                commuterExclusionData={{
                    commuterExclusion: 1,
                    reimbursableDistance: 3,
                    distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                }}
            />,
        );

        expect(mockSetMoneyRequestMerchant).toHaveBeenCalledWith('txn1', '3.00 mi @ $0.67 / mi', true);
    });
});
