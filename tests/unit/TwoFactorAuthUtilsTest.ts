// cspell:ignore EFGH IJKL MNOP SECRETKEY ANYSECRET
import {buildAuthenticatorUrl, splitSecretInChunks} from '@libs/TwoFactorAuthUtils';

describe('TwoFactorAuthUtils', () => {
    describe('splitSecretInChunks', () => {
        it('formats a 16-character secret into space-separated 4-character chunks', () => {
            expect(splitSecretInChunks('ABCDEFGHIJKLMNOP')).toBe('ABCD EFGH IJKL MNOP');
        });

        it('returns the secret unchanged when shorter than 16 characters', () => {
            expect(splitSecretInChunks('SHORT')).toBe('SHORT');
        });

        it('returns the secret unchanged when longer than 16 characters', () => {
            const long = 'ABCDEFGHIJKLMNOPQ'; // 17 chars
            expect(splitSecretInChunks(long)).toBe(long);
        });

        it('returns an empty string unchanged', () => {
            expect(splitSecretInChunks('')).toBe('');
        });
    });

    describe('buildAuthenticatorUrl', () => {
        it('builds a valid otpauth URL with the expected format', () => {
            const url = buildAuthenticatorUrl('user@expensify.com', 'SECRETKEY12345678');
            expect(url).toBe('otpauth://totp/Expensify:user@expensify.com?secret=SECRETKEY12345678&issuer=Expensify');
        });

        it('includes the contact method and secret key verbatim', () => {
            const url = buildAuthenticatorUrl('test+alias@example.com', 'ABCD1234EFGH5678');
            expect(url).toContain('test+alias@example.com');
            expect(url).toContain('ABCD1234EFGH5678');
        });

        it('always uses the Expensify issuer', () => {
            const url = buildAuthenticatorUrl('user@expensify.com', 'ANYSECRET1234567');
            expect(url).toContain('issuer=Expensify');
        });
    });
});
