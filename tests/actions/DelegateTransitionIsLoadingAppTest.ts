import {clearOnyxForDelegateTransition} from '@libs/actions/Delegate';

import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

OnyxUpdateManager();

async function swapAccounts() {
    await clearOnyxForDelegateTransition();
    await waitForBatchedUpdates();
}

describe('IS_LOADING_APP across a copilot account swap', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await Onyx.clear();
        // Given an account that already finished its first load, and a load in flight holding the gate.
        await Onyx.merge(ONYXKEYS.HAS_LOADED_APP, true);
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, true);
        await waitForBatchedUpdates();
    });

    it('leaves the flag as a real value rather than deleting it', async () => {
        // When the transition clears the outgoing account's data.
        await swapAccounts();

        // Then the app still reports itself loaded and the flag survived the clear.
        expect(await getOnyxValue(ONYXKEYS.HAS_LOADED_APP)).toBe(true);
        expect(await getOnyxValue(ONYXKEYS.IS_LOADING_APP)).toBe(true);
    });

    it('does not open the loading gate of a load that is still in flight', async () => {
        // When the transition clears the outgoing account's data while the incoming account's OpenApp is the next step in the same chain.
        await swapAccounts();

        // Then the swap leaves the gate closed against the load that owns it.
        expect(await getOnyxValue(ONYXKEYS.IS_LOADING_APP)).toBe(true);
    });
});
