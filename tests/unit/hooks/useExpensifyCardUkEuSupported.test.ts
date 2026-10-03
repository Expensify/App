import {renderHook, waitFor} from '@testing-library/react-native';

import useExpensifyCardUkEuSupported from '@hooks/useExpensifyCardUkEuSupported';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const policyID = 'A6D48964EA47D654';

describe('useExpensifyCardUkEuSupported', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it.each([CONST.CURRENCY.GBP, CONST.CURRENCY.EUR])('supports a %s workspace for an account with no betas', async (outputCurrency) => {
        // Given a workspace in a UK/EU card currency and an account that holds no betas at all
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {id: policyID, outputCurrency});
        await Onyx.set(ONYXKEYS.BETAS, []);
        await waitForBatchedUpdates();

        // When the hook resolves for that workspace
        const {result} = renderHook(() => useExpensifyCardUkEuSupported(policyID));
        await waitForBatchedUpdates();

        // Then the UK/EU card flow is available without any beta
        await waitFor(() => {
            expect(result.current).toBe(true);
        });
    });

    it('does not support a USD workspace', async () => {
        // Given a USD workspace
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {id: policyID, outputCurrency: CONST.CURRENCY.USD});
        await Onyx.set(ONYXKEYS.BETAS, []);
        await waitForBatchedUpdates();

        // When the hook resolves for that workspace
        const {result} = renderHook(() => useExpensifyCardUkEuSupported(policyID));
        await waitForBatchedUpdates();

        // Then the USD program stays in charge
        await waitFor(() => {
            expect(result.current).toBe(false);
        });
    });
});
