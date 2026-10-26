import {getNetSuiteOAuthMigrationSeverity, shouldShowNetSuiteOAuthMigrationNudge, shouldShowNetSuiteOAuthMigrationOption} from '@pages/workspace/accounting/netsuite/utils';

import CONST from '@src/CONST';
import type Policy from '@src/types/onyx/Policy';

import type {OnyxCollection} from 'react-native-onyx';

import createMock from '../../../../../utils/createMock';

type NetSuiteMigrationOverrides = {
    accountID?: string;
    verified?: boolean;
    tokenID?: string;
    tokenSecret?: string;
    authType?: 'tba' | 'oauth2';
    shouldIncludeSyncOptions?: boolean;
    syncTax?: boolean;
    syncReimbursedReports?: boolean;
    syncCustomSegments?: boolean;
    syncCustomLists?: boolean;
    customSegments?: Array<{segmentName: string; internalID: string; scriptID: string; mapping: 'TAG' | 'REPORT_FIELD' | ''}>;
    customLists?: Array<{listName: string; internalID: string; transactionFieldID: string; mapping: 'TAG' | 'REPORT_FIELD' | ''}>;
};

function makeNetSuitePolicy(overrides: NetSuiteMigrationOverrides): Policy {
    const shouldIncludeSyncOptions = overrides.shouldIncludeSyncOptions ?? true;
    return createMock<Policy>({
        role: CONST.POLICY.ROLE.ADMIN,
        connections: {
            netsuite: {
                accountID: 'accountID' in overrides ? overrides.accountID : 'account123',
                verified: 'verified' in overrides ? overrides.verified : true,
                tokenID: 'tokenID' in overrides ? overrides.tokenID : 'token123',
                tokenSecret: 'tokenSecret' in overrides ? overrides.tokenSecret : 'secret456',
                config: overrides.authType !== undefined ? {authType: overrides.authType} : undefined,
                options: shouldIncludeSyncOptions
                    ? {
                          config: {
                              syncOptions: {
                                  syncTax: overrides.syncTax ?? false,
                                  syncReimbursedReports: overrides.syncReimbursedReports ?? false,
                                  syncCustomSegments: overrides.syncCustomSegments ?? false,
                                  syncCustomLists: overrides.syncCustomLists ?? false,
                                  customSegments: overrides.customSegments ?? [],
                                  customLists: overrides.customLists ?? [],
                              },
                          },
                      }
                    : undefined,
            },
        },
    });
}

function makePolicyCollection(...policies: Policy[]): OnyxCollection<Policy> {
    return Object.fromEntries(policies.map((policy, index) => [`policy_${index}`, policy]));
}

describe('shouldShowNetSuiteOAuthMigrationOption', () => {
    it('returns true for a verified TBA connection with an excluded sync setting', () => {
        // Given a verified NetSuite TBA connection that imports taxes
        const policy = makeNetSuitePolicy({syncTax: true});

        // When checking whether to show the optional migration link
        const result = shouldShowNetSuiteOAuthMigrationOption(policy);

        // Then the link is available even though proactive migration nudges are limited
        expect(result).toBe(true);
    });

    it('returns false for an OAuth 2.0 connection', () => {
        // Given a NetSuite connection that already uses OAuth 2.0
        const policy = makeNetSuitePolicy({authType: 'oauth2'});

        // When checking whether to show the optional migration link
        const result = shouldShowNetSuiteOAuthMigrationOption(policy);

        // Then the link is hidden because the connection does not need migration
        expect(result).toBe(false);
    });

    it('returns false for an unverified TBA connection', () => {
        // Given an unverified NetSuite TBA connection
        const policy = makeNetSuitePolicy({verified: false});

        // When checking whether to show the optional migration link
        const result = shouldShowNetSuiteOAuthMigrationOption(policy);

        // Then the link is hidden because the connection is not active
        expect(result).toBe(false);
    });

    it.each([
        ['account ID', {accountID: undefined}],
        ['token ID', {tokenID: undefined}],
        ['token secret', {tokenSecret: undefined}],
    ] satisfies Array<[string, NetSuiteMigrationOverrides]>)('returns false when the %s is missing', (_credentialName, overrides) => {
        // Given a NetSuite TBA connection with an incomplete credential set
        const policy = makeNetSuitePolicy(overrides);

        // When checking whether to show the optional migration link
        const result = shouldShowNetSuiteOAuthMigrationOption(policy);

        // Then the link is hidden because there is no complete TBA connection to migrate
        expect(result).toBe(false);
    });
});

describe('shouldShowNetSuiteOAuthMigrationNudge', () => {
    describe('when the nudge SHOULD be shown', () => {
        it('returns true for a verified TBA connection with no authType set', () => {
            // Given a policy with a verified NetSuite TBA connection and no authType recorded
            const policy = makeNetSuitePolicy({verified: true, tokenID: 'token', tokenSecret: 'secret', authType: undefined});

            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(policy, makePolicyCollection(policy));

            // Then the nudge should be shown because the connection is TBA and not yet migrated
            expect(result).toBe(true);
        });

        it('returns true when authType is tba', () => {
            // Given a policy with authType explicitly set to tba
            const policy = makeNetSuitePolicy({verified: true, tokenID: 'token', tokenSecret: 'secret', authType: 'tba'});

            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(policy, makePolicyCollection(policy));

            // Then the nudge should be shown because the connection is not yet on OAuth 2.0
            expect(result).toBe(true);
        });
    });

    describe('when the nudge should NOT be shown', () => {
        it('returns false when authType is oauth2 (already migrated)', () => {
            // Given a policy where the NetSuite connection has already migrated to OAuth 2.0
            const policy = makeNetSuitePolicy({verified: true, tokenID: 'token', tokenSecret: 'secret', authType: 'oauth2'});

            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(policy, makePolicyCollection(policy));

            // Then the nudge should not be shown because the migration is already complete
            expect(result).toBe(false);
        });

        it('returns false when connection is not verified', () => {
            // Given a policy with a TBA connection that has not been verified yet
            const policy = makeNetSuitePolicy({verified: false, tokenID: 'token', tokenSecret: 'secret'});

            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(policy, makePolicyCollection(policy));

            // Then the nudge should not be shown because the connection is unverified
            expect(result).toBe(false);
        });

        it('returns false when tokenID is missing', () => {
            // Given a policy without a tokenID (not a TBA connection)
            const policy = makeNetSuitePolicy({verified: true, tokenID: undefined, tokenSecret: 'secret'});

            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(policy, makePolicyCollection(policy));

            // Then the nudge should not be shown because there is no TBA token to migrate
            expect(result).toBe(false);
        });

        it('returns false when tokenSecret is missing', () => {
            // Given a policy without a tokenSecret (incomplete TBA credentials)
            const policy = makeNetSuitePolicy({verified: true, tokenID: 'token', tokenSecret: undefined});

            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(policy, makePolicyCollection(policy));

            // Then the nudge should not be shown because the TBA credential pair is incomplete
            expect(result).toBe(false);
        });

        it('returns false when the policy has no netsuite connection', () => {
            // Given a policy with no NetSuite connection at all
            const policy = createMock<Policy>({connections: {}});

            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(policy, makePolicyCollection(policy));

            // Then the nudge should not be shown
            expect(result).toBe(false);
        });

        it('returns false when policy is undefined', () => {
            // Given no policy
            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(undefined, {});

            // Then the nudge should not be shown
            expect(result).toBe(false);
        });

        it('returns false when the connection settings are unavailable', () => {
            // Given a TBA connection whose sync settings are not loaded
            const policy = makeNetSuitePolicy({shouldIncludeSyncOptions: false});

            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(policy, makePolicyCollection(policy));

            // Then the nudge should not be shown because migration eligibility is unknown
            expect(result).toBe(false);
        });

        it('returns false when the policy collection is unavailable', () => {
            // Given a simple TBA connection but no policy collection
            const policy = makeNetSuitePolicy({});

            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(policy, undefined);

            // Then the nudge should not be shown because shared connection eligibility is unknown
            expect(result).toBe(false);
        });

        it('returns false when a TBA sibling policy for the same account has an excluded setting', () => {
            // Given two TBA policies share an account and the sibling imports tax
            const policy = makeNetSuitePolicy({});
            const siblingPolicy = makeNetSuitePolicy({syncTax: true});

            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(policy, makePolicyCollection(policy, siblingPolicy));

            // Then the nudge should not migrate the sibling policy indirectly
            expect(result).toBe(false);
        });

        it('ignores an excluded sibling policy that is already on OAuth 2.0', () => {
            // Given a simple TBA policy and an OAuth sibling policy for the same account
            const policy = makeNetSuitePolicy({});
            const siblingPolicy = makeNetSuitePolicy({authType: 'oauth2', syncTax: true});

            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(policy, makePolicyCollection(policy, siblingPolicy));

            // Then the nudge can be shown because the sibling will not switch transports
            expect(result).toBe(true);
        });

        it('ignores an excluded sibling policy for another NetSuite account', () => {
            // Given a simple TBA policy and a complex TBA policy for another account
            const policy = makeNetSuitePolicy({});
            const siblingPolicy = makeNetSuitePolicy({accountID: 'anotherAccount', syncTax: true});

            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(policy, makePolicyCollection(policy, siblingPolicy));

            // Then the unrelated sibling does not block this account's nudge
            expect(result).toBe(true);
        });

        it.each([
            ['tax import', {syncTax: true}],
            ['reimbursed report sync', {syncReimbursedReports: true}],
            ['custom segment import', {syncCustomSegments: true}],
            ['custom list import', {syncCustomLists: true}],
        ] satisfies Array<[string, NetSuiteMigrationOverrides]>)('returns false when %s is enabled', (_settingName, settings) => {
            // Given a TBA connection with a complex sync setting enabled
            const policy = makeNetSuitePolicy(settings);

            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(policy, makePolicyCollection(policy));

            // Then the nudge should not be shown during the limited rollout
            expect(result).toBe(false);
        });

        it('returns false when custom segments are configured', () => {
            // Given a TBA connection with a configured custom segment or custom record
            const policy = makeNetSuitePolicy({
                customSegments: [{segmentName: 'Region', internalID: '1', scriptID: 'region', mapping: 'TAG'}],
            });

            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(policy, makePolicyCollection(policy));

            // Then the nudge should not be shown during the limited rollout
            expect(result).toBe(false);
        });

        it('returns false when custom lists are configured', () => {
            // Given a TBA connection with a configured custom list
            const policy = makeNetSuitePolicy({
                customLists: [{listName: 'Project', internalID: '2', transactionFieldID: 'project', mapping: 'REPORT_FIELD'}],
            });

            // When checking whether to show the migration nudge
            const result = shouldShowNetSuiteOAuthMigrationNudge(policy, makePolicyCollection(policy));

            // Then the nudge should not be shown during the limited rollout
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
