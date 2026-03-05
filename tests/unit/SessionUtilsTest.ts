import {checkIfShouldUseNewPartnerName, isLoggingInAsNewUser} from '@src/libs/SessionUtils';

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

    describe('isLoggingInAsNewUser', () => {
        it('should return true when transition email differs from session email', () => {
            const transitionURL = 'https://new.expensify.com/transition?email=target@example.com&authTokenType=support';
            expect(isLoggingInAsNewUser(transitionURL, 'agent@expensify.com')).toBe(true);
        });

        it('should return false when transition email matches session email', () => {
            const transitionURL = 'https://new.expensify.com/transition?email=user@example.com';
            expect(isLoggingInAsNewUser(transitionURL, 'user@example.com')).toBe(false);
        });

        it('should return false when supportal-ing into the same user again (emails match)', () => {
            // This is the edge case that causes stale policies — the agent already supportal'd
            // into this user before, so session.email is already the target user's email.
            const transitionURL = 'https://new.expensify.com/transition?email=target@example.com&authTokenType=support';
            expect(isLoggingInAsNewUser(transitionURL, 'target@example.com')).toBe(false);
        });

        it('should return true when transition URL has no email param', () => {
            const transitionURL = 'https://new.expensify.com/transition?authTokenType=support';
            expect(isLoggingInAsNewUser(transitionURL, 'agent@expensify.com')).toBe(true);
        });

        it('should return true when both transition URL and session have no email', () => {
            // params.get('email') returns null, sessionEmail is undefined → null !== undefined → true
            expect(isLoggingInAsNewUser(undefined, undefined)).toBe(true);
        });
    });
});
