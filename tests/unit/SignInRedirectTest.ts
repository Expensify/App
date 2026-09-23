import redirectToSignIn from '@libs/actions/SignInRedirect';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

Onyx.init({keys: ONYXKEYS});

describe('redirectToSignIn', () => {
    it('logs the reason it was given', async () => {
        const logInfoSpy = jest.spyOn(Log, 'info').mockImplementation(() => {});

        await redirectToSignIn(CONST.SIGN_OUT_REASON.REAUTH_FAILED);
        await waitForBatchedUpdates();

        expect(logInfoSpy).toHaveBeenCalledWith(expect.any(String), false, expect.objectContaining({signOutReason: CONST.SIGN_OUT_REASON.REAUTH_FAILED}));

        logInfoSpy.mockRestore();
    });
});
