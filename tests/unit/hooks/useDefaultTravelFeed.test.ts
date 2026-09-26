import {renderHook, waitFor} from '@testing-library/react-native';

import useDefaultTravelFeed from '@hooks/useDefaultTravelFeed';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const policyID = 'A6D48964EA47D654';
const workspaceFundID = 22588762;
const travelFundID = 2048186;

describe('useDefaultTravelFeed', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {id: policyID, policyAccountID: workspaceFundID});
    });

    it('resolves a linked travel-only domain feed', async () => {
        // Given a travel feed on another fund whose TRAVEL_US program is linked to the workspace
        await Onyx.merge(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${travelFundID}`, {
            [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {paymentBankAccountID: 68951, linkedPolicyIDs: [policyID]},
        });
        await waitForBatchedUpdates();

        // When the workspace resolves its default Travel Billing feed
        const {result} = renderHook(() => useDefaultTravelFeed(policyID));

        // Then it uses the linked travel fund instead of the workspace's card fund
        await waitFor(() => {
            expect(result.current).toEqual({fundID: travelFundID, programKey: CONST.TRAVEL.PROGRAM_TRAVEL_US});
        });
    });

    it('recognizes a linked pay-by-invoice travel feed without a bank account', async () => {
        // Given a linked Travel Billing program that settles by invoice
        await Onyx.merge(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${travelFundID}`, {
            [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {invoiceTo: 'billing@example.com', linkedPolicyIDs: [policyID]},
        });
        await waitForBatchedUpdates();

        // When the workspace resolves its default Travel Billing feed
        const {result} = renderHook(() => useDefaultTravelFeed(policyID));

        // Then the invoice-settled fund is selected
        await waitFor(() => {
            expect(result.current.fundID).toBe(travelFundID);
        });
    });

    it("does not match another program's workspace links", async () => {
        // Given a fund whose US card program, but not its Travel Billing program, is linked to the workspace
        await Onyx.merge(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${travelFundID}`, {
            [CONST.COUNTRY.US]: {paymentBankAccountID: 68951, linkedPolicyIDs: [policyID]},
            [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {paymentBankAccountID: 77777},
        });
        await waitForBatchedUpdates();

        // When the workspace resolves its default Travel Billing feed
        const {result} = renderHook(() => useDefaultTravelFeed(policyID));

        // Then it falls back to the workspace fund rather than borrowing the US program's link
        await waitFor(() => {
            expect(result.current.fundID).toBe(workspaceFundID);
        });
    });
});
