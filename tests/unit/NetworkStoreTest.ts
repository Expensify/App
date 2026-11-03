import {getAuthToken, getEncryptedAuthToken, setAuthToken} from '@libs/Network/NetworkStore';

describe('NetworkStore.setAuthToken', () => {
    it.each([
        ['new-api-token', 'new-image-token'],
        ['old-api-token', 'rotated-image-token'],
        ['new-api-token', null],
        ['old-api-token', null],
        [null, null],
    ] as const)('replaces the cached pair with (%s, %s)', (newAuthToken, newEncryptedAuthToken) => {
        // Given credentials cached for the previous API and image requests
        setAuthToken('old-api-token', 'old-image-token');

        // When the caller supplies both replacement values, including explicit clears
        setAuthToken(newAuthToken, newEncryptedAuthToken);

        // Then neither cached credential is inferred from the previous token
        expect(getAuthToken()).toBe(newAuthToken);
        expect(getEncryptedAuthToken()).toBe(newEncryptedAuthToken);
    });
});
