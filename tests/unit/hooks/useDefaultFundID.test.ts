import {renderHook, waitFor} from '@testing-library/react-native';

import useDefaultFundID from '@hooks/useDefaultFundID';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const policyID = 'A6D48964EA47D654';

// Contains a zero digit on purpose: the previous implementation excluded funds by testing the raw
// Onyx key for the stringified workspace account ID, so an unresolved workspace fund (0) dropped
// every fund whose ID contains a zero.
const domainFundIDWithZero = 2048186;
const workspaceFundID = 22588762;

describe('useDefaultFundID', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('resolves a domain fund whose ID contains a zero while the workspace fund is still unresolved', async () => {
        // The page can mount before policyAccountID lands, so useWorkspaceAccountID returns DEFAULT_NUMBER_ID.
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {id: policyID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${domainFundIDWithZero}`, {preferredPolicy: policyID, paymentBankAccountID: 68951});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDefaultFundID(policyID));
        await waitForBatchedUpdates();

        await waitFor(() => {
            expect(result.current).toBe(domainFundIDWithZero);
        });
    });

    it('prefers the domain fund holding the settings over the workspace fund', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {id: policyID, policyAccountID: workspaceFundID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${domainFundIDWithZero}`, {preferredPolicy: policyID, paymentBankAccountID: 68951});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDefaultFundID(policyID));
        await waitForBatchedUpdates();

        await waitFor(() => {
            expect(result.current).toBe(domainFundIDWithZero);
        });
    });

    it('does not match the workspace fund as a domain fund', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {id: policyID, policyAccountID: workspaceFundID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceFundID}`, {preferredPolicy: policyID});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDefaultFundID(policyID));
        await waitForBatchedUpdates();

        await waitFor(() => {
            expect(result.current).toBe(workspaceFundID);
        });
    });

    it('falls back to DEFAULT_NUMBER_ID when neither a domain fund nor a workspace fund is known', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {id: policyID});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDefaultFundID(policyID));
        await waitForBatchedUpdates();

        await waitFor(() => {
            expect(result.current).toBe(CONST.DEFAULT_NUMBER_ID);
        });
    });
});
