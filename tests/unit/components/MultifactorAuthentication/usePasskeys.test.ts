import {renderHook} from '@testing-library/react-native';

import usePasskeys from '@components/MultifactorAuthentication/biometrics/usePasskeys';

import CONST from '@src/CONST';
import type {LocalPasskeyCredentialsEntry} from '@src/types/onyx';

let mockLocalPasskeyCredentials: LocalPasskeyCredentialsEntry | undefined;
let mockServerKnownCredentialIDs: string[];

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: 12345}),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [mockLocalPasskeyCredentials],
}));

jest.mock('@components/MultifactorAuthentication/biometrics/shared/useServerCredentials', () => ({
    __esModule: true,
    default: () => ({
        serverKnownCredentialIDs: mockServerKnownCredentialIDs,
        haveCredentialsEverBeenConfigured: true,
    }),
}));

describe('usePasskeys', () => {
    beforeEach(() => {
        mockLocalPasskeyCredentials = undefined;
        mockServerKnownCredentialIDs = [];
    });

    describe('getLocalCredentialID', () => {
        it('skips a stale first credential and returns the first local credential the server still knows', async () => {
            mockLocalPasskeyCredentials = [
                {id: 'stale-credential', type: CONST.PASSKEY_CREDENTIAL_TYPE},
                {id: 'valid-credential', type: CONST.PASSKEY_CREDENTIAL_TYPE},
            ];
            mockServerKnownCredentialIDs = ['valid-credential'];

            const {result} = renderHook(() => usePasskeys());

            await expect(result.current.getLocalCredentialID()).resolves.toBe('valid-credential');
        });

        it('returns undefined when none of the local credentials are known to the server', async () => {
            mockLocalPasskeyCredentials = [{id: 'stale-credential', type: CONST.PASSKEY_CREDENTIAL_TYPE}];
            mockServerKnownCredentialIDs = ['other-credential'];

            const {result} = renderHook(() => usePasskeys());

            await expect(result.current.getLocalCredentialID()).resolves.toBeUndefined();
        });
    });
});
