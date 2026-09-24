import {
    getConnectedATSProvider,
    getMergeATSApprovalMode,
    getMergeATSApproverField,
    getMergeATSOfficesLabel,
    getMergeATSStagesLabel,
    getMergeATSTagsLabel,
    isAnyRecruitingConnected,
    isMergeATSCompleteSetupNeeded,
    shouldShowRecruitingConnectionError,
} from '@libs/merge/RecruitingUtils';

import type {MergeProviderCardDescriptor} from '@pages/workspace/merge/types';
import {getRecruitingCards} from '@pages/workspace/recruiting/utils';

import CONST from '@src/CONST';
import MERGE_ATS_PROVIDERS from '@src/CONST/MERGE_ATS_PROVIDERS';
import type {MergeATSProviderSlug} from '@src/CONST/MERGE_ATS_PROVIDERS';
import ROUTES from '@src/ROUTES';
import type {ConnectionLastSync, Connections, MergeATSConnectionConfig, MergeConnectionLastSync} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';
import type IconAsset from '@src/types/utils/IconAsset';

import {formatPhoneNumber, translateLocal} from 'tests/utils/TestHelper';

jest.mock('@libs/PersonalDetailsUtils', () => ({
    temporaryGetDisplayNameOrDefault: jest.fn(
        ({passedPersonalDetails, defaultValue}: {passedPersonalDetails?: {displayName?: string}; defaultValue: string}) => passedPersonalDetails?.displayName ?? defaultValue,
    ),
}));

const MERGE_ATS = CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS;

const POLICY_ID = 'ABC123';
const GREENHOUSE: MergeATSProviderSlug = 'greenhouse';
const STUB_ICON: IconAsset = {uri: 'stub'};
const APPROVER_LOGIN = 'approver@test.com';
const ERROR_TIMESTAMP = 123;

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

type GetRecruitingCardsParams = Parameters<typeof getRecruitingCards>[0];

function makeGetRecruitingCardsParams(overrides: Partial<GetRecruitingCardsParams> = {}): GetRecruitingCardsParams {
    return {
        policy: makePolicy(),
        policyEmployeePersonalDetails: {},
        policyID: POLICY_ID,
        icons: {Download: STUB_ICON},
        translate: translateLocal,
        formatPhoneNumber,
        ...overrides,
    };
}

function getGreenhouseCard(overrides: Partial<GetRecruitingCardsParams> = {}): MergeProviderCardDescriptor | undefined {
    return getRecruitingCards(makeGetRecruitingCardsParams(overrides)).find((card) => card.key === `merge_ats_${GREENHOUSE}`);
}

function getRow(card: MergeProviderCardDescriptor | undefined, field: string) {
    return card?.configRows?.find((row) => row.field === field);
}

function getDefaultApproverTitle(
    connectionOverrides: Parameters<typeof makeMergeATSConnection>[0],
    personalDetails: GetRecruitingCardsParams['policyEmployeePersonalDetails'] = {},
): string | undefined {
    const card = getGreenhouseCard({policy: makeMergeATSPolicy(connectionOverrides), policyEmployeePersonalDetails: personalDetails});
    return getRow(card, 'approvalMode')?.title;
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

    describe('isAnyRecruitingConnected', () => {
        it('returns false when the policy has no ATS connection', () => {
            // Given a policy with no connections at all, and one with an empty connections object
            // When each is checked for a recruiting connection
            // Then neither counts as connected
            expect(isAnyRecruitingConnected(undefined)).toBe(false);
            expect(isAnyRecruitingConnected(makePolicy())).toBe(false);
            expect(isAnyRecruitingConnected(makePolicy({connections: {}}))).toBe(false);
        });

        it('returns true when a Merge ATS provider is connected', () => {
            // Given a policy connected to Greenhouse
            const policy = makeMergeATSPolicy({config: {integration: GREENHOUSE}});

            // When the policy is checked for a recruiting connection
            // Then it counts as connected
            expect(isAnyRecruitingConnected(policy)).toBe(true);
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

describe('getRecruitingCards', () => {
    it('returns one card per supported Merge ATS provider', () => {
        // Given a policy with no ATS connection
        // When the recruiting cards are built
        const cards = getRecruitingCards(makeGetRecruitingCardsParams());

        // Then every supported provider gets a card carrying its brand info and setup link
        expect(cards).toHaveLength(Object.keys(MERGE_ATS_PROVIDERS).length);
        for (const [slug, provider] of Object.entries(MERGE_ATS_PROVIDERS)) {
            const card = cards.find((c) => c.key === `merge_ats_${slug}`);
            expect(card?.category).toBe(CONST.POLICY.CONNECTIONS.CATEGORY.RECRUITING);
            expect(card?.connectionName).toBe(MERGE_ATS);
            expect(card?.displayName).toBe(provider.displayName);
            expect(card?.icon).toBe(provider.iconUrl);
            expect(card?.setupLink).toContain(`integration=${slug}`);
        }
    });

    it('leaves a disconnected card without state or config rows', () => {
        // Given a policy with no ATS connection
        // When the Greenhouse card is built
        const card = getGreenhouseCard();

        // Then it is idle and offers nothing to configure
        expect(card?.isConnected).toBe(false);
        expect(card?.isSyncInProgress).toBe(false);
        expect(card?.isInitialSyncInProgress).toBe(false);
        expect(card?.hasError).toBe(false);
        expect(card?.needsReconnect).toBe(false);
        expect(card?.configRows).toEqual([]);
    });

    it('marks only the connected provider as connected', () => {
        // Given a policy connected to Greenhouse
        const policy = makeMergeATSPolicy({config: {integration: GREENHOUSE}});

        // When the cards are built
        const cards = getRecruitingCards(makeGetRecruitingCardsParams({policy}));

        // Then the Greenhouse card is connected and every other provider stays disconnected
        expect(cards.find((card) => card.key === `merge_ats_${GREENHOUSE}`)?.isConnected).toBe(true);
        expect(cards.filter((card) => card.key !== `merge_ats_${GREENHOUSE}`).every((card) => !card.isConnected)).toBe(true);
    });

    it('flags the first sync separately from a manual sync', () => {
        // Given a connection whose very first sync is running
        const initialSync = getGreenhouseCard({
            policy: makeMergeATSPolicy({lastSync: {syncStatus: CONST.MERGE.SYNC_STATUS.SYNCING, syncType: CONST.MERGE.SYNC_TYPE.INITIAL}}),
        });

        // And a connection running a manual re-sync
        const manualSync = getGreenhouseCard({
            policy: makeMergeATSPolicy({lastSync: {syncStatus: CONST.MERGE.SYNC_STATUS.SYNCING, syncType: CONST.MERGE.SYNC_TYPE.MANUAL}}),
        });

        // Then both report a sync in progress, but only the first one is the initial sync
        expect(initialSync?.isSyncInProgress).toBe(true);
        expect(initialSync?.isInitialSyncInProgress).toBe(true);
        expect(manualSync?.isSyncInProgress).toBe(true);
        expect(manualSync?.isInitialSyncInProgress).toBe(false);
    });

    it('surfaces the error message of a failed sync', () => {
        // Given a connection whose last sync failed
        const policy = makeMergeATSPolicy({lastSync: {syncStatus: CONST.MERGE.SYNC_STATUS.FAILED, errorMessage: 'Something broke'}});

        // When the Greenhouse card is built
        const card = getGreenhouseCard({policy});

        // Then the failure and its message are carried on the card
        expect(card?.hasError).toBe(true);
        expect(card?.lastSyncErrorMessage).toBe('Something broke');
    });

    it('drops the error message of a sync that did not fail', () => {
        // Given a connection that synced successfully but still carries an error message from an earlier attempt
        const policy = makeMergeATSPolicy({
            lastSync: {syncStatus: CONST.MERGE.SYNC_STATUS.DONE, errorMessage: 'Stale error', successfulDate: '2024-01-01'},
        });

        // When the Greenhouse card is built
        const card = getGreenhouseCard({policy});

        // Then no error is shown and the successful sync date is passed through
        expect(card?.hasError).toBe(false);
        expect(card?.lastSyncErrorMessage).toBeUndefined();
        expect(card?.successfulDate).toBe('2024-01-01');
    });

    it('hides the config rows while the connection needs to be reconnected', () => {
        // Given a connection whose last sync failed to authenticate
        const policy = makeMergeATSPolicy({
            config: {approvalMode: CONST.MERGE.APPROVAL_MODE.BASIC},
            lastSync: {isAuthenticationError: true},
        });

        // When the Greenhouse card is built
        const card = getGreenhouseCard({policy});

        // Then the admin is steered to reconnect instead of configuring the connection
        expect(card?.needsReconnect).toBe(true);
        expect(card?.configRows).toEqual([]);
    });

    it('points to the import settings page while the setup is incomplete', () => {
        // Given a synced connection that returned filter options the admin has not chosen from yet
        const policy = makeMergeATSPolicy({
            data: {stages: [{id: 's1', name: 'Offer'}]},
            lastSync: {syncStatus: CONST.MERGE.SYNC_STATUS.DONE},
        });

        // When the Greenhouse card is built
        const card = getGreenhouseCard({policy});

        // Then it links to the import settings page to finish the setup
        expect(card?.completeSetupRoute).toBe(ROUTES.WORKSPACE_RECRUITING_MERGE_IMPORT_SETTINGS.getRoute(POLICY_ID));
    });

    it('does not ask to complete the setup once filters are chosen', () => {
        // Given a synced connection whose filters are already saved
        const policy = makeMergeATSPolicy({
            config: {filters: {stages: ['Offer']}},
            data: {stages: [{id: 's1', name: 'Offer'}]},
            lastSync: {syncStatus: CONST.MERGE.SYNC_STATUS.DONE},
        });

        // When the Greenhouse card is built
        const card = getGreenhouseCard({policy});

        // Then there is no setup route left to follow
        expect(card?.completeSetupRoute).toBeUndefined();
    });

    it('does not ask to complete the setup while the connection needs to be reconnected', () => {
        // Given a connection that both needs reconnecting and has an unfinished setup
        const policy = makeMergeATSPolicy({
            data: {stages: [{id: 's1', name: 'Offer'}]},
            lastSync: {syncStatus: CONST.MERGE.SYNC_STATUS.DONE, isAuthenticationError: true},
        });

        // When the Greenhouse card is built
        const card = getGreenhouseCard({policy});

        // Then reconnecting takes priority over the setup prompt
        expect(card?.needsReconnect).toBe(true);
        expect(card?.completeSetupRoute).toBeUndefined();
    });

    it('builds the import settings and default approver rows for a connected card', () => {
        // Given a connected policy
        const policy = makeMergeATSPolicy({config: {integration: GREENHOUSE}});

        // When the Greenhouse card is built
        const card = getGreenhouseCard({policy});

        // Then the two config rows are returned in display order, each pointing at its own RHP
        expect(card?.configRows?.map((row) => row.field)).toEqual(['filters', 'approvalMode']);
        expect(getRow(card, 'filters')?.route).toBe(ROUTES.WORKSPACE_RECRUITING_MERGE_IMPORT_SETTINGS.getRoute(POLICY_ID));
        expect(getRow(card, 'approvalMode')?.route).toBe(ROUTES.WORKSPACE_RECRUITING_MERGE_APPROVAL_MODE.getRoute(POLICY_ID));
    });

    it('renders the import settings row as a plain labelled menu item', () => {
        // Given a connected policy
        const policy = makeMergeATSPolicy({config: {integration: GREENHOUSE}});

        // When the import settings row is built
        const row = getRow(getGreenhouseCard({policy}), 'filters');

        // Then it opts out of the top description and shows the download icon next to its label
        expect(row?.shouldRenderAsMenuItem).toBe(true);
        expect(row?.icon).toBe(STUB_ICON);
        expect(row?.title).toBe('workspace.recruiting.importSettings');
        expect(row?.description).toBeUndefined();
    });

    it('carries the pending action and errors of each config field', () => {
        // Given a connection with a filters update in flight and a failed approval mode update
        const policy = makeMergeATSPolicy({
            config: {
                pendingFields: {filters: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                errorFields: {approvalMode: {[ERROR_TIMESTAMP]: 'Generic error'}},
            },
        });

        // When the Greenhouse card is built
        const card = getGreenhouseCard({policy});

        // Then each row reflects the state of its own field
        expect(getRow(card, 'filters')?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
        expect(getRow(card, 'filters')?.errors).toBeUndefined();
        expect(getRow(card, 'approvalMode')?.pendingAction).toBeUndefined();
        expect(getRow(card, 'approvalMode')?.errors).toEqual({[ERROR_TIMESTAMP]: 'Generic error'});
    });

    describe('default approver row', () => {
        it('reads "not set" when no approval mode is configured', () => {
            // Given a connected policy with no approval mode
            // When the default approver row is built
            // Then nothing is set yet
            expect(getDefaultApproverTitle({config: {approvalMode: null}})).toBe('workspace.merge.notSet');
        });

        it('shows only the mode name in custom mode', () => {
            // Given a connection in custom approval mode, where approvals are configured in Expensify instead
            // When the default approver row is built
            // Then only the mode is shown, with no approver
            expect(getDefaultApproverTitle({config: {approvalMode: CONST.MERGE.APPROVAL_MODE.CUSTOM, finalApprover: APPROVER_LOGIN}})).toBe('workspace.merge.approvalModes.custom');
        });

        it('shows the mode and the approver in basic mode', () => {
            // Given a connection in basic mode with a final approver
            // When the default approver row is built
            // Then the mode and the approver are shown together
            expect(getDefaultApproverTitle({config: {approvalMode: CONST.MERGE.APPROVAL_MODE.BASIC, finalApprover: APPROVER_LOGIN}})).toBe(
                `workspace.merge.approvalModes.basic • ${APPROVER_LOGIN}`,
            );
        });

        it('falls back to "not set" for the approver when basic mode has none', () => {
            // Given a connection in basic mode with no final approver chosen
            // When the default approver row is built
            // Then the missing approver is called out rather than left blank
            expect(getDefaultApproverTitle({config: {approvalMode: CONST.MERGE.APPROVAL_MODE.BASIC, finalApprover: null}})).toBe(
                'workspace.merge.approvalModes.basic • workspace.merge.notSet',
            );
        });

        it('resolves the approver login to their display name', () => {
            // Given a final approver who is a known workspace member
            // When the default approver row is built
            // Then their display name is shown instead of their login
            expect(
                getDefaultApproverTitle(
                    {config: {approvalMode: CONST.MERGE.APPROVAL_MODE.BASIC, finalApprover: APPROVER_LOGIN}},
                    {[APPROVER_LOGIN]: {accountID: 1, displayName: 'Alex Approver'}},
                ),
            ).toBe('workspace.merge.approvalModes.basic • Alex Approver');
        });

        it('shows the ATS field the approver is read from in advanced mode', () => {
            // Given a connection in advanced mode reading the approver from the recruiter field
            // When the default approver row is built
            // Then the mode, the translated ATS field, and the fallback approver are all shown
            expect(
                getDefaultApproverTitle({
                    config: {approvalMode: CONST.MERGE.APPROVAL_MODE.ADVANCED, approverField: CONST.MERGE.ATS_APPROVER_FIELD.RECRUITER, finalApprover: APPROVER_LOGIN},
                }),
            ).toBe(`workspace.merge.approvalModes.advanced • workspace.recruiting.approverFields.recruiter -> ${APPROVER_LOGIN}`);
        });

        it('translates the recruiting coordinator field in advanced mode', () => {
            // Given a connection in advanced mode reading the approver from the recruiting coordinator field
            // When the default approver row is built
            // Then that field gets its own translated label
            expect(
                getDefaultApproverTitle({
                    config: {approvalMode: CONST.MERGE.APPROVAL_MODE.ADVANCED, approverField: CONST.MERGE.ATS_APPROVER_FIELD.RECRUITING_COORDINATOR, finalApprover: APPROVER_LOGIN},
                }),
            ).toBe(`workspace.merge.approvalModes.advanced • workspace.recruiting.approverFields.recruitingCoordinator -> ${APPROVER_LOGIN}`);
        });

        it('shows an unrecognized ATS field as-is', () => {
            // Given an approver field the app does not have a translation for, since the backend can add new ones
            // When the default approver row is built
            // Then the raw field name is shown rather than a missing translation
            expect(
                getDefaultApproverTitle({
                    config: {approvalMode: CONST.MERGE.APPROVAL_MODE.ADVANCED, approverField: 'hiringManager', finalApprover: APPROVER_LOGIN},
                }),
            ).toBe(`workspace.merge.approvalModes.advanced • hiringManager -> ${APPROVER_LOGIN}`);
        });

        it('reads "not set" for the ATS field when advanced mode has none', () => {
            // Given a connection in advanced mode with no approver field chosen
            // When the default approver row is built
            // Then the missing field is called out
            expect(
                getDefaultApproverTitle({
                    config: {approvalMode: CONST.MERGE.APPROVAL_MODE.ADVANCED, approverField: null, finalApprover: APPROVER_LOGIN},
                }),
            ).toBe(`workspace.merge.approvalModes.advanced • workspace.merge.notSet -> ${APPROVER_LOGIN}`);
        });
    });
});
