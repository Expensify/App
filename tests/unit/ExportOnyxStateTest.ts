import ExportOnyxState from '@libs/ExportOnyxState/common';
import type * as OnyxTypes from '@src/types/onyx';

type ExampleOnyxState = {
    session: OnyxTypes.Session;
};

describe('maskOnyxState', () => {
    const mockSession = {
        authToken: 'sensitive-auth-token',
        encryptedAuthToken: 'sensitive-encrypted-token',
        email: 'user@example.com',
        accountID: 12345,
    };

    it('should mask session details by default', () => {
        const input = {session: mockSession};
        const result = ExportOnyxState.maskOnyxState(input) as ExampleOnyxState;

        expect(result.session.authToken).toBe('***');
        expect(result.session.encryptedAuthToken).toBe('***');
    });

    it('should not mask fragile data when isMaskingFragileDataEnabled is false', () => {
        const input = {
            session: mockSession,
        };
        const result = ExportOnyxState.maskOnyxState(input) as ExampleOnyxState;

        expect(result.session.authToken).toBe('***');
        expect(result.session.encryptedAuthToken).toBe('***');
        expect(result.session.email).toBe('user@example.com');
    });

    it('should mask fragile data when isMaskingFragileDataEnabled is true', () => {
        const input = {
            session: mockSession,
        };
        const result = ExportOnyxState.maskOnyxState(input, true) as ExampleOnyxState;

        expect(result.session.authToken).toBe('***');
        expect(result.session.encryptedAuthToken).toBe('***');
        expect(result.session.email).toBe('***');
    });
});
