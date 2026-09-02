import {
    getConnectedATSProvider,
    getMergeATSApprovalMode,
    getMergeATSApproverField,
    getMergeATSOfficesLabel,
    getMergeATSStagesLabel,
    getMergeATSTagsLabel,
    isMergeATSCompleteSetupNeeded,
    shouldShowRecruitingConnectionError,
} from '@libs/merge/RecruitingUtils';

import CONST from '@src/CONST';
import MERGE_ATS_PROVIDERS from '@src/CONST/MERGE_ATS_PROVIDERS';
import type {MergeATSProviderSlug} from '@src/CONST/MERGE_ATS_PROVIDERS';
import type {ConnectionLastSync, Connections, MergeATSConnectionConfig, MergeConnectionLastSync} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';

const MERGE_ATS = CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS;

const POLICY_ID = 'ABC123';

function makePolicy(overrides: Partial<Policy> = {}): Policy {
    return {
        id: POLICY_ID,
        name: 'Test Workspace',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: 'owner@test.com',
        ownerAccountID: 1,
        outputCurrency: 'USD',
        ...overrides,
    };
}

function makeLastSync(overrides: Partial<ConnectionLastSync> = {}): ConnectionLastSync {
    return {
        isAuthenticationError: false,
        isSuccessful: true,
        source: 'NEWEXPENSIFY',
        ...overrides,
    };
}

function makeMergeATSConnection({
    config,
    data,
    lastSync,
}: {
    config?: Partial<MergeATSConnectionConfig>;
    data?: Connections[typeof MERGE_ATS]['data'];
    lastSync?: Partial<MergeConnectionLastSync>;
} = {}): Connections[typeof MERGE_ATS] {
    return {
        config: {
            integration: 'greenhouse',
            approvalMode: null,
            finalApprover: null,
            filters: null,
            approverField: null,
            ...config,
        },
        data,
        lastSync: {
            ...makeLastSync(lastSync),
            syncStatus: lastSync?.syncStatus,
            syncType: lastSync?.syncType,
            manualSyncTimestamps: lastSync?.manualSyncTimestamps,
        },
    };
}

function makeMergeATSPolicy(connectionOverrides: Parameters<typeof makeMergeATSConnection>[0] = {}): Policy {
    return makePolicy({
        connections: {[MERGE_ATS]: makeMergeATSConnection(connectionOverrides)},
    });
}

describe('RecruitingUtils', () => {
    describe('getConnectedATSProvider', () => {
        it('returns null when no ATS provider is connected', () => {
            expect(getConnectedATSProvider(undefined)).toBeNull();
            expect(getConnectedATSProvider(makePolicy())).toBeNull();
        });

        it('returns the provider brand info for a connected Merge ATS integration', () => {
            expect(getConnectedATSProvider(makeMergeATSPolicy({config: {integration: 'greenhouse'}}))).toEqual({
                connectionName: MERGE_ATS,
                displayName: MERGE_ATS_PROVIDERS.greenhouse.displayName,
                iconUrl: MERGE_ATS_PROVIDERS.greenhouse.iconUrl,
                mergeSlug: 'greenhouse',
            });
        });

        it('falls back to the generic Merge ATS name when the integration slug is unknown', () => {
            // The slug is set by the backend, so it can be missing or a provider we do not know about yet.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- deliberately simulating a slug we cannot resolve
            const policy = makeMergeATSPolicy({config: {integration: undefined as unknown as MergeATSProviderSlug}});

            expect(getConnectedATSProvider(policy)).toEqual({
                connectionName: MERGE_ATS,
                displayName: CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.merge_ats,
                iconUrl: undefined,
                mergeSlug: undefined,
            });
        });
    });

    describe('getMergeATSTagsLabel', () => {
        it('returns undefined when there is no connection, no filters, or no tag selected', () => {
            expect(getMergeATSTagsLabel(undefined)).toBeUndefined();
            expect(getMergeATSTagsLabel(makePolicy())).toBeUndefined();
            expect(getMergeATSTagsLabel(makeMergeATSPolicy())).toBeUndefined();
            expect(getMergeATSTagsLabel(makeMergeATSPolicy({config: {filters: {tags: []}}}))).toBeUndefined();
        });

        it('uses the selected tag names as-is', () => {
            const policy = makeMergeATSPolicy({config: {filters: {tags: ['Engineering', 'Design']}}});
            expect(getMergeATSTagsLabel(policy)).toBe('Engineering and Design');
        });

        it('ignores the other filter dimensions', () => {
            const policy = makeMergeATSPolicy({
                config: {filters: {tags: ['Engineering'], stages: ['Offer'], offices: ['o1']}},
                data: {offices: [{id: 'o1', name: 'New York'}]},
            });
            expect(getMergeATSTagsLabel(policy)).toBe('Engineering');
        });
    });

    describe('getMergeATSStagesLabel', () => {
        it('returns undefined when there is no connection, no filters, or no stage selected', () => {
            expect(getMergeATSStagesLabel(undefined)).toBeUndefined();
            expect(getMergeATSStagesLabel(makePolicy())).toBeUndefined();
            expect(getMergeATSStagesLabel(makeMergeATSPolicy())).toBeUndefined();
            expect(getMergeATSStagesLabel(makeMergeATSPolicy({config: {filters: {stages: []}}}))).toBeUndefined();
        });

        it('uses the selected stage names as-is, even when the stage catalog is available', () => {
            const policy = makeMergeATSPolicy({
                config: {filters: {stages: ['Offer', 'Phone Screen']}},
                data: {stages: [{id: 's1', name: 'Offer'}]},
            });
            expect(getMergeATSStagesLabel(policy)).toBe('Offer and Phone Screen');
        });

        it('ignores the other filter dimensions', () => {
            const policy = makeMergeATSPolicy({
                config: {filters: {tags: ['Engineering'], stages: ['Offer'], offices: ['o1']}},
                data: {offices: [{id: 'o1', name: 'New York'}]},
            });
            expect(getMergeATSStagesLabel(policy)).toBe('Offer');
        });
    });

    describe('getMergeATSOfficesLabel', () => {
        it('returns undefined when there is no connection, no filters, or no office selected', () => {
            expect(getMergeATSOfficesLabel(undefined)).toBeUndefined();
            expect(getMergeATSOfficesLabel(makePolicy())).toBeUndefined();
            expect(getMergeATSOfficesLabel(makeMergeATSPolicy())).toBeUndefined();
            expect(getMergeATSOfficesLabel(makeMergeATSPolicy({config: {filters: {offices: []}}}))).toBeUndefined();
        });

        it('resolves the selected office ids to their display names', () => {
            const policy = makeMergeATSPolicy({
                config: {filters: {offices: ['o1', 'o2']}},
                data: {
                    offices: [
                        {id: 'o1', name: 'New York'},
                        {id: 'o2', name: 'Remote - EU'},
                    ],
                },
            });
            expect(getMergeATSOfficesLabel(policy)).toBe('New York and Remote - EU');
        });

        it('drops office ids that are not in the office catalog', () => {
            const policy = makeMergeATSPolicy({
                config: {filters: {offices: ['o1', 'missing']}},
                data: {offices: [{id: 'o1', name: 'New York'}]},
            });
            expect(getMergeATSOfficesLabel(policy)).toBe('New York');
        });

        it('returns undefined when none of the selected office ids resolve', () => {
            const policy = makeMergeATSPolicy({
                config: {filters: {offices: ['missing']}},
                data: {offices: [{id: 'o1', name: 'New York'}]},
            });
            expect(getMergeATSOfficesLabel(policy)).toBeUndefined();
        });

        it('ignores the other filter dimensions', () => {
            const policy = makeMergeATSPolicy({config: {filters: {tags: ['Engineering'], stages: ['Offer']}}});
            expect(getMergeATSOfficesLabel(policy)).toBeUndefined();
        });
    });

    describe('isMergeATSCompleteSetupNeeded', () => {
        it('returns false when not connected', () => {
            expect(isMergeATSCompleteSetupNeeded(undefined)).toBe(false);
            expect(isMergeATSCompleteSetupNeeded(makePolicy())).toBe(false);
        });

        it('returns false while the initial sync is still in progress', () => {
            const policy = makeMergeATSPolicy({
                lastSync: {
                    syncStatus: CONST.MERGE.SYNC_STATUS.SYNCING,
                    syncType: CONST.MERGE.SYNC_TYPE.INITIAL,
                },
            });
            expect(isMergeATSCompleteSetupNeeded(policy)).toBe(false);
        });

        it('returns false when the sync is done but no filter options were returned', () => {
            const policy = makeMergeATSPolicy({
                data: {},
                lastSync: {syncStatus: CONST.MERGE.SYNC_STATUS.DONE},
            });
            expect(isMergeATSCompleteSetupNeeded(policy)).toBe(false);
        });

        it('returns false when the setup is already complete', () => {
            const policy = makeMergeATSPolicy({
                config: {filters: {stages: ['Offer']}},
                data: {stages: [{id: 's1', name: 'Offer'}]},
                lastSync: {syncStatus: CONST.MERGE.SYNC_STATUS.DONE},
            });
            expect(isMergeATSCompleteSetupNeeded(policy)).toBe(false);
        });

        it('returns true when the sync is done, filter options are available, and the admin has not chosen filters yet', () => {
            const policy = makeMergeATSPolicy({
                data: {stages: [{id: 's1', name: 'Offer'}]},
                lastSync: {syncStatus: CONST.MERGE.SYNC_STATUS.DONE},
            });
            expect(isMergeATSCompleteSetupNeeded(policy)).toBe(true);
        });
    });

    describe('getMergeATSApprovalMode', () => {
        it('returns null when there is no connection or no approval mode', () => {
            expect(getMergeATSApprovalMode(undefined)).toBeNull();
            expect(getMergeATSApprovalMode(makePolicy())).toBeNull();
            expect(getMergeATSApprovalMode(makeMergeATSPolicy())).toBeNull();
        });

        it('returns the configured approval mode', () => {
            const policy = makeMergeATSPolicy({
                config: {approvalMode: CONST.MERGE.APPROVAL_MODE.CUSTOM},
            });
            expect(getMergeATSApprovalMode(policy)).toBe(CONST.MERGE.APPROVAL_MODE.CUSTOM);
        });
    });

    describe('getMergeATSApproverField', () => {
        it('returns null when there is no connection or no approver field', () => {
            expect(getMergeATSApproverField(undefined)).toBeNull();
            expect(getMergeATSApproverField(makePolicy())).toBeNull();
            expect(getMergeATSApproverField(makeMergeATSPolicy())).toBeNull();
        });

        it('returns the configured approver field', () => {
            expect(getMergeATSApproverField(makeMergeATSPolicy({config: {approverField: 'recruiter'}}))).toBe('recruiter');
        });
    });

    describe('shouldShowRecruitingConnectionError', () => {
        it('returns false when the user is not an admin', () => {
            const policy = makeMergeATSPolicy({
                lastSync: {syncStatus: CONST.MERGE.SYNC_STATUS.FAILED},
            });
            expect(shouldShowRecruitingConnectionError(policy, false)).toBe(false);
        });

        it('returns false when no recruiting integration is connected', () => {
            expect(shouldShowRecruitingConnectionError(undefined, true)).toBe(false);
            expect(shouldShowRecruitingConnectionError(makePolicy(), true)).toBe(false);
        });

        it('returns false when the last sync was fine', () => {
            const policy = makeMergeATSPolicy({
                lastSync: {syncStatus: CONST.MERGE.SYNC_STATUS.DONE},
            });
            expect(shouldShowRecruitingConnectionError(policy, true)).toBe(false);
        });

        it('returns true when the connection needs to be reconnected', () => {
            const policy = makeMergeATSPolicy({
                lastSync: {isAuthenticationError: true},
            });
            expect(shouldShowRecruitingConnectionError(policy, true)).toBe(true);
        });

        it('returns true when the last sync failed', () => {
            const policy = makeMergeATSPolicy({
                lastSync: {syncStatus: CONST.MERGE.SYNC_STATUS.FAILED},
            });
            expect(shouldShowRecruitingConnectionError(policy, true)).toBe(true);
        });
    });
});
