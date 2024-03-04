import {PUBLIC_DOMAINS} from 'expensify-common/lib/CONST';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import Str from 'expensify-common/lib/str';
import {escapeRegExp} from 'lodash';
import lodashClone from 'lodash/clone';
import lodashUnion from 'lodash/union';
import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as API from '@libs/API';
import type {
    AddMembersToWorkspaceParams,
    CreateWorkspaceFromIOUPaymentParams,
    CreateWorkspaceParams,
    DeleteMembersFromWorkspaceParams,
    DeleteWorkspaceAvatarParams,
    DeleteWorkspaceParams,
    OpenDraftWorkspaceRequestParams,
    OpenWorkspaceInvitePageParams,
    OpenWorkspaceMembersPageParams,
    OpenWorkspaceParams,
    OpenWorkspaceReimburseViewParams,
    SetWorkspaceApprovalModeParams,
    SetWorkspaceAutoReportingFrequencyParams,
    SetWorkspaceAutoReportingMonthlyOffsetParams,
    SetWorkspaceAutoReportingParams,
    UpdateWorkspaceAvatarParams,
    UpdateWorkspaceCustomUnitAndRateParams,
    UpdateWorkspaceDescriptionParams,
    UpdateWorkspaceGeneralSettingsParams,
    UpdateWorkspaceMembersRoleParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import Log from '@libs/Log';
import * as NumberUtils from '@libs/NumberUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PhoneNumber from '@libs/PhoneNumber';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {
    InvitedEmailsToAccountIDs,
    PersonalDetailsList,
    Policy,
    PolicyCategories,
    PolicyMember,
    PolicyTagList,
    RecentlyUsedCategories,
    RecentlyUsedTags,
    ReimbursementAccount,
    Report,
    ReportAction,
    Transaction,
} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type {Attributes, CustomUnit, Rate, Unit} from '@src/types/onyx/Policy';
import type {OnyxData} from '@src/types/onyx/Request';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type AnnounceRoomMembersOnyxData = {
    onyxOptimisticData: OnyxUpdate[];
    onyxFailureData: OnyxUpdate[];
};

type ReportCreationData = Record<
    string,
    {
        reportID: string;
        reportActionID?: string;
    }
>;

type WorkspaceMembersChats = {
    onyxSuccessData: OnyxUpdate[];
    onyxOptimisticData: OnyxUpdate[];
    onyxFailureData: OnyxUpdate[];
    reportCreationData: ReportCreationData;
};

type OptimisticCustomUnits = {
    customUnits: Record<string, CustomUnit>;
    customUnitID: string;
    customUnitRateID: string;
    outputCurrency: string;
};

type PoliciesRecord = Record<string, OnyxEntry<Policy>>;

type NewCustomUnit = {
    customUnitID: string;
    name: string;
    attributes: Attributes;
    rates: Rate;
};

type WorkspaceMembersRoleData = {
    accountID: number;
    email: string;
    role: typeof CONST.POLICY.ROLE.ADMIN | typeof CONST.POLICY.ROLE.USER;
};

const allPolicies: OnyxCollection<Policy> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (val, key) => {
        if (!key) {
            return;
        }
        if (val === null || val === undefined) {
            // If we are deleting a policy, we have to check every report linked to that policy
            // and unset the draft indicator (pencil icon) alongside removing any draft comments. Clearing these values will keep the newly archived chats from being displayed in the LHN.
            // More info: https://github.com/Expensify/App/issues/14260
            const policyID = key.replace(ONYXKEYS.COLLECTION.POLICY, '');
            const policyReports = ReportUtils.getAllPolicyReports(policyID);
            const cleanUpMergeQueries: Record<`${typeof ONYXKEYS.COLLECTION.REPORT}${string}`, NullishDeep<Report>> = {};
            const cleanUpSetQueries: Record<`${typeof ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${string}` | `${typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${string}`, null> = {};
            policyReports.forEach((policyReport) => {
                if (!policyReport) {
                    return;
                }
                const {reportID} = policyReport;
                cleanUpMergeQueries[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = {hasDraft: false};
                cleanUpSetQueries[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`] = null;
                cleanUpSetQueries[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${reportID}`] = null;
            });
            Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, cleanUpMergeQueries);
            Onyx.multiSet(cleanUpSetQueries);
            delete allPolicies[key];
            return;
        }

        allPolicies[key] = val;
    },
});

let allReports: OnyxCollection<Report> = null;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => (allReports = value),
});

let allPolicyMembers: OnyxCollection<PolicyMember>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY_MEMBERS,
    waitForCollectionCallback: true,
    callback: (val) => {
        allPolicyMembers = val;
    },
});

let lastAccessedWorkspacePolicyID: OnyxEntry<string> = null;
Onyx.connect({
    key: ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID,
    callback: (value) => (lastAccessedWorkspacePolicyID = value),
});

let sessionEmail = '';
let sessionAccountID = 0;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        sessionEmail = val?.email ?? '';
        sessionAccountID = val?.accountID ?? -1;
    },
});

let allPersonalDetails: OnyxEntry<PersonalDetailsList>;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (val) => (allPersonalDetails = val),
});

let reimbursementAccount: OnyxEntry<ReimbursementAccount>;
Onyx.connect({
    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    callback: (val) => (reimbursementAccount = val),
});

let allRecentlyUsedCategories: OnyxCollection<RecentlyUsedCategories> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES,
    waitForCollectionCallback: true,
    callback: (val) => (allRecentlyUsedCategories = val),
});

let allPolicyTags: OnyxCollection<PolicyTagList> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY_TAGS,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            allPolicyTags = {};
            return;
        }

        allPolicyTags = value;
    },
});

let allRecentlyUsedTags: OnyxCollection<RecentlyUsedTags> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS,
    waitForCollectionCallback: true,
    callback: (val) => (allRecentlyUsedTags = val),
});

let allPolicyCategories: OnyxCollection<PolicyCategories> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY_CATEGORIES,
    waitForCollectionCallback: true,
    callback: (val) => (allPolicyCategories = val),
});

/**
 * Stores in Onyx the policy ID of the last workspace that was accessed by the user
 */
function updateLastAccessedWorkspace(policyID: OnyxEntry<string>) {
    Onyx.set(ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID, policyID);
}

/**
 * Check if the user has any active free policies (aka workspaces)
 */
function hasActiveFreePolicy(policies: Array<OnyxEntry<Policy>> | PoliciesRecord): boolean {
    const adminFreePolicies = Object.values(policies).filter((policy) => policy && policy.type === CONST.POLICY.TYPE.FREE && policy.role === CONST.POLICY.ROLE.ADMIN);

    if (adminFreePolicies.length === 0) {
        return false;
    }

    if (adminFreePolicies.some((policy) => !policy?.pendingAction)) {
        return true;
    }

    if (adminFreePolicies.some((policy) => policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD)) {
        return true;
    }

    if (adminFreePolicies.some((policy) => policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)) {
        return false;
    }

    // If there are no add or delete pending actions the only option left is an update
    // pendingAction, in which case we should return true.
    return true;
}

/**
 * Delete the workspace
 */
function deleteWorkspace(policyID: string, policyName: string) {
    if (!allPolicies) {
        return;
    }

    const filteredPolicies = Object.values(allPolicies).filter((policy): policy is Policy => policy?.id !== policyID);
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                avatar: '',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                errors: null,
            },
        },
        ...(!hasActiveFreePolicy(filteredPolicies)
            ? [
                  {
                      onyxMethod: Onyx.METHOD.MERGE,
                      key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                      value: {
                          errors: null,
                      },
                  },
              ]
            : []),
    ];

    const reportsToArchive = Object.values(allReports ?? {}).filter(
        (report) => report?.policyID === policyID && (ReportUtils.isChatRoom(report) || ReportUtils.isPolicyExpenseChat(report) || ReportUtils.isTaskReport(report)),
    );
    reportsToArchive.forEach((report) => {
        const {reportID, ownerAccountID} = report ?? {};
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                hasDraft: false,
                oldPolicyName: allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]?.name ?? '',
            },
        });

        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${reportID}`,
            value: null,
        });

        // Add closed actions to all chat reports linked to this policy
        // Announce & admin chats have FAKE owners, but workspace chats w/ users do have owners.
        let emailClosingReport: string = CONST.POLICY.OWNER_EMAIL_FAKE;
        if (!!ownerAccountID && ownerAccountID !== CONST.POLICY.OWNER_ACCOUNT_ID_FAKE) {
            emailClosingReport = allPersonalDetails?.[ownerAccountID]?.login ?? '';
        }
        const optimisticClosedReportAction = ReportUtils.buildOptimisticClosedReportAction(emailClosingReport, policyName, CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED);
        const optimisticReportActions: Record<string, ReportAction> = {};
        optimisticReportActions[optimisticClosedReportAction.reportActionID] = optimisticClosedReportAction as ReportAction;
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: optimisticReportActions,
        });
    });

    // Restore the old report stateNum and statusNum
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
            value: {
                errors: reimbursementAccount?.errors ?? null,
            },
        },
    ];

    reportsToArchive.forEach((report) => {
        const {reportID, stateNum, statusNum, hasDraft, oldPolicyName} = report ?? {};
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                stateNum,
                statusNum,
                hasDraft,
                oldPolicyName,
            },
        });
    });

    const params: DeleteWorkspaceParams = {policyID};

    API.write(WRITE_COMMANDS.DELETE_WORKSPACE, params, {optimisticData, failureData});

    // Reset the lastAccessedWorkspacePolicyID
    if (policyID === lastAccessedWorkspacePolicyID) {
        updateLastAccessedWorkspace(null);
    }
}

/**
 * Is the user an admin of a free policy (aka workspace)?
 */
function isAdminOfFreePolicy(policies?: PoliciesRecord): boolean {
    return Object.values(policies ?? {}).some((policy) => policy && policy.type === CONST.POLICY.TYPE.FREE && policy.role === CONST.POLICY.ROLE.ADMIN);
}

/**
 * Build optimistic data for adding members to the announcement room
 */
function buildAnnounceRoomMembersOnyxData(policyID: string, accountIDs: number[]): AnnounceRoomMembersOnyxData {
    const announceReport = ReportUtils.getRoom(CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, policyID);
    const announceRoomMembers: AnnounceRoomMembersOnyxData = {
        onyxOptimisticData: [],
        onyxFailureData: [],
    };

    if (!announceReport) {
        return announceRoomMembers;
    }

    if (announceReport?.participantAccountIDs) {
        // Everyone in special policy rooms is visible
        const participantAccountIDs = [...announceReport.participantAccountIDs, ...accountIDs];

        announceRoomMembers.onyxOptimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${announceReport?.reportID}`,
            value: {
                participantAccountIDs,
                visibleChatMemberAccountIDs: participantAccountIDs,
            },
        });
    }

    announceRoomMembers.onyxFailureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${announceReport?.reportID}`,
        value: {
            participantAccountIDs: announceReport?.participantAccountIDs,
            visibleChatMemberAccountIDs: announceReport?.visibleChatMemberAccountIDs,
        },
    });
    return announceRoomMembers;
}

function setWorkspaceAutoReporting(policyID: string, enabled: boolean) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                autoReporting: enabled,
                harvesting: {
                    enabled: true,
                },
                pendingFields: {isAutoApprovalEnabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                autoReporting: !enabled,
                pendingFields: {isAutoApprovalEnabled: null, harvesting: null},
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {isAutoApprovalEnabled: null, harvesting: null},
            },
        },
    ];

    const params: SetWorkspaceAutoReportingParams = {policyID, enabled};
    API.write(WRITE_COMMANDS.SET_WORKSPACE_AUTO_REPORTING, params, {optimisticData, failureData, successData});
}

function setWorkspaceAutoReportingFrequency(policyID: string, frequency: ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                autoReportingFrequency: frequency,
                pendingFields: {autoReportingFrequency: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {autoReportingFrequency: null},
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {autoReportingFrequency: null},
            },
        },
    ];

    const params: SetWorkspaceAutoReportingFrequencyParams = {policyID, frequency};
    API.write(WRITE_COMMANDS.SET_WORKSPACE_AUTO_REPORTING_FREQUENCY, params, {optimisticData, failureData, successData});
}

function setWorkspaceAutoReportingMonthlyOffset(policyID: string, autoReportingOffset: number | ValueOf<typeof CONST.POLICY.AUTO_REPORTING_OFFSET>) {
    const value = JSON.stringify({autoReportingOffset: autoReportingOffset.toString()});

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                autoReportingOffset,
                pendingFields: {autoReportingOffset: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {autoReportingOffset: null},
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {autoReportingOffset: null},
            },
        },
    ];

    const params: SetWorkspaceAutoReportingMonthlyOffsetParams = {policyID, value};
    API.write(WRITE_COMMANDS.SET_WORKSPACE_AUTO_REPORTING_MONTHLY_OFFSET, params, {optimisticData, failureData, successData});
}

function setWorkspaceApprovalMode(policyID: string, approver: string, approvalMode: ValueOf<typeof CONST.POLICY.APPROVAL_MODE>) {
    const isAutoApprovalEnabled = approvalMode === CONST.POLICY.APPROVAL_MODE.BASIC;

    const value = {
        approver,
        approvalMode,
        isAutoApprovalEnabled,
    };

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                ...value,
                pendingFields: {approvalMode: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {approvalMode: null},
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {approvalMode: null},
            },
        },
    ];

    const params: SetWorkspaceApprovalModeParams = {policyID, value: JSON.stringify(value)};
    API.write(WRITE_COMMANDS.SET_WORKSPACE_APPROVAL_MODE, params, {optimisticData, failureData, successData});
}

/**
 * Build optimistic data for removing users from the announcement room
 */
function removeOptimisticAnnounceRoomMembers(policyID: string, accountIDs: number[]): AnnounceRoomMembersOnyxData {
    const announceReport = ReportUtils.getRoom(CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, policyID);
    const announceRoomMembers: AnnounceRoomMembersOnyxData = {
        onyxOptimisticData: [],
        onyxFailureData: [],
    };

    if (!announceReport) {
        return announceRoomMembers;
    }

    if (announceReport?.participantAccountIDs) {
        const remainUsers = announceReport.participantAccountIDs.filter((e) => !accountIDs.includes(e));
        announceRoomMembers.onyxOptimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${announceReport.reportID}`,
            value: {
                participantAccountIDs: [...remainUsers],
                visibleChatMemberAccountIDs: [...remainUsers],
            },
        });

        announceRoomMembers.onyxFailureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${announceReport.reportID}`,
            value: {
                participantAccountIDs: announceReport.participantAccountIDs,
                visibleChatMemberAccountIDs: announceReport.visibleChatMemberAccountIDs,
            },
        });
    }

    return announceRoomMembers;
}

/**
 * Remove the passed members from the policy employeeList
 * Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
 */
function removeMembers(accountIDs: number[], policyID: string) {
    // In case user selects only themselves (admin), their email will be filtered out and the members
    // array passed will be empty, prevent the function from proceeding in that case as there is no one to remove
    if (accountIDs.length === 0) {
        return;
    }

    const membersListKey = `${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}` as const;
    const policy = ReportUtils.getPolicy(policyID);
    const workspaceChats = ReportUtils.getWorkspaceChats(policyID, accountIDs);
    const optimisticClosedReportActions = workspaceChats.map(() => ReportUtils.buildOptimisticClosedReportAction(sessionEmail, policy.name, CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY));

    const announceRoomMembers = removeOptimisticAnnounceRoomMembers(policyID, accountIDs);

    const optimisticMembersState: OnyxCollection<PolicyMember> = {};
    const successMembersState: OnyxCollection<PolicyMember> = {};
    const failureMembersState: OnyxCollection<PolicyMember> = {};
    accountIDs.forEach((accountID) => {
        optimisticMembersState[accountID] = {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};
        successMembersState[accountID] = null;
        failureMembersState[accountID] = {errors: ErrorUtils.getMicroSecondOnyxError('workspace.people.error.genericRemove')};
    });

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: membersListKey,
            value: optimisticMembersState,
        },
        ...announceRoomMembers.onyxOptimisticData,
    ];

    workspaceChats.forEach((report) => {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report?.reportID}`,
            value: {
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                oldPolicyName: policy.name,
                hasDraft: false,
            },
        });
    });
    optimisticClosedReportActions.forEach((reportAction, index) => {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${workspaceChats?.[index]?.reportID}`,
            value: {[reportAction.reportActionID]: reportAction as ReportAction},
        });
    });

    // If the policy has primaryLoginsInvited, then it displays informative messages on the members page about which primary logins were added by secondary logins.
    // If we delete all these logins then we should clear the informative messages since they are no longer relevant.
    if (!isEmptyObject(policy?.primaryLoginsInvited ?? {})) {
        // Take the current policy members and remove them optimistically
        const policyMemberAccountIDs = Object.keys(allPolicyMembers?.[`${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`] ?? {}).map((accountID) => Number(accountID));
        const remainingMemberAccountIDs = policyMemberAccountIDs.filter((accountID) => !accountIDs.includes(accountID));
        const remainingLogins: string[] = PersonalDetailsUtils.getLoginsByAccountIDs(remainingMemberAccountIDs);
        const invitedPrimaryToSecondaryLogins: Record<string, string> = {};

        if (policy.primaryLoginsInvited) {
            Object.keys(policy.primaryLoginsInvited).forEach((key) => (invitedPrimaryToSecondaryLogins[policy.primaryLoginsInvited?.[key] ?? ''] = key));
        }

        // Then, if no remaining members exist that were invited by a secondary login, clear the informative messages
        if (!remainingLogins.some((remainingLogin) => !!invitedPrimaryToSecondaryLogins[remainingLogin])) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: membersListKey,
                value: {
                    primaryLoginsInvited: null,
                },
            });
        }
    }

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: membersListKey,
            value: successMembersState,
        },
    ];

    const filteredWorkspaceChats = workspaceChats.filter((report): report is Report => report !== null);
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: membersListKey,
            value: failureMembersState,
        },
        ...announceRoomMembers.onyxFailureData,
    ];

    filteredWorkspaceChats.forEach(({reportID, stateNum, statusNum, hasDraft, oldPolicyName = null}) => {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                stateNum,
                statusNum,
                hasDraft,
                oldPolicyName,
            },
        });
    });
    optimisticClosedReportActions.forEach((reportAction, index) => {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${workspaceChats?.[index]?.reportID}`,
            value: {[reportAction.reportActionID]: null},
        });
    });

    const params: DeleteMembersFromWorkspaceParams = {
        emailList: accountIDs.map((accountID) => allPersonalDetails?.[accountID]?.login).join(','),
        policyID,
    };

    API.write(WRITE_COMMANDS.DELETE_MEMBERS_FROM_WORKSPACE, params, {optimisticData, successData, failureData});
}

function updateWorkspaceMembersRole(policyID: string, accountIDs: number[], newRole: typeof CONST.POLICY.ROLE.ADMIN | typeof CONST.POLICY.ROLE.USER) {
    const previousPolicyMembers = {...allPolicyMembers};
    const memberRoles: WorkspaceMembersRoleData[] = accountIDs.reduce((result: WorkspaceMembersRoleData[], accountID: number) => {
        if (!allPersonalDetails?.[accountID]?.login) {
            return result;
        }

        result.push({
            accountID,
            email: allPersonalDetails?.[accountID]?.login ?? '',
            role: newRole,
        });

        return result;
    }, []);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`,
            value: {
                ...memberRoles.reduce((member: Record<number, {role: string}>, current) => {
                    // eslint-disable-next-line no-param-reassign
                    member[current.accountID] = {role: current?.role};
                    return member;
                }, {}),
                errors: null,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`,
            value: {
                errors: null,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`,
            value: {
                ...(previousPolicyMembers[`${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`] as Record<string, PolicyMember | null>),
                errors: ErrorUtils.getMicroSecondOnyxError('workspace.editor.genericFailureMessage'),
            },
        },
    ];

    const params: UpdateWorkspaceMembersRoleParams = {
        policyID,
        employees: JSON.stringify(memberRoles.map((item) => ({email: item.email, role: item.role}))),
    };

    API.write(WRITE_COMMANDS.UPDATE_WORKSPACE_MEMBERS_ROLE, params, {optimisticData, successData, failureData});
}

/**
 * Optimistically create a chat for each member of the workspace, creates both optimistic and success data for onyx.
 *
 * @returns - object with onyxSuccessData, onyxOptimisticData, and optimisticReportIDs (map login to reportID)
 */
function createPolicyExpenseChats(policyID: string, invitedEmailsToAccountIDs: InvitedEmailsToAccountIDs, hasOutstandingChildRequest = false): WorkspaceMembersChats {
    const workspaceMembersChats: WorkspaceMembersChats = {
        onyxSuccessData: [],
        onyxOptimisticData: [],
        onyxFailureData: [],
        reportCreationData: {},
    };

    Object.keys(invitedEmailsToAccountIDs).forEach((email) => {
        const accountID = invitedEmailsToAccountIDs[email];
        const cleanAccountID = Number(accountID);
        const login = PhoneNumber.addSMSDomainIfPhoneNumber(email);

        const oldChat = ReportUtils.getChatByParticipantsAndPolicy([sessionAccountID, cleanAccountID], policyID);

        // If the chat already exists, we don't want to create a new one - just make sure it's not archived
        if (oldChat) {
            workspaceMembersChats.reportCreationData[login] = {
                reportID: oldChat.reportID,
            };
            workspaceMembersChats.onyxOptimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${oldChat.reportID}`,
                value: {
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                },
            });
            return;
        }
        const optimisticReport = ReportUtils.buildOptimisticChatReport([sessionAccountID, cleanAccountID], undefined, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, policyID, cleanAccountID);
        const optimisticCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(login);

        workspaceMembersChats.reportCreationData[login] = {
            reportID: optimisticReport.reportID,
            reportActionID: optimisticCreatedAction.reportActionID,
        };

        workspaceMembersChats.onyxOptimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticReport.reportID}`,
            value: {
                ...optimisticReport,
                pendingFields: {
                    createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                isOptimisticReport: true,
                hasOutstandingChildRequest,
            },
        });
        workspaceMembersChats.onyxOptimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticReport.reportID}`,
            value: {[optimisticCreatedAction.reportActionID]: optimisticCreatedAction},
        });

        workspaceMembersChats.onyxSuccessData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticReport.reportID}`,
            value: {
                pendingFields: {
                    createChat: null,
                },
                errorFields: {
                    createChat: null,
                },
                isOptimisticReport: false,
            },
        });
        workspaceMembersChats.onyxSuccessData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticReport.reportID}`,
            value: {[optimisticCreatedAction.reportActionID]: {pendingAction: null}},
        });

        workspaceMembersChats.onyxFailureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${optimisticReport.reportID}`,
            value: {
                isLoadingInitialReportActions: false,
            },
        });
    });
    return workspaceMembersChats;
}

/**
 * Adds members to the specified workspace/policyID
 * Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
 */
function addMembersToWorkspace(invitedEmailsToAccountIDs: InvitedEmailsToAccountIDs, welcomeNote: string, policyID: string) {
    const membersListKey = `${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}` as const;
    const logins = Object.keys(invitedEmailsToAccountIDs).map((memberLogin) => PhoneNumber.addSMSDomainIfPhoneNumber(memberLogin));
    const accountIDs = Object.values(invitedEmailsToAccountIDs);

    const newPersonalDetailsOnyxData = PersonalDetailsUtils.getNewPersonalDetailsOnyxData(logins, accountIDs);

    const announceRoomMembers = buildAnnounceRoomMembersOnyxData(policyID, accountIDs);

    // create onyx data for policy expense chats for each new member
    const membersChats = createPolicyExpenseChats(policyID, invitedEmailsToAccountIDs);

    const optimisticMembersState: OnyxCollection<PolicyMember> = {};
    const failureMembersState: OnyxCollection<PolicyMember> = {};
    accountIDs.forEach((accountID) => {
        optimisticMembersState[accountID] = {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD};
        failureMembersState[accountID] = {
            errors: ErrorUtils.getMicroSecondOnyxError('workspace.people.error.genericAdd'),
        };
    });

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: membersListKey,

            // Convert to object with each key containing {pendingAction: ‘add’}
            value: optimisticMembersState,
        },
        ...newPersonalDetailsOnyxData.optimisticData,
        ...membersChats.onyxOptimisticData,
        ...announceRoomMembers.onyxOptimisticData,
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: membersListKey,

            // Convert to object with each key clearing pendingAction, when it is an existing account.
            // Remove the object, when it is a newly created account.
            value: accountIDs.reduce((accountIDsWithClearedPendingAction, accountID) => {
                let value = null;
                const accountAlreadyExists = !isEmptyObject(allPersonalDetails?.[accountID]);

                if (accountAlreadyExists) {
                    value = {pendingAction: null, errors: null};
                }

                return {...accountIDsWithClearedPendingAction, [accountID]: value};
            }, {}),
        },
        ...newPersonalDetailsOnyxData.finallyData,
        ...membersChats.onyxSuccessData,
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: membersListKey,

            // Convert to object with each key containing the error. We don’t
            // need to remove the members since that is handled by onClose of OfflineWithFeedback.
            value: failureMembersState,
        },
        ...newPersonalDetailsOnyxData.finallyData,
        ...membersChats.onyxFailureData,
        ...announceRoomMembers.onyxFailureData,
    ];

    const params: AddMembersToWorkspaceParams = {
        employees: JSON.stringify(logins.map((login) => ({email: login}))),
        welcomeNote: new ExpensiMark().replace(welcomeNote),
        policyID,
    };
    if (!isEmptyObject(membersChats.reportCreationData)) {
        params.reportCreationData = JSON.stringify(membersChats.reportCreationData);
    }
    API.write(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE, params, {optimisticData, successData, failureData});
}

/**
 * Updates a workspace avatar image
 */
function updateWorkspaceAvatar(policyID: string, file: File) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                avatar: file.uri,
                originalFileName: file.name,
                errorFields: {
                    avatar: null,
                },
                pendingFields: {
                    avatar: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];
    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {
                    avatar: null,
                },
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                avatar: allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]?.avatar,
            },
        },
    ];

    const params: UpdateWorkspaceAvatarParams = {
        policyID,
        file,
    };

    API.write(WRITE_COMMANDS.UPDATE_WORKSPACE_AVATAR, params, {optimisticData, finallyData, failureData});
}

/**
 * Deletes the avatar image for the workspace
 */
function deleteWorkspaceAvatar(policyID: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {
                    avatar: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errorFields: {
                    avatar: null,
                },
                avatar: '',
            },
        },
    ];
    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {
                    avatar: null,
                },
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                errorFields: {
                    avatar: ErrorUtils.getMicroSecondOnyxError('avatarWithImagePicker.deleteWorkspaceError'),
                },
            },
        },
    ];

    const params: DeleteWorkspaceAvatarParams = {policyID};

    API.write(WRITE_COMMANDS.DELETE_WORKSPACE_AVATAR, params, {optimisticData, finallyData, failureData});
}

/**
 * Clear error and pending fields for the workspace avatar
 */
function clearAvatarErrors(policyID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        errorFields: {
            avatar: null,
        },
        pendingFields: {
            avatar: null,
        },
    });
}

/**
 * Optimistically update the general settings. Set the general settings as pending until the response succeeds.
 * If the response fails set a general error message. Clear the error message when updating.
 */
function updateGeneralSettings(policyID: string, name: string, currency: string) {
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];

    if (!policy) {
        return;
    }

    const distanceUnit = Object.values(policy?.customUnits ?? {}).find((unit) => unit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
    const distanceRate = Object.values(distanceUnit?.rates ?? {}).find((rate) => rate.name === CONST.CUSTOM_UNITS.DEFAULT_RATE);

    const optimisticData: OnyxUpdate[] = [
        {
            // We use SET because it's faster than merge and avoids a race condition when setting the currency and navigating the user to the Bank account page in confirmCurrencyChangeAndHideModal
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                ...policy,

                pendingFields: {
                    generalSettings: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },

                // Clear errorFields in case the user didn't dismiss the general settings error
                errorFields: {
                    generalSettings: null,
                },
                name,
                outputCurrency: currency,
                ...(distanceUnit?.customUnitID && distanceRate?.customUnitRateID
                    ? {
                          customUnits: {
                              [distanceUnit?.customUnitID]: {
                                  ...distanceUnit,
                                  rates: {
                                      [distanceRate?.customUnitRateID]: {
                                          ...distanceRate,
                                          currency,
                                      },
                                  },
                              },
                          },
                      }
                    : {}),
            },
        },
    ];
    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {
                    generalSettings: null,
                },
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                errorFields: {
                    generalSettings: ErrorUtils.getMicroSecondOnyxError('workspace.editor.genericFailureMessage'),
                },
                ...(distanceUnit?.customUnitID
                    ? {
                          customUnits: {
                              [distanceUnit.customUnitID]: distanceUnit,
                          },
                      }
                    : {}),
            },
        },
    ];

    const params: UpdateWorkspaceGeneralSettingsParams = {
        policyID,
        workspaceName: name,
        currency,
    };

    API.write(WRITE_COMMANDS.UPDATE_WORKSPACE_GENERAL_SETTINGS, params, {
        optimisticData,
        finallyData,
        failureData,
    });
}

function updateWorkspaceDescription(policyID: string, description: string, currentDescription: string) {
    if (description === currentDescription) {
        return;
    }
    const parsedDescription = ReportUtils.getParsedComment(description);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                description: parsedDescription,
                pendingFields: {
                    description: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errorFields: {
                    description: null,
                },
            },
        },
    ];
    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {
                    description: null,
                },
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                errorFields: {
                    description: ErrorUtils.getMicroSecondOnyxError('workspace.editor.genericFailureMessage'),
                },
            },
        },
    ];

    const params: UpdateWorkspaceDescriptionParams = {
        policyID,
        description: parsedDescription,
    };

    API.write(WRITE_COMMANDS.UPDATE_WORKSPACE_DESCRIPTION, params, {
        optimisticData,
        finallyData,
        failureData,
    });
}

function clearWorkspaceGeneralSettingsErrors(policyID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        errorFields: {
            generalSettings: null,
        },
    });
}

function setWorkspaceErrors(policyID: string, errors: Errors) {
    if (!allPolicies?.[policyID]) {
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {errors: null});
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {errors});
}

function clearCustomUnitErrors(policyID: string, customUnitID: string, customUnitRateID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        customUnits: {
            [customUnitID]: {
                errors: null,
                pendingAction: null,
                rates: {
                    [customUnitRateID]: {
                        errors: null,
                        pendingAction: null,
                    },
                },
            },
        },
    });
}

function hideWorkspaceAlertMessage(policyID: string) {
    if (!allPolicies?.[policyID]) {
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {alertMessage: ''});
}

function updateWorkspaceCustomUnitAndRate(policyID: string, currentCustomUnit: CustomUnit, newCustomUnit: NewCustomUnit, lastModified?: string) {
    if (!currentCustomUnit.customUnitID || !newCustomUnit?.customUnitID || !newCustomUnit.rates?.customUnitRateID) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [newCustomUnit.customUnitID]: {
                        ...newCustomUnit,
                        rates: {
                            [newCustomUnit.rates.customUnitRateID]: {
                                ...newCustomUnit.rates,
                                errors: null,
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                        },
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [newCustomUnit.customUnitID]: {
                        pendingAction: null,
                        errors: null,
                        rates: {
                            [newCustomUnit.rates.customUnitRateID]: {
                                pendingAction: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [currentCustomUnit.customUnitID]: {
                        customUnitID: currentCustomUnit.customUnitID,
                        rates: {
                            [newCustomUnit.rates.customUnitRateID]: {
                                ...currentCustomUnit.rates,
                                errors: ErrorUtils.getMicroSecondOnyxError('workspace.reimburse.updateCustomUnitError'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const newCustomUnitParam = lodashClone(newCustomUnit);
    const {pendingAction, errors, ...newRates} = newCustomUnitParam.rates ?? {};
    newCustomUnitParam.rates = newRates;

    const params: UpdateWorkspaceCustomUnitAndRateParams = {
        policyID,
        lastModified,
        customUnit: JSON.stringify(newCustomUnitParam),
        customUnitRate: JSON.stringify(newCustomUnitParam.rates),
    };

    API.write(WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT_AND_RATE, params, {optimisticData, successData, failureData});
}

/**
 * Removes an error after trying to delete a member
 */
function clearDeleteMemberError(policyID: string, accountID: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`, {
        [accountID]: {
            pendingAction: null,
            errors: null,
        },
    });
}

/**
 * Removes an error after trying to add a member
 */
function clearAddMemberError(policyID: string, accountID: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`, {
        [accountID]: null,
    });
    Onyx.merge(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`, {
        [accountID]: null,
    });
}

/**
 * Removes an error after trying to delete a workspace
 */
function clearDeleteWorkspaceError(policyID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        pendingAction: null,
        errors: null,
    });
}

/**
 * Removes the workspace after failure to create.
 */
function removeWorkspace(policyID: string) {
    Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, null);
}

/**
 * Generate a policy name based on an email and policy list.
 * @param [email] the email to base the workspace name on. If not passed, will use the logged-in user's email instead
 */
function generateDefaultWorkspaceName(email = ''): string {
    const emailParts = email ? email.split('@') : sessionEmail.split('@');
    let defaultWorkspaceName = '';
    if (!emailParts || emailParts.length !== 2) {
        return defaultWorkspaceName;
    }
    const username = emailParts[0];
    const domain = emailParts[1];

    if (PUBLIC_DOMAINS.some((publicDomain) => publicDomain === domain.toLowerCase())) {
        defaultWorkspaceName = `${Str.UCFirst(username)}'s Workspace`;
    } else {
        defaultWorkspaceName = `${Str.UCFirst(domain.split('.')[0])}'s Workspace`;
    }

    if (`@${domain.toLowerCase()}` === CONST.SMS.DOMAIN) {
        defaultWorkspaceName = 'My Group Workspace';
    }

    if (isEmptyObject(allPolicies)) {
        return defaultWorkspaceName;
    }

    // find default named workspaces and increment the last number
    const numberRegEx = new RegExp(`${escapeRegExp(defaultWorkspaceName)} ?(\\d*)`, 'i');
    const parsedWorkspaceNumbers = Object.values(allPolicies ?? {})
        .filter((policy) => policy?.name && numberRegEx.test(policy.name))
        .map((policy) => Number(numberRegEx.exec(policy?.name ?? '')?.[1] ?? '1')); // parse the number at the end
    const lastWorkspaceNumber = Math.max(...parsedWorkspaceNumbers);
    return lastWorkspaceNumber !== -Infinity ? `${defaultWorkspaceName} ${lastWorkspaceNumber + 1}` : defaultWorkspaceName;
}

/**
 * Returns a client generated 16 character hexadecimal value for the policyID
 */
function generatePolicyID(): string {
    return NumberUtils.generateHexadecimalValue(16);
}

/**
 * Returns a client generated 13 character hexadecimal value for a custom unit ID
 */
function generateCustomUnitID(): string {
    return NumberUtils.generateHexadecimalValue(13);
}

function buildOptimisticCustomUnits(): OptimisticCustomUnits {
    const currency = allPersonalDetails?.[sessionAccountID]?.localCurrencyCode ?? CONST.CURRENCY.USD;
    const customUnitID = generateCustomUnitID();
    const customUnitRateID = generateCustomUnitID();

    const customUnits: Record<string, CustomUnit> = {
        [customUnitID]: {
            customUnitID,
            name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
            attributes: {
                unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
            },
            rates: {
                [customUnitRateID]: {
                    customUnitRateID,
                    name: CONST.CUSTOM_UNITS.DEFAULT_RATE,
                    rate: CONST.CUSTOM_UNITS.MILEAGE_IRS_RATE * CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET,
                    currency,
                },
            },
        },
    };

    return {
        customUnits,
        customUnitID,
        customUnitRateID,
        outputCurrency: currency,
    };
}

/**
 * Optimistically creates a Policy Draft for a new workspace
 *
 * @param [policyOwnerEmail] the email of the account to make the owner of the policy
 * @param [policyName] custom policy name we will use for created workspace
 * @param [policyID] custom policy id we will use for created workspace
 * @param [makeMeAdmin] leave the calling account as an admin on the policy
 */
function createDraftInitialWorkspace(policyOwnerEmail = '', policyName = '', policyID = generatePolicyID(), makeMeAdmin = false) {
    const workspaceName = policyName || generateDefaultWorkspaceName(policyOwnerEmail);
    const {customUnits, outputCurrency} = buildOptimisticCustomUnits();

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`,
            value: {
                id: policyID,
                type: CONST.POLICY.TYPE.FREE,
                name: workspaceName,
                role: CONST.POLICY.ROLE.ADMIN,
                owner: sessionEmail,
                ownerAccountID: sessionAccountID,
                isPolicyExpenseChatEnabled: true,
                outputCurrency,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                customUnits,
                makeMeAdmin,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_MEMBERS_DRAFTS}${policyID}`,
            value: {
                [sessionAccountID]: {
                    role: CONST.POLICY.ROLE.ADMIN,
                    errors: {},
                },
            },
        },
    ];

    Onyx.update(optimisticData);
}

/**
 * Optimistically creates a new workspace and default workspace chats
 *
 * @param [policyOwnerEmail] the email of the account to make the owner of the policy
 * @param [makeMeAdmin] leave the calling account as an admin on the policy
 * @param [policyName] custom policy name we will use for created workspace
 * @param [policyID] custom policy id we will use for created workspace
 */
function createWorkspace(policyOwnerEmail = '', makeMeAdmin = false, policyName = '', policyID = generatePolicyID()): string {
    const workspaceName = policyName || generateDefaultWorkspaceName(policyOwnerEmail);

    const {customUnits, customUnitID, customUnitRateID, outputCurrency} = buildOptimisticCustomUnits();

    const {
        announceChatReportID,
        announceChatData,
        announceReportActionData,
        announceCreatedReportActionID,
        adminsChatReportID,
        adminsChatData,
        adminsReportActionData,
        adminsCreatedReportActionID,
        expenseChatReportID,
        expenseChatData,
        expenseReportActionData,
        expenseCreatedReportActionID,
    } = ReportUtils.buildOptimisticWorkspaceChats(policyID, workspaceName);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                id: policyID,
                type: CONST.POLICY.TYPE.FREE,
                name: workspaceName,
                role: CONST.POLICY.ROLE.ADMIN,
                owner: sessionEmail,
                ownerAccountID: sessionAccountID,
                isPolicyExpenseChatEnabled: true,
                outputCurrency,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                customUnits,
                areCategoriesEnabled: true,
                areTagsEnabled: false,
                areDistanceRatesEnabled: false,
                areWorkflowsEnabled: false,
                areReportFieldsEnabled: false,
                areConnectionsEnabled: false,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`,
            value: {
                [sessionAccountID]: {
                    role: CONST.POLICY.ROLE.ADMIN,
                    errors: {},
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${announceChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                ...announceChatData,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${announceChatReportID}`,
            value: announceReportActionData,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${adminsChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                ...adminsChatData,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminsChatReportID}`,
            value: adminsReportActionData,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                ...expenseChatData,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseChatReportID}`,
            value: expenseReportActionData,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_MEMBERS_DRAFTS}${policyID}`,
            value: null,
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {pendingAction: null},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${announceChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
                pendingAction: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${announceChatReportID}`,
            value: {
                [announceCreatedReportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${adminsChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
                pendingAction: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminsChatReportID}`,
            value: {
                [adminsCreatedReportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
                pendingAction: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseChatReportID}`,
            value: {
                [expenseCreatedReportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${announceChatReportID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${announceChatReportID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${adminsChatReportID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminsChatReportID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseChatReportID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseChatReportID}`,
            value: null,
        },
    ];

    const params: CreateWorkspaceParams = {
        policyID,
        announceChatReportID,
        adminsChatReportID,
        expenseChatReportID,
        ownerEmail: policyOwnerEmail,
        makeMeAdmin,
        policyName: workspaceName,
        type: CONST.POLICY.TYPE.FREE,
        announceCreatedReportActionID,
        adminsCreatedReportActionID,
        expenseCreatedReportActionID,
        customUnitID,
        customUnitRateID,
    };

    API.write(WRITE_COMMANDS.CREATE_WORKSPACE, params, {optimisticData, successData, failureData});

    return adminsChatReportID;
}

function openWorkspaceReimburseView(policyID: string) {
    if (!policyID) {
        Log.warn('openWorkspaceReimburseView invalid params', {policyID});
        return;
    }

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
            value: {
                isLoading: false,
            },
        },
    ];

    const params: OpenWorkspaceReimburseViewParams = {policyID};

    API.read(READ_COMMANDS.OPEN_WORKSPACE_REIMBURSE_VIEW, params, {successData, failureData});
}

function setPolicyIDForReimburseView(policyID: string) {
    Onyx.merge(ONYXKEYS.WORKSPACE_RATE_AND_UNIT, {policyID, rate: null, unit: null});
}

function clearOnyxDataForReimburseView() {
    Onyx.merge(ONYXKEYS.WORKSPACE_RATE_AND_UNIT, null);
}

function setRateForReimburseView(rate: string) {
    Onyx.merge(ONYXKEYS.WORKSPACE_RATE_AND_UNIT, {rate});
}

function setUnitForReimburseView(unit: Unit) {
    Onyx.merge(ONYXKEYS.WORKSPACE_RATE_AND_UNIT, {unit});
}

/**
 * Returns the accountIDs of the members of the policy whose data is passed in the parameters
 */
function openWorkspace(policyID: string, clientMemberAccountIDs: number[]) {
    if (!policyID || !clientMemberAccountIDs) {
        Log.warn('openWorkspace invalid params', {policyID, clientMemberAccountIDs});
        return;
    }

    const params: OpenWorkspaceParams = {
        policyID,
        clientMemberAccountIDs: JSON.stringify(clientMemberAccountIDs),
    };

    API.read(READ_COMMANDS.OPEN_WORKSPACE, params);
}

function openWorkspaceMembersPage(policyID: string, clientMemberEmails: string[]) {
    if (!policyID || !clientMemberEmails) {
        Log.warn('openWorkspaceMembersPage invalid params', {policyID, clientMemberEmails});
        return;
    }

    const params: OpenWorkspaceMembersPageParams = {
        policyID,
        clientMemberEmails: JSON.stringify(clientMemberEmails),
    };

    API.read(READ_COMMANDS.OPEN_WORKSPACE_MEMBERS_PAGE, params);
}

function openWorkspaceInvitePage(policyID: string, clientMemberEmails: string[]) {
    if (!policyID || !clientMemberEmails) {
        Log.warn('openWorkspaceInvitePage invalid params', {policyID, clientMemberEmails});
        return;
    }

    const params: OpenWorkspaceInvitePageParams = {
        policyID,
        clientMemberEmails: JSON.stringify(clientMemberEmails),
    };

    API.read(READ_COMMANDS.OPEN_WORKSPACE_INVITE_PAGE, params);
}

function openDraftWorkspaceRequest(policyID: string) {
    const params: OpenDraftWorkspaceRequestParams = {policyID};

    API.read(READ_COMMANDS.OPEN_DRAFT_WORKSPACE_REQUEST, params);
}

function setWorkspaceInviteMembersDraft(policyID: string, invitedEmailsToAccountIDs: InvitedEmailsToAccountIDs) {
    Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policyID}`, invitedEmailsToAccountIDs);
}

function setWorkspaceInviteMessageDraft(policyID: string, message: string) {
    Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MESSAGE_DRAFT}${policyID}`, message);
}

function clearErrors(policyID: string) {
    setWorkspaceErrors(policyID, {});
    hideWorkspaceAlertMessage(policyID);
}

/**
 * Dismiss the informative messages about which policy members were added with primary logins when invited with their secondary login.
 */
function dismissAddedWithPrimaryLoginMessages(policyID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {primaryLoginsInvited: null});
}

function buildOptimisticPolicyRecentlyUsedCategories(policyID?: string, category?: string) {
    if (!policyID || !category) {
        return [];
    }

    const policyRecentlyUsedCategories = allRecentlyUsedCategories?.[`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${policyID}`] ?? [];

    return lodashUnion([category], policyRecentlyUsedCategories);
}

function buildOptimisticPolicyRecentlyUsedTags(policyID?: string, transactionTags?: string): RecentlyUsedTags {
    if (!policyID || !transactionTags) {
        return {};
    }

    const policyTags = allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {};
    const policyTagKeys = Object.keys(policyTags);
    const policyRecentlyUsedTags = allRecentlyUsedTags?.[`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`] ?? {};
    const newOptimisticPolicyRecentlyUsedTags: RecentlyUsedTags = {};

    TransactionUtils.getTagArrayFromName(transactionTags).forEach((tag, index) => {
        if (!tag) {
            return;
        }

        const tagListKey = policyTagKeys[index];
        newOptimisticPolicyRecentlyUsedTags[tagListKey] = [...new Set([...tag, ...(policyRecentlyUsedTags[tagListKey] ?? [])])];
    });

    return newOptimisticPolicyRecentlyUsedTags;
}

/**
 * This flow is used for bottom up flow converting IOU report to an expense report. When user takes this action,
 * we create a Collect type workspace when the person taking the action becomes an owner and an admin, while we
 * add a new member to the workspace as an employee and convert the IOU report passed as a param into an expense report.
 *
 * @returns policyID of the workspace we have created
 */
function createWorkspaceFromIOUPayment(iouReport: Report | EmptyObject): string | undefined {
    // This flow only works for IOU reports
    if (!ReportUtils.isIOUReportUsingReport(iouReport)) {
        return;
    }

    // Generate new variables for the policy
    const policyID = generatePolicyID();
    const workspaceName = generateDefaultWorkspaceName(sessionEmail);
    const employeeAccountID = iouReport.ownerAccountID;
    const employeeEmail = iouReport.ownerEmail ?? '';
    const {customUnits, customUnitID, customUnitRateID} = buildOptimisticCustomUnits();
    const oldPersonalPolicyID = iouReport.policyID;
    const iouReportID = iouReport.reportID;

    const {
        announceChatReportID,
        announceChatData,
        announceReportActionData,
        announceCreatedReportActionID,
        adminsChatReportID,
        adminsChatData,
        adminsReportActionData,
        adminsCreatedReportActionID,
        expenseChatReportID: workspaceChatReportID,
        expenseChatData: workspaceChatData,
        expenseReportActionData: workspaceChatReportActionData,
        expenseCreatedReportActionID: workspaceChatCreatedReportActionID,
    } = ReportUtils.buildOptimisticWorkspaceChats(policyID, workspaceName);

    if (!employeeAccountID) {
        return;
    }

    // Create the workspace chat for the employee whose IOU is being paid
    const employeeWorkspaceChat = createPolicyExpenseChats(policyID, {[employeeEmail]: employeeAccountID}, true);
    const newWorkspace = {
        id: policyID,

        // We are creating a collect policy in this case
        type: CONST.POLICY.TYPE.TEAM,
        name: workspaceName,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: sessionEmail,
        ownerAccountID: sessionAccountID,
        isPolicyExpenseChatEnabled: true,

        // Setting the currency to USD as we can only add the VBBA for this policy currency right now
        outputCurrency: CONST.CURRENCY.USD,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        customUnits,
        areCategoriesEnabled: true,
        areTagsEnabled: false,
        areDistanceRatesEnabled: false,
        areWorkflowsEnabled: false,
        areReportFieldsEnabled: false,
        areConnectionsEnabled: false,
    };

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: newWorkspace,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`,
            value: {
                [sessionAccountID]: {
                    role: CONST.POLICY.ROLE.ADMIN,
                    errors: {},
                },
                [employeeAccountID]: {
                    role: CONST.POLICY.ROLE.USER,
                    errors: {},
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${announceChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                ...announceChatData,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${announceChatReportID}`,
            value: announceReportActionData,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${adminsChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                ...adminsChatData,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminsChatReportID}`,
            value: adminsReportActionData,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${workspaceChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                ...workspaceChatData,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${workspaceChatReportID}`,
            value: workspaceChatReportActionData,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
                pendingAction: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_MEMBERS_DRAFTS}${policyID}`,
            value: {
                pendingAction: null,
            },
        },
        ...employeeWorkspaceChat.onyxOptimisticData,
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {pendingAction: null},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${announceChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
                pendingAction: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${announceChatReportID}`,
            value: {
                [Object.keys(announceChatData)[0]]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${adminsChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
                pendingAction: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminsChatReportID}`,
            value: {
                [Object.keys(adminsChatData)[0]]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${workspaceChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
                pendingAction: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${workspaceChatReportID}`,
            value: {
                [Object.keys(workspaceChatData)[0]]: {
                    pendingAction: null,
                },
            },
        },
        ...employeeWorkspaceChat.onyxSuccessData,
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`,
            value: {
                pendingAction: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${announceChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
                pendingAction: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${announceChatReportID}`,
            value: {
                pendingAction: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${adminsChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
                pendingAction: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminsChatReportID}`,
            value: {
                pendingAction: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${workspaceChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
                pendingAction: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${workspaceChatReportID}`,
            value: {
                pendingAction: null,
            },
        },
    ];

    // Compose the memberData object which is used to add the employee to the workspace and
    // optimistically create the workspace chat for them.
    const memberData = {
        accountID: Number(employeeAccountID),
        email: employeeEmail,
        workspaceChatReportID: employeeWorkspaceChat.reportCreationData[employeeEmail].reportID,
        workspaceChatCreatedReportActionID: employeeWorkspaceChat.reportCreationData[employeeEmail].reportActionID,
    };

    const oldChatReportID = iouReport.chatReportID;

    // Next we need to convert the IOU report to Expense report.
    // We need to change:
    // - report type
    // - change the sign of the report total
    // - update its policyID and policyName
    // - update the chatReportID to point to the new workspace chat
    const expenseReport = {
        ...iouReport,
        chatReportID: memberData.workspaceChatReportID,
        policyID,
        policyName: workspaceName,
        type: CONST.REPORT.TYPE.EXPENSE,
        total: -(iouReport?.total ?? 0),
    };
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`,
        value: expenseReport,
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`,
        value: iouReport,
    });

    // The expense report transactions need to have the amount reversed to negative values
    const reportTransactions = TransactionUtils.getAllReportTransactions(iouReportID);

    // For performance reasons, we are going to compose a merge collection data for transactions
    const transactionsOptimisticData: Record<string, Transaction> = {};
    const transactionFailureData: Record<string, Transaction> = {};
    reportTransactions.forEach((transaction) => {
        transactionsOptimisticData[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = {
            ...transaction,
            amount: -transaction.amount,
            modifiedAmount: transaction.modifiedAmount ? -transaction.modifiedAmount : 0,
        };

        transactionFailureData[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = transaction;
    });

    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}`,
        value: transactionsOptimisticData,
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}`,
        value: transactionFailureData,
    });

    // We need to move the report preview action from the DM to the workspace chat.
    const reportPreview = ReportActionsUtils.getParentReportAction(iouReport);
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldChatReportID}`,
        value: {[reportPreview.reportActionID]: null},
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldChatReportID}`,
        value: {[reportPreview.reportActionID]: reportPreview},
    });

    // To optimistically remove the GBR from the DM we need to update the hasOutstandingChildRequest param to false
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${oldChatReportID}`,
        value: {
            hasOutstandingChildRequest: false,
        },
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${oldChatReportID}`,
        value: {
            hasOutstandingChildRequest: true,
        },
    });

    if (reportPreview?.reportActionID) {
        // Update the created timestamp of the report preview action to be after the workspace chat created timestamp.
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${memberData.workspaceChatReportID}`,
            value: {
                [reportPreview.reportActionID]: {
                    ...reportPreview,
                    message: [
                        {
                            type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                            text: ReportUtils.getReportPreviewMessage(expenseReport, {}, false, false, newWorkspace),
                        },
                    ],
                    created: DateUtils.getDBTime(),
                },
            },
        });
    }

    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${memberData.workspaceChatReportID}`,
        value: {[reportPreview.reportActionID]: null},
    });

    // Create the MOVED report action and add it to the DM chat which indicates to the user where the report has been moved
    const movedReportAction = ReportUtils.buildOptimisticMovedReportAction(oldPersonalPolicyID ?? '', policyID, memberData.workspaceChatReportID, iouReportID, workspaceName);
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldChatReportID}`,
        value: {[movedReportAction.reportActionID]: movedReportAction},
    });
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldChatReportID}`,
        value: {
            [movedReportAction.reportActionID]: {
                ...movedReportAction,
                pendingAction: null,
            },
        },
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldChatReportID}`,
        value: {[movedReportAction.reportActionID]: null},
    });

    const params: CreateWorkspaceFromIOUPaymentParams = {
        policyID,
        announceChatReportID,
        adminsChatReportID,
        expenseChatReportID: workspaceChatReportID,
        ownerEmail: '',
        makeMeAdmin: false,
        policyName: workspaceName,
        type: CONST.POLICY.TYPE.TEAM,
        announceCreatedReportActionID,
        adminsCreatedReportActionID,
        expenseCreatedReportActionID: workspaceChatCreatedReportActionID,
        customUnitID,
        customUnitRateID,
        iouReportID,
        memberData: JSON.stringify(memberData),
        reportActionID: movedReportAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.CREATE_WORKSPACE_FROM_IOU_PAYMENT, params, {optimisticData, successData, failureData});

    return policyID;
}

function setWorkspaceCategoryEnabled(policyID: string, categoriesToUpdate: Record<string, {name: string; enabled: boolean}>) {
    const policyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`] ?? {};

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    ...Object.keys(categoriesToUpdate).reduce<PolicyCategories>((acc, key) => {
                        acc[key] = {
                            ...policyCategories[key],
                            ...categoriesToUpdate[key],
                            errors: null,
                            pendingFields: {
                                enabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                        };

                        return acc;
                    }, {}),
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    ...Object.keys(categoriesToUpdate).reduce<PolicyCategories>((acc, key) => {
                        acc[key] = {
                            ...policyCategories[key],
                            ...categoriesToUpdate[key],
                            errors: null,
                            pendingFields: {
                                enabled: null,
                            },
                        };

                        return acc;
                    }, {}),
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    ...Object.keys(categoriesToUpdate).reduce<PolicyCategories>((acc, key) => {
                        acc[key] = {
                            ...policyCategories[key],
                            ...categoriesToUpdate[key],
                            errors: ErrorUtils.getMicroSecondOnyxError('workspace.categories.genericFailureMessage'),
                            pendingFields: {
                                enabled: null,
                            },
                        };

                        return acc;
                    }, {}),
                },
            },
        ],
    };

    const parameters = {
        policyID,
        categories: JSON.stringify(Object.keys(categoriesToUpdate).map((key) => categoriesToUpdate[key])),
    };

    API.write('SetWorkspaceCategoriesEnabled', parameters, onyxData);
}

function setWorkspaceRequiresCategory(policyID: string, requiresCategory: boolean) {
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    requiresCategory,
                    errors: {
                        requiresCategory: null,
                    },
                    pendingFields: {
                        requiresCategory: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    errors: {
                        requiresCategory: null,
                    },
                    pendingFields: {
                        requiresCategory: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    requiresCategory: !requiresCategory,
                    errors: ErrorUtils.getMicroSecondOnyxError('workspace.categories.genericFailureMessage'),
                    pendingFields: {
                        requiresCategory: null,
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        requiresCategory,
    };

    API.write('SetWorkspaceRequiresCategory', parameters, onyxData);
}

function clearCategoryErrors(policyID: string, categoryName: string) {
    const category = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`]?.[categoryName];

    if (!category) {
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {
        [category.name]: {
            errors: null,
        },
    });
}

export {
    removeMembers,
    updateWorkspaceMembersRole,
    addMembersToWorkspace,
    isAdminOfFreePolicy,
    hasActiveFreePolicy,
    setWorkspaceErrors,
    clearCustomUnitErrors,
    hideWorkspaceAlertMessage,
    deleteWorkspace,
    updateWorkspaceCustomUnitAndRate,
    updateLastAccessedWorkspace,
    clearDeleteMemberError,
    clearAddMemberError,
    clearDeleteWorkspaceError,
    openWorkspaceReimburseView,
    setPolicyIDForReimburseView,
    clearOnyxDataForReimburseView,
    setRateForReimburseView,
    setUnitForReimburseView,
    generateDefaultWorkspaceName,
    updateGeneralSettings,
    clearWorkspaceGeneralSettingsErrors,
    deleteWorkspaceAvatar,
    updateWorkspaceAvatar,
    clearAvatarErrors,
    generatePolicyID,
    createWorkspace,
    openWorkspaceMembersPage,
    openWorkspaceInvitePage,
    openWorkspace,
    removeWorkspace,
    createWorkspaceFromIOUPayment,
    setWorkspaceInviteMembersDraft,
    clearErrors,
    dismissAddedWithPrimaryLoginMessages,
    openDraftWorkspaceRequest,
    buildOptimisticPolicyRecentlyUsedCategories,
    buildOptimisticPolicyRecentlyUsedTags,
    createDraftInitialWorkspace,
    setWorkspaceInviteMessageDraft,
    setWorkspaceAutoReporting,
    setWorkspaceApprovalMode,
    setWorkspaceAutoReportingFrequency,
    setWorkspaceAutoReportingMonthlyOffset,
    updateWorkspaceDescription,
    setWorkspaceCategoryEnabled,
    setWorkspaceRequiresCategory,
    clearCategoryErrors,
};
