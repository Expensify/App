import {renderHook, waitFor} from '@testing-library/react-native';

import useTravelBillingFundID from '@hooks/useTravelBillingFundID';

import {getTravelBillingCardSettingsKey} from '@libs/TravelBillingUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const policyID = 'CF7BE4573FC925E8';
const domainFundID = 18452096;
const workspaceFundID = 22588762;

const travelBillingSettings = {
    isEnabled: true,
    linkedPolicyIDs: [policyID],
    paymentBankAccountID: 8789966,
};

describe('useTravelBillingFundID', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('resolves the domain fund when the travel billing feed lives on the domain', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {id: policyID, policyAccountID: workspaceFundID});
        await Onyx.merge(getTravelBillingCardSettingsKey(domainFundID), {[CONST.TRAVEL.PROGRAM_TRAVEL_US]: travelBillingSettings});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTravelBillingFundID(policyID));
        await waitForBatchedUpdates();

        await waitFor(() => {
            expect(result.current).toBe(domainFundID);
        });
    });

    it('resolves the domain fund even when the last selected card feed is the workspace', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {id: policyID, policyAccountID: workspaceFundID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_FEED}${policyID}`, workspaceFundID);
        await Onyx.merge(getTravelBillingCardSettingsKey(workspaceFundID), {[CONST.COUNTRY.US]: {paymentBankAccountID: 67890}});
        await Onyx.merge(getTravelBillingCardSettingsKey(domainFundID), {[CONST.TRAVEL.PROGRAM_TRAVEL_US]: travelBillingSettings});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTravelBillingFundID(policyID));
        await waitForBatchedUpdates();

        await waitFor(() => {
            expect(result.current).toBe(domainFundID);
        });
    });

    it('resolves the workspace fund when only the workspace holds the travel billing feed', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {id: policyID, policyAccountID: workspaceFundID});
        await Onyx.merge(getTravelBillingCardSettingsKey(domainFundID), {[CONST.COUNTRY.US]: {linkedPolicyIDs: [policyID], paymentBankAccountID: 67890}});
        await Onyx.merge(getTravelBillingCardSettingsKey(workspaceFundID), {[CONST.TRAVEL.PROGRAM_TRAVEL_US]: travelBillingSettings});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTravelBillingFundID(policyID));
        await waitForBatchedUpdates();

        await waitFor(() => {
            expect(result.current).toBe(workspaceFundID);
        });
    });
});
