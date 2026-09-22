import {checkIfShouldUseNewPartnerName, getPartnerCredentials, getTransitionLinkEmailParams, isAgentEmail, isLoggingInAsDelegate} from '@src/libs/SessionUtils';

function mockHybridAppConfig(isHybridApp: boolean): () => void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const CONFIG = require('@src/CONFIG');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const originalValue = CONFIG.default.IS_HYBRID_APP;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    CONFIG.default.IS_HYBRID_APP = isHybridApp;

    // Return cleanup function
    return () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        CONFIG.default.IS_HYBRID_APP = originalValue;
    };
}

function testPartnerNameBehavior(isHybridApp: boolean, partnerUserID: string | undefined, expectedResult: boolean): void {
    const cleanup = mockHybridAppConfig(isHybridApp);
    try {
        const result = checkIfShouldUseNewPartnerName(partnerUserID);
        expect(result).toBe(expectedResult);
    } finally {
        cleanup();
    }
}

describe('SessionUtils', () => {
    describe('isAgentEmail', () => {
        test.each([
            ['matches valid agent email', 'agent_123@expensify.ai', true],
            ['matches name-based agent email', 'testbot_12345678@expensify.ai', true],
            ['matches agent email with multiple digits', 'agent_9999999@expensify.ai', true],
            ['returns false for non-agent email', 'user@expensify.com', false],
            ['returns false for non-agent expensify.ai email', 'user@expensify.ai', false],
            ['returns false for agent email with wrong domain', 'agent_123@expensify.com', false],
            ['returns false for agent prefix without digits', 'agent_@expensify.ai', false],
            ['returns false for empty string', '', false],
            ['returns false for undefined', undefined, false],
            ['returns false when agent name contains an underscore', 'prefix_agent_123@expensify.ai', false],
            ['returns false when agent pattern has extra suffix', 'agent_123@expensify.ai.evil.com', false],
        ])('%s', (_description, email, expectedResult) => {
            expect(isAgentEmail(email)).toBe(expectedResult);
        });
    });

    describe('checkIfShouldUseNewPartnerName', () => {
        test.each([
            // [description, isHybridApp, partnerUserID, expectedResult]
            ['should return true for any partnerUserID when not in HybridApp', false, 'any-user-id', true],
            ['should return true for undefined partnerUserID when not in HybridApp', false, undefined, true],
            ['should return true for empty partnerUserID when not in HybridApp', false, '', true],
            ['should return true for expensify.cash- prefix when not in HybridApp', false, 'expensify.cash-12345', true],
            ['should return true for expensify.cash- prefix when in HybridApp', true, 'expensify.cash-12345', true],
            ['should return false for legacy partnerUserID when in HybridApp', true, 'legacy-user-12345', false],
            ['should return false for undefined partnerUserID when in HybridApp', true, undefined, false],
            ['should return false for empty partnerUserID when in HybridApp', true, '', false],
            ['should return true when partnerUserID starts with expensify.cash- prefix when in HybridApp', true, 'expensify.cash-user123', true],
            ['should return false when partnerUserID contains but does not start with expensify.cash- when in HybridApp', true, 'some-prefix-expensify.cash-12345', false],
            [
                'should return false for similar but different prefix when in HybridApp',
                true,
                'expensify-cash-12345', // missing dot
                false,
            ],
            ['should be case sensitive for expensify.cash- prefix when in HybridApp', true, 'EXPENSIFY.CASH-12345', false],
        ])('%s', (description, isHybridApp, partnerUserID, expectedResult) => {
            testPartnerNameBehavior(isHybridApp, partnerUserID, expectedResult);
        });
    });

    describe('getPartnerCredentials', () => {
        test.each([
            ['should return new partner credentials when not in HybridApp', false, 'any-user-id'],
            ['should return new partner credentials for expensify.cash- prefix when in HybridApp', true, 'expensify.cash-12345'],
            ['should return legacy partner credentials for legacy partnerUserID when in HybridApp', true, 'legacy-user-12345'],
        ])('%s', (_description, isHybridApp, partnerUserID) => {
            const cleanup = mockHybridAppConfig(isHybridApp);

            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const CONFIG = require('@src/CONFIG');
                const useNewPartnerName = checkIfShouldUseNewPartnerName(partnerUserID);
                const {partnerName, partnerPassword} = getPartnerCredentials(partnerUserID);

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                expect(partnerName).toBe(useNewPartnerName ? CONFIG.default.EXPENSIFY.PARTNER_NAME : CONFIG.default.EXPENSIFY.LEGACY_PARTNER_NAME);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                expect(partnerPassword).toBe(useNewPartnerName ? CONFIG.default.EXPENSIFY.PARTNER_PASSWORD : CONFIG.default.EXPENSIFY.LEGACY_PARTNER_PASSWORD);
            } finally {
                cleanup();
            }
        });
    });

    describe('isLoggingInAsDelegate', () => {
        test.each([
            ['should return false when transitionURL is undefined', undefined, false],
            ['should return false when transitionURL is empty', '', false],
            ['should return false when delegatorEmail is absent', '?email=user@example.com', false],
            ['should return false when delegatorEmail has empty value (query string)', '?delegatorEmail=', false],
            ['should return true when delegatorEmail is present in query string', '?delegatorEmail=delegate@example.com', true],
            ['should return true when delegatorEmail is a subsequent param', '?email=user@example.com&delegatorEmail=delegate@example.com', true],
            ['should return true for full URL where URLSearchParams mangles the first param key', 'https://example.com?delegatorEmail=delegate@example.com', true],
            ['should return true for full URL with delegatorEmail as second param', 'https://example.com?email=user@example.com&delegatorEmail=delegate@example.com', true],
            ['should return false for full URL without delegatorEmail', 'https://example.com?email=user@example.com', false],
            ['should return false when param name is similar but not exact', '?delegateEmail=delegate@example.com', false],
            ['should return true when delegatorEmail value contains encoded characters', '?delegatorEmail=user%40example.com', true],
        ])('%s', (_description, transitionURL, expectedResult) => {
            expect(isLoggingInAsDelegate(transitionURL)).toBe(expectedResult);
        });
    });

    describe('getTransitionLinkEmailParams', () => {
        // The transition sign-out decision compares these two values against the session email, so a log line built
        // from them has to read the link the way the decision does. Parsed params come first, then the raw value for
        // the case where a full URL mangles the first query key.
        test.each([
            ['reads both params from a query string', '?email=user@example.com&delegatorEmail=delegate@example.com', 'user@example.com', 'delegate@example.com'],
            ['reads a query string starting with delegatorEmail', '?delegatorEmail=delegate@example.com', null, 'delegate@example.com'],
            ['falls back to the raw value when a full URL mangles the first param key', 'https://example.com?email=user%40example.com&delegatorEmail=delegate@example.com', 'user%40example.com', 'delegate@example.com'],
            ['reads only the param the link carries', '?email=user@example.com', 'user@example.com', null],
            ['reads nothing from a supportal-style link', '?authTokenType=support&shortLivedAuthToken=abc', null, null],
            ['reads nothing for an undefined link', undefined, null, null],
            ['reads nothing for an empty link', '', null, null],
        ])('%s', (_description, transitionURL, expectedEmail, expectedDelegatorEmail) => {
            expect(getTransitionLinkEmailParams(transitionURL)).toEqual({email: expectedEmail, delegatorEmail: expectedDelegatorEmail});
        });

        test('does not read the credentials the link also carries', () => {
            // Given a transition link that names an account and carries short-lived credentials
            const transitionURL = '?email=user@example.com&shortLivedAuthToken=secret-token&encryptedAuthToken=encrypted-token';

            // When the link is read to build a log payload
            const params = getTransitionLinkEmailParams(transitionURL);

            // Then only the two account identities come back, so no credential reaches the log payload
            expect(Object.keys(params)).toEqual(['email', 'delegatorEmail']);
            expect(JSON.stringify(params)).not.toContain('secret-token');
            expect(JSON.stringify(params)).not.toContain('encrypted-token');
        });
    });
});
