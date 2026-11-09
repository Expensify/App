import {render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import DistanceRequestFooter from '@components/DistanceRequest/DistanceRequestFooter';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import getStoredDefaultP2PMileageRate from '@libs/getStoredDefaultP2PMileageRate';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Transaction from '@src/types/onyx/Transaction';
import type TransactionState from '@src/types/utils/TransactionStateType';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomTransaction from '../../utils/collections/transaction';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

let mockRenderedUnit: string | undefined;

jest.mock('@components/DistanceMapView', () => (props: {unit?: string}) => {
    mockRenderedUnit = props.unit;
    return null;
});

jest.mock('@libs/getStoredDefaultP2PMileageRate');

// A P2P distance expense the backend saved in kilometers
const transaction: Transaction = {
    ...createRandomTransaction(1),
    comment: {
        type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
        customUnit: {
            name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
            customUnitRateID: CONST.CUSTOM_UNITS.FAKE_P2P_ID,
            distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS,
        },
    },
};

function renderFooter(transactionState: TransactionState) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <DistanceRequestFooter
                transaction={transaction}
                policy={undefined}
                navigateToWaypointEditPage={jest.fn()}
                transactionState={transactionState}
            />
        </ComposeProviders>,
    );
}

describe('DistanceRequestFooter', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockRenderedUnit = undefined;

        // The stored default P2P rate is still in miles, as it was fetched before the user changed their payment currency
        jest.mocked(getStoredDefaultP2PMileageRate).mockReturnValue({rate: 70, unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES});
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('labels the route with the unit saved on the expense when editing a saved expense', async () => {
        // Given a saved expense whose unit differs from the stored default P2P rate
        // When the footer renders for the saved (current) transaction
        renderFooter(CONST.TRANSACTION.STATE.CURRENT);
        await waitForBatchedUpdatesWithAct();

        // Then the route label uses the expense's saved unit so it matches the Distance row
        expect(mockRenderedUnit).toBe(CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS);
    });

    it('labels the route with the rate unit when the transaction is a draft', async () => {
        // Given a draft that carries a distanceUnit, as reuse route and the confirmation page write one
        // When the footer renders for the draft transaction
        renderFooter(CONST.TRANSACTION.STATE.DRAFT);
        await waitForBatchedUpdatesWithAct();

        // Then the route label keeps using the rate unit, so create flows are unchanged
        expect(mockRenderedUnit).toBe(CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES);
    });
});
