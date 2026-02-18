import {emailRegex, maskOnyxState} from '@libs/ExportOnyxState/common';
import ONYXKEYS from '@src/ONYXKEYS';
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
        loading: false,
        creationDate: '2024-01-01',
    };

    describe('whitelist functionality', () => {
        it('should only export whitelisted fields from session', () => {
            const input = {session: mockSession};
            const result = maskOnyxState(input) as ExampleOnyxState;

            // Whitelisted fields should be preserved
            expect(result.session.email).toBe('user@example.com');
            expect(result.session.accountID).toBe(12345);
            expect(result.session.loading).toBe(false);
            expect(result.session.creationDate).toBe('2024-01-01');

            // Non-whitelisted fields should be intelligently redacted
            expect(result.session.authToken).not.toBe('sensitive-auth-token');
            expect(result.session.authToken).toHaveLength('sensitive-auth-token'.length);
            expect(result.session.encryptedAuthToken).not.toBe('sensitive-encrypted-token');
            expect(result.session.encryptedAuthToken).toHaveLength('sensitive-encrypted-token'.length);
        });

        it('should mask fields in maskList while preserving structure', () => {
            const mockAccount = {
                validated: true,
                isFromPublicDomain: false,
                isUsingExpensifyCard: true,
                primaryLogin: 'user@example.com',
                requiresTwoFactorAuth: true,
            };

            const input = {[ONYXKEYS.ACCOUNT]: mockAccount};
            const result = maskOnyxState(input) as {account: Record<string, unknown>};

            // Whitelisted fields should be preserved
            expect(result.account.validated).toBe(true);
            expect(result.account.isFromPublicDomain).toBe(false);
            expect(result.account.isUsingExpensifyCard).toBe(true);

            // Masked fields should be masked but preserved
            expect(result.account.primaryLogin).not.toBe('user@example.com');
            expect(result.account.primaryLogin).toHaveLength('user@example.com'.length);

            // Non-whitelisted, non-masked fields should be redacted
            expect(result.account.requiresTwoFactorAuth).toBe('***');
        });

        it('should redact fields not in allowList or maskList', () => {
            const input = {
                session: {
                    ...mockSession,
                    customField: 'should-be-redacted',
                    anotherField: 'also-redacted',
                },
            };
            const result = maskOnyxState(input) as {session: Record<string, unknown>};

            // Whitelisted fields should be preserved
            expect(result.session.email).toBe('user@example.com');
            expect(result.session.accountID).toBe(12345);

            // Non-whitelisted fields should be intelligently redacted
            expect(result.session.customField).not.toBe('should-be-redacted');
            expect(result.session.customField).toHaveLength('should-be-redacted'.length);
            expect(result.session.anotherField).not.toBe('also-redacted');
            expect(result.session.anotherField).toHaveLength('also-redacted'.length);
        });

        it('should handle collection keys correctly', () => {
            const mockReport = {
                reportID: '123',
                type: 'expense',
                chatType: 'policyExpenseChat',
                stateNum: 1,
                statusNum: 0,
                reportName: 'Test Report',
                description: 'Test Description',
                ownerAccountID: 12345,
                customField: 'should-be-redacted',
            };

            const input = {
                [`${ONYXKEYS.COLLECTION.REPORT}123`]: mockReport,
            };
            const result = maskOnyxState(input) as Record<string, typeof mockReport>;

            const processedReport = result[`${ONYXKEYS.COLLECTION.REPORT}123`];

            // Whitelisted fields should be preserved
            expect(processedReport.reportID).toBe('123');
            expect(processedReport.type).toBe('expense');
            expect(processedReport.chatType).toBe('policyExpenseChat');
            expect(processedReport.stateNum).toBe(1);
            expect(processedReport.statusNum).toBe(0);

            // Masked fields should be masked
            expect(processedReport.reportName).not.toBe('Test Report');
            expect(processedReport.reportName).toHaveLength('Test Report'.length);
            expect(processedReport.description).not.toBe('Test Description');

            // Non-whitelisted, non-masked fields should be intelligently redacted
            expect(processedReport.customField).not.toBe('should-be-redacted');
            expect(processedReport.customField).toHaveLength('should-be-redacted'.length);
        });

        it('should remove sensitive keys from export', () => {
            const input = {
                session: mockSession,
                [ONYXKEYS.NVP_PRIVATE_PUSH_NOTIFICATION_ID]: 'sensitive-id',
                [ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID]: 'stripe-id',
                [ONYXKEYS.PLAID_LINK_TOKEN]: 'plaid-token',
                [ONYXKEYS.ONFIDO_TOKEN]: 'onfido-token',
            };
            const result = maskOnyxState(input);

            // Sensitive keys should be removed
            expect(result[ONYXKEYS.NVP_PRIVATE_PUSH_NOTIFICATION_ID]).toBeUndefined();
            expect(result[ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID]).toBeUndefined();
            expect(result[ONYXKEYS.PLAID_LINK_TOKEN]).toBeUndefined();
            expect(result[ONYXKEYS.ONFIDO_TOKEN]).toBeUndefined();

            // Session should still be present
            expect(result.session).toBeDefined();
        });

        it('should handle keys without export policies', () => {
            const input = {
                session: mockSession,
                unknownKey: {
                    field1: 'value1',
                    field2: 'value2',
                },
            };
            const result = maskOnyxState(input) as Record<string, unknown>;

            // Keys without policies should be left as-is
            expect(result.unknownKey).toEqual({
                field1: 'value1',
                field2: 'value2',
            });
        });
    });

    it('should mask session details by default', () => {
        const input = {session: mockSession};
        const result = maskOnyxState(input) as ExampleOnyxState;

        expect(result.session.authToken).not.toBe('sensitive-auth-token');
        expect(result.session.authToken).toHaveLength('sensitive-auth-token'.length);
        expect(result.session.encryptedAuthToken).not.toBe('sensitive-encrypted-token');
        expect(result.session.encryptedAuthToken).toHaveLength('sensitive-encrypted-token'.length);
    });

    it('should not mask fragile data when isMaskingFragileDataEnabled is false', () => {
        const input = {
            session: mockSession,
        };
        const result = maskOnyxState(input) as ExampleOnyxState;

        expect(result.session.authToken).not.toBe('sensitive-auth-token');
        expect(result.session.authToken).toHaveLength('sensitive-auth-token'.length);
        expect(result.session.encryptedAuthToken).not.toBe('sensitive-encrypted-token');
        expect(result.session.encryptedAuthToken).toHaveLength('sensitive-encrypted-token'.length);
        expect(result.session.email).toBe('user@example.com');
    });

    it('should mask fragile data when isMaskingFragileDataEnabled is true', () => {
        const input = {
            session: mockSession,
        };
        const result = maskOnyxState(input, true) as ExampleOnyxState;

        expect(result.session.authToken).not.toBe('sensitive-auth-token');
        expect(result.session.authToken).toHaveLength('sensitive-auth-token'.length);
        expect(result.session.encryptedAuthToken).not.toBe('sensitive-encrypted-token');
        expect(result.session.encryptedAuthToken).toHaveLength('sensitive-encrypted-token'.length);
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
