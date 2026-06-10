import type {OnyxEntry} from 'react-native-onyx';
import {getRenderOptions} from '@pages/signin/SignInPage';
import {clearSignInData} from '@userActions/Session';
import type {Account, Credentials} from '@src/types/onyx';

jest.mock('@userActions/Session', () => ({
    clearSignInData: jest.fn(),
}));

const LOGIN = 'test@example.com';

function buildParams(account: OnyxEntry<Account>, isSignInInitiated: boolean) {
    const credentials: OnyxEntry<Credentials> = {login: LOGIN};
    return {
        hasLogin: true,
        hasValidateCode: false,
        account,
        isPrimaryLogin: true,
        isUsingMagicCode: false,
        hasInitiatedSAMLLogin: false,
        isSignInInitiated,
        shouldShowAnotherLoginPageOpenedMessage: false,
        credentials,
        isAccountValidated: true,
    };
}

describe('SignInPage getRenderOptions SAML routing', () => {
    beforeEach(() => {
        jest.mocked(clearSignInData).mockClear();
    });

    it('initiates SAML for a SAML-required account that began signing in this session, even when isLoading is false', () => {
        // The BEGIN_SIGNIN response can leave isSAMLRequired=true while isLoading is already back to false.
        const {shouldInitiateSAMLLogin} = getRenderOptions(buildParams({isSAMLRequired: true, isLoading: false}, true));

        expect(shouldInitiateSAMLLogin).toBe(true);
        expect(clearSignInData).not.toHaveBeenCalled();
    });

    it('clears sign-in data for a SAML-required account on a cold reload where no sign-in was initiated this session', () => {
        const {shouldInitiateSAMLLogin} = getRenderOptions(buildParams({isSAMLRequired: true, isLoading: false}, false));

        expect(shouldInitiateSAMLLogin).toBe(false);
        expect(clearSignInData).toHaveBeenCalledTimes(1);
    });

    it('shows ChooseSSOOrMagicCode when SAML is enabled but not required', () => {
        const {shouldInitiateSAMLLogin, shouldShowChooseSSOOrMagicCode} = getRenderOptions(buildParams({isSAMLEnabled: true, isSAMLRequired: false, isLoading: false}, true));

        expect(shouldInitiateSAMLLogin).toBe(false);
        expect(shouldShowChooseSSOOrMagicCode).toBe(true);
        expect(clearSignInData).not.toHaveBeenCalled();
    });
});
