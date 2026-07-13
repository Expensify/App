import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {
    getConnectedHRProvider,
    getHRApprovalMode,
    getMergeHRFinalApprover,
    isAnyHRConnected,
    isAnyHRReadOnlyWorkflowMode,
    isMergeHRCompleteSetupNeeded,
    isMergeHRConnected,
    isMergeHRManualSyncLimitReached,
    shouldShowHRConnectionError,
} from '@libs/HRUtils';

import {getApprovalModeLabel, getHRCards, getHRCardState} from '@pages/workspace/hr/utils';
import type {HRCardDescriptor} from '@pages/workspace/hr/utils';

import CONST from '@src/CONST';
import MERGE_HR_PROVIDERS from '@src/CONST/MERGE_HR_PROVIDERS';
import ROUTES from '@src/ROUTES';
import type {
    ConnectionLastSync,
    Connections,
    GustoConnectionConfig,
    MergeHRConnectionConfig,
    MergeHRConnectionLastSync,
    PolicyConnectionSyncProgress,
    ZenefitsConnectionConfig,
} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';
import type IconAsset from '@src/types/utils/IconAsset';

import createRandomPolicy from '../utils/collections/policies';

jest.mock('@libs/PersonalDetailsUtils', () => ({
    getPersonalDetailByEmail: jest.fn(() => null),
    getDisplayNameOrDefault: jest.fn((_detail: unknown, fallback: string) => fallback),
    temporaryGetDisplayNameOrDefault: jest.fn(({defaultValue}: {defaultValue: string}) => defaultValue),
}));

const GUSTO = CONST.POLICY.CONNECTIONS.NAME.GUSTO;
const ZENEFITS = CONST.POLICY.CONNECTIONS.NAME.ZENEFITS;
const MERGE_HR = CONST.POLICY.CONNECTIONS.NAME.MERGE_HR;

const STUB_ICON = {} as IconAsset;
const POLICY_ID = 'ABC123';
const SYNC_TIMEOUT = CONST.POLICY.CONNECTIONS.SYNC_STAGE_TIMEOUT_MINUTES;

type GetHRCardsParams = Parameters<typeof getHRCards>[0];

// `Connections` marks every integration as required, but a real policy only carries the connections it has
// actually set up (a type bug to fix one day). We accept a partial `connections` and let the single `as Policy`
// cast below absorb it here, so individual tests can pass just the connection(s) they care about.
function makePolicy(overrides: Partial<Omit<Policy, 'connections'>> & {connections?: Partial<Connections>} = {}): Policy {
    return {
        id: POLICY_ID,
        name: 'Test Workspace',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: 'owner@test.com',
        ownerAccountID: 1,
        isPolicyExpenseChatEnabled: true,
        outputCurrency: 'USD',
        ...overrides,
    } as Policy;
}

function makeLastSync(overrides: Partial<ConnectionLastSync> = {}): ConnectionLastSync {
    return {
        isAuthenticationError: false,
        isSuccessful: true,
        source: 'NEWEXPENSIFY',
        ...overrides,
    };
}

function makeGustoConnection({config, lastSync}: {config?: Partial<GustoConnectionConfig>; lastSync?: Partial<ConnectionLastSync>} = {}): Connections[typeof GUSTO] {
    return {
        config: {finalApprover: null, approvalMode: null, ...config},
        lastSync: makeLastSync(lastSync),
    };
}

function makeZenefitsConnection({config, lastSync}: {config?: Partial<ZenefitsConnectionConfig>; lastSync?: Partial<ConnectionLastSync>} = {}): Connections[typeof ZENEFITS] {
    return {
        config: {finalApprover: null, approvalMode: null, isConfigured: false, ...config},
        lastSync: makeLastSync(lastSync),
    };
}

function makeMergeHRConnection({
    config,
    data,
    lastSync,
}: {
    config?: Partial<MergeHRConnectionConfig>;
    data?: Connections[typeof MERGE_HR]['data'];
    lastSync?: Partial<MergeHRConnectionLastSync>;
} = {}): Connections[typeof MERGE_HR] {
    return {
        config: {integration: 'workday', approvalMode: null, finalApprover: null, groups: null, ...config},
        data,
        lastSync: {
            ...makeLastSync(lastSync),
            syncStatus: lastSync?.syncStatus,
            syncType: lastSync?.syncType,
            manualSyncTimestamps: lastSync?.manualSyncTimestamps,
        },
    };
}

function makeSyncProgress(connectionName: string, stage: string, minutesAgo = 1): PolicyConnectionSyncProgress {
    const timestamp = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
    return {
        stageInProgress: stage,
        connectionName,
        timestamp,
    } as PolicyConnectionSyncProgress;
}

const stubGetLocalDateFromDatetime: LocaleContextProps['getLocalDateFromDatetime'] = (datetime) => (datetime ? new Date(datetime) : new Date(0));
const stubTranslate = ((key: string) => key) as unknown as LocaleContextProps['translate'];

function getRow(card: HRCardDescriptor | undefined, field: string) {
    return card?.configRows?.find((row) => row.field === field);
}

function makeGetHRCardsParams(overrides: Partial<GetHRCardsParams> = {}): GetHRCardsParams {
    return {
        policy: makePolicy(),
        connectionSyncProgress: undefined,
        getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
        translate: stubTranslate,
        policyID: POLICY_ID,
        gustoIcon: STUB_ICON,
        trinetIcon: STUB_ICON,
        ...overrides,
    };
}

describe('HRUtils', () => {
    describe('isMergeHRConnected', () => {
        it('returns false for undefined policy', () => {
            expect(isMergeHRConnected(undefined)).toBe(false);
        });

        it('returns false for policy with no connections', () => {
            const policy = createRandomPolicy(0);
            delete policy.connections;
            expect(isMergeHRConnected(policy)).toBe(false);
        });

        it('returns true for policy with merge_hris connection', () => {
            const policy = makePolicy({
                connections: {[MERGE_HR]: makeMergeHRConnection({config: {integration: 'workday'}})},
            });
            expect(isMergeHRConnected(policy)).toBe(true);
        });

        it('returns false for policy with gusto connection only', () => {
            const policy = makePolicy({
                connections: {[GUSTO]: makeGustoConnection()},
            });
            expect(isMergeHRConnected(policy)).toBe(false);
        });
    });

    describe('getConnectedHRProvider', () => {
        it('returns null for no connections', () => {
            const policy = createRandomPolicy(0);
            delete policy.connections;
            expect(getConnectedHRProvider(policy)).toBeNull();
        });

        it('returns Gusto when only Gusto is connected', () => {
            const policy = makePolicy({
                connections: {[GUSTO]: makeGustoConnection()},
            });
            const provider = getConnectedHRProvider(policy);
            expect(provider?.connectionName).toBe(CONST.POLICY.CONNECTIONS.NAME.GUSTO);
        });

        it('prefers Gusto when both Gusto and Zenefits are connected', () => {
            const policy = makePolicy({
                connections: {
                    [GUSTO]: makeGustoConnection(),
                    [ZENEFITS]: makeZenefitsConnection({config: {isConfigured: true}}),
                },
            });
            const provider = getConnectedHRProvider(policy);
            expect(provider?.connectionName).toBe(CONST.POLICY.CONNECTIONS.NAME.GUSTO);
        });

        it('returns Merge HR with displayName from integration slug', () => {
            const policy = makePolicy({
                connections: {[MERGE_HR]: makeMergeHRConnection({config: {integration: 'workday'}})},
            });
            const provider = getConnectedHRProvider(policy);
            expect(provider?.connectionName).toBe(CONST.POLICY.CONNECTIONS.NAME.MERGE_HR);
            expect(provider?.displayName).toBe('Workday');
            expect(provider?.mergeSlug).toBe('workday');
        });
    });

    describe('isAnyHRConnected', () => {
        it('returns false for empty connections', () => {
            const policy = makePolicy({connections: {}});
            expect(isAnyHRConnected(policy)).toBe(false);
        });

        it('returns true for Gusto', () => {
            const policy = makePolicy({
                connections: {[GUSTO]: makeGustoConnection()},
            });
            expect(isAnyHRConnected(policy)).toBe(true);
        });

        it('returns true for Zenefits', () => {
            const policy = makePolicy({
                connections: {[ZENEFITS]: makeZenefitsConnection({config: {isConfigured: true}})},
            });
            expect(isAnyHRConnected(policy)).toBe(true);
        });

        it('returns true for Merge HR', () => {
            const policy = makePolicy({
                connections: {[MERGE_HR]: makeMergeHRConnection({config: {integration: 'workday'}})},
            });
            expect(isAnyHRConnected(policy)).toBe(true);
        });
    });

    describe('isAnyHRReadOnlyWorkflowMode', () => {
        it('returns false with no HR connections', () => {
            const policy = makePolicy({connections: {}});
            expect(isAnyHRReadOnlyWorkflowMode(policy)).toBe(false);
        });

        it('returns false with custom mode for Gusto', () => {
            const policy = makePolicy({
                connections: {[GUSTO]: makeGustoConnection({config: {approvalMode: CONST.GUSTO.APPROVAL_MODE.CUSTOM}})},
            });
            expect(isAnyHRReadOnlyWorkflowMode(policy)).toBe(false);
        });

        it('returns true with basic mode for Gusto', () => {
            const policy = makePolicy({
                connections: {[GUSTO]: makeGustoConnection({config: {approvalMode: CONST.GUSTO.APPROVAL_MODE.BASIC}})},
            });
            expect(isAnyHRReadOnlyWorkflowMode(policy)).toBe(true);
        });

        it('returns true with manager mode for Zenefits', () => {
            const policy = makePolicy({
                connections: {[ZENEFITS]: makeZenefitsConnection({config: {approvalMode: CONST.ZENEFITS.APPROVAL_MODE.MANAGER}})},
            });
            expect(isAnyHRReadOnlyWorkflowMode(policy)).toBe(true);
        });

        it('returns true with basic mode for Merge HR', () => {
            const policy = makePolicy({
                connections: {[MERGE_HR]: makeMergeHRConnection({config: {approvalMode: CONST.MERGE_HR.APPROVAL_MODE.BASIC, integration: 'workday'}})},
            });
            expect(isAnyHRReadOnlyWorkflowMode(policy)).toBe(true);
        });
    });

    describe('getHRApprovalMode', () => {
        it('returns null for no connection', () => {
            const policy = makePolicy({connections: {}});
            expect(getHRApprovalMode(policy, undefined)).toBeNull();
        });

        it('returns correct mode for Gusto', () => {
            const policy = makePolicy({
                connections: {[GUSTO]: makeGustoConnection({config: {approvalMode: CONST.GUSTO.APPROVAL_MODE.CUSTOM}})},
            });
            expect(getHRApprovalMode(policy, CONST.POLICY.CONNECTIONS.NAME.GUSTO)).toBe(CONST.GUSTO.APPROVAL_MODE.CUSTOM);
        });

        it('returns correct mode for Zenefits', () => {
            const policy = makePolicy({
                connections: {[ZENEFITS]: makeZenefitsConnection({config: {approvalMode: CONST.ZENEFITS.APPROVAL_MODE.MANAGER}})},
            });
            expect(getHRApprovalMode(policy, CONST.POLICY.CONNECTIONS.NAME.ZENEFITS)).toBe(CONST.ZENEFITS.APPROVAL_MODE.MANAGER);
        });

        it('returns correct mode for Merge HR', () => {
            const policy = makePolicy({
                connections: {[MERGE_HR]: makeMergeHRConnection({config: {approvalMode: CONST.MERGE_HR.APPROVAL_MODE.BASIC, integration: 'workday'}})},
            });
            expect(getHRApprovalMode(policy, CONST.POLICY.CONNECTIONS.NAME.MERGE_HR)).toBe(CONST.MERGE_HR.APPROVAL_MODE.BASIC);
        });

        it('returns null for unknown connection name', () => {
            const policy = makePolicy({connections: {}});
            expect(getHRApprovalMode(policy, CONST.POLICY.CONNECTIONS.NAME.GUSTO)).toBeNull();
        });
    });

    describe('getMergeHRFinalApprover', () => {
        it('returns finalApprover when in basic mode', () => {
            const policy = makePolicy({
                connections: {
                    [MERGE_HR]: makeMergeHRConnection({config: {approvalMode: CONST.MERGE_HR.APPROVAL_MODE.BASIC, finalApprover: 'boss@company.com', integration: 'workday'}}),
                },
            });
            expect(getMergeHRFinalApprover(policy)).toBe('boss@company.com');
        });

        it('returns finalApprover when in advanced (manager) mode', () => {
            const policy = makePolicy({
                connections: {
                    [MERGE_HR]: makeMergeHRConnection({config: {approvalMode: CONST.MERGE_HR.APPROVAL_MODE.MANAGER, finalApprover: 'boss@company.com', integration: 'workday'}}),
                },
            });
            expect(getMergeHRFinalApprover(policy)).toBe('boss@company.com');
        });

        it('returns null when in custom mode', () => {
            const policy = makePolicy({
                connections: {
                    [MERGE_HR]: makeMergeHRConnection({config: {approvalMode: CONST.MERGE_HR.APPROVAL_MODE.CUSTOM, finalApprover: 'boss@company.com', integration: 'workday'}}),
                },
            });
            expect(getMergeHRFinalApprover(policy)).toBeNull();
        });

        it('returns null when finalApprover is not set', () => {
            const policy = makePolicy({
                connections: {
                    [MERGE_HR]: makeMergeHRConnection({config: {approvalMode: CONST.MERGE_HR.APPROVAL_MODE.MANAGER, finalApprover: null, integration: 'workday'}}),
                },
            });
            expect(getMergeHRFinalApprover(policy)).toBeNull();
        });
    });

    describe('isMergeHRCompleteSetupNeeded', () => {
        it('returns false when not connected', () => {
            expect(isMergeHRCompleteSetupNeeded(makePolicy())).toBe(false);
        });

        it('returns false when initial sync is still in progress', () => {
            const policy = makePolicy({
                connections: {
                    [MERGE_HR]: makeMergeHRConnection({
                        config: {integration: 'workday'},
                        data: {},
                        lastSync: {syncStatus: CONST.MERGE_HR.SYNC_STATUS.SYNCING, syncType: CONST.MERGE_HR.SYNC_TYPE.INITIAL},
                    }),
                },
            });
            expect(isMergeHRCompleteSetupNeeded(policy)).toBe(false);
        });

        it('returns false when sync is done but no groups were returned', () => {
            const policy = makePolicy({
                connections: {
                    [MERGE_HR]: makeMergeHRConnection({config: {integration: 'workday'}, data: {}, lastSync: {syncStatus: CONST.MERGE_HR.SYNC_STATUS.DONE}}),
                },
            });
            expect(isMergeHRCompleteSetupNeeded(policy)).toBe(false);
        });

        it('returns false when setup is already complete', () => {
            const policy = makePolicy({
                connections: {
                    [MERGE_HR]: makeMergeHRConnection({
                        config: {integration: 'workday', groups: ['g1']},
                        data: {groups: [{id: 'g1', name: 'Eng', type: 'Department'}]},
                        lastSync: {syncStatus: CONST.MERGE_HR.SYNC_STATUS.DONE},
                    }),
                },
            });
            expect(isMergeHRCompleteSetupNeeded(policy)).toBe(false);
        });

        it('returns true when sync is done, groups are available, and admin has not chosen groups yet', () => {
            const policy = makePolicy({
                connections: {
                    [MERGE_HR]: makeMergeHRConnection({
                        config: {integration: 'workday'},
                        data: {groups: [{id: 'g1', name: 'Eng', type: 'Department'}]},
                        lastSync: {syncStatus: CONST.MERGE_HR.SYNC_STATUS.DONE},
                    }),
                },
            });
            expect(isMergeHRCompleteSetupNeeded(policy)).toBe(true);
        });
    });

    describe('shouldShowHRConnectionError', () => {
        it('returns false when user is not an admin', () => {
            const policy = makePolicy({
                connections: {gusto: makeGustoConnection({lastSync: {isSuccessful: false, errorDate: new Date().toISOString()}})},
            });
            expect(shouldShowHRConnectionError(policy, false, false)).toBe(false);
        });

        it('returns false for undefined policy', () => {
            expect(shouldShowHRConnectionError(undefined, false, true)).toBe(false);
        });

        it('returns false when no HR provider is connected', () => {
            expect(shouldShowHRConnectionError(makePolicy(), false, true)).toBe(false);
        });

        it('returns true when Merge HR has an authentication error', () => {
            const policy = makePolicy({
                connections: {[MERGE_HR]: makeMergeHRConnection({config: {integration: 'workday'}, lastSync: {isAuthenticationError: true}})},
            });
            expect(shouldShowHRConnectionError(policy, false, true)).toBe(true);
        });

        it('returns true when Merge HR sync status is FAILED', () => {
            const policy = makePolicy({
                connections: {[MERGE_HR]: makeMergeHRConnection({config: {integration: 'workday'}, lastSync: {syncStatus: CONST.MERGE_HR.SYNC_STATUS.FAILED}})},
            });
            expect(shouldShowHRConnectionError(policy, false, true)).toBe(true);
        });

        it('returns false when Merge HR sync status is DONE', () => {
            const policy = makePolicy({
                connections: {[MERGE_HR]: makeMergeHRConnection({config: {integration: 'workday'}, lastSync: {syncStatus: CONST.MERGE_HR.SYNC_STATUS.DONE}})},
            });
            expect(shouldShowHRConnectionError(policy, false, true)).toBe(false);
        });

        it('returns false when Merge HR sync status is SYNCING', () => {
            const policy = makePolicy({
                connections: {[MERGE_HR]: makeMergeHRConnection({config: {integration: 'workday'}, lastSync: {syncStatus: CONST.MERGE_HR.SYNC_STATUS.SYNCING}})},
            });
            expect(shouldShowHRConnectionError(policy, false, true)).toBe(false);
        });

        it('returns true when Gusto sync has failed with an error date', () => {
            const policy = makePolicy({
                connections: {gusto: makeGustoConnection({lastSync: {isSuccessful: false, errorDate: new Date().toISOString()}})},
            });
            expect(shouldShowHRConnectionError(policy, false, true)).toBe(true);
        });

        it('returns false when Gusto sync is in progress', () => {
            const policy = makePolicy({
                connections: {gusto: makeGustoConnection({lastSync: {isSuccessful: false, errorDate: new Date().toISOString()}})},
            });
            expect(shouldShowHRConnectionError(policy, true, true)).toBe(false);
        });

        it('returns false for Gusto when last sync was successful', () => {
            const policy = makePolicy({
                connections: {gusto: makeGustoConnection({lastSync: {isSuccessful: true}})},
            });
            expect(shouldShowHRConnectionError(policy, false, true)).toBe(false);
        });

        it('returns true when Zenefits sync has failed with an error date', () => {
            const policy = makePolicy({
                connections: {zenefits: makeZenefitsConnection({lastSync: {isSuccessful: false, errorDate: new Date().toISOString()}})},
            });
            expect(shouldShowHRConnectionError(policy, false, true)).toBe(true);
        });

        it('returns false when Zenefits sync is in progress', () => {
            const policy = makePolicy({
                connections: {zenefits: makeZenefitsConnection({lastSync: {isSuccessful: false, errorDate: new Date().toISOString()}})},
            });
            expect(shouldShowHRConnectionError(policy, true, true)).toBe(false);
        });
    });

    describe('isMergeHRManualSyncLimitReached', () => {
        const dbTimeHoursAgo = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);

        const makeMergePolicyWithSyncTimestamps = (manualSyncTimestamps?: string[]) =>
            makePolicy({
                connections: {[MERGE_HR]: makeMergeHRConnection({config: {integration: 'workday'}, lastSync: {manualSyncTimestamps}})},
            });

        it('returns false for undefined policy', () => {
            expect(isMergeHRManualSyncLimitReached(undefined)).toBe(false);
        });

        it('returns false when there is no merge_hris connection', () => {
            expect(isMergeHRManualSyncLimitReached(makePolicy())).toBe(false);
        });

        it('returns false when there are no manual sync timestamps', () => {
            expect(isMergeHRManualSyncLimitReached(makeMergePolicyWithSyncTimestamps(undefined))).toBe(false);
            expect(isMergeHRManualSyncLimitReached(makeMergePolicyWithSyncTimestamps([]))).toBe(false);
        });

        it('returns false when only one sync happened within the last 24 hours', () => {
            expect(isMergeHRManualSyncLimitReached(makeMergePolicyWithSyncTimestamps([dbTimeHoursAgo(1)]))).toBe(false);
        });

        it('returns false when both syncs are older than 24 hours', () => {
            expect(isMergeHRManualSyncLimitReached(makeMergePolicyWithSyncTimestamps([dbTimeHoursAgo(25), dbTimeHoursAgo(48)]))).toBe(false);
        });

        it('returns false when only one of the two syncs falls within the window', () => {
            expect(isMergeHRManualSyncLimitReached(makeMergePolicyWithSyncTimestamps([dbTimeHoursAgo(2), dbTimeHoursAgo(30)]))).toBe(false);
        });

        it('returns true when two syncs happened within the last 24 hours', () => {
            expect(isMergeHRManualSyncLimitReached(makeMergePolicyWithSyncTimestamps([dbTimeHoursAgo(1), dbTimeHoursAgo(10)]))).toBe(true);
        });
    });
});

describe('getHRCardState', () => {
    describe('Gusto', () => {
        it('returns disconnected when policy has no gusto connection', () => {
            const state = getHRCardState({
                policy: makePolicy(),
                connectionName: GUSTO,
                connectionSyncProgress: undefined,
                getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
            });
            expect(state.isConnected).toBe(false);
            expect(state.isSyncInProgress).toBe(false);
            expect(state.hasError).toBe(false);
        });

        it('returns connected when policy has a gusto connection', () => {
            const policy = makePolicy({connections: {[GUSTO]: makeGustoConnection()}});
            const state = getHRCardState({
                policy,
                connectionName: GUSTO,
                connectionSyncProgress: undefined,
                getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
            });
            expect(state.isConnected).toBe(true);
        });

        it('detects sync in progress', () => {
            const policy = makePolicy({connections: {[GUSTO]: makeGustoConnection()}});
            const syncProgress = makeSyncProgress(GUSTO, CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.GUSTO_SYNC_TITLE);
            const state = getHRCardState({
                policy,
                connectionName: GUSTO,
                connectionSyncProgress: syncProgress,
                getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
            });
            expect(state.isSyncInProgress).toBe(true);
            expect(state.syncStageInProgress).toBe(CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.GUSTO_SYNC_TITLE);
        });

        it('detects sync error with backend message', () => {
            const policy = makePolicy({
                connections: {
                    [GUSTO]: makeGustoConnection({lastSync: {isSuccessful: false, errorDate: new Date().toISOString(), errorMessage: 'Token expired'}}),
                },
            });
            const state = getHRCardState({
                policy,
                connectionName: GUSTO,
                connectionSyncProgress: undefined,
                getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
            });
            expect(state.hasError).toBe(true);
            expect(state.lastSyncErrorMessage).toBe('Token expired');
        });

        it('returns undefined lastSyncErrorMessage when no error', () => {
            const policy = makePolicy({
                connections: {[GUSTO]: makeGustoConnection({lastSync: {isSuccessful: true}})},
            });
            const state = getHRCardState({
                policy,
                connectionName: GUSTO,
                connectionSyncProgress: undefined,
                getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
            });
            expect(state.hasError).toBe(false);
            expect(state.lastSyncErrorMessage).toBeUndefined();
        });

        it('does not report sync in progress when stage is JOB_DONE and connection exists', () => {
            const policy = makePolicy({connections: {[GUSTO]: makeGustoConnection()}});
            const syncProgress = makeSyncProgress(GUSTO, CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE);
            const state = getHRCardState({
                policy,
                connectionName: GUSTO,
                connectionSyncProgress: syncProgress,
                getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
            });
            expect(state.isSyncInProgress).toBe(false);
        });

        it('does not report sync in progress when timestamp is stale', () => {
            const policy = makePolicy({connections: {[GUSTO]: makeGustoConnection()}});
            const syncProgress = makeSyncProgress(GUSTO, CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.GUSTO_SYNC_TITLE, SYNC_TIMEOUT + 5);
            const state = getHRCardState({
                policy,
                connectionName: GUSTO,
                connectionSyncProgress: syncProgress,
                getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
            });
            expect(state.isSyncInProgress).toBe(false);
        });
    });

    describe('Zenefits', () => {
        it('returns connected when policy has a zenefits connection', () => {
            const policy = makePolicy({connections: {[ZENEFITS]: makeZenefitsConnection()}});
            const state = getHRCardState({
                policy,
                connectionName: ZENEFITS,
                connectionSyncProgress: undefined,
                getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
            });
            expect(state.isConnected).toBe(true);
        });
    });

    describe('Merge HR', () => {
        it('returns connected only for the matching slug', () => {
            const policy = makePolicy({
                connections: {[MERGE_HR]: makeMergeHRConnection({config: {integration: 'bamboohr'}})},
            });

            const bamboo = getHRCardState({
                policy,
                connectionName: MERGE_HR,
                connectionSyncProgress: undefined,
                getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
                mergeSlug: 'bamboohr',
            });
            expect(bamboo.isConnected).toBe(true);

            const workday = getHRCardState({
                policy,
                connectionName: MERGE_HR,
                connectionSyncProgress: undefined,
                getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
                mergeSlug: 'workday',
            });
            expect(workday.isConnected).toBe(false);
        });

        it('returns connected for any slug when mergeSlug is not provided', () => {
            const policy = makePolicy({
                connections: {[MERGE_HR]: makeMergeHRConnection({config: {integration: 'bamboohr'}})},
            });
            const state = getHRCardState({
                policy,
                connectionName: MERGE_HR,
                connectionSyncProgress: undefined,
                getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
            });
            expect(state.isConnected).toBe(true);
        });

        it('detects sync in progress from lastSync.syncStatus', () => {
            const policy = makePolicy({
                connections: {
                    [MERGE_HR]: makeMergeHRConnection({
                        config: {integration: 'bamboohr'},
                        lastSync: {syncStatus: CONST.MERGE_HR.SYNC_STATUS.SYNCING, syncType: CONST.MERGE_HR.SYNC_TYPE.INITIAL},
                    }),
                },
            });
            const state = getHRCardState({
                policy,
                connectionName: MERGE_HR,
                connectionSyncProgress: undefined,
                getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
                mergeSlug: 'bamboohr',
            });
            expect(state.isSyncInProgress).toBe(true);
            expect(state.isInitialSyncInProgress).toBe(true);
            expect(state.syncStageInProgress).toBeUndefined();
        });

        it('ignores sync progress for a different connection', () => {
            const policy = makePolicy({
                connections: {[MERGE_HR]: makeMergeHRConnection({config: {integration: 'bamboohr'}})},
            });
            const syncProgress = makeSyncProgress(GUSTO, CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.GUSTO_SYNC_TITLE);
            const state = getHRCardState({
                policy,
                connectionName: MERGE_HR,
                connectionSyncProgress: syncProgress,
                getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
                mergeSlug: 'bamboohr',
            });
            expect(state.isSyncInProgress).toBe(false);
            expect(state.syncStageInProgress).toBeUndefined();
        });
    });
});

describe('getApprovalModeLabel', () => {
    it('returns notSet key when no approval mode is configured', () => {
        const policy = makePolicy();
        expect(getApprovalModeLabel(policy, GUSTO, stubTranslate)).toBe('workspace.hr.notSet');
    });

    it('returns basic label for Gusto basic approval mode', () => {
        const policy = makePolicy({
            connections: {[GUSTO]: makeGustoConnection({config: {approvalMode: CONST.GUSTO.APPROVAL_MODE.BASIC}})},
        });
        expect(getApprovalModeLabel(policy, GUSTO, stubTranslate)).toBe('workspace.hr.approvalModes.basic.label');
    });

    it('returns manager label for Gusto manager approval mode', () => {
        const policy = makePolicy({
            connections: {[GUSTO]: makeGustoConnection({config: {approvalMode: CONST.GUSTO.APPROVAL_MODE.MANAGER}})},
        });
        expect(getApprovalModeLabel(policy, GUSTO, stubTranslate)).toBe('workspace.hr.approvalModes.manager.label');
    });

    it('returns custom label for Gusto custom approval mode', () => {
        const policy = makePolicy({
            connections: {[GUSTO]: makeGustoConnection({config: {approvalMode: CONST.GUSTO.APPROVAL_MODE.CUSTOM}})},
        });
        expect(getApprovalModeLabel(policy, GUSTO, stubTranslate)).toBe('workspace.hr.approvalModes.custom.label');
    });

    it('returns basic label for Merge HR basic approval mode', () => {
        const policy = makePolicy({
            connections: {[MERGE_HR]: makeMergeHRConnection({config: {approvalMode: CONST.MERGE_HR.APPROVAL_MODE.BASIC}})},
        });
        expect(getApprovalModeLabel(policy, MERGE_HR, stubTranslate)).toBe('workspace.hr.approvalModes.basic.label');
    });

    it('returns notSet for unknown approval mode', () => {
        const policy = makePolicy({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- intentionally unexpected approval mode value
            connections: {[GUSTO]: makeGustoConnection({config: {approvalMode: 'UNKNOWN_MODE' as GustoConnectionConfig['approvalMode']}})},
        });
        expect(getApprovalModeLabel(policy, GUSTO, stubTranslate)).toBe('workspace.hr.notSet');
    });

    it('returns notSet when policy is null', () => {
        expect(getApprovalModeLabel(undefined, GUSTO, stubTranslate)).toBe('workspace.hr.notSet');
    });
});

describe('getHRCards', () => {
    it('returns Gusto and Zenefits cards first, followed by the Merge HR provider cards', () => {
        const cards = getHRCards(makeGetHRCardsParams());
        expect(cards).toHaveLength(2 + Object.keys(MERGE_HR_PROVIDERS).length);
        expect(cards?.at(0)?.key).toBe('gusto');
        expect(cards?.at(0)?.connectionName).toBe(GUSTO);
        expect(cards?.at(1)?.key).toBe('zenefits');
        expect(cards?.at(1)?.connectionName).toBe(ZENEFITS);
    });

    it('returns all Merge HR provider cards', () => {
        const cards = getHRCards(makeGetHRCardsParams());

        const mergeKeys = Object.keys(MERGE_HR_PROVIDERS);
        for (const slug of mergeKeys) {
            expect(cards.find((c) => c.key === `merge_${slug}`)).toBeDefined();
        }
    });

    it('sets correct routes for a connected Gusto card', () => {
        const policy = makePolicy({connections: {[GUSTO]: makeGustoConnection()}});
        const cards = getHRCards(makeGetHRCardsParams({policy}));

        expect(getRow(cards?.at(0), 'approvalMode')?.route).toBe(ROUTES.WORKSPACE_HR_GUSTO_APPROVAL_MODE.getRoute(POLICY_ID));
        expect(getRow(cards?.at(0), 'finalApprover')?.route).toBe(ROUTES.WORKSPACE_HR_GUSTO_FINAL_APPROVER.getRoute(POLICY_ID));
    });

    it('sets correct routes for a connected Zenefits card', () => {
        const policy = makePolicy({connections: {[ZENEFITS]: makeZenefitsConnection()}});
        const cards = getHRCards(makeGetHRCardsParams({policy}));
        const zenefits = cards.find((c) => c.key === 'zenefits');

        expect(getRow(zenefits, 'approvalMode')?.route).toBe(ROUTES.WORKSPACE_HR_ZENEFITS_APPROVAL_MODE.getRoute(POLICY_ID));
        expect(getRow(zenefits, 'finalApprover')?.route).toBe(ROUTES.WORKSPACE_HR_ZENEFITS_FINAL_APPROVER.getRoute(POLICY_ID));
    });

    it('sets correct routes for a connected Merge HR card', () => {
        const policy = makePolicy({
            connections: {[MERGE_HR]: makeMergeHRConnection({config: {integration: 'bamboohr'}})},
        });
        const cards = getHRCards(makeGetHRCardsParams({policy}));
        const bamboo = cards.find((c) => c.key === 'merge_bamboohr');

        expect(getRow(bamboo, 'approvalMode')?.route).toBe(ROUTES.WORKSPACE_HR_MERGE_APPROVAL_MODE.getRoute(POLICY_ID));
        expect(getRow(bamboo, 'finalApprover')?.route).toBe(ROUTES.WORKSPACE_HR_MERGE_FINAL_APPROVER.getRoute(POLICY_ID));
    });

    it('returns the connected Zenefits card even when the Zenefits beta is disabled', () => {
        const policy = makePolicy({
            connections: {
                [ZENEFITS]: makeZenefitsConnection({config: {approvalMode: CONST.ZENEFITS.APPROVAL_MODE.BASIC, finalApprover: 'admin@test.com'}, lastSync: {isSuccessful: true}}),
            },
        });
        const cards = getHRCards(makeGetHRCardsParams({policy}));
        const zenefits = cards.find((c) => c.key === 'zenefits');

        expect(zenefits?.isConnected).toBe(true);
        expect(zenefits?.config).toBeDefined();
    });

    it('marks the connected Gusto card as connected with config', () => {
        const policy = makePolicy({
            connections: {
                [GUSTO]: makeGustoConnection({config: {approvalMode: CONST.GUSTO.APPROVAL_MODE.BASIC, finalApprover: 'admin@test.com'}, lastSync: {isSuccessful: true}}),
            },
        });
        const cards = getHRCards(makeGetHRCardsParams({policy}));

        expect(cards?.at(0)?.isConnected).toBe(true);
        expect(cards?.at(0)?.config).toBeDefined();
        expect(getRow(cards?.at(0), 'approvalMode')?.title).toBe('workspace.hr.approvalModes.basic.label');
    });

    it('marks only the matching Merge slug as connected', () => {
        const policy = makePolicy({
            connections: {
                [MERGE_HR]: makeMergeHRConnection({config: {integration: 'bamboohr', approvalMode: CONST.MERGE_HR.APPROVAL_MODE.MANAGER}}),
            },
        });
        const cards = getHRCards(makeGetHRCardsParams({policy}));

        const bamboo = cards.find((c) => c.key === 'merge_bamboohr');
        const workday = cards.find((c) => c.key === 'merge_workday');
        const hibob = cards.find((c) => c.key === 'merge_hibob');

        expect(bamboo?.isConnected).toBe(true);
        expect(bamboo?.config).toBeDefined();
        expect(getRow(bamboo, 'approvalMode')?.title).toBe('workspace.hr.approvalModes.manager.label');

        expect(workday?.isConnected).toBe(false);
        expect(workday?.config).toBeUndefined();

        expect(hibob?.isConnected).toBe(false);
        expect(hibob?.config).toBeUndefined();
    });

    it('connected Merge card gets lastSyncErrorMessage when sync has failed', () => {
        const policy = makePolicy({
            connections: {
                [MERGE_HR]: makeMergeHRConnection({config: {integration: 'bamboohr'}, lastSync: {syncStatus: CONST.MERGE_HR.SYNC_STATUS.FAILED, errorMessage: 'Auth failed'}}),
            },
        });
        const cards = getHRCards(makeGetHRCardsParams({policy}));

        const bamboo = cards.find((c) => c.key === 'merge_bamboohr');
        expect(bamboo?.hasError).toBe(true);
        expect(bamboo?.lastSyncErrorMessage).toBe('Auth failed');
    });

    it('disconnected Merge cards do not inherit error state from the connection', () => {
        const policy = makePolicy({
            connections: {
                [MERGE_HR]: makeMergeHRConnection({config: {integration: 'bamboohr'}, lastSync: {isSuccessful: false, errorDate: new Date().toISOString(), errorMessage: 'Auth failed'}}),
            },
        });
        const cards = getHRCards(makeGetHRCardsParams({policy}));

        const workday = cards.find((c) => c.key === 'merge_workday');
        expect(workday?.isConnected).toBe(false);
        expect(workday?.hasError).toBe(false);
        expect(workday?.lastSyncErrorMessage).toBeUndefined();
    });

    it('connected Merge card detects sync in progress from lastSync.syncStatus', () => {
        const policy = makePolicy({
            connections: {
                [MERGE_HR]: makeMergeHRConnection({
                    config: {integration: 'bamboohr'},
                    lastSync: {syncStatus: CONST.MERGE_HR.SYNC_STATUS.SYNCING, syncType: CONST.MERGE_HR.SYNC_TYPE.INITIAL},
                }),
            },
        });
        const cards = getHRCards(makeGetHRCardsParams({policy, connectionSyncProgress: undefined}));

        const bamboo = cards.find((c) => c.key === 'merge_bamboohr');
        expect(bamboo?.isSyncInProgress).toBe(true);
        expect(bamboo?.isInitialSyncInProgress).toBe(true);
        expect(bamboo?.syncStageInProgress).toBeUndefined();
    });

    it('uses provider icons from params for static providers', () => {
        const gustoIcon = {testId: 'gusto'} as unknown as IconAsset;
        const trinetIcon = {testId: 'zenefits'} as unknown as IconAsset;
        const cards = getHRCards(makeGetHRCardsParams({gustoIcon, trinetIcon}));

        expect(cards?.at(0)?.icon).toBe(gustoIcon);
        expect(cards?.at(1)?.icon).toBe(trinetIcon);
    });

    it('uses provider iconUrl for Merge cards', () => {
        const cards = getHRCards(makeGetHRCardsParams());
        const mergeCards = cards.filter((c) => c.key.startsWith('merge_'));

        expect(mergeCards.length).toBeGreaterThan(0);
        for (const card of mergeCards) {
            const slug = card.key.replace('merge_', '');
            const expected = MERGE_HR_PROVIDERS[slug as keyof typeof MERGE_HR_PROVIDERS]?.iconUrl;
            expect(card.icon).toBe(expected);
        }
    });

    it('maps each config row to its own pending action and errors', () => {
        const policy = makePolicy({
            connections: {
                [MERGE_HR]: makeMergeHRConnection({
                    config: {
                        integration: 'bamboohr',
                        groups: ['g1'],
                        pendingFields: {groups: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                        errorFields: {approvalMode: {error: 'Something went wrong'}},
                    },
                    data: {groups: [{id: 'g1', name: 'Test group', type: 'Department'}]},
                }),
            },
        });
        const cards = getHRCards(makeGetHRCardsParams({policy}));
        const bamboo = cards.find((c) => c.key === 'merge_bamboohr');

        expect(getRow(bamboo, 'groups')?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
        expect(getRow(bamboo, 'approvalMode')?.errors).toEqual({error: 'Something went wrong'});
        expect(getRow(bamboo, 'finalApprover')?.errors).toBeUndefined();
    });

    it('connected Merge card does not expose completeSetupRoute while initial sync is in progress (no groups in data yet)', () => {
        const policy = makePolicy({
            connections: {
                [MERGE_HR]: makeMergeHRConnection({
                    config: {integration: 'bamboohr', groups: null},
                    data: {},
                    lastSync: {syncStatus: CONST.MERGE_HR.SYNC_STATUS.SYNCING, syncType: CONST.MERGE_HR.SYNC_TYPE.INITIAL},
                }),
            },
        });
        const cards = getHRCards(makeGetHRCardsParams({policy}));

        const bambooCard = cards.find((c) => c.key === 'merge_bamboohr');
        expect(bambooCard?.isConnected).toBe(true);
        expect(bambooCard?.completeSetupRoute).toBeUndefined();
    });

    it('connected Merge card needing setup exposes completeSetupRoute and no groups summary', () => {
        const policy = makePolicy({
            connections: {
                [MERGE_HR]: makeMergeHRConnection({
                    config: {integration: 'bamboohr', groups: null},
                    data: {groups: [{id: 'g1', name: 'Test group', type: 'Department'}]},
                    lastSync: {syncStatus: CONST.MERGE_HR.SYNC_STATUS.DONE},
                }),
            },
        });
        const cards = getHRCards(makeGetHRCardsParams({policy}));

        const bambooCard = cards.find((c) => c.key === 'merge_bamboohr');
        expect(bambooCard?.completeSetupRoute).toBe(ROUTES.WORKSPACE_HR_MERGE_GROUPS.getRoute(POLICY_ID));
        expect(getRow(bambooCard, 'groups')?.route).toBe(ROUTES.WORKSPACE_HR_MERGE_GROUPS.getRoute(POLICY_ID));
        expect(getRow(bambooCard, 'groups')?.title).toBeUndefined();
    });

    it('connected Merge card with chosen groups summarizes the selected names and drops completeSetupRoute', () => {
        const policy = makePolicy({
            connections: {
                [MERGE_HR]: makeMergeHRConnection({config: {integration: 'bamboohr', groups: ['g1', 'missing']}, data: {groups: [{id: 'g1', name: 'Test group', type: 'Department'}]}}),
            },
        });
        const cards = getHRCards(makeGetHRCardsParams({policy}));

        const bambooCard = cards.find((c) => c.key === 'merge_bamboohr');
        expect(getRow(bambooCard, 'groups')?.title).toBe('Test group');
        expect(bambooCard?.completeSetupRoute).toBeUndefined();
    });
});
