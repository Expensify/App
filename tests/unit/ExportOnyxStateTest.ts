import {emailRegex, keysToMask, maskOnyxState, ONYX_KEY_EXPORT_RULES, onyxKeysToMaskFragileData, onyxKeysToRemove, safeOnyxKeys} from '@libs/ExportOnyxState/common';
import {isRecord} from '@libs/ObjectUtils';

import ONYXKEYS from '@src/ONYXKEYS';

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
            // preservedUserSession holds a full Session (tokens included) and must be masked exactly like session
            const input = {session: mockSession, [ONYXKEYS.PRESERVED_USER_SESSION]: mockSession};
            const result = maskOnyxState(input);
            const session = result.session;
            const preservedUserSession = result.preservedUserSession;

            if (!isRecord(session) || !isRecord(preservedUserSession)) {
                throw new Error('Expected session records in masked Onyx state');
            }

            expect(result).toMatchObject({
                session: {
                    email: 'user@example.com',
                    accountID: 12345,
                    loading: false,
                    creationDate: '2024-01-01',
                },
                preservedUserSession: {
                    email: 'user@example.com',
                    accountID: 12345,
                },
            });
            expect(typeof session.authToken).toBe('string');
            expect(typeof session.encryptedAuthToken).toBe('string');
            expect(typeof preservedUserSession.authToken).toBe('string');
            expect(typeof preservedUserSession.encryptedAuthToken).toBe('string');
            if (
                typeof session.authToken !== 'string' ||
                typeof session.encryptedAuthToken !== 'string' ||
                typeof preservedUserSession.authToken !== 'string' ||
                typeof preservedUserSession.encryptedAuthToken !== 'string'
            ) {
                throw new Error('Expected masked session tokens');
            }
            expect(session.authToken).toHaveLength('sensitive-auth-token'.length);
            expect(session.encryptedAuthToken).toHaveLength('sensitive-encrypted-token'.length);
            expect(preservedUserSession.authToken).toHaveLength('sensitive-auth-token'.length);
            expect(preservedUserSession.encryptedAuthToken).toHaveLength('sensitive-encrypted-token'.length);
            expect(session.authToken).not.toBe('sensitive-auth-token');
            expect(session.encryptedAuthToken).not.toBe('sensitive-encrypted-token');
            expect(preservedUserSession.authToken).not.toBe('sensitive-auth-token');
            expect(preservedUserSession.encryptedAuthToken).not.toBe('sensitive-encrypted-token');
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
            const result = maskOnyxState(input);
            const account = result.account;

            if (!isRecord(account)) {
                throw new Error('Expected an account record in masked Onyx state');
            }

            expect(result).toMatchObject({
                account: {
                    validated: true,
                    isFromPublicDomain: false,
                    isUsingExpensifyCard: true,
                    requiresTwoFactorAuth: '***',
                },
            });
            expect(typeof account.primaryLogin).toBe('string');
            if (typeof account.primaryLogin !== 'string') {
                throw new Error('Expected a masked primary login');
            }
            expect(account.primaryLogin).toHaveLength('user@example.com'.length);
            expect(account.primaryLogin).not.toBe('user@example.com');
        });

        it('should redact fields not in allowList or maskList', () => {
            const input = {
                session: {
                    ...mockSession,
                    customField: 'should-be-redacted',
                    anotherField: 'also-redacted',
                },
            };
            const result = maskOnyxState(input);
            const session = result.session;

            if (!isRecord(session)) {
                throw new Error('Expected a session record in masked Onyx state');
            }

            expect(result).toMatchObject({
                session: {
                    email: 'user@example.com',
                    accountID: 12345,
                },
            });
            expect(typeof session.customField).toBe('string');
            expect(typeof session.anotherField).toBe('string');
            if (typeof session.customField !== 'string' || typeof session.anotherField !== 'string') {
                throw new Error('Expected masked custom session fields');
            }
            expect(session.customField).toHaveLength('should-be-redacted'.length);
            expect(session.anotherField).toHaveLength('also-redacted'.length);
            expect(session.customField).not.toBe('should-be-redacted');
            expect(session.anotherField).not.toBe('also-redacted');
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
            const result = maskOnyxState(input);
            const reportKey = `${ONYXKEYS.COLLECTION.REPORT}123`;
            const report = result[reportKey];

            if (!isRecord(report)) {
                throw new Error('Expected a report record in masked Onyx state');
            }

            expect(result).toMatchObject({
                [reportKey]: {
                    reportID: '123',
                    type: 'expense',
                    chatType: 'policyExpenseChat',
                    stateNum: 1,
                    statusNum: 0,
                },
            });
            expect(typeof report.reportName).toBe('string');
            expect(typeof report.description).toBe('string');
            expect(typeof report.customField).toBe('string');
            if (typeof report.reportName !== 'string' || typeof report.description !== 'string' || typeof report.customField !== 'string') {
                throw new Error('Expected masked report fields');
            }
            expect(report.reportName).toHaveLength('Test Report'.length);
            expect(report.description).toHaveLength('Test Description'.length);
            expect(report.customField).toHaveLength('should-be-redacted'.length);
            expect(report.reportName).not.toBe('Test Report');
            expect(report.description).not.toBe('Test Description');
            expect(report.customField).not.toBe('should-be-redacted');
        });

        it('should remove sensitive and transient keys from export', () => {
            const input = {
                session: mockSession,
                [ONYXKEYS.NVP_PRIVATE_PUSH_NOTIFICATION_ID]: 'sensitive-id',
                [ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID]: 'stripe-id',
                [ONYXKEYS.RAM_ONLY_PLAID_LINK_TOKEN]: 'plaid-token',
                [ONYXKEYS.RAM_ONLY_IS_PRODUCT_MARKETING_WINDOW_COVERED]: true,
                [ONYXKEYS.ONFIDO_TOKEN]: 'onfido-token',
            };
            const result = maskOnyxState(input);

            // Sensitive keys should be removed
            expect(result[ONYXKEYS.NVP_PRIVATE_PUSH_NOTIFICATION_ID]).toBeUndefined();
            expect(result[ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID]).toBeUndefined();
            expect(result[ONYXKEYS.RAM_ONLY_PLAID_LINK_TOKEN]).toBeUndefined();
            expect(result[ONYXKEYS.RAM_ONLY_IS_PRODUCT_MARKETING_WINDOW_COVERED]).toBeUndefined();
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
        const result = maskOnyxState(input);
        const session = result.session;

        if (!isRecord(session)) {
            throw new Error('Expected a session record in masked Onyx state');
        }

        expect(typeof session.authToken).toBe('string');
        expect(typeof session.encryptedAuthToken).toBe('string');
        if (typeof session.authToken !== 'string' || typeof session.encryptedAuthToken !== 'string') {
            throw new Error('Expected masked session tokens');
        }
        expect(session.authToken).toHaveLength('sensitive-auth-token'.length);
        expect(session.encryptedAuthToken).toHaveLength('sensitive-encrypted-token'.length);
        expect(session.authToken).not.toBe('sensitive-auth-token');
        expect(session.encryptedAuthToken).not.toBe('sensitive-encrypted-token');
    });

    it('should not mask fragile data when isMaskingFragileDataEnabled is false', () => {
        const input = {
            session: mockSession,
        };
        const result = maskOnyxState(input);
        const session = result.session;

        if (!isRecord(session)) {
            throw new Error('Expected a session record in masked Onyx state');
        }

        expect(result).toMatchObject({
            session: {
                email: 'user@example.com',
            },
        });
        expect(typeof session.authToken).toBe('string');
        expect(typeof session.encryptedAuthToken).toBe('string');
        if (typeof session.authToken !== 'string' || typeof session.encryptedAuthToken !== 'string') {
            throw new Error('Expected masked session tokens');
        }
        expect(session.authToken).toHaveLength('sensitive-auth-token'.length);
        expect(session.encryptedAuthToken).toHaveLength('sensitive-encrypted-token'.length);
        expect(session.authToken).not.toBe('sensitive-auth-token');
        expect(session.encryptedAuthToken).not.toBe('sensitive-encrypted-token');
    });

    it('should mask fragile data when isMaskingFragileDataEnabled is true', () => {
        const input = {
            session: mockSession,
        };
        const result = maskOnyxState(input, true);
        const session = result.session;

        if (!isRecord(session)) {
            throw new Error('Expected a session record in masked Onyx state');
        }

        expect(typeof session.authToken).toBe('string');
        expect(typeof session.encryptedAuthToken).toBe('string');
        if (typeof session.authToken !== 'string' || typeof session.encryptedAuthToken !== 'string') {
            throw new Error('Expected masked session tokens');
        }
        expect(session.authToken).toHaveLength('sensitive-auth-token'.length);
        expect(session.encryptedAuthToken).toHaveLength('sensitive-encrypted-token'.length);
        expect(session.authToken).not.toBe('sensitive-auth-token');
        expect(session.encryptedAuthToken).not.toBe('sensitive-encrypted-token');
    });

    it('should mask emails as a string value in property with a random email', () => {
        const input = {
            session: mockSession,
        };

        const result = maskOnyxState(input);

        if (!isRecord(result.session) || typeof result.session.email !== 'string') {
            throw new Error('Expected a masked session email');
        }
        expect(result.session.email).toMatch(emailRegex);
    });

    it('should mask array of emails with random emails', () => {
        const input = {
            session: mockSession,
            emails: ['user@example.com', 'user2@example.com'],
        };

        const result = maskOnyxState(input, true);

        expect(Array.isArray(result.emails)).toBe(true);
        if (!Array.isArray(result.emails)) {
            return;
        }
        expect(result.emails).toHaveLength(2);
        for (const email of result.emails) {
            expect(typeof email).toBe('string');
            if (typeof email === 'string') {
                expect(email).toMatch(emailRegex);
            }
        }
    });

    it('should mask emails in keys of objects', () => {
        const input = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'user@example.com': 'value',
            session: mockSession,
        };

        const result = maskOnyxState(input, true);

        expect(Object.keys(result).at(0)).toMatch(emailRegex);
    });

    it('should mask emails that are part of a string', () => {
        const input = {
            session: mockSession,
            emailString: 'user@example.com is a test string',
        };

        const result = maskOnyxState(input, true);
        expect(typeof result.emailString).toBe('string');
        if (typeof result.emailString === 'string') {
            expect(result.emailString).not.toContain('user@example.com');
        }
    });

    it('should mask keys that are in the fixed list', () => {
        const input = {
            session: mockSession,
            edits: ['hey', 'hi'],
            lastMessageHtml: 'hey',
        };

        const result = maskOnyxState(input, true);

        expect(result).toMatchObject({edits: ['***', '***']});
        expect(typeof result.lastMessageHtml).toBe('string');
        if (typeof result.lastMessageHtml === 'string') {
            expect(result.lastMessageHtml).not.toBe(input.lastMessageHtml);
        }
    });

    it.each([
        ['masking enabled', true],
        ['masking disabled', false],
    ])('should mask delegate credentials held under hybridApp with %s', (_label, isMaskingEnabled) => {
        // Given a hybridApp key holding live OldDot delegate credentials in delegateAccessData
        const credentialValues = ['live-olddot-auth-token', 'live-olddot-encrypted-token', 'auto-generated-login', 'auto-generated-password', 'delegate@example.com'];
        const input = {
            session: mockSession,
            [ONYXKEYS.HYBRID_APP]: {
                isSingleNewDotEntry: true,
                delegateAccessData: {
                    isDelegateAccess: true,
                    oldDotCurrentAuthToken: 'live-olddot-auth-token',
                    oldDotCurrentEncryptedAuthToken: 'live-olddot-encrypted-token',
                    oldDotAutoGeneratedLogin: 'auto-generated-login',
                    oldDotAutoGeneratedPassword: 'auto-generated-password',
                    oldDotCurrentUserEmail: 'delegate@example.com',
                },
            },
        };

        // When the state is exported (the export rule applies regardless of the masking toggle)
        const serialized = JSON.stringify(maskOnyxState(input, isMaskingEnabled));

        // Then none of the credential values may appear verbatim anywhere in the export
        for (const credentialValue of credentialValues) {
            expect(serialized).not.toContain(credentialValue);
        }
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

    it('removes the Cloudflare QA session from the export entirely', () => {
        // The classification lists only prove the key is bucketed. This pins the actual behavior:
        // both OAuth tokens must vanish from the exported state, not just get masked.
        const input = {
            [ONYXKEYS.CLOUDFLARE_SESSION]: {accessToken: 'oauth:access-token', refreshToken: 'oauth:refresh-token', expiresAt: 1753600000000},
            [ONYXKEYS.IS_DEBUG_MODE_ENABLED]: true,
        };

        const result = maskOnyxState(input, true);

        expect(result[ONYXKEYS.CLOUDFLARE_SESSION]).toBeUndefined();
        expect(Object.keys(result)).not.toContain(ONYXKEYS.CLOUDFLARE_SESSION);
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
            ONYXKEYS.PRESERVED_USER_SESSION,
            ONYXKEYS.PRESERVED_ACCOUNT,
            ONYXKEYS.HYBRID_APP,
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
            ONYXKEYS.CLOUDFLARE_SESSION,
            ONYXKEYS.COLLECTION.BANK_ACCOUNT_SHARE_DETAILS,
            ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST,
            ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING,
            ONYXKEYS.COLLECTION.DOMAIN_ERRORS,
            ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD,
            ONYXKEYS.WALLET_TERMS,
            ONYXKEYS.VALIDATE_ACTION_CODE,
            ONYXKEYS.NVP_INTRO_SELECTED,
        ];

        for (const sensitiveKey of knownSensitiveKeys) {
            expect(safeOnyxKeys.has(sensitiveKey)).toBe(false);
        }
    });

    it('session token field names must be in keysToMask so the maskFragileData fallback can never pass them through', () => {
        // maskFragileData exports any field name it does not recognize verbatim. Keys that reach it and hold a
        // session-token field rely on keysToMask to catch the secret, so these generic field names must stay
        // listed as a backstop even though the keys that carry them today have their own export rules.
        const credentialFieldNames = ['authToken', 'encryptedAuthToken', 'supportAuthToken'];

        for (const fieldName of credentialFieldNames) {
            expect(keysToMask.has(fieldName)).toBe(true);
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

describe('Onyx key export bucket ordering', () => {
    // The buckets are written as ONYXKEYS.X references and kept in order of that name, not of the string it
    // resolves to. BETAS is listed before BETA_CONFIGURATION even though their values sort the other way
    // round, so comparing the values would flag correct code. A Set only remembers the values, so map each
    // one back to the name it was written as before checking the order.
    const nameByValue = new Map<string, string>();
    for (const [name, value] of Object.entries(ONYXKEYS)) {
        if (typeof value !== 'string') {
            continue;
        }
        nameByValue.set(value, name);
    }
    for (const [name, value] of Object.entries(ONYXKEYS.COLLECTION)) {
        nameByValue.set(value, `COLLECTION.${name}`);
    }

    it.each([
        ['safeOnyxKeys', safeOnyxKeys],
        ['onyxKeysToMaskFragileData', onyxKeysToMaskFragileData],
    ])('%s should list its keys alphabetically', (_bucketName, bucket) => {
        // A Set keeps insertion order, so this is the order the keys appear in the source
        const names = Array.from(bucket).map((value) => nameByValue.get(value) ?? value);

        expect(names).toEqual([...names].sort());
    });

    it('keysToMask should list its field names alphabetically', () => {
        const fieldNames = Array.from(keysToMask);

        expect(fieldNames).toEqual([...fieldNames].sort());
    });
});
