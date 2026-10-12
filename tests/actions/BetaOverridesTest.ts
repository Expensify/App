import {clearBetaOverride, clearBetaOverrides, setBetaOverride} from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type BetaOverrides from '@src/types/onyx/BetaOverrides';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

function getBetaOverrides(): Promise<BetaOverrides | undefined> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: ONYXKEYS.BETA_OVERRIDES,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

describe('beta override actions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('removes only the requested beta and leaves the others stored', async () => {
        // Given Two stored overrides
        setBetaOverride(CONST.BETAS.DEFAULT_ROOMS, true);
        setBetaOverride(CONST.BETAS.ASAP_SUBMIT, false);
        await waitForBatchedUpdates();

        // When One of them is cleared
        clearBetaOverride(CONST.BETAS.DEFAULT_ROOMS);
        await waitForBatchedUpdates();

        // Then That key is gone rather than stored as null, and the other is untouched
        const betaOverrides = await getBetaOverrides();
        expect(betaOverrides?.[CONST.BETAS.DEFAULT_ROOMS]).toBeUndefined();
        expect(betaOverrides?.[CONST.BETAS.ASAP_SUBMIT]).toBe(false);
    });

    it('leaves nothing behind that reads as an override once the last one is cleared', async () => {
        // Given A single stored override
        setBetaOverride(CONST.BETAS.DEFAULT_ROOMS, true);
        await waitForBatchedUpdates();

        // When It is cleared
        clearBetaOverride(CONST.BETAS.DEFAULT_ROOMS);
        await waitForBatchedUpdates();

        // Then Nothing resolves as an override, so the beta follows the account again
        const betaOverrides = await getBetaOverrides();
        expect(betaOverrides?.[CONST.BETAS.DEFAULT_ROOMS]).toBeUndefined();
    });

    it('drops every override when they are all cleared', async () => {
        // Given Two stored overrides
        setBetaOverride(CONST.BETAS.DEFAULT_ROOMS, true);
        setBetaOverride(CONST.BETAS.ASAP_SUBMIT, false);
        await waitForBatchedUpdates();

        // When They are all cleared
        clearBetaOverrides();
        await waitForBatchedUpdates();

        // Then The whole key is gone
        const betaOverrides = await getBetaOverrides();
        expect(betaOverrides).toBeUndefined();
    });
});
