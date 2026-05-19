import type {OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {getApprovalModeLabel, getHRCards, getHRCardState} from '@pages/workspace/hr/utils';
import CONST from '@src/CONST';
import MERGE_HR_PROVIDERS from '@src/CONST/MERGE_HR_PROVIDERS';
import ROUTES from '@src/ROUTES';
import type {PolicyConnectionSyncProgress} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';
import type IconAsset from '@src/types/utils/IconAsset';

jest.mock('@libs/actions/connections/Gusto', () => jest.fn(() => 'https://gusto.example.com'));
jest.mock('@libs/actions/connections/Zenefits', () => jest.fn(() => 'https://zenefits.example.com'));
jest.mock('@libs/actions/connections/MergeHR', () => ({connectPolicyToMergeHR: jest.fn()}));
jest.mock('@libs/actions/Link', () => ({openLink: jest.fn()}));
jest.mock('@libs/PersonalDetailsUtils', () => ({
    getPersonalDetailByEmail: jest.fn(() => null),
    getDisplayNameOrDefault: jest.fn((_detail: unknown, fallback: string) => fallback),
}));

const GUSTO = CONST.POLICY.CONNECTIONS.NAME.GUSTO;
const ZENEFITS = CONST.POLICY.CONNECTIONS.NAME.ZENEFITS;
const MERGE_HR = CONST.POLICY.CONNECTIONS.NAME.MERGE_HR;

const STUB_ICON = {} as IconAsset;
const POLICY_ID = 'ABC123';
const ENV_URL = 'https://dev.new.expensify.com:8082';
const SYNC_TIMEOUT = CONST.POLICY.CONNECTIONS.SYNC_STAGE_TIMEOUT_MINUTES;

function makePolicy(overrides: Partial<Policy> = {}): OnyxEntry<Policy> {
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

function makeSyncProgress(connectionName: string, stage: string, minutesAgo = 1): OnyxEntry<PolicyConnectionSyncProgress> {
    const timestamp = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
    return {
        stageInProgress: stage,
        connectionName,
        timestamp,
    } as PolicyConnectionSyncProgress;
}

const stubGetLocalDateFromDatetime: LocaleContextProps['getLocalDateFromDatetime'] = (datetime) => (datetime ? new Date(datetime) : new Date(0));
const stubTranslate = ((key: string) => key) as unknown as LocaleContextProps['translate'];
const allBetasEnabled = () => true;
const noBetasEnabled = () => false;

function makeGetHRCardsParams(overrides: Record<string, unknown> = {}) {
    return {
        policy: makePolicy(),
        connectionSyncProgress: null,
        getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
        isBetaEnabled: allBetasEnabled,
        translate: stubTranslate,
        policyID: POLICY_ID,
        environmentURL: ENV_URL,
        gustoIcon: STUB_ICON,
        zenefitsIcon: STUB_ICON,
        ...overrides,
    };
}

describe('getHRCardState', () => {
    describe('Gusto', () => {
        it('returns disconnected when policy has no gusto connection', () => {
            const state = getHRCardState({
                policy: makePolicy(),
                connectionName: GUSTO,
                connectionSyncProgress: null,
                getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
            });
            expect(state.isConnected).toBe(false);
            expect(state.isSyncInProgress).toBe(false);
            expect(state.hasError).toBe(false);
        });

        it('returns connected when policy has a gusto connection', () => {
            const policy = makePolicy({connections: {gusto: {config: {}, data: {}, lastSync: {}}} as unknown as Policy['connections']});
            const state = getHRCardState({
                policy,
                connectionName: GUSTO,
                connectionSyncProgress: null,
                getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
            });
            expect(state.isConnected).toBe(true);
        });

        it('detects sync in progress', () => {
            const policy = makePolicy({connections: {gusto: {config: {}, data: {}, lastSync: {}}} as unknown as Policy['connections']});
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
                    gusto: {
                        config: {},
                        data: {},
                        lastSync: {isSuccessful: false, errorDate: new Date().toISOString(), errorMessage: 'Token expired'},
                    },
                } as unknown as Policy['connections'],
            });
            const state = getHRCardState({
                policy,
                connectionName: GUSTO,
                connectionSyncProgress: null,
                getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
            });
            expect(state.hasError).toBe(true);
            expect(state.lastSyncErrorMessage).toBe('Token expired');
        });

        it('returns undefined lastSyncErrorMessage when no error', () => {
            const policy = makePolicy({
                connections: {gusto: {config: {}, data: {}, lastSync: {isSuccessful: true}}} as unknown as Policy['connections'],
            });
            const state = getHRCardState({
                policy,
                connectionName: GUSTO,
                connectionSyncProgress: null,
                getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
            });
            expect(state.hasError).toBe(false);
            expect(state.lastSyncErrorMessage).toBeUndefined();
        });

        it('does not report sync in progress when stage is JOB_DONE and connection exists', () => {
            const policy = makePolicy({connections: {gusto: {config: {}, data: {}, lastSync: {}}} as unknown as Policy['connections']});
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
            const policy = makePolicy({connections: {gusto: {config: {}, data: {}, lastSync: {}}} as unknown as Policy['connections']});
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
            const policy = makePolicy({connections: {zenefits: {config: {}, data: {}, lastSync: {}}} as unknown as Policy['connections']});
            const state = getHRCardState({
                policy,
                connectionName: ZENEFITS,
                connectionSyncProgress: null,
                getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
            });
            expect(state.isConnected).toBe(true);
        });
    });

    describe('Merge HR', () => {
        it('returns connected only for the matching slug', () => {
            const policy = makePolicy({
                connections: {merge_hris: {config: {integration: 'bamboohr'}, data: {}, lastSync: {}}} as unknown as Policy['connections'],
            });

            const bamboo = getHRCardState({
                policy,
                connectionName: MERGE_HR,
                connectionSyncProgress: null,
                getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
                mergeSlug: 'bamboohr',
            });
            expect(bamboo.isConnected).toBe(true);

            const workday = getHRCardState({
                policy,
                connectionName: MERGE_HR,
                connectionSyncProgress: null,
                getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
                mergeSlug: 'workday',
            });
            expect(workday.isConnected).toBe(false);
        });

        it('returns connected for any slug when mergeSlug is not provided', () => {
            const policy = makePolicy({
                connections: {merge_hris: {config: {integration: 'bamboohr'}, data: {}, lastSync: {}}} as unknown as Policy['connections'],
            });
            const state = getHRCardState({
                policy,
                connectionName: MERGE_HR,
                connectionSyncProgress: null,
                getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
            });
            expect(state.isConnected).toBe(true);
        });

        it('detects sync in progress with stage info', () => {
            const policy = makePolicy({
                connections: {merge_hris: {config: {integration: 'bamboohr'}, data: {}, lastSync: {}}} as unknown as Policy['connections'],
            });
            const syncProgress = makeSyncProgress(MERGE_HR, CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.MERGE_HR_SYNC_TITLE);
            const state = getHRCardState({
                policy,
                connectionName: MERGE_HR,
                connectionSyncProgress: syncProgress,
                getLocalDateFromDatetime: stubGetLocalDateFromDatetime,
                mergeSlug: 'bamboohr',
            });
            expect(state.isSyncInProgress).toBe(true);
            expect(state.syncStageInProgress).toBe(CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.MERGE_HR_SYNC_TITLE);
        });

        it('ignores sync progress for a different connection', () => {
            const policy = makePolicy({
                connections: {merge_hris: {config: {integration: 'bamboohr'}, data: {}, lastSync: {}}} as unknown as Policy['connections'],
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
            connections: {gusto: {config: {approvalMode: CONST.GUSTO.APPROVAL_MODE.BASIC}}} as unknown as Policy['connections'],
        });
        expect(getApprovalModeLabel(policy, GUSTO, stubTranslate)).toBe('workspace.hr.approvalModes.basic.label');
    });

    it('returns manager label for Gusto manager approval mode', () => {
        const policy = makePolicy({
            connections: {gusto: {config: {approvalMode: CONST.GUSTO.APPROVAL_MODE.MANAGER}}} as unknown as Policy['connections'],
        });
        expect(getApprovalModeLabel(policy, GUSTO, stubTranslate)).toBe('workspace.hr.approvalModes.manager.label');
    });

    it('returns custom label for Gusto custom approval mode', () => {
        const policy = makePolicy({
            connections: {gusto: {config: {approvalMode: CONST.GUSTO.APPROVAL_MODE.CUSTOM}}} as unknown as Policy['connections'],
        });
        expect(getApprovalModeLabel(policy, GUSTO, stubTranslate)).toBe('workspace.hr.approvalModes.custom.label');
    });

    it('returns basic label for Merge HR basic approval mode', () => {
        const policy = makePolicy({
            connections: {merge_hris: {config: {approvalMode: CONST.MERGE_HR.APPROVAL_MODE.BASIC}}} as unknown as Policy['connections'],
        });
        expect(getApprovalModeLabel(policy, MERGE_HR, stubTranslate)).toBe('workspace.hr.approvalModes.basic.label');
    });

    it('returns notSet for unknown approval mode', () => {
        const policy = makePolicy({
            connections: {gusto: {config: {approvalMode: 'UNKNOWN_MODE'}}} as unknown as Policy['connections'],
        });
        expect(getApprovalModeLabel(policy, GUSTO, stubTranslate)).toBe('workspace.hr.notSet');
    });

    it('returns notSet when policy is null', () => {
        expect(getApprovalModeLabel(null, GUSTO, stubTranslate)).toBe('workspace.hr.notSet');
    });
});

describe('getHRCards', () => {
    it('returns no cards when no betas are enabled', () => {
        const cards = getHRCards(makeGetHRCardsParams({isBetaEnabled: noBetasEnabled}));
        expect(cards).toHaveLength(0);
    });

    it('returns Gusto and Zenefits cards when their betas are enabled', () => {
        const isBetaEnabled = (beta: string) => beta === CONST.BETAS.GUSTO || beta === CONST.BETAS.ZENEFITS;
        const cards = getHRCards(makeGetHRCardsParams({isBetaEnabled}));

        expect(cards).toHaveLength(2);
        expect(cards[0].key).toBe('gusto');
        expect(cards[0].connectionName).toBe(GUSTO);
        expect(cards[1].key).toBe('zenefits');
        expect(cards[1].connectionName).toBe(ZENEFITS);
    });

    it('returns all Merge HR provider cards when merge beta is enabled', () => {
        const isBetaEnabled = (beta: string) => beta === CONST.BETAS.MERGE_HR;
        const cards = getHRCards(makeGetHRCardsParams({isBetaEnabled}));

        const mergeKeys = Object.keys(MERGE_HR_PROVIDERS);
        expect(cards).toHaveLength(mergeKeys.length);
        for (const slug of mergeKeys) {
            expect(cards.find((c) => c.key === `merge_${slug}`)).toBeDefined();
        }
    });

    it('sets correct routes for Gusto cards', () => {
        const isBetaEnabled = (beta: string) => beta === CONST.BETAS.GUSTO;
        const cards = getHRCards(makeGetHRCardsParams({isBetaEnabled}));

        expect(cards[0].approvalModeRoute).toBe(ROUTES.WORKSPACE_HR_GUSTO_APPROVAL_MODE.getRoute(POLICY_ID));
        expect(cards[0].finalApproverRoute).toBe(ROUTES.WORKSPACE_HR_GUSTO_FINAL_APPROVER.getRoute(POLICY_ID));
    });

    it('sets correct routes for Zenefits cards', () => {
        const isBetaEnabled = (beta: string) => beta === CONST.BETAS.ZENEFITS;
        const cards = getHRCards(makeGetHRCardsParams({isBetaEnabled}));

        expect(cards[0].approvalModeRoute).toBe(ROUTES.WORKSPACE_HR_ZENEFITS_APPROVAL_MODE.getRoute(POLICY_ID));
        expect(cards[0].finalApproverRoute).toBe(ROUTES.WORKSPACE_HR_ZENEFITS_FINAL_APPROVER.getRoute(POLICY_ID));
    });

    it('sets correct routes for Merge HR cards', () => {
        const isBetaEnabled = (beta: string) => beta === CONST.BETAS.MERGE_HR;
        const cards = getHRCards(makeGetHRCardsParams({isBetaEnabled}));

        for (const card of cards) {
            expect(card.approvalModeRoute).toBe(ROUTES.WORKSPACE_HR_MERGE_APPROVAL_MODE.getRoute(POLICY_ID));
            expect(card.finalApproverRoute).toBe(ROUTES.WORKSPACE_HR_MERGE_FINAL_APPROVER.getRoute(POLICY_ID));
        }
    });

    it('marks the connected Gusto card as connected with config', () => {
        const policy = makePolicy({
            connections: {
                gusto: {
                    config: {approvalMode: CONST.GUSTO.APPROVAL_MODE.BASIC, finalApprover: 'admin@test.com'},
                    data: {},
                    lastSync: {isSuccessful: true},
                },
            } as unknown as Policy['connections'],
        });
        const isBetaEnabled = (beta: string) => beta === CONST.BETAS.GUSTO;
        const cards = getHRCards(makeGetHRCardsParams({policy, isBetaEnabled}));

        expect(cards[0].isConnected).toBe(true);
        expect(cards[0].config).toBeDefined();
        expect(cards[0].approvalModeLabel).toBe('workspace.hr.approvalModes.basic.label');
    });

    it('marks only the matching Merge slug as connected', () => {
        const policy = makePolicy({
            connections: {
                merge_hris: {
                    config: {integration: 'bamboohr', approvalMode: CONST.MERGE_HR.APPROVAL_MODE.MANAGER},
                    data: {},
                    lastSync: {},
                },
            } as unknown as Policy['connections'],
        });
        const isBetaEnabled = (beta: string) => beta === CONST.BETAS.MERGE_HR;
        const cards = getHRCards(makeGetHRCardsParams({policy, isBetaEnabled}));

        const bamboo = cards.find((c) => c.key === 'merge_bamboohr');
        const workday = cards.find((c) => c.key === 'merge_workday');
        const hibob = cards.find((c) => c.key === 'merge_hibob');

        expect(bamboo?.isConnected).toBe(true);
        expect(bamboo?.config).toBeDefined();
        expect(bamboo?.approvalModeLabel).toBe('workspace.hr.approvalModes.manager.label');

        expect(workday?.isConnected).toBe(false);
        expect(workday?.config).toBeUndefined();

        expect(hibob?.isConnected).toBe(false);
        expect(hibob?.config).toBeUndefined();
    });

    it('connected Merge card gets lastSyncErrorMessage when sync has failed', () => {
        const policy = makePolicy({
            connections: {
                merge_hris: {
                    config: {integration: 'bamboohr'},
                    data: {},
                    lastSync: {isSuccessful: false, errorDate: new Date().toISOString(), errorMessage: 'Auth failed'},
                },
            } as unknown as Policy['connections'],
        });
        const isBetaEnabled = (beta: string) => beta === CONST.BETAS.MERGE_HR;
        const cards = getHRCards(makeGetHRCardsParams({policy, isBetaEnabled}));

        const bamboo = cards.find((c) => c.key === 'merge_bamboohr');
        expect(bamboo?.hasError).toBe(true);
        expect(bamboo?.lastSyncErrorMessage).toBe('Auth failed');
    });

    it('disconnected Merge cards do not inherit error state from the connection', () => {
        const policy = makePolicy({
            connections: {
                merge_hris: {
                    config: {integration: 'bamboohr'},
                    data: {},
                    lastSync: {isSuccessful: false, errorDate: new Date().toISOString(), errorMessage: 'Auth failed'},
                },
            } as unknown as Policy['connections'],
        });
        const isBetaEnabled = (beta: string) => beta === CONST.BETAS.MERGE_HR;
        const cards = getHRCards(makeGetHRCardsParams({policy, isBetaEnabled}));

        const workday = cards.find((c) => c.key === 'merge_workday');
        expect(workday?.isConnected).toBe(false);
        expect(workday?.hasError).toBe(false);
        expect(workday?.lastSyncErrorMessage).toBeUndefined();
    });

    it('connected Merge card gets syncStageInProgress during sync', () => {
        const policy = makePolicy({
            connections: {
                merge_hris: {
                    config: {integration: 'bamboohr'},
                    data: {},
                    lastSync: {},
                },
            } as unknown as Policy['connections'],
        });
        const syncProgress = makeSyncProgress(MERGE_HR, CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.MERGE_HR_SYNC_TITLE);
        const isBetaEnabled = (beta: string) => beta === CONST.BETAS.MERGE_HR;
        const cards = getHRCards(makeGetHRCardsParams({policy, connectionSyncProgress: syncProgress, isBetaEnabled}));

        const bamboo = cards.find((c) => c.key === 'merge_bamboohr');
        expect(bamboo?.isSyncInProgress).toBe(true);
        expect(bamboo?.syncStageInProgress).toBe(CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.MERGE_HR_SYNC_TITLE);
    });

    it('each card has an onConnect callback', () => {
        const cards = getHRCards(makeGetHRCardsParams());
        for (const card of cards) {
            expect(typeof card.onConnect).toBe('function');
        }
    });

    it('uses provider icons from params for static providers', () => {
        const gustoIcon = {testId: 'gusto'} as unknown as IconAsset;
        const zenefitsIcon = {testId: 'zenefits'} as unknown as IconAsset;
        const isBetaEnabled = (beta: string) => beta === CONST.BETAS.GUSTO || beta === CONST.BETAS.ZENEFITS;
        const cards = getHRCards(makeGetHRCardsParams({gustoIcon, zenefitsIcon, isBetaEnabled}));

        expect(cards[0].icon).toBe(gustoIcon);
        expect(cards[1].icon).toBe(zenefitsIcon);
    });

    it('uses provider iconUrl for Merge cards', () => {
        const isBetaEnabled = (beta: string) => beta === CONST.BETAS.MERGE_HR;
        const cards = getHRCards(makeGetHRCardsParams({isBetaEnabled}));

        for (const card of cards) {
            const slug = card.key.replace('merge_', '');
            const expected = MERGE_HR_PROVIDERS[slug as keyof typeof MERGE_HR_PROVIDERS]?.iconUrl;
            expect(card.icon).toBe(expected);
        }
    });
});
