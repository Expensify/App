import {render} from '@testing-library/react-native';

import CategoryDefaultsSetter from '@pages/iou/request/step/confirmation/CategoryDefaultsSetter';

import {setMoneyRequestCategory} from '@userActions/IOU/MoneyRequest';

import CONST from '@src/CONST';
import type {Policy, PolicyCategories, Transaction} from '@src/types/onyx';

import React from 'react';

import createMock from '../utils/createMock';

const CURRENT_USER_ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;

jest.mock('@userActions/IOU/MoneyRequest', () => ({
    setMoneyRequestCategory: jest.fn(),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({accountID: CURRENT_USER_ACCOUNT_ID})));

const setMoneyRequestCategoryMock = jest.mocked(setMoneyRequestCategory);

const policy = createMock<Policy>({
    id: 'policy1',
    customUnits: {
        distance: {customUnitID: 'distance', name: CONST.CUSTOM_UNITS.NAME_DISTANCE, defaultCategory: 'Car', rates: {}},
        perDiem: {customUnitID: 'perDiem', name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL, defaultCategory: 'Car', rates: {}},
    },
});

function renderSetter({
    category = '',
    visibleTo,
    isDistanceRequest = true,
    requestType = CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
}: {
    category?: string;
    visibleTo: Record<number, boolean> | null;
    isDistanceRequest?: boolean;
    requestType?: string;
}) {
    const transaction = createMock<Transaction>({transactionID: 'transaction1', category});
    const policyCategories: PolicyCategories = {
        Car: {name: 'Car', enabled: true, visibleTo},
        Benefits: {name: 'Benefits', enabled: true, visibleTo: null},
    };
    return render(
        <CategoryDefaultsSetter
            transactions={[transaction]}
            transactionIDs={[transaction.transactionID]}
            existingTransaction={undefined}
            policyCategories={policyCategories}
            policy={policy}
            isDistanceRequest={isDistanceRequest}
            requestType={requestType}
            isMovingTransactionFromTrackExpense={false}
        />,
    );
}

describe('CategoryDefaultsSetter', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('applies the distance default category when the member can use it', () => {
        // Given a distance expense on a workspace whose distance default, Car, is open to everyone
        // When the confirmation page sets the defaults
        renderSetter({visibleTo: null});

        // Then the expense is coded to Car, as before category visibility
        expect(setMoneyRequestCategoryMock).toHaveBeenCalledWith('transaction1', 'Car', policy, false);
    });

    it("doesn't apply the distance default category when it's hidden from the member", () => {
        // Given a distance expense whose distance default, Car, is limited to another member
        // When the confirmation page sets the defaults
        renderSetter({visibleTo: {[OTHER_ACCOUNT_ID]: true}});

        // Then the expense isn't coded to Car, since the member couldn't pick it
        expect(setMoneyRequestCategoryMock).not.toHaveBeenCalledWith('transaction1', 'Car', expect.anything(), expect.anything());
    });

    it("keeps a category already on the expense even when it's hidden from the member", () => {
        // Given a distance expense already coded to Car, which is limited to another member
        // When the confirmation page sets the defaults
        renderSetter({category: 'Car', visibleTo: {[OTHER_ACCOUNT_ID]: true}});

        // Then Car stays, so a category set before the restriction isn't silently removed, and the "Category not allowed" violation flags it instead
        expect(setMoneyRequestCategoryMock).not.toHaveBeenCalled();
    });

    it('keeps a default category the member can use', () => {
        // Given a distance expense already coded to Car, which the member is on the list for
        // When the confirmation page sets the defaults
        renderSetter({category: 'Car', visibleTo: {[CURRENT_USER_ACCOUNT_ID]: true}});

        // Then Car stays, since the member can use it
        expect(setMoneyRequestCategoryMock).not.toHaveBeenCalled();
    });
});
