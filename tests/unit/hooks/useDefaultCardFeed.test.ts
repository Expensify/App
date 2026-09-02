import {renderHook, waitFor} from '@testing-library/react-native';

import useDefaultCardFeed from '@hooks/useDefaultCardFeed';

import {buildCardFeedKey} from '@libs/CardUtils';

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
const unusableFundID = 3311447;

describe('useDefaultCardFeed', () => {
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

        const {result} = renderHook(() => useDefaultCardFeed(policyID));
        await waitForBatchedUpdates();

        await waitFor(() => {
            expect(result.current.fundID).toBe(domainFundIDWithZero);
        });
    });

    it('prefers the domain fund holding the settings over the workspace fund', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {id: policyID, policyAccountID: workspaceFundID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${domainFundIDWithZero}`, {preferredPolicy: policyID, paymentBankAccountID: 68951});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDefaultCardFeed(policyID));
        await waitForBatchedUpdates();

        await waitFor(() => {
            expect(result.current.fundID).toBe(domainFundIDWithZero);
        });
    });

    it('does not match the workspace fund as a domain fund', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {id: policyID, policyAccountID: workspaceFundID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceFundID}`, {preferredPolicy: policyID});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDefaultCardFeed(policyID));
        await waitForBatchedUpdates();

        await waitFor(() => {
            expect(result.current.fundID).toBe(workspaceFundID);
        });
    });

    it('falls back to DEFAULT_NUMBER_ID when neither a domain fund nor a workspace fund is known', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {id: policyID});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDefaultCardFeed(policyID));
        await waitForBatchedUpdates();

        await waitFor(() => {
            expect(result.current.fundID).toBe(CONST.DEFAULT_NUMBER_ID);
        });
    });
    it('resolves the program against the fund it returns, not the unusable last-selected one', async () => {
        // The last-selected feed names a GB program that IS configured on its fund, but that feed is pending deletion, so
        // the hook falls through to the domain fund. That fund only has a US program, so the GB key must not carry over.
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {id: policyID, policyAccountID: workspaceFundID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_FEED}${policyID}`, buildCardFeedKey(unusableFundID, CONST.COUNTRY.GB));
        await Onyx.merge(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${unusableFundID}`, {
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            [CONST.COUNTRY.GB]: {paymentBankAccountID: 55555},
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${domainFundIDWithZero}`, {
            preferredPolicy: policyID,
            [CONST.COUNTRY.US]: {paymentBankAccountID: 68951},
        });
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDefaultCardFeed(policyID));
        await waitForBatchedUpdates();

        await waitFor(() => {
            expect(result.current).toEqual({fundID: domainFundIDWithZero, programKey: CONST.COUNTRY.US});
        });
    });

    it('honors the last-selected program when that feed is usable', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {id: policyID, policyAccountID: workspaceFundID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_FEED}${policyID}`, buildCardFeedKey(domainFundIDWithZero, CONST.COUNTRY.GB));
        await Onyx.merge(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${domainFundIDWithZero}`, {
            [CONST.COUNTRY.US]: {paymentBankAccountID: 68951},
            [CONST.COUNTRY.GB]: {paymentBankAccountID: 77777},
        });
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDefaultCardFeed(policyID));
        await waitForBatchedUpdates();

        await waitFor(() => {
            expect(result.current).toEqual({fundID: domainFundIDWithZero, programKey: CONST.COUNTRY.GB});
        });
    });
});
