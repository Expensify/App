import {clearTwoFactorAuthData} from '@libs/actions/TwoFactorAuthActions';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const RECOVERY_CODES = '111111111, 222222222';
const SECRET_KEY = 'ABCDEFGHIJKLMNOP';

describe('TwoFactorAuthActions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('keeps the pending secret and recovery codes when setup is unfinished', async () => {
        // Given an in-progress setup whose authenticator entry is already scanned
        await Onyx.merge(ONYXKEYS.ACCOUNT, {
            requiresTwoFactorAuth: false,
            recoveryCodes: RECOVERY_CODES,
            twoFactorAuthSecretKey: SECRET_KEY,
            codesAreCopied: true,
            twoFactorAuthSetupInProgress: true,
        });
        await waitForBatchedUpdates();

        // When the user leaves the flow before 2FA is enabled
        clearTwoFactorAuthData(false, true);
        await waitForBatchedUpdates();

        // Then the secret and codes stay so reopening setup does not mint a new secret
        const account = await getOnyxValue(ONYXKEYS.ACCOUNT);
        expect(account?.recoveryCodes).toBe(RECOVERY_CODES);
        expect(account?.twoFactorAuthSecretKey).toBe(SECRET_KEY);
        expect(account?.codesAreCopied).toBe(false);
        expect(account?.twoFactorAuthSetupInProgress ?? null).toBeNull();
    });

    it('clears the secret and recovery codes once 2FA is enabled', async () => {
        // Given a finished setup
        await Onyx.merge(ONYXKEYS.ACCOUNT, {
            requiresTwoFactorAuth: true,
            recoveryCodes: RECOVERY_CODES,
            twoFactorAuthSecretKey: SECRET_KEY,
            codesAreCopied: true,
            twoFactorAuthSetupInProgress: true,
        });
        await waitForBatchedUpdates();

        // When the flow is dismissed after 2FA is enabled
        clearTwoFactorAuthData(true, true);
        await waitForBatchedUpdates();

        // Then the setup data is cleared
        const account = await getOnyxValue(ONYXKEYS.ACCOUNT);
        expect(account?.recoveryCodes ?? null).toBeNull();
        expect(account?.twoFactorAuthSecretKey ?? null).toBeNull();
        expect(account?.codesAreCopied).toBe(false);
        expect(account?.twoFactorAuthSetupInProgress ?? null).toBeNull();
    });
});
