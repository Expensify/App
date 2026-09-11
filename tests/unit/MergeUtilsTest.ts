import type {PersonalDetailsByLogin} from '@components/PersonalDetailsByLoginProvider';

import DateUtils from '@libs/DateUtils';
import {
    getMergeFinalApprover,
    getMergeFinalApproverDisplayName,
    hasMergeAuthenticationError,
    hasMergeSyncError,
    isMergeConnected,
    isMergeConnectionName,
    isMergeManualSyncLimitReached,
    isMergeSyncDone,
    showMergeManualSyncLimitModalIfReached,
} from '@libs/merge/MergeUtils';
import type {MergeConnectionName} from '@libs/merge/MergeUtils';

import CONST from '@src/CONST';
import type PersonalDetails from '@src/types/onyx/PersonalDetails';
import type {ConnectionLastSync, MergeConnectionLastSync} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';

import type {ValueOf} from 'type-fest';

import createRandomPolicy from 'tests/utils/collections/policies';
import {formatPhoneNumber, translateLocal} from 'tests/utils/TestHelper';

const MERGE_HR = CONST.POLICY.CONNECTIONS.NAME.MERGE_HR;
const MERGE_ATS = CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS;
const MERGE_CONNECTIONS: MergeConnectionName[] = [MERGE_HR, MERGE_ATS];

function makePolicy(overrides: Partial<Policy> = {}): Policy {
    return {
        ...createRandomPolicy(1),
        ...overrides,
    };
}

function makeLastSync(overrides: Partial<MergeConnectionLastSync> = {}): ConnectionLastSync {
    return {
        isAuthenticationError: false,
        isSuccessful: true,
        source: 'NEWEXPENSIFY',
        ...overrides,
    };
}

/** The approval config fields the shared Merge utils read, which both Merge HR and Merge ATS have in common. */
type MergeApprovalConfig = {
    /** Approval mode configured for the connection */
    approvalMode?: ValueOf<typeof CONST.MERGE.APPROVAL_MODE> | null;

    /** Workspace member who acts as the final approver */
    finalApprover?: string | null;
};

/** Builds a policy with the given Merge connection present. Only the fields the shared utils read are set. */
function makeMergePolicy(connectionName: MergeConnectionName, lastSync: Partial<MergeConnectionLastSync> = {}, config: MergeApprovalConfig = {}): Policy {
    const connection =
        connectionName === MERGE_HR
            ? {config: {integration: 'workday' as const, approvalMode: null, finalApprover: null, groups: null, ...config}, lastSync: makeLastSync(lastSync)}
            : {config: {integration: 'greenhouse' as const, approvalMode: null, finalApprover: null, filters: null, approverField: null, ...config}, lastSync: makeLastSync(lastSync)};

    return makePolicy({connections: {[connectionName]: connection}});
}

const dbTimeHoursAgo = (hoursAgo: number) => DateUtils.subtractMillisecondsFromDateTime(DateUtils.getDBTime(), hoursAgo * 60 * 60 * 1000);

describe('MergeUtils', () => {
    describe('isMergeConnectionName', () => {
        it('returns true for the Merge-backed connections', () => {
            expect(isMergeConnectionName(MERGE_HR)).toBe(true);
            expect(isMergeConnectionName(MERGE_ATS)).toBe(true);
        });

        it('returns false for connections that are not backed by Merge', () => {
            expect(isMergeConnectionName(CONST.POLICY.CONNECTIONS.NAME.GUSTO)).toBe(false);
            expect(isMergeConnectionName(CONST.POLICY.CONNECTIONS.NAME.ZENEFITS)).toBe(false);
            expect(isMergeConnectionName(CONST.POLICY.CONNECTIONS.NAME.QBO)).toBe(false);
        });
    });

    describe.each(MERGE_CONNECTIONS)('%s', (connectionName) => {
        const otherConnectionName = connectionName === MERGE_HR ? MERGE_ATS : MERGE_HR;

        describe('isMergeConnected', () => {
            it('returns false when there is no policy or no connection', () => {
                expect(isMergeConnected(undefined, connectionName)).toBe(false);
                expect(isMergeConnected(makePolicy(), connectionName)).toBe(false);
            });

            it('returns true when the connection is present', () => {
                expect(isMergeConnected(makeMergePolicy(connectionName), connectionName)).toBe(true);
            });

            it('ignores the other Merge connection', () => {
                expect(isMergeConnected(makeMergePolicy(otherConnectionName), connectionName)).toBe(false);
            });
        });

        describe('isMergeSyncDone', () => {
            it('returns false when there is no connection or no sync status', () => {
                expect(isMergeSyncDone(undefined, connectionName)).toBe(false);
                expect(isMergeSyncDone(makeMergePolicy(connectionName), connectionName)).toBe(false);
            });

            it('returns false while a sync is running', () => {
                expect(isMergeSyncDone(makeMergePolicy(connectionName, {syncStatus: CONST.MERGE.SYNC_STATUS.SYNCING}), connectionName)).toBe(false);
            });

            it('returns true once the sync is done', () => {
                expect(isMergeSyncDone(makeMergePolicy(connectionName, {syncStatus: CONST.MERGE.SYNC_STATUS.DONE}), connectionName)).toBe(true);
            });
        });

        describe('hasMergeAuthenticationError', () => {
            it('returns false when there is no connection', () => {
                expect(hasMergeAuthenticationError(undefined, connectionName)).toBe(false);
                expect(hasMergeAuthenticationError(makePolicy(), connectionName)).toBe(false);
            });

            it('returns false when the last sync did not hit an authentication error', () => {
                expect(hasMergeAuthenticationError(makeMergePolicy(connectionName), connectionName)).toBe(false);
            });

            it('returns true when the last sync hit an authentication error', () => {
                expect(hasMergeAuthenticationError(makeMergePolicy(connectionName, {isAuthenticationError: true}), connectionName)).toBe(true);
            });
        });

        describe('hasMergeSyncError', () => {
            it('returns false when there is no connection', () => {
                expect(hasMergeSyncError(undefined, connectionName)).toBe(false);
                expect(hasMergeSyncError(makePolicy(), connectionName)).toBe(false);
            });

            it('returns false when the last sync succeeded', () => {
                expect(hasMergeSyncError(makeMergePolicy(connectionName, {syncStatus: CONST.MERGE.SYNC_STATUS.DONE}), connectionName)).toBe(false);
            });

            it('returns false while a sync is running', () => {
                expect(hasMergeSyncError(makeMergePolicy(connectionName, {syncStatus: CONST.MERGE.SYNC_STATUS.SYNCING}), connectionName)).toBe(false);
            });

            it('returns true when the connection needs to be reconnected', () => {
                expect(hasMergeSyncError(makeMergePolicy(connectionName, {isAuthenticationError: true}), connectionName)).toBe(true);
            });

            it('returns true when the last sync failed', () => {
                expect(hasMergeSyncError(makeMergePolicy(connectionName, {syncStatus: CONST.MERGE.SYNC_STATUS.FAILED}), connectionName)).toBe(true);
            });

            it('ignores an error on the other Merge connection', () => {
                expect(hasMergeSyncError(makeMergePolicy(otherConnectionName, {syncStatus: CONST.MERGE.SYNC_STATUS.FAILED}), connectionName)).toBe(false);
            });
        });

        describe('getMergeFinalApprover', () => {
            const policyWithApprovalConfig = (config: MergeApprovalConfig) => makeMergePolicy(connectionName, {}, config);

            it('returns null when there is no policy or no connection', () => {
                expect(getMergeFinalApprover(undefined, connectionName)).toBeNull();
                expect(getMergeFinalApprover(makePolicy(), connectionName)).toBeNull();
            });

            it('returns the finalApprover when in basic mode', () => {
                const policy = policyWithApprovalConfig({approvalMode: CONST.MERGE.APPROVAL_MODE.BASIC, finalApprover: 'boss@company.com'});
                expect(getMergeFinalApprover(policy, connectionName)).toBe('boss@company.com');
            });

            it('returns the finalApprover when in advanced (manager) mode', () => {
                const policy = policyWithApprovalConfig({approvalMode: CONST.MERGE.APPROVAL_MODE.MANAGER, finalApprover: 'boss@company.com'});
                expect(getMergeFinalApprover(policy, connectionName)).toBe('boss@company.com');
            });

            it('returns null when in custom mode', () => {
                const policy = policyWithApprovalConfig({approvalMode: CONST.MERGE.APPROVAL_MODE.CUSTOM, finalApprover: 'boss@company.com'});
                expect(getMergeFinalApprover(policy, connectionName)).toBeNull();
            });

            it('returns null when the finalApprover is not set', () => {
                const policy = policyWithApprovalConfig({approvalMode: CONST.MERGE.APPROVAL_MODE.MANAGER, finalApprover: null});
                expect(getMergeFinalApprover(policy, connectionName)).toBeNull();
            });

            it('ignores the final approver configured on the other Merge connection', () => {
                const policy = makeMergePolicy(otherConnectionName, {}, {approvalMode: CONST.MERGE.APPROVAL_MODE.BASIC, finalApprover: 'boss@company.com'});
                expect(getMergeFinalApprover(policy, connectionName)).toBeNull();
            });
        });

        describe('isMergeManualSyncLimitReached', () => {
            const policyWithSyncTimestamps = (manualSyncTimestamps?: string[]) => makeMergePolicy(connectionName, {manualSyncTimestamps});

            it('returns false when there is no policy or no connection', () => {
                expect(isMergeManualSyncLimitReached(undefined, connectionName)).toBe(false);
                expect(isMergeManualSyncLimitReached(makePolicy(), connectionName)).toBe(false);
            });

            it('returns false when there are no manual sync timestamps', () => {
                expect(isMergeManualSyncLimitReached(policyWithSyncTimestamps(undefined), connectionName)).toBe(false);
                expect(isMergeManualSyncLimitReached(policyWithSyncTimestamps([]), connectionName)).toBe(false);
            });

            it('returns false when only one sync happened within the last 24 hours', () => {
                expect(isMergeManualSyncLimitReached(policyWithSyncTimestamps([dbTimeHoursAgo(1)]), connectionName)).toBe(false);
            });

            it('returns false when both syncs are older than 24 hours', () => {
                expect(isMergeManualSyncLimitReached(policyWithSyncTimestamps([dbTimeHoursAgo(25), dbTimeHoursAgo(48)]), connectionName)).toBe(false);
            });

            it('returns false when only one of the two syncs falls within the window', () => {
                expect(isMergeManualSyncLimitReached(policyWithSyncTimestamps([dbTimeHoursAgo(2), dbTimeHoursAgo(30)]), connectionName)).toBe(false);
            });

            it('returns true when two syncs happened within the last 24 hours', () => {
                expect(isMergeManualSyncLimitReached(policyWithSyncTimestamps([dbTimeHoursAgo(1), dbTimeHoursAgo(10)]), connectionName)).toBe(true);
            });
        });
    });

    describe('getMergeFinalApproverDisplayName', () => {
        const APPROVER_LOGIN = 'boss@company.com';
        const SMS_LOGIN = '+15551234567@expensify.sms';

        const personalDetailsFor = (login: string, overrides: Partial<PersonalDetails> = {}): PersonalDetailsByLogin => ({
            [login]: {accountID: 42, login, ...overrides},
        });

        it('returns "not set" when there is no final approver', () => {
            // Given a connection with no final approver configured
            // When the approver's display name is resolved
            // Then the missing approver is called out rather than left blank
            expect(getMergeFinalApproverDisplayName(undefined, {}, translateLocal, formatPhoneNumber)).toBe('workspace.merge.notSet');
            expect(getMergeFinalApproverDisplayName(null, {}, translateLocal, formatPhoneNumber)).toBe('workspace.merge.notSet');
            expect(getMergeFinalApproverDisplayName('', {}, translateLocal, formatPhoneNumber)).toBe('workspace.merge.notSet');
        });

        it('returns the display name when the approver is a known workspace member', () => {
            // Given a final approver who is a workspace member with a display name
            // When the approver's display name is resolved
            // Then their display name is shown instead of their login
            const personalDetails = personalDetailsFor(APPROVER_LOGIN, {displayName: 'Boss Man'});
            expect(getMergeFinalApproverDisplayName(APPROVER_LOGIN, personalDetails, translateLocal, formatPhoneNumber)).toBe('Boss Man');
        });

        it('falls back to the login when the approver is not among the workspace members', () => {
            // Given a final approver whose personal details are not loaded
            // When the approver's display name is resolved
            // Then their login is shown
            expect(getMergeFinalApproverDisplayName(APPROVER_LOGIN, {}, translateLocal, formatPhoneNumber)).toBe(APPROVER_LOGIN);
            expect(getMergeFinalApproverDisplayName(APPROVER_LOGIN, personalDetailsFor('someone.else@company.com'), translateLocal, formatPhoneNumber)).toBe(APPROVER_LOGIN);
        });

        it('falls back to the login when the approver has no display name set', () => {
            // Given a final approver who is a workspace member but has not set a display name
            // When the approver's display name is resolved
            // Then their login is shown rather than "hidden"
            expect(getMergeFinalApproverDisplayName(APPROVER_LOGIN, personalDetailsFor(APPROVER_LOGIN), translateLocal, formatPhoneNumber)).toBe(APPROVER_LOGIN);
            expect(getMergeFinalApproverDisplayName(APPROVER_LOGIN, personalDetailsFor(APPROVER_LOGIN, {displayName: ''}), translateLocal, formatPhoneNumber)).toBe(APPROVER_LOGIN);
        });

        it('formats the phone number of an SMS approver who has no display name of their own', () => {
            // Given a final approver who signed up with a phone number, so their display name is their SMS login
            // When the approver's display name is resolved
            // Then the phone number is formatted for display
            const personalDetails = personalDetailsFor(SMS_LOGIN, {displayName: SMS_LOGIN});
            expect(getMergeFinalApproverDisplayName(SMS_LOGIN, personalDetails, translateLocal, formatPhoneNumber)).toBe(formatPhoneNumber(SMS_LOGIN));
        });
    });

    describe('showMergeManualSyncLimitModalIfReached', () => {
        const showConfirmModal: jest.MockedFunction<Parameters<typeof showMergeManualSyncLimitModalIfReached>[3]> = jest.fn();

        beforeEach(() => {
            showConfirmModal.mockClear();
        });

        it.each(MERGE_CONNECTIONS)('allows the sync and shows no modal when the %s limit has not been reached', (connectionName) => {
            const policy = makeMergePolicy(connectionName, {manualSyncTimestamps: [dbTimeHoursAgo(1)]});

            expect(showMergeManualSyncLimitModalIfReached(policy, connectionName, translateLocal, showConfirmModal)).toBe(false);
            expect(showConfirmModal).not.toHaveBeenCalled();
        });

        it.each(MERGE_CONNECTIONS)('blocks the sync and shows the modal when the %s limit has been reached', (connectionName) => {
            const policy = makeMergePolicy(connectionName, {manualSyncTimestamps: [dbTimeHoursAgo(1), dbTimeHoursAgo(10)]});

            expect(showMergeManualSyncLimitModalIfReached(policy, connectionName, translateLocal, showConfirmModal)).toBe(true);
            expect(showConfirmModal).toHaveBeenCalledTimes(1);
            expect(showConfirmModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'workspace.merge.syncLimitReached.title',
                    prompt: 'workspace.merge.syncLimitReached.prompt',
                    shouldShowCancelButton: false,
                }),
            );
        });

        it('allows the sync for connections that are not backed by Merge, even at the limit', () => {
            const policy = makePolicy({
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.GUSTO]: {
                        config: {finalApprover: null, approvalMode: null},
                        lastSync: makeLastSync(),
                    },
                },
            });

            expect(showMergeManualSyncLimitModalIfReached(policy, CONST.POLICY.CONNECTIONS.NAME.GUSTO, translateLocal, showConfirmModal)).toBe(false);
            expect(showConfirmModal).not.toHaveBeenCalled();
        });
    });
});
