import {renderHook} from '@testing-library/react-native';

import useTimeSensitiveNetSuiteMigration from '@pages/home/TimeSensitiveSection/hooks/useTimeSensitiveNetSuiteMigration';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Policy from '@src/types/onyx/Policy';

import type {PartialDeep} from 'type-fest';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

function makePolicy(id: string, overrides: PartialDeep<Policy, {recurseIntoArrays: true}> = {}): Policy {
    return createMock<Policy>({
        id,
        name: overrides.name ?? `Workspace ${id}`,
        role: overrides.role ?? CONST.POLICY.ROLE.ADMIN,
        ...overrides,
    });
}

/** Returns a policy with a verified TBA NetSuite connection that requires migration. */
function makeNetSuitePolicy(id: string, nameOverride?: string): Policy {
    return makePolicy(id, {
        name: nameOverride ?? `NetSuite Workspace ${id}`,
        connections: {
            netsuite: {
                accountID: 'account123',
                verified: true,
                tokenID: 'token123',
                tokenSecret: 'secret456',
                options: {config: {syncOptions: {}}},
            },
        },
    });
}

describe('useTimeSensitiveNetSuiteMigration', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    describe('when no policies qualify', () => {
        it('returns an empty array when there are no policies', () => {
            // Given no policies in Onyx
            // When the hook renders
            const {result} = renderHook(() => useTimeSensitiveNetSuiteMigration());

            // Then no migration policies are returned
            expect(result.current.netSuiteMigrationPolicies).toEqual([]);
        });

        it('returns an empty array when the policy has no NetSuite connection', async () => {
            // Given an admin policy with no accounting connections
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy1`, makePolicy('policy1'));
            await waitForBatchedUpdates();

            // When the hook renders
            const {result} = renderHook(() => useTimeSensitiveNetSuiteMigration());

            // Then no migration policies are returned
            expect(result.current.netSuiteMigrationPolicies).toEqual([]);
        });

        it('returns an empty array when the NetSuite connection is not verified', async () => {
            // Given an admin policy with an unverified NetSuite connection
            const policy = makePolicy('policy1', {
                connections: {
                    netsuite: {verified: false, tokenID: 'token', tokenSecret: 'secret'},
                },
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy1`, policy);
            await waitForBatchedUpdates();

            // When the hook renders
            const {result} = renderHook(() => useTimeSensitiveNetSuiteMigration());

            // Then the connection is excluded because it is unverified
            expect(result.current.netSuiteMigrationPolicies).toEqual([]);
        });

        it('returns an empty array when the NetSuite connection has no tokenID', async () => {
            // Given a verified NetSuite connection without a TBA token (not a TBA connection)
            const policy = makePolicy('policy1', {
                connections: {
                    netsuite: {verified: true, tokenID: undefined, tokenSecret: 'secret'},
                },
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy1`, policy);
            await waitForBatchedUpdates();

            // When the hook renders
            const {result} = renderHook(() => useTimeSensitiveNetSuiteMigration());

            // Then the connection is excluded because it has no TBA credentials to migrate
            expect(result.current.netSuiteMigrationPolicies).toEqual([]);
        });

        it('returns an empty array when the NetSuite connection is already on OAuth 2.0', async () => {
            // Given a verified NetSuite connection where authType is already oauth2
            const policy = makePolicy('policy1', {
                connections: {
                    netsuite: {
                        accountID: 'account123',
                        verified: true,
                        tokenID: 'token',
                        tokenSecret: 'secret',
                        config: {authType: 'oauth2'},
                    },
                },
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy1`, policy);
            await waitForBatchedUpdates();

            // When the hook renders
            const {result} = renderHook(() => useTimeSensitiveNetSuiteMigration());

            // Then the policy is excluded because the connection is already migrated
            expect(result.current.netSuiteMigrationPolicies).toEqual([]);
        });

        it('returns an empty array when the user is not an admin on the policy', async () => {
            // Given a member-role policy with a qualifying NetSuite connection
            const policy = makePolicy('policy1', {
                role: CONST.POLICY.ROLE.USER,
                connections: {
                    netsuite: {verified: true, tokenID: 'token', tokenSecret: 'secret'},
                },
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy1`, policy);
            await waitForBatchedUpdates();

            // When the hook renders
            const {result} = renderHook(() => useTimeSensitiveNetSuiteMigration());

            // Then the policy is excluded because only admins see the migration nudge
            expect(result.current.netSuiteMigrationPolicies).toEqual([]);
        });

        it('returns an empty array when the policy is pending deletion', async () => {
            // Given a qualifying policy is being deleted
            const policy = {
                ...makeNetSuitePolicy('policy1'),
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy1`, policy);
            await waitForBatchedUpdates();

            // When the hook renders
            const {result} = renderHook(() => useTimeSensitiveNetSuiteMigration());

            // Then the policy is excluded while deletion is pending
            expect(result.current.netSuiteMigrationPolicies).toEqual([]);
        });
    });

    describe('when policies qualify', () => {
        it('returns the policy when it has a qualifying TBA NetSuite connection', async () => {
            // Given an admin policy with a verified, un-migrated TBA NetSuite connection
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy1`, makeNetSuitePolicy('policy1', 'Acme Corp'));
            await waitForBatchedUpdates();

            // When the hook renders
            const {result} = renderHook(() => useTimeSensitiveNetSuiteMigration());

            // Then the policy is included in the migration list
            expect(result.current.netSuiteMigrationPolicies).toHaveLength(1);
            expect(result.current.netSuiteMigrationPolicies.at(0)).toMatchObject({
                policyID: 'policy1',
                policyName: 'Acme Corp',
            });
        });

        it('returns the policy when authType is explicitly tba (not yet migrated)', async () => {
            // Given a verified NetSuite connection where authType is set to tba
            const policy = makePolicy('policy1', {
                name: 'TBA Corp',
                connections: {
                    netsuite: {
                        accountID: 'account123',
                        verified: true,
                        tokenID: 'token',
                        tokenSecret: 'secret',
                        config: {authType: 'tba'},
                        options: {config: {syncOptions: {}}},
                    },
                },
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy1`, policy);
            await waitForBatchedUpdates();

            // When the hook renders
            const {result} = renderHook(() => useTimeSensitiveNetSuiteMigration());

            // Then the policy is included because authType tba is not yet migrated
            expect(result.current.netSuiteMigrationPolicies).toHaveLength(1);
            expect(result.current.netSuiteMigrationPolicies.at(0)?.policyID).toBe('policy1');
        });

        it('returns multiple policies when several admin workspaces need migration', async () => {
            // Given three admin workspaces with qualifying TBA NetSuite connections
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy1`, makeNetSuitePolicy('policy1', 'Alpha'));
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy2`, makeNetSuitePolicy('policy2', 'Beta'));
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy3`, makeNetSuitePolicy('policy3', 'Gamma'));
            await waitForBatchedUpdates();

            // When the hook renders
            const {result} = renderHook(() => useTimeSensitiveNetSuiteMigration());

            // Then all three policies are returned
            expect(result.current.netSuiteMigrationPolicies).toHaveLength(3);
            const ids = result.current.netSuiteMigrationPolicies.map((p) => p.policyID);
            expect(ids).toContain('policy1');
            expect(ids).toContain('policy2');
            expect(ids).toContain('policy3');
        });

        it('filters out non-qualifying policies and includes only qualifying ones', async () => {
            // Given one qualifying TBA policy and one already-migrated policy
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy1`, makeNetSuitePolicy('policy1', 'Needs Migration'));
            await Onyx.merge(
                `${ONYXKEYS.COLLECTION.POLICY}policy2`,
                makePolicy('policy2', {
                    name: 'Already Migrated',
                    connections: {
                        netsuite: {
                            verified: true,
                            tokenID: 'token',
                            tokenSecret: 'secret',
                            config: {authType: 'oauth2'},
                        },
                    },
                }),
            );
            await waitForBatchedUpdates();

            // When the hook renders
            const {result} = renderHook(() => useTimeSensitiveNetSuiteMigration());

            // Then only the un-migrated policy is returned
            expect(result.current.netSuiteMigrationPolicies).toHaveLength(1);
            expect(result.current.netSuiteMigrationPolicies.at(0)?.policyID).toBe('policy1');
        });

        it('excludes shared connections when one TBA policy uses an unsupported setting', async () => {
            // Given two policies share a NetSuite account and one imports tax
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy1`, makeNetSuitePolicy('policy1', 'Simple Workspace'));
            await Onyx.merge(
                `${ONYXKEYS.COLLECTION.POLICY}policy2`,
                makePolicy('policy2', {
                    connections: {
                        netsuite: {
                            accountID: 'account123',
                            verified: true,
                            tokenID: 'token123',
                            tokenSecret: 'secret456',
                            options: {config: {syncOptions: {syncTax: true}}},
                        },
                    },
                }),
            );
            await waitForBatchedUpdates();

            // When the hook renders
            const {result} = renderHook(() => useTimeSensitiveNetSuiteMigration());

            // Then neither policy is offered because OAuth migration updates both policies
            expect(result.current.netSuiteMigrationPolicies).toEqual([]);
        });
    });

    describe('reactivity to Onyx changes', () => {
        it('updates when a policy is migrated to OAuth 2.0 (authType becomes oauth2)', async () => {
            // Given a qualifying TBA policy
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy1`, makeNetSuitePolicy('policy1'));
            await waitForBatchedUpdates();

            const {result, rerender} = renderHook(() => useTimeSensitiveNetSuiteMigration());
            expect(result.current.netSuiteMigrationPolicies).toHaveLength(1);

            // When the policy is migrated (authType updated to oauth2)
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy1`, {
                connections: {netsuite: {config: {authType: 'oauth2'}}},
            });
            await waitForBatchedUpdates();
            rerender({});

            // Then the policy is removed from the migration list
            expect(result.current.netSuiteMigrationPolicies).toHaveLength(0);
        });

        it('updates when a new qualifying policy is added to Onyx', async () => {
            // Given no policies initially
            const {result, rerender} = renderHook(() => useTimeSensitiveNetSuiteMigration());
            expect(result.current.netSuiteMigrationPolicies).toHaveLength(0);

            // When a new qualifying policy is written to Onyx
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy1`, makeNetSuitePolicy('policy1', 'New Workspace'));
            await waitForBatchedUpdates();
            rerender({});

            // Then the new policy appears in the migration list
            expect(result.current.netSuiteMigrationPolicies).toHaveLength(1);
            expect(result.current.netSuiteMigrationPolicies.at(0)?.policyName).toBe('New Workspace');
        });
    });
});
