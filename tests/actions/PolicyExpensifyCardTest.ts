import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import {openPolicyExpensifyCardsPage} from '@src/libs/actions/Policy/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ExpensifyCardLoadingState, ExpensifyCardSettings} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const policyID = 'A6D48964EA47D654';
const workspaceFundID = 22588762;

// The fund the page falls back to before policyAccountID lands, mirroring CONST.DEFAULT_NUMBER_ID.
const unresolvedFundID = 0;

const loadingStateKey = `${ONYXKEYS.COLLECTION.RAM_ONLY_EXPENSIFY_CARD_LOADING_STATE}${policyID}` as const;
const unresolvedFundSettingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${unresolvedFundID}` as const;
const workspaceFundSettingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceFundID}` as const;

function getLoadingState() {
    return new Promise<OnyxEntry<ExpensifyCardLoadingState>>((resolve) => {
        const connection = Onyx.connect({
            key: loadingStateKey,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

function getCardSettingsForFund(key: typeof unresolvedFundSettingsKey | typeof workspaceFundSettingsKey) {
    return new Promise<OnyxEntry<ExpensifyCardSettings>>((resolve) => {
        const connection = Onyx.connect({
            key,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

OnyxUpdateManager();
describe('actions/PolicyExpensifyCard', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    const mockFetch = TestHelper.setupGlobalFetchMock();

    beforeEach(() => {
        mockFetch.succeed();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('openPolicyExpensifyCardsPage', () => {
        it('marks the page loaded even when the response carries no settings for the requested fund', async () => {
            openPolicyExpensifyCardsPage(policyID, workspaceFundID);
            await waitForBatchedUpdates();
            await mockFetch.resume?.();
            await waitForBatchedUpdates();

            await expect(getLoadingState()).resolves.toEqual(expect.objectContaining({hasOnceLoadedPage: true}));
        });

        it('keys the loaded flag on the policy so it survives the fund the page resolves changing', async () => {
            // The first open races the policy load and goes out before the fund is known.
            openPolicyExpensifyCardsPage(policyID, CONST.DEFAULT_NUMBER_ID);
            await waitForBatchedUpdates();
            await mockFetch.resume?.();
            await waitForBatchedUpdates();

            await expect(getLoadingState()).resolves.toEqual(expect.objectContaining({hasOnceLoadedPage: true}));
        });

        it('does not write card settings under an unresolved fund ID', async () => {
            openPolicyExpensifyCardsPage(policyID, CONST.DEFAULT_NUMBER_ID);
            await waitForBatchedUpdates();
            await mockFetch.resume?.();
            await waitForBatchedUpdates();

            await expect(getCardSettingsForFund(unresolvedFundSettingsKey)).resolves.toBeUndefined();
        });

        it('still writes the fund-scoped loading flags for a resolved fund', async () => {
            mockFetch.pause?.();
            openPolicyExpensifyCardsPage(policyID, workspaceFundID);
            await waitForBatchedUpdates();

            await expect(getCardSettingsForFund(workspaceFundSettingsKey)).resolves.toEqual(expect.objectContaining({isLoading: true}));

            await mockFetch.resume?.();
            await waitForBatchedUpdates();

            await expect(getCardSettingsForFund(workspaceFundSettingsKey)).resolves.toEqual(expect.objectContaining({isLoading: false, hasOnceLoaded: true}));
        });

        it('records an error without marking the page loaded when the initial request fails', async () => {
            mockFetch.fail();
            openPolicyExpensifyCardsPage(policyID, workspaceFundID);
            await waitForBatchedUpdates();

            await expect(getLoadingState()).resolves.toEqual(expect.objectContaining({hasLoadingError: true}));
            await expect(getLoadingState()).resolves.not.toEqual(expect.objectContaining({hasOnceLoadedPage: true}));
        });
    });
});
