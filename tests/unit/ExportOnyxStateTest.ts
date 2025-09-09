import {emailRegex, maskOnyxState} from '@libs/ExportOnyxState/common';
import type {Session} from '@src/types/onyx';

type ExampleOnyxState = {
    session: Session;
    [key: string]: unknown;
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
        const result = maskOnyxState(input) as ExampleOnyxState;

        expect(result.session.authToken).toBe('***');
        expect(result.session.encryptedAuthToken).toBe('***');
    });

    it('should not mask fragile data when isMaskingFragileDataEnabled is false', () => {
        const input = {
            session: mockSession,
        };
        const result = maskOnyxState(input) as ExampleOnyxState;

        expect(result.session.authToken).toBe('***');
        expect(result.session.encryptedAuthToken).toBe('***');
        expect(result.session.email).toBe('user@example.com');
    });

    it('should mask fragile data when isMaskingFragileDataEnabled is true', () => {
        const input = {
            session: mockSession,
        };
        const result = maskOnyxState(input, true) as ExampleOnyxState;

        expect(result.session.authToken).toBe('***');
        expect(result.session.encryptedAuthToken).toBe('***');
    });

    it('should mask emails as a string value in property with a random email', () => {
        const input = {
            session: mockSession,
        };

        const result = maskOnyxState(input) as ExampleOnyxState;

        expect(result.session.email).toMatch(emailRegex);
    });

    it('should mask array of emails with random emails', () => {
        const input = {
            session: mockSession,
            emails: ['user@example.com', 'user2@example.com'],
        };

        const result = maskOnyxState(input, true) as Record<string, string[]>;

        expect(result.emails.at(0)).toMatch(emailRegex);
        expect(result.emails.at(1)).toMatch(emailRegex);
    });

    it('should mask emails in keys of objects', () => {
        const input = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'user@example.com': 'value',
            session: mockSession,
        };

        const result = maskOnyxState(input, true) as Record<string, string>;

        expect(Object.keys(result).at(0)).toMatch(emailRegex);
    });

    it('should mask emails that are part of a string', () => {
        const input = {
            session: mockSession,
            emailString: 'user@example.com is a test string',
        };

        const result = maskOnyxState(input, true) as Record<string, string>;
        expect(result.emailString).not.toContain('user@example.com');
    });

    it('should mask keys that are in the fixed list', () => {
        const input = {
            session: mockSession,
            edits: ['hey', 'hi'],
            lastMessageHtml: 'hey',
        };

        const result = maskOnyxState(input, true) as ExampleOnyxState;

        expect(result.edits).toEqual(['***', '***']);
        expect(result.lastMessageHtml).not.toEqual(input.lastMessageHtml);
    });
});
