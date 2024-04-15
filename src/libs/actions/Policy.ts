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
    AddBillingCardAndRequestWorkspaceOwnerChangeParams,
    AddMembersToWorkspaceParams,
    CreatePolicyDistanceRateParams,
    CreateWorkspaceFromIOUPaymentParams,
    CreateWorkspaceParams,
    DeleteMembersFromWorkspaceParams,
    DeletePolicyDistanceRatesParams,
    DeleteWorkspaceAvatarParams,
    DeleteWorkspaceParams,
    EnablePolicyCategoriesParams,
    EnablePolicyConnectionsParams,
    EnablePolicyDistanceRatesParams,
    EnablePolicyReportFieldsParams,
    EnablePolicyTagsParams,
    EnablePolicyTaxesParams,
    EnablePolicyWorkflowsParams,
    LeavePolicyParams,
    OpenDraftWorkspaceRequestParams,
    OpenPolicyCategoriesPageParams,
    OpenPolicyDistanceRatesPageParams,
    OpenPolicyMoreFeaturesPageParams,
    OpenPolicyTagsPageParams,
    OpenPolicyTaxesPageParams,
    OpenPolicyWorkflowsPageParams,
    OpenWorkspaceInvitePageParams,
    OpenWorkspaceMembersPageParams,
    OpenWorkspaceParams,
    OpenWorkspaceReimburseViewParams,
    RequestWorkspaceOwnerChangeParams,
    SetPolicyDistanceRatesDefaultCategoryParams,
    SetPolicyDistanceRatesEnabledParams,
    SetPolicyDistanceRatesUnitParams,
    SetWorkspaceApprovalModeParams,
    SetWorkspaceAutoReportingFrequencyParams,
    SetWorkspaceAutoReportingMonthlyOffsetParams,
    SetWorkspaceAutoReportingParams,
    SetWorkspacePayerParams,
    SetWorkspaceReimbursementParams,
    UpdatePolicyDistanceRateValueParams,
    UpdateWorkspaceAvatarParams,
    UpdateWorkspaceCustomUnitAndRateParams,
    UpdateWorkspaceDescriptionParams,
    UpdateWorkspaceGeneralSettingsParams,
    UpdateWorkspaceMembersRoleParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import * as NumberUtils from '@libs/NumberUtils';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PhoneNumber from '@libs/PhoneNumber';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import type {PolicySelector} from '@pages/home/sidebar/SidebarScreen/FloatingActionButtonAndPopover';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {
    InvitedEmailsToAccountIDs,
    PersonalDetailsList,
    Policy,
    PolicyCategories,
    PolicyCategory,
    PolicyEmployee,
    PolicyOwnershipChangeChecks,
    PolicyTag,
    PolicyTagList,
    PolicyTags,
    RecentlyUsedCategories,
    RecentlyUsedTags,
    ReimbursementAccount,
    Report,
    ReportAction,
    TaxRatesWithDefault,
    Transaction,
} from '@src/types/onyx';
import type {ErrorFields, Errors, OnyxValueWithOfflineFeedback, PendingAction} from '@src/types/onyx/OnyxCommon';
import type {OriginalMessageJoinPolicyChangeLog} from '@src/types/onyx/OriginalMessage';
import type {Attributes, CustomUnit, Rate, Unit} from '@src/types/onyx/Policy';
import type {OnyxData} from '@src/types/onyx/Request';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type AnnounceRoomMembersOnyxData = {
    onyxOptimisticData: OnyxUpdate[];
    onyxSuccessData: OnyxUpdate[];
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

let policyOwnershipChecks: Record<string, PolicyOwnershipChangeChecks>;
Onyx.connect({
    key: ONYXKEYS.POLICY_OWNERSHIP_CHANGE_CHECKS,
    callback: (value) => {
        policyOwnershipChecks = value ?? {};
    },
});

/**
 * Stores in Onyx the policy ID of the last workspace that was accessed by the user
 */
function updateLastAccessedWorkspace(policyID: OnyxEntry<string>) {
    Onyx.set(ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID, policyID);
}

/**
 * Checks if the currency is supported for direct reimbursement
 * USD currency is the only one supported in NewDot for now
 */
function isCurrencySupportedForDirectReimbursement(currency: string) {
    return currency === CONST.CURRENCY.USD;
}

/**
 * Returns the policy of the report
 */
function getPolicy(policyID: string | undefined): Policy | EmptyObject {
    if (!allPolicies || !policyID) {
        return {};
    }
    return allPolicies[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] ?? {};
}

/**
 * Check if the user has any active free policies (aka workspaces)
 */
function hasActiveChatEnabledPolicies(policies: Array<OnyxEntry<PolicySelector>> | OnyxCollection<PolicySelector>, includeOnlyFreePolicies = false): boolean {
    const adminChatEnabledPolicies = Object.values(policies ?? {}).filter(
        (policy) =>
            policy &&
            ((policy.type === CONST.POLICY.TYPE.FREE && policy.role === CONST.POLICY.ROLE.ADMIN) ||
                (!includeOnlyFreePolicies && policy.type !== CONST.POLICY.TYPE.PERSONAL && policy.role === CONST.POLICY.ROLE.ADMIN && policy.isPolicyExpenseChatEnabled)),
    );

    if (adminChatEnabledPolicies.length === 0) {
        return false;
    }

    if (adminChatEnabledPolicies.some((policy) => !policy?.pendingAction)) {
        return true;
    }

    if (adminChatEnabledPolicies.some((policy) => policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD)) {
        return true;
    }

    if (adminChatEnabledPolicies.some((policy) => policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)) {
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
        ...(!hasActiveChatEnabledPolicies(filteredPolicies, true)
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
    const finallyData: OnyxUpdate[] = [];
    reportsToArchive.forEach((report) => {
        const {reportID, ownerAccountID} = report ?? {};
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                oldPolicyName: allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]?.name ?? '',
                policyName: '',
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
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticClosedReportAction.reportActionID]: optimisticClosedReportAction as ReportAction,
            },
        });

        // We are temporarily adding this workaround because 'DeleteWorkspace' doesn't
        // support receiving the optimistic reportActions' ids for the moment.
        finallyData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticClosedReportAction.reportActionID]: null,
            },
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
        const {reportID, stateNum, statusNum, oldPolicyName} = report ?? {};
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                stateNum,
                statusNum,
                oldPolicyName,
                policyName: report?.policyName,
            },
        });
    });

    const params: DeleteWorkspaceParams = {policyID};

    API.write(WRITE_COMMANDS.DELETE_WORKSPACE, params, {optimisticData, finallyData, failureData});

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
        onyxSuccessData: [],
    };

    if (!announceReport) {
        return announceRoomMembers;
    }

    if (announceReport?.participantAccountIDs) {
        // Everyone in special policy rooms is visible
        const participantAccountIDs = [...announceReport.participantAccountIDs, ...accountIDs];
        const pendingChatMembers = ReportUtils.getPendingChatMembers(accountIDs, announceReport?.pendingChatMembers ?? [], CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

        announceRoomMembers.onyxOptimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${announceReport?.reportID}`,
            value: {
                participants: ReportUtils.buildParticipantsFromAccountIDs(participantAccountIDs),
                participantAccountIDs,
                visibleChatMemberAccountIDs: participantAccountIDs,
                pendingChatMembers,
            },
        });
    }

    announceRoomMembers.onyxFailureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${announceReport?.reportID}`,
        value: {
            participants: announceReport?.participants,
            participantAccountIDs: announceReport?.participantAccountIDs,
            visibleChatMemberAccountIDs: announceReport?.visibleChatMemberAccountIDs,
            pendingChatMembers: announceReport?.pendingChatMembers ?? null,
        },
    });
    announceRoomMembers.onyxSuccessData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${announceReport?.reportID}`,
        value: {
            pendingChatMembers: announceReport?.pendingChatMembers ?? null,
        },
    });
    return announceRoomMembers;
}

function setWorkspaceAutoReporting(policyID: string, enabled: boolean, frequency: ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>) {
    const policy = getPolicy(policyID);
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                autoReporting: enabled,
                harvesting: {
                    enabled,
                },
                autoReportingFrequency: frequency,
                pendingFields: {autoReporting: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                autoReporting: policy.autoReporting ?? null,
                harvesting: {
                    enabled: policy.harvesting?.enabled ?? null,
                },
                autoReportingFrequency: policy.autoReportingFrequency ?? null,
                pendingFields: {autoReporting: null},
                errorFields: {autoReporting: ErrorUtils.getMicroSecondOnyxError('workflowsDelayedSubmissionPage.autoReportingErrorMessage')},
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {autoReporting: null},
            },
        },
    ];

    const params: SetWorkspaceAutoReportingParams = {policyID, enabled};

    API.write(WRITE_COMMANDS.SET_WORKSPACE_AUTO_REPORTING, params, {optimisticData, failureData, successData});
}

function setWorkspaceAutoReportingFrequency(policyID: string, frequency: ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>) {
    const policy = getPolicy(policyID);

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
                autoReportingFrequency: policy.autoReportingFrequency ?? null,
                pendingFields: {autoReportingFrequency: null},
                errorFields: {autoReportingFrequency: ErrorUtils.getMicroSecondOnyxError('workflowsDelayedSubmissionPage.autoReportingFrequencyErrorMessage')},
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
    const policy = getPolicy(policyID);

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
                autoReportingOffset: policy.autoReportingOffset ?? null,
                pendingFields: {autoReportingOffset: null},
                errorFields: {autoReportingOffset: ErrorUtils.getMicroSecondOnyxError('workflowsDelayedSubmissionPage.monthlyOffsetErrorMessage')},
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
    const policy = getPolicy(policyID);

    const value = {
        approver,
        approvalMode,
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
                approver: policy.approver ?? null,
                approvalMode: policy.approvalMode ?? null,
                pendingFields: {approvalMode: null},
                errorFields: {approvalMode: ErrorUtils.getMicroSecondOnyxError('workflowsApprovalPage.genericErrorMessage')},
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

    const params: SetWorkspaceApprovalModeParams = {
        policyID,
        value: JSON.stringify({
            ...value,
            // This property should now be set to false for all Collect policies
            isAutoApprovalEnabled: false,
        }),
    };
    API.write(WRITE_COMMANDS.SET_WORKSPACE_APPROVAL_MODE, params, {optimisticData, failureData, successData});
}

function setWorkspacePayer(policyID: string, reimburserEmail: string) {
    const policy = getPolicy(policyID);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                achAccount: {reimburser: reimburserEmail},
                errorFields: {reimburser: null},
                pendingFields: {reimburser: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                errorFields: {reimburser: null},
                pendingFields: {reimburser: null},
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                achAccount: {reimburser: policy.achAccount?.reimburser ?? null},
                errorFields: {reimburser: ErrorUtils.getMicroSecondOnyxError('workflowsPayerPage.genericErrorMessage')},
                pendingFields: {reimburser: null},
            },
        },
    ];

    const params: SetWorkspacePayerParams = {policyID, reimburserEmail};

    API.write(WRITE_COMMANDS.SET_WORKSPACE_PAYER, params, {optimisticData, failureData, successData});
}

function clearPolicyErrorField(policyID: string, fieldName: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {errorFields: {[fieldName]: null}});
}

function setWorkspaceReimbursement(policyID: string, reimbursementChoice: ValueOf<typeof CONST.POLICY.REIMBURSEMENT_CHOICES>, reimburserEmail: string) {
    const policy = getPolicy(policyID);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                reimbursementChoice,
                achAccount: {reimburser: reimburserEmail},
                errorFields: {reimbursementChoice: null},
                pendingFields: {reimbursementChoice: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                errorFields: {reimbursementChoice: null},
                pendingFields: {reimbursementChoice: null},
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                reimbursementChoice: policy.reimbursementChoice ?? null,
                achAccount: {reimburser: policy.achAccount?.reimburser ?? null},
                errorFields: {reimbursementChoice: ErrorUtils.getMicroSecondOnyxError('common.genericErrorMessage')},
                pendingFields: {reimbursementChoice: null},
            },
        },
    ];

    const params: SetWorkspaceReimbursementParams = {policyID, reimbursementChoice};

    API.write(WRITE_COMMANDS.SET_WORKSPACE_REIMBURSEMENT, params, {optimisticData, failureData, successData});
}

function clearWorkspaceReimbursementErrors(policyID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {errorFields: {reimbursementChoice: null}});
}

/**
 * Build optimistic data for removing users from the announcement room
 */
function removeOptimisticAnnounceRoomMembers(policyID: string, policyName: string, accountIDs: number[]): AnnounceRoomMembersOnyxData {
    const announceReport = ReportUtils.getRoom(CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, policyID);
    const announceRoomMembers: AnnounceRoomMembersOnyxData = {
        onyxOptimisticData: [],
        onyxFailureData: [],
        onyxSuccessData: [],
    };

    if (!announceReport) {
        return announceRoomMembers;
    }

    if (announceReport?.participantAccountIDs) {
        const pendingChatMembers = ReportUtils.getPendingChatMembers(accountIDs, announceReport?.pendingChatMembers ?? [], CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

        announceRoomMembers.onyxOptimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${announceReport.reportID}`,
            value: {
                pendingChatMembers,
                ...(accountIDs.includes(sessionAccountID)
                    ? {
                          statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                          stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                          oldPolicyName: policyName,
                      }
                    : {}),
            },
        });
        announceRoomMembers.onyxFailureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${announceReport.reportID}`,
            value: {
                pendingChatMembers: announceReport?.pendingChatMembers ?? null,
                ...(accountIDs.includes(sessionAccountID)
                    ? {
                          statusNum: announceReport.statusNum,
                          stateNum: announceReport.stateNum,
                          oldPolicyName: announceReport.oldPolicyName,
                      }
                    : {}),
            },
        });
        announceRoomMembers.onyxSuccessData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${announceReport.reportID}`,
            value: {
                pendingChatMembers: announceReport?.pendingChatMembers ?? null,
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

    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const;
    const policy = getPolicy(policyID);

    const workspaceChats = ReportUtils.getWorkspaceChats(policyID, accountIDs);
    const emailList = accountIDs.map((accountID) => allPersonalDetails?.[accountID]?.login).filter((login) => !!login) as string[];
    const optimisticClosedReportActions = workspaceChats.map(() => ReportUtils.buildOptimisticClosedReportAction(sessionEmail, policy.name, CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY));

    const announceRoomMembers = removeOptimisticAnnounceRoomMembers(policy.id, policy.name, accountIDs);

    const optimisticMembersState: OnyxCollection<PolicyEmployee> = {};
    const successMembersState: OnyxCollection<PolicyEmployee> = {};
    const failureMembersState: OnyxCollection<PolicyEmployee> = {};
    emailList.forEach((email) => {
        optimisticMembersState[email] = {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};
        successMembersState[email] = null;
        failureMembersState[email] = {errors: ErrorUtils.getMicroSecondOnyxError('workspace.people.error.genericRemove')};
    });

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,
            value: {employeeList: optimisticMembersState},
        },
        ...announceRoomMembers.onyxOptimisticData,
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,
            value: {employeeList: successMembersState},
        },
        ...announceRoomMembers.onyxSuccessData,
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,
            value: {employeeList: failureMembersState},
        },
        ...announceRoomMembers.onyxFailureData,
    ];

    const pendingChatMembers = ReportUtils.getPendingChatMembers(accountIDs, [], CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

    workspaceChats.forEach((report) => {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report?.reportID}`,
            value: {
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                oldPolicyName: policy.name,
                pendingChatMembers,
            },
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report?.reportID}`,
            value: {
                pendingChatMembers: null,
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report?.reportID}`,
            value: {
                pendingChatMembers: null,
            },
        });
    });
    // comment out for time this issue would be resolved https://github.com/Expensify/App/issues/35952
    // optimisticClosedReportActions.forEach((reportAction, index) => {
    //     optimisticData.push({
    //         onyxMethod: Onyx.METHOD.MERGE,
    //         key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${workspaceChats?.[index]?.reportID}`,
    //         value: {[reportAction.reportActionID]: reportAction as ReportAction},
    //     });
    // });

    // If the policy has primaryLoginsInvited, then it displays informative messages on the members page about which primary logins were added by secondary logins.
    // If we delete all these logins then we should clear the informative messages since they are no longer relevant.
    if (!isEmptyObject(policy?.primaryLoginsInvited ?? {})) {
        // Take the current policy members and remove them optimistically
        const employeeListEmails = Object.keys(allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]?.employeeList ?? {});
        const remainingLogins = employeeListEmails.filter((email) => !emailList.includes(email));
        const invitedPrimaryToSecondaryLogins: Record<string, string> = {};

        if (policy.primaryLoginsInvited) {
            Object.keys(policy.primaryLoginsInvited).forEach((key) => (invitedPrimaryToSecondaryLogins[policy.primaryLoginsInvited?.[key] ?? ''] = key));
        }

        // Then, if no remaining members exist that were invited by a secondary login, clear the informative messages
        if (!remainingLogins.some((remainingLogin) => !!invitedPrimaryToSecondaryLogins[remainingLogin])) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    primaryLoginsInvited: null,
                },
            });
        }
    }

    const filteredWorkspaceChats = workspaceChats.filter((report): report is Report => report !== null);

    filteredWorkspaceChats.forEach(({reportID, stateNum, statusNum, oldPolicyName = null}) => {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                stateNum,
                statusNum,
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
        emailList: emailList.join(','),
        policyID,
    };

    API.write(WRITE_COMMANDS.DELETE_MEMBERS_FROM_WORKSPACE, params, {optimisticData, successData, failureData});
}

function leaveWorkspace(policyID: string) {
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    const workspaceChats = ReportUtils.getAllWorkspaceReports(policyID);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                employeeList: {
                    [sessionEmail]: {
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
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
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                employeeList: {
                    [sessionEmail]: null,
                },
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingAction: policy?.pendingAction,
                employeeList: {
                    [sessionEmail]: {
                        errors: ErrorUtils.getMicroSecondOnyxError('workspace.people.error.genericRemove'),
                    },
                },
            },
        },
    ];

    const pendingChatMembers = ReportUtils.getPendingChatMembers([sessionAccountID], [], CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

    workspaceChats.forEach((report) => {
        const parentReport = ReportUtils.getRootParentReport(report);
        const reportToCheckOwner = isEmptyObject(parentReport) ? report : parentReport;

        if (ReportUtils.isPolicyExpenseChat(report) && !ReportUtils.isReportOwner(reportToCheckOwner)) {
            return;
        }

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report?.reportID}`,
            value: {
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                oldPolicyName: policy?.name ?? '',
                pendingChatMembers,
            },
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report?.reportID}`,
            value: {
                pendingChatMembers: null,
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report?.reportID}`,
            value: {
                pendingChatMembers: null,
            },
        });
    });

    const params: LeavePolicyParams = {
        policyID,
        email: sessionEmail,
    };
    API.write(WRITE_COMMANDS.LEAVE_POLICY, params, {optimisticData, successData, failureData});
}

function updateWorkspaceMembersRole(policyID: string, accountIDs: number[], newRole: typeof CONST.POLICY.ROLE.ADMIN | typeof CONST.POLICY.ROLE.USER) {
    const previousEmployeeList = {...allPolicies?.[policyID]?.employeeList};
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
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                employeeList: {
                    ...memberRoles.reduce((member: Record<string, {role: string; pendingAction: PendingAction}>, current) => {
                        // eslint-disable-next-line no-param-reassign
                        member[current.email] = {role: current?.role, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE};
                        return member;
                    }, {}),
                },
                errors: null,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                employeeList: {
                    ...memberRoles.reduce((member: Record<string, {role: string; pendingAction: PendingAction}>, current) => {
                        // eslint-disable-next-line no-param-reassign
                        member[current.email] = {role: current?.role, pendingAction: null};
                        return member;
                    }, {}),
                },
                errors: null,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                employeeList: previousEmployeeList,
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

function requestWorkspaceOwnerChange(policyID: string) {
    const policy = getPolicy(policyID);
    const ownershipChecks = {...policyOwnershipChecks?.[policyID]} ?? {};

    const changeOwnerErrors = Object.keys(policy?.errorFields?.changeOwner ?? {});

    if (changeOwnerErrors && changeOwnerErrors.length > 0) {
        const currentError = changeOwnerErrors[0];
        if (currentError === CONST.POLICY.OWNERSHIP_ERRORS.AMOUNT_OWED) {
            ownershipChecks.shouldClearOutstandingBalance = true;
        }

        if (currentError === CONST.POLICY.OWNERSHIP_ERRORS.OWNER_OWES_AMOUNT) {
            ownershipChecks.shouldTransferAmountOwed = true;
        }

        if (currentError === CONST.POLICY.OWNERSHIP_ERRORS.SUBSCRIPTION) {
            ownershipChecks.shouldTransferSubscription = true;
        }

        if (currentError === CONST.POLICY.OWNERSHIP_ERRORS.DUPLICATE_SUBSCRIPTION) {
            ownershipChecks.shouldTransferSingleSubscription = true;
        }

        Onyx.merge(ONYXKEYS.POLICY_OWNERSHIP_CHANGE_CHECKS, {
            [policyID]: ownershipChecks,
        });
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                errorFields: null,
                isLoading: true,
                isChangeOwnerSuccessful: false,
                isChangeOwnerFailed: false,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                isLoading: false,
                isChangeOwnerSuccessful: true,
                isChangeOwnerFailed: false,
                owner: sessionEmail,
                ownerAccountID: sessionAccountID,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                isLoading: false,
                isChangeOwnerSuccessful: false,
                isChangeOwnerFailed: true,
            },
        },
    ];

    const params: RequestWorkspaceOwnerChangeParams = {
        policyID,
        ...ownershipChecks,
    };

    API.write(WRITE_COMMANDS.REQUEST_WORKSPACE_OWNER_CHANGE, params, {optimisticData, successData, failureData});
}

function clearWorkspaceOwnerChangeFlow(policyID: string) {
    Onyx.merge(ONYXKEYS.POLICY_OWNERSHIP_CHANGE_CHECKS, null);
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        errorFields: null,
        isLoading: false,
        isChangeOwnerSuccessful: false,
        isChangeOwnerFailed: false,
    });
}

function addBillingCardAndRequestPolicyOwnerChange(
    policyID: string,
    cardData: {
        cardNumber: string;
        cardYear: string;
        cardMonth: string;
        cardCVV: string;
        addressName: string;
        addressZip: string;
        currency: string;
    },
) {
    const {cardNumber, cardYear, cardMonth, cardCVV, addressName, addressZip, currency} = cardData;

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                errorFields: null,
                isLoading: true,
                isChangeOwnerSuccessful: false,
                isChangeOwnerFailed: false,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                isLoading: false,
                isChangeOwnerSuccessful: true,
                isChangeOwnerFailed: false,
                owner: sessionEmail,
                ownerAccountID: sessionAccountID,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                isLoading: false,
                isChangeOwnerSuccessful: false,
                isChangeOwnerFailed: true,
            },
        },
    ];

    const params: AddBillingCardAndRequestWorkspaceOwnerChangeParams = {
        policyID,
        cardNumber,
        cardYear,
        cardMonth,
        cardCVV,
        addressName,
        addressZip,
        currency,
    };

    API.write(WRITE_COMMANDS.ADD_BILLING_CARD_AND_REQUEST_WORKSPACE_OWNER_CHANGE, params, {optimisticData, successData, failureData});
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
                pendingChatMembers: [
                    {
                        accountID: accountID.toString(),
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    },
                ],
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
                pendingChatMembers: null,
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
    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const;
    const logins = Object.keys(invitedEmailsToAccountIDs).map((memberLogin) => PhoneNumber.addSMSDomainIfPhoneNumber(memberLogin));
    const accountIDs = Object.values(invitedEmailsToAccountIDs);

    const {newAccountIDs, newLogins} = PersonalDetailsUtils.getNewAccountIDsAndLogins(logins, accountIDs);
    const newPersonalDetailsOnyxData = PersonalDetailsUtils.getPersonalDetailsOnyxDataForOptimisticUsers(newLogins, newAccountIDs);

    const announceRoomMembers = buildAnnounceRoomMembersOnyxData(policyID, accountIDs);

    // create onyx data for policy expense chats for each new member
    const membersChats = createPolicyExpenseChats(policyID, invitedEmailsToAccountIDs);

    const optimisticMembersState: OnyxCollection<PolicyEmployee> = {};
    const successMembersState: OnyxCollection<PolicyEmployee> = {};
    const failureMembersState: OnyxCollection<PolicyEmployee> = {};
    Object.keys(invitedEmailsToAccountIDs).forEach((email) => {
        optimisticMembersState[email] = {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, role: CONST.POLICY.ROLE.USER};
        successMembersState[email] = {pendingAction: null};
        failureMembersState[email] = {
            errors: ErrorUtils.getMicroSecondOnyxError('workspace.people.error.genericAdd'),
        };
    });

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,

            // Convert to object with each key containing {pendingAction: ‘add’}
            value: {
                employeeList: optimisticMembersState,
            },
        },
        ...newPersonalDetailsOnyxData.optimisticData,
        ...membersChats.onyxOptimisticData,
        ...announceRoomMembers.onyxOptimisticData,
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,
            value: {
                employeeList: successMembersState,
            },
        },
        ...newPersonalDetailsOnyxData.finallyData,
        ...membersChats.onyxSuccessData,
        ...announceRoomMembers.onyxSuccessData,
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,

            // Convert to object with each key containing the error. We don’t
            // need to remove the members since that is handled by onClose of OfflineWithFeedback.
            value: failureMembersState,
        },
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
 * Invite member to the specified policyID
 * Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
 */
function inviteMemberToWorkspace(policyID: string, inviterEmail: string) {
    const memberJoinKey = `${ONYXKEYS.COLLECTION.POLICY_JOIN_MEMBER}${policyID}` as const;

    const optimisticMembersState = {policyID, inviterEmail};
    const failureMembersState = {policyID, inviterEmail};

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: memberJoinKey,
            value: optimisticMembersState,
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: memberJoinKey,
            value: {...failureMembersState, errors: ErrorUtils.getMicroSecondOnyxError('common.genericEditFailureMessage')},
        },
    ];

    const params = {policyID, inviterEmail};

    API.write(WRITE_COMMANDS.JOIN_POLICY_VIA_INVITE_LINK, params, {optimisticData, failureData});
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
    const distanceUnit = Object.values(policy?.customUnits ?? {}).find((unit) => unit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
    const customUnitID = distanceUnit?.customUnitID;

    if (!policy) {
        return;
    }

    const currentRates = distanceUnit?.rates ?? {};
    const optimisticRates: Record<string, Rate> = {};
    const finallyRates: Record<string, Rate> = {};
    const failureRates: Record<string, Rate> = {};

    if (customUnitID) {
        for (const rateID of Object.keys(currentRates)) {
            optimisticRates[rateID] = {
                ...currentRates[rateID],
                pendingFields: {currency: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                currency,
            };
            finallyRates[rateID] = {
                ...currentRates[rateID],
                pendingFields: {currency: null},
                currency,
            };
            failureRates[rateID] = {
                ...currentRates[rateID],
                pendingFields: {currency: null},
                errorFields: {currency: ErrorUtils.getMicroSecondOnyxError('common.genericErrorMessage')},
            };
        }
    }

    const optimisticData: OnyxUpdate[] = [
        {
            // We use SET because it's faster than merge and avoids a race condition when setting the currency and navigating the user to the Bank account page in confirmCurrencyChangeAndHideModal
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                ...policy,

                pendingFields: {
                    ...policy.pendingFields,
                    generalSettings: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },

                // Clear errorFields in case the user didn't dismiss the general settings error
                errorFields: {
                    generalSettings: null,
                },
                name,
                outputCurrency: currency,
                ...(customUnitID && {
                    customUnits: {
                        [customUnitID]: {
                            ...distanceUnit,
                            rates: optimisticRates,
                        },
                    },
                }),
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
                ...(customUnitID && {
                    customUnits: {
                        [customUnitID]: {
                            ...distanceUnit,
                            rates: finallyRates,
                        },
                    },
                }),
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
                ...(customUnitID && {
                    customUnits: {
                        [customUnitID]: {
                            ...distanceUnit,
                            rates: failureRates,
                        },
                    },
                }),
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
    const email = allPersonalDetails?.[accountID]?.login ?? '';
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        employeeList: {
            [email]: {
                pendingAction: null,
                errors: null,
            },
        },
    });
}

/**
 * Removes an error after trying to add a member
 */
function clearAddMemberError(policyID: string, accountID: number) {
    const email = allPersonalDetails?.[accountID]?.login ?? '';
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        employeeList: {
            [email]: null,
        },
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
                type: CONST.POLICY.TYPE.TEAM,
                name: workspaceName,
                role: CONST.POLICY.ROLE.ADMIN,
                owner: sessionEmail,
                ownerAccountID: sessionAccountID,
                isPolicyExpenseChatEnabled: true,
                outputCurrency,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                customUnits,
                makeMeAdmin,
                autoReporting: true,
                employeeList: {
                    [sessionEmail]: {
                        role: CONST.POLICY.ROLE.ADMIN,
                        errors: {},
                    },
                },
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                harvesting: {
                    enabled: true,
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
                type: CONST.POLICY.TYPE.TEAM,
                name: workspaceName,
                role: CONST.POLICY.ROLE.ADMIN,
                owner: sessionEmail,
                ownerAccountID: sessionAccountID,
                isPolicyExpenseChatEnabled: true,
                outputCurrency,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                autoReporting: true,
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                harvesting: {
                    enabled: true,
                },
                customUnits,
                areCategoriesEnabled: true,
                areTagsEnabled: false,
                areDistanceRatesEnabled: false,
                areWorkflowsEnabled: false,
                areReportFieldsEnabled: false,
                areConnectionsEnabled: false,
                employeeList: {
                    [sessionEmail]: {
                        role: CONST.POLICY.ROLE.ADMIN,
                        errors: {},
                    },
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
                pendingChatMembers: [],
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
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {employeeList: null},
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
        type: CONST.POLICY.TYPE.TEAM,
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

function openPolicyWorkflowsPage(policyID: string) {
    if (!policyID) {
        Log.warn('openPolicyWorkflowsPage invalid params', {policyID});
        return;
    }

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    isLoading: true,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    isLoading: false,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    isLoading: false,
                },
            },
        ],
    };

    const params: OpenPolicyWorkflowsPageParams = {policyID};

    API.read(READ_COMMANDS.OPEN_POLICY_WORKFLOWS_PAGE, params, onyxData);
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

function openPolicyCategoriesPage(policyID: string) {
    if (!policyID) {
        Log.warn('openPolicyCategoriesPage invalid params', {policyID});
        return;
    }

    const params: OpenPolicyCategoriesPageParams = {
        policyID,
    };

    API.read(READ_COMMANDS.OPEN_POLICY_CATEGORIES_PAGE, params);
}

function openPolicyTagsPage(policyID: string) {
    if (!policyID) {
        Log.warn('openPolicyTasgPage invalid params', {policyID});
        return;
    }

    const params: OpenPolicyTagsPageParams = {
        policyID,
    };

    API.read(READ_COMMANDS.OPEN_POLICY_TAGS_PAGE, params);
}

function openPolicyTaxesPage(policyID: string) {
    if (!policyID) {
        Log.warn('openPolicyTaxesPage invalid params', {policyID});
        return;
    }

    const params: OpenPolicyTaxesPageParams = {
        policyID,
    };

    API.read(READ_COMMANDS.OPEN_POLICY_TAXES_PAGE, params);
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

function setWorkspaceInviteMessageDraft(policyID: string, message: string | null) {
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
    const policyTagKeys = PolicyUtils.getSortedTagKeys(policyTags);
    const policyRecentlyUsedTags = allRecentlyUsedTags?.[`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`] ?? {};
    const newOptimisticPolicyRecentlyUsedTags: RecentlyUsedTags = {};

    TransactionUtils.getTagArrayFromName(transactionTags).forEach((tag, index) => {
        if (!tag) {
            return;
        }

        const tagListKey = policyTagKeys[index];
        newOptimisticPolicyRecentlyUsedTags[tagListKey] = [...new Set([tag, ...(policyRecentlyUsedTags[tagListKey] ?? [])])];
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
        autoReporting: true,
        approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
        harvesting: {
            enabled: true,
        },
        customUnits,
        areCategoriesEnabled: true,
        areTagsEnabled: false,
        areDistanceRatesEnabled: false,
        areWorkflowsEnabled: false,
        areReportFieldsEnabled: false,
        areConnectionsEnabled: false,
        employeeList: {
            [sessionEmail]: {
                role: CONST.POLICY.ROLE.ADMIN,
                errors: {},
            },
            [employeeEmail]: {
                role: CONST.POLICY.ROLE.USER,
                errors: {},
            },
        },
    };

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: newWorkspace,
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
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    const optimisticPolicyCategoriesData = {
        ...Object.keys(categoriesToUpdate).reduce<PolicyCategories>((acc, key) => {
            acc[key] = {
                ...policyCategories[key],
                ...categoriesToUpdate[key],
                errors: null,
                pendingFields: {
                    enabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            };

            return acc;
        }, {}),
    };
    const shouldDisableRequiresCategory = !OptionsListUtils.hasEnabledOptions({...policyCategories, ...optimisticPolicyCategoriesData});
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: optimisticPolicyCategoriesData,
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
                            pendingAction: null,
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
                            errors: ErrorUtils.getMicroSecondOnyxError('workspace.categories.updateFailureMessage'),
                            pendingFields: {
                                enabled: null,
                            },
                            pendingAction: null,
                        };

                        return acc;
                    }, {}),
                },
            },
        ],
    };
    if (shouldDisableRequiresCategory) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                requiresCategory: false,
                pendingFields: {
                    requiresCategory: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        });
        onyxData.successData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {
                    requiresCategory: null,
                },
            },
        });
        onyxData.failureData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                requiresCategory: policy?.requiresCategory,
                pendingFields: {
                    requiresCategory: null,
                },
            },
        });
    }

    const parameters = {
        policyID,
        categories: JSON.stringify(Object.keys(categoriesToUpdate).map((key) => categoriesToUpdate[key])),
    };

    API.write(WRITE_COMMANDS.SET_WORKSPACE_CATEGORIES_ENABLED, parameters, onyxData);
}

function createPolicyCategory(policyID: string, categoryName: string) {
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        name: categoryName,
                        enabled: true,
                        errors: null,
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        errors: null,
                        pendingAction: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        errors: ErrorUtils.getMicroSecondOnyxError('workspace.categories.createFailureMessage'),
                        pendingAction: null,
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        categories: JSON.stringify([{name: categoryName}]),
    };

    API.write(WRITE_COMMANDS.CREATE_WORKSPACE_CATEGORIES, parameters, onyxData);
}

function renamePolicyCategory(policyID: string, policyCategory: {oldName: string; newName: string}) {
    const policyCategoryToUpdate = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`]?.[policyCategory.oldName] ?? {};

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [policyCategory.oldName]: null,
                    [policyCategory.newName]: {
                        ...policyCategoryToUpdate,
                        name: policyCategory.newName,
                        unencodedName: decodeURIComponent(policyCategory.newName),
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        pendingFields: {
                            name: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        },
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [policyCategory.oldName]: null,
                    [policyCategory.newName]: {
                        ...policyCategoryToUpdate,
                        name: policyCategory.newName,
                        unencodedName: decodeURIComponent(policyCategory.newName),
                        errors: null,
                        pendingAction: null,
                        pendingFields: {
                            name: null,
                        },
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [policyCategory.newName]: null,
                    [policyCategory.oldName]: {
                        ...policyCategoryToUpdate,
                        name: policyCategory.oldName,
                        unencodedName: decodeURIComponent(policyCategory.oldName),
                        errors: ErrorUtils.getMicroSecondOnyxError('workspace.categories.updateFailureMessage'),
                        pendingAction: null,
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        categories: JSON.stringify({[policyCategory.oldName]: policyCategory.newName}),
    };

    API.write(WRITE_COMMANDS.RENAME_WORKSPACE_CATEGORY, parameters, onyxData);
}

function createPolicyTag(policyID: string, tagName: string) {
    const policyTag = PolicyUtils.getTagLists(allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {})?.[0] ?? {};

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [policyTag.name]: {
                        tags: {
                            [tagName]: {
                                name: tagName,
                                enabled: true,
                                errors: null,
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                            },
                        },
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [policyTag.name]: {
                        tags: {
                            [tagName]: {
                                errors: null,
                                pendingAction: null,
                            },
                        },
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [policyTag.name]: {
                        tags: {
                            [tagName]: {
                                errors: ErrorUtils.getMicroSecondOnyxError('workspace.tags.genericFailureMessage'),
                            },
                        },
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        tags: JSON.stringify([{name: tagName}]),
    };

    API.write(WRITE_COMMANDS.CREATE_POLICY_TAG, parameters, onyxData);
}

function setWorkspaceTagEnabled(policyID: string, tagsToUpdate: Record<string, {name: string; enabled: boolean}>) {
    const policyTag = PolicyUtils.getTagLists(allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {})?.[0] ?? {};

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [policyTag.name]: {
                        tags: {
                            ...Object.keys(tagsToUpdate).reduce<PolicyTags>((acc, key) => {
                                acc[key] = {
                                    ...policyTag.tags[key],
                                    ...tagsToUpdate[key],
                                    errors: null,
                                    pendingFields: {
                                        enabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                    },
                                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                };

                                return acc;
                            }, {}),
                        },
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [policyTag.name]: {
                        tags: {
                            ...Object.keys(tagsToUpdate).reduce<PolicyTags>((acc, key) => {
                                acc[key] = {
                                    ...policyTag.tags[key],
                                    ...tagsToUpdate[key],
                                    errors: null,
                                    pendingFields: {
                                        enabled: null,
                                    },
                                    pendingAction: null,
                                };

                                return acc;
                            }, {}),
                        },
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [policyTag.name]: {
                        tags: {
                            ...Object.keys(tagsToUpdate).reduce<PolicyTags>((acc, key) => {
                                acc[key] = {
                                    ...policyTag.tags[key],
                                    ...tagsToUpdate[key],
                                    errors: ErrorUtils.getMicroSecondOnyxError('workspace.tags.genericFailureMessage'),
                                    pendingFields: {
                                        enabled: null,
                                    },
                                    pendingAction: null,
                                };

                                return acc;
                            }, {}),
                        },
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        tags: JSON.stringify(Object.keys(tagsToUpdate).map((key) => tagsToUpdate[key])),
    };

    API.write(WRITE_COMMANDS.SET_POLICY_TAGS_ENABLED, parameters, onyxData);
}

function deletePolicyTags(policyID: string, tagsToDelete: string[]) {
    const policyTag = PolicyUtils.getTagLists(allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {})?.[0] ?? {};

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [policyTag.name]: {
                        tags: {
                            ...tagsToDelete.reduce<Record<string, Partial<OnyxValueWithOfflineFeedback<PolicyTag>>>>((acc, tagName) => {
                                acc[tagName] = {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};
                                return acc;
                            }, {}),
                        },
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [policyTag.name]: {
                        tags: {
                            ...tagsToDelete.reduce<Record<string, null | Partial<OnyxValueWithOfflineFeedback<PolicyTag>>>>((acc, tagName) => {
                                acc[tagName] = null;
                                return acc;
                            }, {}),
                        },
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [policyTag.name]: {
                        tags: {
                            ...tagsToDelete.reduce<Record<string, Partial<OnyxValueWithOfflineFeedback<PolicyTag>>>>((acc, tagName) => {
                                acc[tagName] = {pendingAction: null, errors: ErrorUtils.getMicroSecondOnyxError('workspace.tags.deleteFailureMessage')};
                                return acc;
                            }, {}),
                        },
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        tags: JSON.stringify(tagsToDelete),
    };

    API.write(WRITE_COMMANDS.DELETE_POLICY_TAGS, parameters, onyxData);
}

function clearPolicyTagErrors(policyID: string, tagName: string) {
    const tagListName = Object.keys(allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {})[0];
    const tag = allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`]?.[tagListName].tags?.[tagName];
    if (!tag) {
        return;
    }

    if (tag.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {
            [tagListName]: {
                tags: {
                    [tagName]: null,
                },
            },
        });
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {
        [tagListName]: {
            tags: {
                [tagName]: {
                    errors: null,
                    pendingAction: null,
                },
            },
        },
    });
}

function renamePolicyTag(policyID: string, policyTag: {oldName: string; newName: string}) {
    const tagListName = Object.keys(allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {})[0];
    const oldTag = allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`]?.[tagListName]?.tags?.[policyTag.oldName] ?? {};
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [tagListName]: {
                        tags: {
                            [policyTag.oldName]: null,
                            [policyTag.newName]: {
                                ...oldTag,
                                name: policyTag.newName,
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                pendingFields: {
                                    name: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                },
                            },
                        },
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [tagListName]: {
                        tags: {
                            [policyTag.newName]: {
                                errors: null,
                                pendingAction: null,
                                pendingFields: {
                                    name: null,
                                },
                            },
                        },
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [tagListName]: {
                        tags: {
                            [policyTag.newName]: null,
                            [policyTag.oldName]: {
                                ...oldTag,
                                errors: ErrorUtils.getMicroSecondOnyxError('workspace.tags.genericFailureMessage'),
                            },
                        },
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        oldName: policyTag.oldName,
        newName: policyTag.newName,
    };

    API.write(WRITE_COMMANDS.RENAME_POLICY_TAG, parameters, onyxData);
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
                    errors: ErrorUtils.getMicroSecondOnyxError('workspace.categories.updateFailureMessage'),
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

    API.write(WRITE_COMMANDS.SET_WORKSPACE_REQUIRES_CATEGORY, parameters, onyxData);
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

function deleteWorkspaceCategories(policyID: string, categoryNamesToDelete: string[]) {
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    const policyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`] ?? {};
    const optimisticPolicyCategoriesData = categoryNamesToDelete.reduce<Record<string, Partial<PolicyCategory>>>((acc, categoryName) => {
        acc[categoryName] = {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};
        return acc;
    }, {});
    const shouldDisableRequiresCategory = !OptionsListUtils.hasEnabledOptions(
        Object.values(policyCategories).filter((category) => !categoryNamesToDelete.includes(category.name) && category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
    );
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: optimisticPolicyCategoriesData,
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: categoryNamesToDelete.reduce<Record<string, null>>((acc, categoryName) => {
                    acc[categoryName] = null;
                    return acc;
                }, {}),
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: categoryNamesToDelete.reduce<Record<string, Partial<PolicyCategory>>>((acc, categoryName) => {
                    acc[categoryName] = {
                        pendingAction: null,
                        errors: ErrorUtils.getMicroSecondOnyxError('workspace.categories.deleteFailureMessage'),
                    };
                    return acc;
                }, {}),
            },
        ],
    };
    if (shouldDisableRequiresCategory) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                requiresCategory: false,
                pendingFields: {
                    requiresCategory: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        });
        onyxData.successData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {
                    requiresCategory: null,
                },
            },
        });
        onyxData.failureData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                requiresCategory: policy?.requiresCategory,
                pendingFields: {
                    requiresCategory: null,
                },
            },
        });
    }

    const parameters = {
        policyID,
        categories: JSON.stringify(categoryNamesToDelete),
    };

    API.write(WRITE_COMMANDS.DELETE_WORKSPACE_CATEGORIES, parameters, onyxData);
}

/**
 * Accept user join request to a workspace
 */
function acceptJoinRequest(reportID: string, reportAction: OnyxEntry<ReportAction>) {
    const choice = CONST.REPORT.ACTIONABLE_MENTION_JOIN_WORKSPACE_RESOLUTION.ACCEPT;
    if (!reportAction) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportAction.reportActionID]: {
                    originalMessage: {choice},
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportAction.reportActionID]: {
                    originalMessage: {choice},
                    pendingAction: null,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportAction.reportActionID]: {
                    originalMessage: {choice: ''},
                    pendingAction: null,
                },
            },
        },
    ];

    const parameters = {
        requests: JSON.stringify({
            [(reportAction.originalMessage as OriginalMessageJoinPolicyChangeLog['originalMessage']).policyID]: {
                requests: [{accountID: reportAction?.actorAccountID, adminsRoomMessageReportActionID: reportAction.reportActionID}],
            },
        }),
    };

    API.write(WRITE_COMMANDS.ACCEPT_JOIN_REQUEST, parameters, {optimisticData, failureData, successData});
}

/**
 * Decline user join request to a workspace
 */
function declineJoinRequest(reportID: string, reportAction: OnyxEntry<ReportAction>) {
    if (!reportAction) {
        return;
    }
    const choice = CONST.REPORT.ACTIONABLE_MENTION_JOIN_WORKSPACE_RESOLUTION.DECLINE;
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportAction.reportActionID]: {
                    originalMessage: {choice},
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportAction.reportActionID]: {
                    originalMessage: {choice},
                    pendingAction: null,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportAction.reportActionID]: {
                    originalMessage: {choice: ''},
                    pendingAction: null,
                },
            },
        },
    ];

    const parameters = {
        requests: JSON.stringify({
            [(reportAction.originalMessage as OriginalMessageJoinPolicyChangeLog['originalMessage']).policyID]: {
                requests: [{accountID: reportAction?.actorAccountID, adminsRoomMessageReportActionID: reportAction.reportActionID}],
            },
        }),
    };

    API.write(WRITE_COMMANDS.DECLINE_JOIN_REQUEST, parameters, {optimisticData, failureData, successData});
}

function openPolicyDistanceRatesPage(policyID?: string) {
    if (!policyID) {
        return;
    }

    const params: OpenPolicyDistanceRatesPageParams = {policyID};

    API.read(READ_COMMANDS.OPEN_POLICY_DISTANCE_RATES_PAGE, params);
}

function updatePolicyConnectionConfig(policyID: string, settingName: ValueOf<typeof CONST.QUICK_BOOKS_IMPORTS>, settingValue: ValueOf<typeof CONST.INTEGRATION_ENTITY_MAP_TYPES>) {
    const parameters = {policyID, connectionName: CONST.QUICK_BOOKS_ONLINE, settingName, settingValue, idempotencyKey: settingName};
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    quickbooksOnline: {
                        config: {
                            [settingName]: settingValue,
                            pendingFields: {
                                [settingName]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                [settingName]: null,
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
                connections: {
                    quickbooksOnline: {
                        config: {
                            [settingName]: settingValue,
                            pendingFields: {
                                [settingName]: null,
                            },
                            errorFields: {
                                [settingName]: ErrorUtils.getMicroSecondOnyxError('common.genericErrorMessage'),
                            },
                        },
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
                connections: {
                    quickbooksOnline: {
                        config: {
                            [settingName]: settingValue,
                            pendingFields: {
                                [settingName]: null,
                            },
                            errorFields: {
                                [settingName]: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    API.write(WRITE_COMMANDS.UPDATE_POLICY_CONNECTION_CONFIG, parameters, {optimisticData, failureData, successData});
}

function navigateWhenEnableFeature(policyID: string, featureRoute: Route) {
    const isNarrowLayout = getIsNarrowLayout();
    if (isNarrowLayout) {
        setTimeout(() => {
            Navigation.navigate(ROUTES.WORKSPACE_INITIAL.getRoute(policyID));
        }, 1000);
        return;
    }

    /**
     * The app needs to set a navigation action to the microtask queue, it guarantees to execute Onyx.update first, then the navigation action.
     * More details - https://github.com/Expensify/App/issues/37785#issuecomment-1989056726.
     */
    new Promise<void>((resolve) => {
        resolve();
    }).then(() => {
        Navigation.navigate(featureRoute);
    });
}

function enablePolicyCategories(policyID: string, enabled: boolean) {
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areCategoriesEnabled: enabled,
                    pendingFields: {
                        areCategoriesEnabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    pendingFields: {
                        areCategoriesEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areCategoriesEnabled: !enabled,
                    pendingFields: {
                        areCategoriesEnabled: null,
                    },
                },
            },
        ],
    };

    const parameters: EnablePolicyCategoriesParams = {policyID, enabled};

    API.write(WRITE_COMMANDS.ENABLE_POLICY_CATEGORIES, parameters, onyxData);

    if (enabled) {
        navigateWhenEnableFeature(policyID, ROUTES.WORKSPACE_CATEGORIES.getRoute(policyID));
    }
}

function enablePolicyConnections(policyID: string, enabled: boolean) {
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areConnectionsEnabled: enabled,
                    pendingFields: {
                        areConnectionsEnabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    pendingFields: {
                        areConnectionsEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areConnectionsEnabled: !enabled,
                    pendingFields: {
                        areConnectionsEnabled: null,
                    },
                },
            },
        ],
    };

    const parameters: EnablePolicyConnectionsParams = {policyID, enabled};

    API.write(WRITE_COMMANDS.ENABLE_POLICY_CONNECTIONS, parameters, onyxData);
}

function enablePolicyDistanceRates(policyID: string, enabled: boolean) {
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areDistanceRatesEnabled: enabled,
                    pendingFields: {
                        areDistanceRatesEnabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    pendingFields: {
                        areDistanceRatesEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areDistanceRatesEnabled: !enabled,
                    pendingFields: {
                        areDistanceRatesEnabled: null,
                    },
                },
            },
        ],
    };

    const parameters: EnablePolicyDistanceRatesParams = {policyID, enabled};

    API.write(WRITE_COMMANDS.ENABLE_POLICY_DISTANCE_RATES, parameters, onyxData);

    if (enabled) {
        navigateWhenEnableFeature(policyID, ROUTES.WORKSPACE_DISTANCE_RATES.getRoute(policyID));
    }
}

function enablePolicyReportFields(policyID: string, enabled: boolean) {
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areReportFieldsEnabled: enabled,
                    pendingFields: {
                        areReportFieldsEnabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    pendingFields: {
                        areReportFieldsEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areReportFieldsEnabled: !enabled,
                    pendingFields: {
                        areReportFieldsEnabled: null,
                    },
                },
            },
        ],
    };

    const parameters: EnablePolicyReportFieldsParams = {policyID, enabled};

    API.write(WRITE_COMMANDS.ENABLE_POLICY_REPORT_FIELDS, parameters, onyxData);
}

function enablePolicyTags(policyID: string, enabled: boolean) {
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areTagsEnabled: enabled,
                    pendingFields: {
                        areTagsEnabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    pendingFields: {
                        areTagsEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areTagsEnabled: !enabled,
                    pendingFields: {
                        areTagsEnabled: null,
                    },
                },
            },
        ],
    };

    const parameters: EnablePolicyTagsParams = {policyID, enabled};

    API.write(WRITE_COMMANDS.ENABLE_POLICY_TAGS, parameters, onyxData);

    if (enabled) {
        navigateWhenEnableFeature(policyID, ROUTES.WORKSPACE_TAGS.getRoute(policyID));
    }
}

function enablePolicyTaxes(policyID: string, enabled: boolean) {
    const defaultTaxRates: TaxRatesWithDefault = CONST.DEFAULT_TAX;
    const taxRatesData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    taxRates: {
                        ...defaultTaxRates,
                        taxes: {
                            ...Object.keys(defaultTaxRates.taxes).reduce(
                                (prevTaxesData, taxKey) => ({
                                    ...prevTaxesData,
                                    [taxKey]: {
                                        ...defaultTaxRates.taxes[taxKey],
                                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                                    },
                                }),
                                {},
                            ),
                        },
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    taxRates: {
                        taxes: {
                            ...Object.keys(defaultTaxRates.taxes).reduce(
                                (prevTaxesData, taxKey) => ({
                                    ...prevTaxesData,
                                    [taxKey]: {pendingAction: null},
                                }),
                                {},
                            ),
                        },
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    taxRates: undefined,
                },
            },
        ],
    };
    const policy = getPolicy(policyID);
    const shouldAddDefaultTaxRatesData = (!policy?.taxRates || isEmptyObject(policy.taxRates)) && enabled;
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    tax: {
                        trackingEnabled: enabled,
                    },
                    pendingFields: {
                        tax: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
            ...(shouldAddDefaultTaxRatesData ? taxRatesData.optimisticData ?? [] : []),
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    pendingFields: {
                        tax: null,
                    },
                },
            },
            ...(shouldAddDefaultTaxRatesData ? taxRatesData.successData ?? [] : []),
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    tax: {
                        trackingEnabled: !enabled,
                    },
                    pendingFields: {
                        tax: null,
                    },
                },
            },
            ...(shouldAddDefaultTaxRatesData ? taxRatesData.failureData ?? [] : []),
        ],
    };

    const parameters: EnablePolicyTaxesParams = {policyID, enabled};
    if (shouldAddDefaultTaxRatesData) {
        parameters.taxFields = JSON.stringify(defaultTaxRates);
    }
    API.write(WRITE_COMMANDS.ENABLE_POLICY_TAXES, parameters, onyxData);

    if (enabled) {
        navigateWhenEnableFeature(policyID, ROUTES.WORKSPACE_TAXES.getRoute(policyID));
    }
}

function enablePolicyWorkflows(policyID: string, enabled: boolean) {
    const policy = getPolicy(policyID);
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areWorkflowsEnabled: enabled,
                    ...(!enabled
                        ? {
                              approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                              autoReporting: false,
                              harvesting: {
                                  enabled: false,
                              },
                              reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO,
                          }
                        : {}),
                    pendingFields: {
                        areWorkflowsEnabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        ...(!enabled
                            ? {
                                  approvalMode: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                  autoReporting: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                  harvesting: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                  reimbursementChoice: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                              }
                            : {}),
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    pendingFields: {
                        areWorkflowsEnabled: null,
                        ...(!enabled
                            ? {
                                  approvalMode: null,
                                  autoReporting: null,
                                  harvesting: null,
                                  reimbursementChoice: null,
                              }
                            : {}),
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areWorkflowsEnabled: !enabled,
                    ...(!enabled
                        ? {
                              approvalMode: policy.approvalMode,
                              autoReporting: policy.autoReporting,
                              harvesting: policy.harvesting,
                              reimbursementChoice: policy.reimbursementChoice,
                          }
                        : {}),
                    pendingFields: {
                        areWorkflowsEnabled: null,
                        ...(!enabled
                            ? {
                                  approvalMode: null,
                                  autoReporting: null,
                                  harvesting: null,
                                  reimbursementChoice: null,
                              }
                            : {}),
                    },
                },
            },
        ],
    };

    const parameters: EnablePolicyWorkflowsParams = {policyID, enabled};

    API.write(WRITE_COMMANDS.ENABLE_POLICY_WORKFLOWS, parameters, onyxData);

    if (enabled) {
        navigateWhenEnableFeature(policyID, ROUTES.WORKSPACE_WORKFLOWS.getRoute(policyID));
    }
}

function renamePolicyTaglist(policyID: string, policyTagListName: {oldName: string; newName: string}, policyTags: OnyxEntry<PolicyTagList>) {
    const newName = policyTagListName.newName;
    const oldName = policyTagListName.oldName;
    const oldPolicyTags = policyTags?.[oldName] ?? {};
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [newName]: {...oldPolicyTags, name: newName, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
                    [oldName]: null,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [newName]: {pendingAction: null},
                    [oldName]: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    errors: {
                        [oldName]: oldName,
                        [newName]: ErrorUtils.getMicroSecondOnyxError('workspace.tags.genericFailureMessage'),
                    },
                    [newName]: null,
                    [oldName]: oldPolicyTags,
                },
            },
        ],
    };
    const parameters = {
        policyID,
        oldName,
        newName,
    };

    API.write(WRITE_COMMANDS.RENAME_POLICY_TAG_LIST, parameters, onyxData);
}

function setPolicyRequiresTag(policyID: string, requiresTag: boolean) {
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    requiresTag,
                    errors: {requiresTag: null},
                    pendingFields: {
                        requiresTag: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
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
                        requiresTag: null,
                    },
                    pendingFields: {
                        requiresTag: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    requiresTag: !requiresTag,
                    errors: ErrorUtils.getMicroSecondOnyxError('workspace.tags.genericFailureMessage'),
                    pendingFields: {
                        requiresTag: null,
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        requiresTag,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_REQUIRES_TAG, parameters, onyxData);
}

function openPolicyMoreFeaturesPage(policyID: string) {
    const params: OpenPolicyMoreFeaturesPageParams = {policyID};

    API.read(READ_COMMANDS.OPEN_POLICY_MORE_FEATURES_PAGE, params);
}

function createPolicyDistanceRate(policyID: string, customUnitID: string, customUnitRate: Rate) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnitID]: {
                        rates: {
                            [customUnitRate.customUnitRateID ?? '']: {
                                ...customUnitRate,
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                            },
                        },
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
                    [customUnitID]: {
                        rates: {
                            [customUnitRate.customUnitRateID ?? '']: {
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
                    [customUnitID]: {
                        rates: {
                            [customUnitRate.customUnitRateID ?? '']: {
                                errors: ErrorUtils.getMicroSecondOnyxError('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const params: CreatePolicyDistanceRateParams = {
        policyID,
        customUnitID,
        customUnitRate: JSON.stringify(customUnitRate),
    };

    API.write(WRITE_COMMANDS.CREATE_POLICY_DISTANCE_RATE, params, {optimisticData, successData, failureData});
}

function clearCreateDistanceRateItemAndError(policyID: string, customUnitID: string, customUnitRateIDToClear: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        customUnits: {
            [customUnitID]: {
                rates: {
                    [customUnitRateIDToClear]: null,
                },
            },
        },
    });
}

function clearPolicyDistanceRatesErrorFields(policyID: string, customUnitID: string, updatedErrorFields: ErrorFields) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        customUnits: {
            [customUnitID]: {
                errorFields: updatedErrorFields,
            },
        },
    });
}

function clearDeleteDistanceRateError(policyID: string, customUnitID: string, rateID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        customUnits: {
            [customUnitID]: {
                rates: {
                    [rateID]: {
                        errors: null,
                    },
                },
            },
        },
    });
}

function clearPolicyDistanceRateErrorFields(policyID: string, customUnitID: string, rateID: string, updatedErrorFields: ErrorFields) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        customUnits: {
            [customUnitID]: {
                rates: {
                    [rateID]: {
                        errorFields: updatedErrorFields,
                    },
                },
            },
        },
    });
}

/**
 * Takes removes pendingFields and errorFields from a customUnit
 */
function removePendingFieldsFromCustomUnit(customUnit: CustomUnit): CustomUnit {
    const cleanedCustomUnit = {...customUnit};

    delete cleanedCustomUnit.pendingFields;
    delete cleanedCustomUnit.errorFields;

    return cleanedCustomUnit;
}

function setPolicyDistanceRatesUnit(policyID: string, currentCustomUnit: CustomUnit, newCustomUnit: CustomUnit) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [newCustomUnit.customUnitID]: {
                        ...newCustomUnit,
                        pendingFields: {attributes: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
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
                        pendingFields: {attributes: null},
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
                        ...currentCustomUnit,
                        errorFields: {attributes: ErrorUtils.getMicroSecondOnyxError('common.genericErrorMessage')},
                        pendingFields: {attributes: null},
                    },
                },
            },
        },
    ];

    const params: SetPolicyDistanceRatesUnitParams = {
        policyID,
        customUnit: JSON.stringify(removePendingFieldsFromCustomUnit(newCustomUnit)),
    };

    API.write(WRITE_COMMANDS.SET_POLICY_DISTANCE_RATES_UNIT, params, {optimisticData, successData, failureData});
}

function setPolicyDistanceRatesDefaultCategory(policyID: string, currentCustomUnit: CustomUnit, newCustomUnit: CustomUnit) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [newCustomUnit.customUnitID]: {
                        ...newCustomUnit,
                        pendingFields: {defaultCategory: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
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
                        pendingFields: {defaultCategory: null},
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
                        ...currentCustomUnit,
                        errorFields: {defaultCategory: ErrorUtils.getMicroSecondOnyxError('common.genericErrorMessage')},
                        pendingFields: {defaultCategory: null},
                    },
                },
            },
        },
    ];

    const params: SetPolicyDistanceRatesDefaultCategoryParams = {
        policyID,
        customUnit: JSON.stringify(removePendingFieldsFromCustomUnit(newCustomUnit)),
    };

    API.write(WRITE_COMMANDS.SET_POLICY_DISTANCE_RATES_DEFAULT_CATEGORY, params, {optimisticData, successData, failureData});
}

/**
 * Takes array of customUnitRates and removes pendingFields and errorFields from each rate - we don't want to send those via API
 */
function prepareCustomUnitRatesArray(customUnitRates: Rate[]): Rate[] {
    const customUnitRateArray: Rate[] = [];
    customUnitRates.forEach((rate) => {
        const cleanedRate = {...rate};
        delete cleanedRate.pendingFields;
        delete cleanedRate.errorFields;
        customUnitRateArray.push(cleanedRate);
    });

    return customUnitRateArray;
}

function updatePolicyDistanceRateValue(policyID: string, customUnit: CustomUnit, customUnitRates: Rate[]) {
    const currentRates = customUnit.rates;
    const optimisticRates: Record<string, Rate> = {};
    const successRates: Record<string, Rate> = {};
    const failureRates: Record<string, Rate> = {};
    const rateIDs = customUnitRates.map((rate) => rate.customUnitRateID);

    for (const rateID of Object.keys(customUnit.rates)) {
        if (rateIDs.includes(rateID)) {
            const foundRate = customUnitRates.find((rate) => rate.customUnitRateID === rateID);
            optimisticRates[rateID] = {...foundRate, pendingFields: {rate: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}};
            successRates[rateID] = {...foundRate, pendingFields: {rate: null}};
            failureRates[rateID] = {
                ...currentRates[rateID],
                pendingFields: {rate: null},
                errorFields: {rate: ErrorUtils.getMicroSecondOnyxError('common.genericErrorMessage')},
            };
        }
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnit.customUnitID]: {
                        rates: optimisticRates,
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
                    [customUnit.customUnitID]: {
                        rates: successRates,
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
                    [customUnit.customUnitID]: {
                        rates: failureRates,
                    },
                },
            },
        },
    ];

    const params: UpdatePolicyDistanceRateValueParams = {
        policyID,
        customUnitID: customUnit.customUnitID,
        customUnitRateArray: JSON.stringify(prepareCustomUnitRatesArray(customUnitRates)),
    };

    API.write(WRITE_COMMANDS.UPDATE_POLICY_DISTANCE_RATE_VALUE, params, {optimisticData, successData, failureData});
}

function setPolicyDistanceRatesEnabled(policyID: string, customUnit: CustomUnit, customUnitRates: Rate[]) {
    const currentRates = customUnit.rates;
    const optimisticRates: Record<string, Rate> = {};
    const successRates: Record<string, Rate> = {};
    const failureRates: Record<string, Rate> = {};
    const rateIDs = customUnitRates.map((rate) => rate.customUnitRateID);

    for (const rateID of Object.keys(currentRates)) {
        if (rateIDs.includes(rateID)) {
            const foundRate = customUnitRates.find((rate) => rate.customUnitRateID === rateID);
            optimisticRates[rateID] = {...foundRate, pendingFields: {enabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}};
            successRates[rateID] = {...foundRate, pendingFields: {enabled: null}};
            failureRates[rateID] = {
                ...currentRates[rateID],
                pendingFields: {enabled: null},
                errorFields: {enabled: ErrorUtils.getMicroSecondOnyxError('common.genericErrorMessage')},
            };
        }
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnit.customUnitID]: {
                        rates: optimisticRates,
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
                    [customUnit.customUnitID]: {
                        rates: successRates,
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
                    [customUnit.customUnitID]: {
                        rates: failureRates,
                    },
                },
            },
        },
    ];

    const params: SetPolicyDistanceRatesEnabledParams = {
        policyID,
        customUnitID: customUnit.customUnitID,
        customUnitRateArray: JSON.stringify(prepareCustomUnitRatesArray(customUnitRates)),
    };

    API.write(WRITE_COMMANDS.SET_POLICY_DISTANCE_RATES_ENABLED, params, {optimisticData, successData, failureData});
}

function deletePolicyDistanceRates(policyID: string, customUnit: CustomUnit, rateIDsToDelete: string[]) {
    const currentRates = customUnit.rates;
    const optimisticRates: Record<string, Rate> = {};
    const successRates: Record<string, Rate> = {};
    const failureRates: Record<string, Rate> = {};

    for (const rateID of Object.keys(currentRates)) {
        if (rateIDsToDelete.includes(rateID)) {
            optimisticRates[rateID] = {
                ...currentRates[rateID],
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            };
            failureRates[rateID] = {
                ...currentRates[rateID],
                pendingAction: null,
                errors: ErrorUtils.getMicroSecondOnyxError('common.genericErrorMessage'),
            };
        } else {
            optimisticRates[rateID] = currentRates[rateID];
            successRates[rateID] = currentRates[rateID];
        }
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnit.customUnitID]: {
                        rates: optimisticRates,
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
                    [customUnit.customUnitID]: {
                        rates: successRates,
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
                    [customUnit.customUnitID]: {
                        rates: failureRates,
                    },
                },
            },
        },
    ];

    const params: DeletePolicyDistanceRatesParams = {
        policyID,
        customUnitID: customUnit.customUnitID,
        customUnitRateID: rateIDsToDelete,
    };

    API.write(WRITE_COMMANDS.DELETE_POLICY_DISTANCE_RATES, params, {optimisticData, successData, failureData});
}

function setPolicyCustomTaxName(policyID: string, customTaxName: string) {
    const policy = getPolicy(policyID);
    const originalCustomTaxName = policy?.taxRates?.name;
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    taxRates: {
                        name: customTaxName,
                        pendingFields: {name: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                        errorFields: null,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    taxRates: {
                        pendingFields: {name: null},
                        errorFields: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    taxRates: {
                        name: originalCustomTaxName,
                        pendingFields: {name: null},
                        errorFields: {name: ErrorUtils.getMicroSecondOnyxError('common.genericErrorMessage')},
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        customTaxName,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_CUSTOM_TAX_NAME, parameters, onyxData);
}

function setWorkspaceCurrencyDefault(policyID: string, taxCode: string) {
    const policy = getPolicy(policyID);
    const originalDefaultExternalID = policy?.taxRates?.defaultExternalID;
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    taxRates: {
                        defaultExternalID: taxCode,
                        pendingFields: {defaultExternalID: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                        errorFields: null,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    taxRates: {
                        pendingFields: {defaultExternalID: null},
                        errorFields: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    taxRates: {
                        defaultExternalID: originalDefaultExternalID,
                        pendingFields: {defaultExternalID: null},
                        errorFields: {defaultExternalID: ErrorUtils.getMicroSecondOnyxError('common.genericErrorMessage')},
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        taxCode,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_TAXES_CURRENCY_DEFAULT, parameters, onyxData);
}

function setForeignCurrencyDefault(policyID: string, taxCode: string) {
    const policy = getPolicy(policyID);
    const originalDefaultForeignCurrencyID = policy?.taxRates?.foreignTaxDefault;
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    taxRates: {
                        foreignTaxDefault: taxCode,
                        pendingFields: {foreignTaxDefault: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                        errorFields: null,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    taxRates: {
                        pendingFields: {foreignTaxDefault: null},
                        errorFields: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    taxRates: {
                        foreignTaxDefault: originalDefaultForeignCurrencyID,
                        pendingFields: {foreignTaxDefault: null},
                        errorFields: {foreignTaxDefault: ErrorUtils.getMicroSecondOnyxError('common.genericErrorMessage')},
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        taxCode,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_TAXES_FOREIGN_CURRENCY_DEFAULT, parameters, onyxData);
}

export {
    removeMembers,
    leaveWorkspace,
    updateWorkspaceMembersRole,
    requestWorkspaceOwnerChange,
    clearWorkspaceOwnerChangeFlow,
    addBillingCardAndRequestPolicyOwnerChange,
    addMembersToWorkspace,
    isAdminOfFreePolicy,
    hasActiveChatEnabledPolicies,
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
    openPolicyCategoriesPage,
    openPolicyTagsPage,
    openPolicyTaxesPage,
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
    inviteMemberToWorkspace,
    acceptJoinRequest,
    declineJoinRequest,
    createPolicyCategory,
    renamePolicyCategory,
    clearCategoryErrors,
    setWorkspacePayer,
    setWorkspaceReimbursement,
    openPolicyWorkflowsPage,
    setPolicyRequiresTag,
    renamePolicyTaglist,
    enablePolicyCategories,
    enablePolicyConnections,
    enablePolicyDistanceRates,
    enablePolicyReportFields,
    enablePolicyTags,
    enablePolicyTaxes,
    enablePolicyWorkflows,
    openPolicyDistanceRatesPage,
    openPolicyMoreFeaturesPage,
    generateCustomUnitID,
    createPolicyDistanceRate,
    clearCreateDistanceRateItemAndError,
    clearDeleteDistanceRateError,
    setPolicyDistanceRatesUnit,
    setPolicyDistanceRatesDefaultCategory,
    createPolicyTag,
    renamePolicyTag,
    clearPolicyTagErrors,
    clearWorkspaceReimbursementErrors,
    deleteWorkspaceCategories,
    deletePolicyTags,
    setWorkspaceTagEnabled,
    setWorkspaceCurrencyDefault,
    setForeignCurrencyDefault,
    updatePolicyConnectionConfig,
    setPolicyCustomTaxName,
    clearPolicyErrorField,
    isCurrencySupportedForDirectReimbursement,
    clearPolicyDistanceRatesErrorFields,
    clearPolicyDistanceRateErrorFields,
    updatePolicyDistanceRateValue,
    setPolicyDistanceRatesEnabled,
    deletePolicyDistanceRates,
};

export type {NewCustomUnit};
