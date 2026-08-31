/**
 * The staging-server preference describes the install, not the account, so it has to outlive the Onyx clear that
 * runs on sign-out. It is one line in a list that is easy to drop by accident, and there is one such list per way
 * of signing out.
 */
import {KEYS_TO_PRESERVE} from '@libs/actions/App';
import {KEYS_TO_PRESERVE_DELEGATE_ACCESS} from '@libs/actions/Delegate';
import {KEYS_TO_PRESERVE_SUPPORTAL} from '@libs/actions/Session';
import {KEYS_TO_PRESERVE_ON_SIGN_OUT} from '@libs/actions/SignInRedirect';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

Onyx.init({keys: ONYXKEYS});

describe('the lists that survive a sign-out', () => {
    describe.each([
        ['KEYS_TO_PRESERVE', KEYS_TO_PRESERVE],
        ['KEYS_TO_PRESERVE_DELEGATE_ACCESS', KEYS_TO_PRESERVE_DELEGATE_ACCESS],
        ['KEYS_TO_PRESERVE_SUPPORTAL', KEYS_TO_PRESERVE_SUPPORTAL],
        ['KEYS_TO_PRESERVE_ON_SIGN_OUT', KEYS_TO_PRESERVE_ON_SIGN_OUT],
    ])('%s', (_name, list) => {
        it('lists the staging preference', () => {
            expect(list).toContain(ONYXKEYS.SHOULD_USE_STAGING_SERVER);
        });

        // Membership is what a dropped line breaks, but only a real clear proves the list is passed somewhere
        // that honors it
        it('keeps the staging preference across a clear', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.SHOULD_USE_STAGING_SERVER]: true,
                // A control: an account-scoped key that must not survive
                [ONYXKEYS.IS_LOADING_REPORT_DATA]: true,
            });
            await waitForBatchedUpdates();

            await Onyx.clear(list);
            await waitForBatchedUpdates();

            await expect(getOnyxValue(ONYXKEYS.SHOULD_USE_STAGING_SERVER)).resolves.toBe(true);
            await expect(getOnyxValue(ONYXKEYS.IS_LOADING_REPORT_DATA)).resolves.toBeUndefined();
        });
    });
});
