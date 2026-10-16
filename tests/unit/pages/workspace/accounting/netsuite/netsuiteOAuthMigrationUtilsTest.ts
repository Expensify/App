import {getNetSuiteOAuthMigrationSeverity, shouldShowNetSuiteOAuthMigrationNudge} from '@pages/workspace/accounting/netsuite/utils';

import type Policy from '@src/types/onyx/Policy';

import createMock from '../../../../../utils/createMock';

function makeNetSuitePolicy(overrides: {verified?: boolean; tokenID?: string; tokenSecret?: string; authType?: 'tba' | 'oauth2'}): Policy {
    return createMock<Policy>({
        connections: {
            netsuite: {
                verified: 'verified' in overrides ? overrides.verified : true,
                tokenID: 'tokenID' in overrides ? overrides.tokenID : 'token123',
                tokenSecret: 'tokenSecret' in overrides ? overrides.tokenSecret : 'secret456',
                config: overrides.authType !== undefined ? {authType: overrides.authType} : undefined,
            },
        },
    });
}

describe('shouldShowNetSuiteOAuthMigrationNudge', () => {
    describe('when the nudge SHOULD be shown', () => {
        it('returns true for a verified TBA connection with no authType set', () => {
            // Given a policy with a verified NetSuite TBA connection and no authType recorded
            const policy = makeNetSuitePolicy({verified: true, tokenID: 'token', tokenSecret: 'secret', authType: undefined});

            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(policy);

            // Then the nudge should be shown because the connection is TBA and not yet migrated
            expect(result).toBe(true);
        });

        it('returns true when authType is tba', () => {
            // Given a policy with authType explicitly set to tba
            const policy = makeNetSuitePolicy({verified: true, tokenID: 'token', tokenSecret: 'secret', authType: 'tba'});

            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(policy);

            // Then the nudge should be shown because the connection is not yet on OAuth 2.0
            expect(result).toBe(true);
        });
    });

    describe('when the nudge should NOT be shown', () => {
        it('returns false when authType is oauth2 (already migrated)', () => {
            // Given a policy where the NetSuite connection has already migrated to OAuth 2.0
            const policy = makeNetSuitePolicy({verified: true, tokenID: 'token', tokenSecret: 'secret', authType: 'oauth2'});

            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(policy);

            // Then the nudge should not be shown because the migration is already complete
            expect(result).toBe(false);
        });

        it('returns false when connection is not verified', () => {
            // Given a policy with a TBA connection that has not been verified yet
            const policy = makeNetSuitePolicy({verified: false, tokenID: 'token', tokenSecret: 'secret'});

            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(policy);

            // Then the nudge should not be shown because the connection is unverified
            expect(result).toBe(false);
        });

        it('returns false when tokenID is missing', () => {
            // Given a policy without a tokenID (not a TBA connection)
            const policy = makeNetSuitePolicy({verified: true, tokenID: undefined, tokenSecret: 'secret'});

            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(policy);

            // Then the nudge should not be shown because there is no TBA token to migrate
            expect(result).toBe(false);
        });

        it('returns false when tokenSecret is missing', () => {
            // Given a policy without a tokenSecret (incomplete TBA credentials)
            const policy = makeNetSuitePolicy({verified: true, tokenID: 'token', tokenSecret: undefined});

            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(policy);

            // Then the nudge should not be shown because the TBA credential pair is incomplete
            expect(result).toBe(false);
        });

        it('returns false when the policy has no netsuite connection', () => {
            // Given a policy with no NetSuite connection at all
            const policy = createMock<Policy>({connections: {}});

            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(policy);

            // Then the nudge should not be shown
            expect(result).toBe(false);
        });

        it('returns false when policy is undefined', () => {
            // Given no policy
            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(undefined);

            // Then the nudge should not be shown
            expect(result).toBe(false);
        });
    });
});

describe('getNetSuiteOAuthMigrationSeverity', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    it('returns danger when fewer than 30 days remain before the deadline', () => {
        // Given today is 20 days before the Feb 2027 deadline
        jest.useFakeTimers({now: new Date('2027-01-12').getTime()});

        // When computing the severity
        const severity = getNetSuiteOAuthMigrationSeverity();

        // Then severity is danger because the deadline is imminent
        expect(severity).toBe('danger');
    });

    it('returns danger on the exact 30-day boundary', () => {
        // Given today is exactly 30 days before the deadline (boundary is <= 30 → danger)
        jest.useFakeTimers({now: new Date('2027-01-02').getTime()});

        // When computing the severity
        const severity = getNetSuiteOAuthMigrationSeverity();

        // Then severity is danger
        expect(severity).toBe('danger');
    });

    it('returns warning when between 31 and 90 days remain', () => {
        // Given today is 60 days before the Feb 2027 deadline
        jest.useFakeTimers({now: new Date('2026-12-03').getTime()});

        // When computing the severity
        const severity = getNetSuiteOAuthMigrationSeverity();

        // Then severity is warning because the deadline is approaching
        expect(severity).toBe('warning');
    });

    it('returns warning on the exact 90-day boundary', () => {
        // Given today is exactly 90 days before the deadline (boundary is <= 90 → warning)
        jest.useFakeTimers({now: new Date('2026-11-03').getTime()});

        // When computing the severity
        const severity = getNetSuiteOAuthMigrationSeverity();

        // Then severity is warning
        expect(severity).toBe('warning');
    });

    it('returns info when more than 90 days remain', () => {
        // Given today is 200 days before the Feb 2027 deadline
        jest.useFakeTimers({now: new Date('2026-07-16').getTime()});

        // When computing the severity
        const severity = getNetSuiteOAuthMigrationSeverity();

        // Then severity is info because the deadline is far away
        expect(severity).toBe('info');
    });
});
