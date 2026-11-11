import {renderHook, waitFor} from '@testing-library/react-native';

import useTravelBillingFundID from '@hooks/useTravelBillingFundID';

import {getTravelBillingCardSettingsKey} from '@libs/TravelBillingUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const policyID = 'CF7BE4573FC925E8';
const otherPolicyID = 'A1B2C3D4E5F60718';
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
        // Given a domain whose TRAVEL_US program lists the workspace
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {id: policyID, policyAccountID: workspaceFundID});
        await Onyx.merge(getTravelBillingCardSettingsKey(domainFundID), {[CONST.TRAVEL.PROGRAM_TRAVEL_US]: travelBillingSettings});
        await waitForBatchedUpdates();

        // When the hook resolves the travel billing fund
        const {result} = renderHook(() => useTravelBillingFundID(policyID));
        await waitForBatchedUpdates();

        // Then it returns the domain that holds the travel feed
        await waitFor(() => {
            expect(result.current).toBe(domainFundID);
        });
    });

    it('resolves the domain fund even when the last selected card feed is the workspace', async () => {
        // Given the admin last viewed the workspace's own card feed while the domain holds the TRAVEL_US program
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {id: policyID, policyAccountID: workspaceFundID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_FEED}${policyID}`, workspaceFundID);
        await Onyx.merge(getTravelBillingCardSettingsKey(workspaceFundID), {[CONST.COUNTRY.US]: {paymentBankAccountID: 67890}});
        await Onyx.merge(getTravelBillingCardSettingsKey(domainFundID), {[CONST.TRAVEL.PROGRAM_TRAVEL_US]: travelBillingSettings});
        await waitForBatchedUpdates();

        // When the hook resolves the travel billing fund
        const {result} = renderHook(() => useTravelBillingFundID(policyID));
        await waitForBatchedUpdates();

        // Then it returns the domain that holds the travel feed
        await waitFor(() => {
            expect(result.current).toBe(domainFundID);
        });
    });

    it('resolves the workspace fund when only the workspace holds the travel billing feed', async () => {
        // Given a domain linked only through its US card program and a workspace holding the TRAVEL_US program
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {id: policyID, policyAccountID: workspaceFundID});
        await Onyx.merge(getTravelBillingCardSettingsKey(domainFundID), {[CONST.COUNTRY.US]: {linkedPolicyIDs: [policyID], paymentBankAccountID: 67890}});
        await Onyx.merge(getTravelBillingCardSettingsKey(workspaceFundID), {[CONST.TRAVEL.PROGRAM_TRAVEL_US]: travelBillingSettings});
        await waitForBatchedUpdates();

        // When the hook resolves the travel billing fund
        const {result} = renderHook(() => useTravelBillingFundID(policyID));
        await waitForBatchedUpdates();

        // Then it returns the workspace because no domain holds the travel feed
        await waitFor(() => {
            expect(result.current).toBe(workspaceFundID);
        });
    });

    it('resolves the workspace fund when the domain travel billing feed lists only other workspaces', async () => {
        // Given a domain linked to the workspace through its US card program, whose TRAVEL_US program lists only another workspace
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {id: policyID, policyAccountID: workspaceFundID});
        await Onyx.merge(getTravelBillingCardSettingsKey(domainFundID), {
            [CONST.COUNTRY.US]: {linkedPolicyIDs: [policyID], paymentBankAccountID: 67890},
            [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {...travelBillingSettings, linkedPolicyIDs: [otherPolicyID]},
        });
        await waitForBatchedUpdates();

        // When the hook resolves the travel billing fund
        const {result} = renderHook(() => useTravelBillingFundID(policyID));
        await waitForBatchedUpdates();

        // Then it returns the workspace, because the domain's travel feed belongs to the other workspace and the backend sets this one up on its workspace account
        await waitFor(() => {
            expect(result.current).toBe(workspaceFundID);
        });
    });

    it('resolves the workspace fund when the domain travel billing feed was turned off by its last workspace', async () => {
        // Given a domain linked to the workspace through its US card program, whose TRAVEL_US program was deactivated and kept an empty linkedPolicyIDs list
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {id: policyID, policyAccountID: workspaceFundID});
        await Onyx.merge(getTravelBillingCardSettingsKey(domainFundID), {
            [CONST.COUNTRY.US]: {linkedPolicyIDs: [policyID], paymentBankAccountID: 67890},
            [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {isEnabled: false, linkedPolicyIDs: [], paymentBankAccountID: 8789966},
        });
        await waitForBatchedUpdates();

        // When the hook resolves the travel billing fund
        const {result} = renderHook(() => useTravelBillingFundID(policyID));
        await waitForBatchedUpdates();

        // Then it returns the workspace, because the backend treats an empty list as naming no workspaces rather than as a legacy feed
        await waitFor(() => {
            expect(result.current).toBe(workspaceFundID);
        });
    });

    it('resolves the workspace fund when the domain travel billing feed has no linked policies', async () => {
        // Given a domain linked to the workspace through its US card program, with a TRAVEL_US program that has no linkedPolicyIDs
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {id: policyID, policyAccountID: workspaceFundID});
        await Onyx.merge(getTravelBillingCardSettingsKey(domainFundID), {
            [CONST.COUNTRY.US]: {linkedPolicyIDs: [policyID], paymentBankAccountID: 67890},
            [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {isEnabled: true, paymentBankAccountID: 8789966},
        });
        await waitForBatchedUpdates();

        // When the hook resolves the travel billing fund
        const {result} = renderHook(() => useTravelBillingFundID(policyID));
        await waitForBatchedUpdates();

        // Then it returns the workspace, because the backend treats a domain feed without linkedPolicyIDs as linked to no workspace
        await waitFor(() => {
            expect(result.current).toBe(workspaceFundID);
        });
    });

    it('resolves the default domain fund when the domain linked through its card program has no travel billing feed', async () => {
        // Given a domain linked to the workspace through its US card program and no TRAVEL_US program anywhere
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {id: policyID, policyAccountID: workspaceFundID});
        await Onyx.merge(getTravelBillingCardSettingsKey(domainFundID), {[CONST.COUNTRY.US]: {linkedPolicyIDs: [policyID], paymentBankAccountID: 67890}});
        await waitForBatchedUpdates();

        // When the hook resolves the travel billing fund
        const {result} = renderHook(() => useTravelBillingFundID(policyID));
        await waitForBatchedUpdates();

        // Then it keeps returning the default domain fund, so setting up travel billing still starts from the domain
        await waitFor(() => {
            expect(result.current).toBe(domainFundID);
        });
    });
});
