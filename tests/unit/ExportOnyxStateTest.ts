import {emailRegex, maskOnyxState, ONYX_KEY_EXPORT_RULES, onyxKeysToMaskFragileData, onyxKeysToRemove, safeOnyxKeys} from '@libs/ExportOnyxState/common';

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
                [ONYXKEYS.RAM_ONLY_PLAID_LINK_TOKEN]: 'plaid-token',
                [ONYXKEYS.ONFIDO_TOKEN]: 'onfido-token',
            };
            const result = maskOnyxState(input);

            // Sensitive keys should be removed
            expect(result[ONYXKEYS.NVP_PRIVATE_PUSH_NOTIFICATION_ID]).toBeUndefined();
            expect(result[ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID]).toBeUndefined();
            expect(result[ONYXKEYS.RAM_ONLY_PLAID_LINK_TOKEN]).toBeUndefined();
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

    describe('full pass-through safe collection keys', () => {
        it('should pass through data as-is for safe collection keys', () => {
            const mockViolations = [
                {type: 'violation', name: 'missingCategory', data: {errorIndexes: []}},
                {type: 'warning', name: 'tagOutOfPolicy', data: {tagName: 'Department'}},
            ];

            const input = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}txn123`]: mockViolations,
            };
            const result = maskOnyxState(input) as Record<string, unknown>;

            // Safe collection key should pass through data unchanged
            expect(result[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}txn123`]).toEqual(mockViolations);
        });
    });

    describe('safe keys', () => {
        it('should pass through safe keys without any masking', () => {
            const input = {
                session: mockSession,
                [ONYXKEYS.IS_LOADING_APP]: true,
                [ONYXKEYS.NETWORK]: {isOffline: false},
                [ONYXKEYS.PREFERRED_THEME]: 'dark',
            };
            const result = maskOnyxState(input) as Record<string, unknown>;

            expect(result[ONYXKEYS.IS_LOADING_APP]).toBe(true);
            expect(result[ONYXKEYS.NETWORK]).toEqual({isOffline: false});
            expect(result[ONYXKEYS.PREFERRED_THEME]).toBe('dark');
        });

        it('should pass through safe keys even when masking is enabled', () => {
            const input = {
                session: mockSession,
                [ONYXKEYS.IS_LOADING_APP]: true,
                [ONYXKEYS.CURRENT_DATE]: '2024-06-15',
            };
            const result = maskOnyxState(input, true) as Record<string, unknown>;

            expect(result[ONYXKEYS.IS_LOADING_APP]).toBe(true);
            expect(result[ONYXKEYS.CURRENT_DATE]).toBe('2024-06-15');
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

// These tests check that every Onyx key is sorted into a bucket and that no key lands in two of them.
// They can't tell you whether a key belongs in the bucket it's in, since nothing here knows what fields
// a key actually holds. Deciding a key is safe is still a judgment call, and the denylist test below is
// the only place we check it.
describe('Onyx key export coverage', () => {
    it('every ONYXKEYS value (top-level + collection) must be in one of the four buckets', () => {
        // Top-level keys are the string values, so skip the nested objects like COLLECTION and FORMS
        const allTopLevelKeys: string[] = (Object.values(ONYXKEYS) as unknown[]).filter((v): v is string => typeof v === 'string');

        const allCollectionKeys: string[] = Object.values(ONYXKEYS.COLLECTION);

        // onyxKeysToMaskFragileData is written out by hand rather than derived from ONYXKEYS. That's what
        // makes this test useful: a brand new key won't be in any bucket until someone puts it in one.
        const removeKeys = Array.from(onyxKeysToRemove).filter((key): key is Extract<typeof key, string> => typeof key === 'string');
        const coveredKeys = new Set<string>([...Object.keys(ONYX_KEY_EXPORT_RULES), ...removeKeys, ...safeOnyxKeys, ...onyxKeysToMaskFragileData]);

        const uncoveredTopLevel = allTopLevelKeys.filter((key) => !coveredKeys.has(key));
        const uncoveredCollection = allCollectionKeys.filter((key) => !coveredKeys.has(key));

        expect(uncoveredTopLevel).toEqual([]);
        expect(uncoveredCollection).toEqual([]);
    });

    it('FORMS keys should not need individual export rules (handled by maskFragileData fallback)', () => {
        // A few forms reuse a top-level key's string value (personalBankAccount, reimbursementAccount,
        // walletAdditionalDetails, assignCard). Those rules belong to the top-level key, not the form,
        // so leave them out before checking.
        const topLevelValues = new Set<string>((Object.values(ONYXKEYS) as unknown[]).filter((v): v is string => typeof v === 'string'));

        const formOnlyValues = Object.values(ONYXKEYS.FORMS).filter((v) => !topLevelValues.has(v));
        const rulesKeys = new Set(Object.keys(ONYX_KEY_EXPORT_RULES));

        for (const formKey of formOnlyValues) {
            expect(rulesKeys.has(formKey)).toBe(false);
        }
    });

    it('DERIVED keys should all be in onyxKeysToRemove', () => {
        const derivedValues = Object.values(ONYXKEYS.DERIVED);
        for (const derivedKey of derivedValues) {
            expect(onyxKeysToRemove.has(derivedKey)).toBe(true);
        }
    });

    it('known-sensitive keys must never be classified as safe', () => {
        // Anything in safeOnyxKeys is exported with no masking at all. Every key below carries
        // credentials, tokens, banking data or personal details, so none of them may ever end up
        // there. Add to this list when a new sensitive key shows up.
        const knownSensitiveKeys: string[] = [
            ONYXKEYS.SESSION,
            ONYXKEYS.STASHED_SESSION,
            ONYXKEYS.CREDENTIALS,
            ONYXKEYS.STASHED_CREDENTIALS,
            ONYXKEYS.ACCOUNT,
            ONYXKEYS.PERSONAL_DETAILS_LIST,
            ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
            ONYXKEYS.LOGINS,
            ONYXKEYS.PLAID_DATA,
            ONYXKEYS.FUND_LIST,
            ONYXKEYS.BANK_ACCOUNT_LIST,
            ONYXKEYS.CARD_LIST,
            ONYXKEYS.USER_WALLET,
            ONYXKEYS.PERSONAL_BANK_ACCOUNT,
            ONYXKEYS.REIMBURSEMENT_ACCOUNT,
            ONYXKEYS.MAPBOX_ACCESS_TOKEN,
            ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID,
            ONYXKEYS.NVP_PRIVATE_PUSH_NOTIFICATION_ID,
            ONYXKEYS.RAM_ONLY_PLAID_LINK_TOKEN,
            ONYXKEYS.ONFIDO_TOKEN,
            ONYXKEYS.ONFIDO_APPLICANT_ID,
            ONYXKEYS.COLLECTION.BANK_ACCOUNT_SHARE_DETAILS,
            ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST,
            ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING,
            ONYXKEYS.COLLECTION.DOMAIN_ERRORS,
            ONYXKEYS.COLLECTION.NEXT_STEP,
            ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD,
            ONYXKEYS.WALLET_TERMS,
            ONYXKEYS.VALIDATE_ACTION_CODE,
            ONYXKEYS.NVP_INTRO_SELECTED,
        ];

        for (const sensitiveKey of knownSensitiveKeys) {
            expect(safeOnyxKeys.has(sensitiveKey)).toBe(false);
        }
    });

    it('no key should appear in multiple buckets', () => {
        const rulesKeys = Object.keys(ONYX_KEY_EXPORT_RULES);
        const removeKeys = new Set<string>(Array.from(onyxKeysToRemove).filter((key): key is Extract<typeof key, string> => typeof key === 'string'));
        for (const key of rulesKeys) {
            expect(safeOnyxKeys.has(key)).toBe(false);
            expect(removeKeys.has(key)).toBe(false);
            expect(onyxKeysToMaskFragileData.has(key)).toBe(false);
        }
        for (const key of safeOnyxKeys) {
            expect(removeKeys.has(key)).toBe(false);
            expect(onyxKeysToMaskFragileData.has(key)).toBe(false);
        }
        for (const key of removeKeys) {
            expect(onyxKeysToMaskFragileData.has(key)).toBe(false);
        }
    });
});
