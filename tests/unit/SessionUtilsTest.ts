import {checkIfShouldUseNewPartnerName, getEmailFromTransitionURL, getPartnerCredentials, isAgentEmail, isLoggingInAsDelegate, isLoggingInAsNewUser} from '@src/libs/SessionUtils';

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

    describe('isLoggingInAsNewUser', () => {
        test.each([
            ['should return false when email matches sessionEmail directly', '?email=user@example.com', 'user@example.com', false],
            ['should return false when delegatorEmail matches sessionEmail directly', '?delegatorEmail=user@example.com', 'user@example.com', false],
            ['should return true when email does not match sessionEmail', '?email=other@example.com', 'user@example.com', true],
            ['should return true when transitionURL has no email or delegatorEmail param', '?shortLivedAuthToken=abc123', 'user@example.com', true],
            ['should return true when transitionURL is undefined', undefined, 'user@example.com', true],
            [
                'should return false for full URL where URLSearchParams mangles the first param key but the regex-extracted email matches',
                'https://example.com?email=user@example.com',
                'user@example.com',
                false,
            ],
            ['should return true for full URL where the regex-extracted email does not match sessionEmail', 'https://example.com?email=other@example.com', 'user@example.com', true],
            [
                'should return false for full URL where the regex-extracted delegatorEmail matches sessionEmail',
                'https://example.com?delegatorEmail=user@example.com',
                'user@example.com',
                false,
            ],
            ['should return true when the encoded email does not match sessionEmail', '?email=other%40example.com', 'user@example.com', true],
            ['should return false when the encoded email matches sessionEmail after decoding', '?email=user%40example.com', 'user@example.com', false],
        ])('%s', (_description, transitionURL, sessionEmail, expectedResult) => {
            expect(isLoggingInAsNewUser(transitionURL, sessionEmail)).toBe(expectedResult);
        });
    });

    describe('getEmailFromTransitionURL', () => {
        test.each([
            ['should return undefined when url is undefined', undefined, undefined],
            ['should return undefined when url is empty', '', undefined],
            ['should return undefined when url has no query string', 'https://example.com/transition', undefined],
            ['should return undefined when email param is absent', '?shortLivedAuthToken=abc123', undefined],
            ['should return the email when present as the only param', '?email=user@example.com', 'user@example.com'],
            ['should return the email when it is a subsequent param', '?shortLivedAuthToken=abc123&email=user@example.com', 'user@example.com'],
            ['should stop at the next query param delimiter', '?email=user@example.com&exitTo=%2Fhome', 'user@example.com'],
            ['should return the decoded email for a full URL where URLSearchParams would mangle the first param key', 'https://example.com?email=user%40example.com', 'user@example.com'],
            ['should decode a plus-encoded email', '?email=user%2Btag%40example.com', 'user+tag@example.com'],
            ['should return the raw value unchanged when it contains an un-encoded percent that is not a valid escape sequence', '?email=100%off@example.com', '100%off@example.com'],
            ['should ignore a fragment after the query string', '?email=user@example.com#section', 'user@example.com'],
            ['should return undefined when email only appears after a hash fragment', '?shortLivedAuthToken=abc123#email=user@example.com', undefined],
        ])('%s', (_description, url, expectedResult) => {
            expect(getEmailFromTransitionURL(url)).toBe(expectedResult);
        });
    });
});
