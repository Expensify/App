import {PUBLIC_DOMAINS, Str} from 'expensify-common';
import lodashClone from 'lodash/clone';
import escapeRegExp from 'lodash/escapeRegExp';
import lodashUnion from 'lodash/union';
import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {ReportExportType} from '@components/ButtonWithDropdownMenu/types';
import * as API from '@libs/API';
import type {
    AddBillingCardAndRequestWorkspaceOwnerChangeParams,
    CreateWorkspaceFromIOUPaymentParams,
    CreateWorkspaceParams,
    DeleteWorkspaceAvatarParams,
    DeleteWorkspaceParams,
    DisablePolicyBillableModeParams,
    EnablePolicyAutoApprovalOptionsParams,
    EnablePolicyAutoReimbursementLimitParams,
    EnablePolicyCompanyCardsParams,
    EnablePolicyConnectionsParams,
    EnablePolicyDefaultReportTitleParams,
    EnablePolicyExpensifyCardsParams,
    EnablePolicyInvoicingParams,
    EnablePolicyReportFieldsParams,
    EnablePolicyTaxesParams,
    EnablePolicyWorkflowsParams,
    LeavePolicyParams,
    OpenDraftWorkspaceRequestParams,
    OpenPolicyEditCardLimitTypePageParams,
    OpenPolicyExpensifyCardsPageParams,
    OpenPolicyInitialPageParams,
    OpenPolicyMoreFeaturesPageParams,
    OpenPolicyProfilePageParams,
    OpenPolicyTaxesPageParams,
    OpenPolicyWorkflowsPageParams,
    OpenWorkspaceInvitePageParams,
    OpenWorkspaceParams,
    OpenWorkspaceReimburseViewParams,
    RequestExpensifyCardLimitIncreaseParams,
    SetCompanyCardExportAccountParams,
    SetPolicyAutomaticApprovalLimitParams,
    SetPolicyAutomaticApprovalRateParams,
    SetPolicyAutoReimbursementLimitParams,
    SetPolicyBillableModeParams,
    SetPolicyDefaultReportTitleParams,
    SetPolicyPreventMemberCreatedTitleParams,
    SetPolicyPreventSelfApprovalParams,
    SetPolicyRulesEnabledParams,
    SetWorkspaceApprovalModeParams,
    SetWorkspaceAutoReportingFrequencyParams,
    SetWorkspaceAutoReportingMonthlyOffsetParams,
    SetWorkspacePayerParams,
    SetWorkspaceReimbursementParams,
    UpdateCompanyCardNameParams,
    UpdatePolicyAddressParams,
    UpdateWorkspaceAvatarParams,
    UpdateWorkspaceCustomUnitAndRateParams,
    UpdateWorkspaceDescriptionParams,
    UpdateWorkspaceGeneralSettingsParams,
    UpgradeToCorporateParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Log from '@libs/Log';
import * as NetworkStore from '@libs/Network/NetworkStore';
import * as NumberUtils from '@libs/NumberUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PhoneNumber from '@libs/PhoneNumber';
import * as PolicyUtils from '@libs/PolicyUtils';
import {navigateWhenEnableFeature} from '@libs/PolicyUtils';
import * as ReportActionsConnection from '@libs/ReportActionsConnection';
import * as ReportConnection from '@libs/ReportConnection';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import type {PolicySelector} from '@pages/home/sidebar/SidebarScreen/FloatingActionButtonAndPopover';
import * as PersistedRequests from '@userActions/PersistedRequests';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {
    InvitedEmailsToAccountIDs,
    PersonalDetailsList,
    Policy,
    PolicyCategory,
    ReimbursementAccount,
    Report,
    ReportAction,
    Request,
    TaxRatesWithDefault,
    Transaction,
} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type {Attributes, CompanyAddress, CustomUnit, NetSuiteCustomList, NetSuiteCustomSegment, Rate, TaxRate, Unit} from '@src/types/onyx/Policy';
import type {OnyxData} from '@src/types/onyx/Request';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {buildOptimisticPolicyCategories} from './Category';

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

type NewCustomUnit = {
    customUnitID: string;
    name: string;
    attributes: Attributes;
    rates: Rate;
};

type WorkspaceFromIOUCreationData = {
    policyID: string;
    workspaceChatReportID: string;
    reportPreviewReportActionID?: string;
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

let lastAccessedWorkspacePolicyID: OnyxEntry<string>;
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

let allRecentlyUsedCurrencies: string[];
Onyx.connect({
    key: ONYXKEYS.RECENTLY_USED_CURRENCIES,
    callback: (val) => (allRecentlyUsedCurrencies = val ?? []),
});

/**
 * Stores in Onyx the policy ID of the last workspace that was accessed by the user
 */
function updateLastAccessedWorkspace(policyID: OnyxEntry<string>) {
    Onyx.set(ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID, policyID ?? null);
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
function getPolicy(policyID: string | undefined): OnyxEntry<Policy> {
    if (!allPolicies || !policyID) {
        return undefined;
    }
    return allPolicies[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
}

/**
 * Returns a primary policy for the user
 */
// TODO: Use getInvoicePrimaryWorkspace when the invoices screen is ready - https://github.com/Expensify/App/issues/45175.
function getPrimaryPolicy(activePolicyID: OnyxEntry<string>, currentUserLogin: string | undefined): Policy | undefined {
    const activeAdminWorkspaces = PolicyUtils.getActiveAdminWorkspaces(allPolicies, currentUserLogin);
    const primaryPolicy: Policy | null | undefined = activeAdminWorkspaces.find((policy) => policy.id === activePolicyID);
    return primaryPolicy ?? activeAdminWorkspaces[0];
}

/** Check if the policy has invoicing company details */
function hasInvoicingDetails(policy: OnyxEntry<Policy>): boolean {
    return !!policy?.invoice?.companyName && !!policy?.invoice?.companyWebsite;
}

/**
 * Returns a primary invoice workspace for the user
 */
function getInvoicePrimaryWorkspace(activePolicyID: OnyxEntry<string>, currentUserLogin: string | undefined): Policy | undefined {
    if (PolicyUtils.canSendInvoiceFromWorkspace(activePolicyID)) {
        return allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID ?? '-1'}`];
    }
    const activeAdminWorkspaces = PolicyUtils.getActiveAdminWorkspaces(allPolicies, currentUserLogin);
    return activeAdminWorkspaces.find((policy) => PolicyUtils.canSendInvoiceFromWorkspace(policy.id));
}

/**
 * Check if the user has any active free policies (aka workspaces)
 */
function hasActiveChatEnabledPolicies(policies: Array<OnyxEntry<PolicySelector>> | OnyxCollection<PolicySelector>, includeOnlyAdminPolicies = false): boolean {
    const chatEnabledPolicies = Object.values(policies ?? {}).filter(
        (policy) => policy?.isPolicyExpenseChatEnabled && (!includeOnlyAdminPolicies || policy.role === CONST.POLICY.ROLE.ADMIN),
    );

    if (chatEnabledPolicies.length === 0) {
        return false;
    }

    if (chatEnabledPolicies.some((policy) => !policy?.pendingAction)) {
        return true;
    }

    if (chatEnabledPolicies.some((policy) => policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD)) {
        return true;
    }

    if (chatEnabledPolicies.some((policy) => policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)) {
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
                avatarURL: '',
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

    const reportsToArchive = Object.values(ReportConnection.getAllReports() ?? {}).filter(
        (report) => report?.policyID === policyID && (ReportUtils.isChatRoom(report) || ReportUtils.isPolicyExpenseChat(report) || ReportUtils.isTaskReport(report)),
    );
    const finallyData: OnyxUpdate[] = [];
    const currentTime = DateUtils.getDBTime();
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
                // eslint-disable-next-line @typescript-eslint/naming-convention
                private_isArchived: currentTime,
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

    const policy = getPolicy(policyID);
    // Restore the old report stateNum and statusNum
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
            value: {
                errors: reimbursementAccount?.errors ?? null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                avatarURL: policy?.avatarURL,
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
                // eslint-disable-next-line @typescript-eslint/naming-convention
                private_isArchived: null,
            },
        });
    });

    const params: DeleteWorkspaceParams = {policyID};

    API.write(WRITE_COMMANDS.DELETE_WORKSPACE, params, {optimisticData, finallyData, failureData});

    // Reset the lastAccessedWorkspacePolicyID
    if (policyID === lastAccessedWorkspacePolicyID) {
        updateLastAccessedWorkspace(undefined);
    }
}

function setWorkspaceAutoReportingFrequency(policyID: string, frequency: ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>) {
    const policy = getPolicy(policyID);

    const wasPolicyOnManualReporting = PolicyUtils.getCorrectedAutoReportingFrequency(policy) === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL;

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                // Recall that the "daily" and "manual" frequencies don't actually exist in Onyx or the DB (see PolicyUtils.getCorrectedAutoReportingFrequency)
                autoReportingFrequency: frequency === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL ? CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE : frequency,
                pendingFields: {autoReportingFrequency: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},

                // To set the frequency to "manual", we really must set it to "immediate" with harvesting disabled
                ...(frequency === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL && {
                    harvesting: {
                        enabled: false,
                    },
                }),

                // If the policy was on manual reporting before, and now will be auto-reported,
                // then we must re-enable harvesting
                ...(wasPolicyOnManualReporting &&
                    frequency !== CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL && {
                        harvesting: {
                            enabled: true,
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
                autoReportingFrequency: policy?.autoReportingFrequency ?? null,
                harvesting: policy?.harvesting ?? null,
                pendingFields: {autoReportingFrequency: null},
                errorFields: {autoReportingFrequency: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workflowsDelayedSubmissionPage.autoReportingFrequencyErrorMessage')},
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
    const value = JSON.stringify({autoReportingOffset});
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
                autoReportingOffset: policy?.autoReportingOffset ?? null,
                pendingFields: {autoReportingOffset: null},
                errorFields: {autoReportingOffset: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workflowsDelayedSubmissionPage.monthlyOffsetErrorMessage')},
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
                approver: policy?.approver,
                approvalMode: policy?.approvalMode,
                pendingFields: {approvalMode: null},
                errorFields: {approvalMode: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workflowsApproverPage.genericErrorMessage')},
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
                achAccount: {reimburser: policy?.achAccount?.reimburser ?? null},
                errorFields: {reimburser: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workflowsPayerPage.genericErrorMessage')},
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

function clearQBOErrorField(policyID: string, fieldName: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {connections: {quickbooksOnline: {config: {errorFields: {[fieldName]: null}}}}});
}

function clearXeroErrorField(policyID: string, fieldName: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {connections: {xero: {config: {errorFields: {[fieldName]: null}}}}});
}

function clearNetSuiteErrorField(policyID: string, fieldName: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {connections: {netsuite: {options: {config: {errorFields: {[fieldName]: null}}}}}});
}

function clearNetSuitePendingField(policyID: string, fieldName: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {connections: {netsuite: {options: {config: {pendingFields: {[fieldName]: null}}}}}});
}

function removeNetSuiteCustomFieldByIndex(allRecords: NetSuiteCustomSegment[] | NetSuiteCustomList[], policyID: string, importCustomField: string, valueIndex: number) {
    // We allow multiple custom list records with the same internalID. Hence it is safe to remove by index.
    const filteredRecords = allRecords.filter((_, index) => index !== Number(valueIndex));
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        connections: {
            netsuite: {
                options: {
                    config: {
                        syncOptions: {
                            [importCustomField]: filteredRecords,
                        },
                    },
                },
            },
        },
    });
}

function clearSageIntacctErrorField(policyID: string, fieldName: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {connections: {intacct: {config: {errorFields: {[fieldName]: null}}}}});
}

function clearNetSuiteAutoSyncErrorField(policyID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {connections: {netsuite: {config: {errorFields: {autoSync: null}}}}});
}

function setWorkspaceReimbursement(policyID: string, reimbursementChoice: ValueOf<typeof CONST.POLICY.REIMBURSEMENT_CHOICES>, reimburserEmail: string) {
    const policy = getPolicy(policyID);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                reimbursementChoice,
                isLoadingWorkspaceReimbursement: true,
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
                isLoadingWorkspaceReimbursement: false,
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
                isLoadingWorkspaceReimbursement: false,
                reimbursementChoice: policy?.reimbursementChoice ?? null,
                achAccount: {reimburser: policy?.achAccount?.reimburser ?? null},
                errorFields: {reimbursementChoice: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
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
            value: null,
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
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.people.error.genericRemove'),
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

        const oldChat = ReportUtils.getPolicyExpenseChat(cleanAccountID, policyID);

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
                participants: {
                    [accountID]: allPersonalDetails && allPersonalDetails[accountID] ? {} : null,
                },
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
 * Updates a workspace avatar image
 */
function updateWorkspaceAvatar(policyID: string, file: File) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                avatarURL: file.uri,
                originalFileName: file.name,
                errorFields: {
                    avatarURL: null,
                },
                pendingFields: {
                    avatarURL: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
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
                    avatarURL: null,
                },
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                avatarURL: allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]?.avatarURL,
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
    const policy = getPolicy(policyID);
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {
                    avatarURL: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errorFields: {
                    avatarURL: null,
                },
                avatarURL: '',
                originalFileName: null,
            },
        },
    ];
    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {
                    avatarURL: null,
                },
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                avatarURL: policy?.avatarURL,
                originalFileName: policy?.originalFileName,
                errorFields: {
                    avatarURL: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('avatarWithImagePicker.deleteWorkspaceError'),
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
            avatarURL: null,
        },
        pendingFields: {
            avatarURL: null,
        },
    });
}

/**
 * Optimistically update the general settings. Set the general settings as pending until the response succeeds.
 * If the response fails set a general error message. Clear the error message when updating.
 */
function updateGeneralSettings(policyID: string, name: string, currencyValue?: string) {
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    if (!policy) {
        return;
    }

    const distanceUnit = PolicyUtils.getCustomUnit(policy);
    const customUnitID = distanceUnit?.customUnitID;
    const currency = currencyValue ?? policy?.outputCurrency ?? CONST.CURRENCY.USD;

    const currencyPendingAction = currency !== policy?.outputCurrency ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : undefined;
    const namePendingAction = name !== policy?.name ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : undefined;

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
                errorFields: {currency: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
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
                    ...(namePendingAction !== undefined && {name: namePendingAction}),
                    ...(currencyPendingAction !== undefined && {outputCurrency: currencyPendingAction}),
                },

                // Clear errorFields in case the user didn't dismiss the general settings error
                errorFields: {
                    name: null,
                    outputCurrency: null,
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
                    name: null,
                    outputCurrency: null,
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

    const errorFields: Policy['errorFields'] = {
        name: namePendingAction && ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.editor.genericFailureMessage'),
    };

    if (!errorFields.name && currencyPendingAction) {
        errorFields.outputCurrency = ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.editor.genericFailureMessage');
    }

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                errorFields,
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

    const persistedRequests = PersistedRequests.getAll();
    const createWorkspaceRequestChangedIndex = persistedRequests.findIndex(
        (request) => request.data?.policyID === policyID && request.command === WRITE_COMMANDS.CREATE_WORKSPACE && request.data?.policyName !== name,
    );

    const createWorkspaceRequest = persistedRequests[createWorkspaceRequestChangedIndex];
    if (createWorkspaceRequest) {
        const workspaceRequest: Request = {
            ...createWorkspaceRequest,
            data: {
                ...createWorkspaceRequest.data,
                policyName: name,
            },
        };
        Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
            name,
        });

        PersistedRequests.update(createWorkspaceRequestChangedIndex, workspaceRequest);
        return;
    }

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
                    description: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.editor.genericFailureMessage'),
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

function updateAddress(policyID: string, newAddress: CompanyAddress) {
    // TODO: Change API endpoint parameters format to make it possible to follow naming-convention
    const parameters: UpdatePolicyAddressParams = {
        policyID,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'data[addressStreet]': newAddress.addressStreet,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'data[city]': newAddress.city,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'data[country]': newAddress.country,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'data[state]': newAddress.state,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'data[zipCode]': newAddress.zipCode,
    };

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                address: newAddress,
                pendingFields: {
                    address: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];

    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                address: newAddress,
                pendingFields: {
                    address: null,
                },
            },
        },
    ];

    API.write(WRITE_COMMANDS.UPDATE_POLICY_ADDRESS, parameters, {
        optimisticData,
        finallyData,
    });
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
                                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.reimburse.updateCustomUnitError'),
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
    const userDetails = PersonalDetailsUtils.getPersonalDetailByEmail(sessionEmail);
    const displayName = userDetails?.displayName?.trim();

    if (!PUBLIC_DOMAINS.some((publicDomain) => publicDomain === domain.toLowerCase())) {
        defaultWorkspaceName = `${Str.UCFirst(domain.split('.')[0])}'s Workspace`;
    } else if (displayName) {
        defaultWorkspaceName = `${Str.UCFirst(displayName)}'s Workspace`;
    } else if (PUBLIC_DOMAINS.some((publicDomain) => publicDomain === domain.toLowerCase())) {
        defaultWorkspaceName = `${Str.UCFirst(username)}'s Workspace`;
    } else {
        defaultWorkspaceName = userDetails?.phoneNumber ?? '';
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

function buildOptimisticCustomUnits(reportCurrency?: string): OptimisticCustomUnits {
    const currency = reportCurrency ?? allPersonalDetails?.[sessionAccountID]?.localCurrencyCode ?? CONST.CURRENCY.USD;
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
                    enabled: true,
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
                areCategoriesEnabled: true,
                outputCurrency,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                customUnits,
                makeMeAdmin,
                autoReporting: true,
                autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
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
                pendingFields: {
                    autoReporting: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    approvalMode: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    reimbursementChoice: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        },
    ];

    Onyx.update(optimisticData);
}

/**
 * Generates onyx data for creating a new workspace
 *
 * @param [policyOwnerEmail] the email of the account to make the owner of the policy
 * @param [makeMeAdmin] leave the calling account as an admin on the policy
 * @param [policyName] custom policy name we will use for created workspace
 * @param [policyID] custom policy id we will use for created workspace
 * @param [expenseReportId] the reportID of the expense report that is being used to create the workspace
 */
function buildPolicyData(policyOwnerEmail = '', makeMeAdmin = false, policyName = '', policyID = generatePolicyID(), expenseReportId?: string) {
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
    } = ReportUtils.buildOptimisticWorkspaceChats(policyID, workspaceName, expenseReportId);

    const optimisticCategoriesData = buildOptimisticPolicyCategories(policyID, CONST.POLICY.DEFAULT_CATEGORIES);

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
                autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
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
                chatReportIDAdmins: makeMeAdmin ? Number(adminsChatReportID) : undefined,
                pendingFields: {
                    autoReporting: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    approvalMode: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    reimbursementChoice: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    name: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    outputCurrency: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    address: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    description: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
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
            key: `${ONYXKEYS.COLLECTION.REPORT_DRAFT}${announceChatReportID}`,
            value: null,
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
            key: `${ONYXKEYS.COLLECTION.REPORT_DRAFT}${expenseChatReportID}`,
            value: null,
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingAction: null,
                pendingFields: {
                    autoReporting: null,
                    approvalMode: null,
                    reimbursementChoice: null,
                    name: null,
                    outputCurrency: null,
                    address: null,
                    description: null,
                },
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
                isOptimisticReport: false,
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
                isOptimisticReport: false,
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
                isOptimisticReport: false,
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

    if (optimisticCategoriesData.optimisticData) {
        optimisticData.push(...optimisticCategoriesData.optimisticData);
    }

    if (optimisticCategoriesData.failureData) {
        failureData.push(...optimisticCategoriesData.failureData);
    }

    if (optimisticCategoriesData.successData) {
        successData.push(...optimisticCategoriesData.successData);
    }

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

    return {successData, optimisticData, failureData, params};
}

/**
 * Optimistically creates a new workspace and default workspace chats
 *
 * @param [policyOwnerEmail] the email of the account to make the owner of the policy
 * @param [makeMeAdmin] leave the calling account as an admin on the policy
 * @param [policyName] custom policy name we will use for created workspace
 * @param [policyID] custom policy id we will use for created workspace
 */
function createWorkspace(policyOwnerEmail = '', makeMeAdmin = false, policyName = '', policyID = generatePolicyID()): CreateWorkspaceParams {
    const {optimisticData, failureData, successData, params} = buildPolicyData(policyOwnerEmail, makeMeAdmin, policyName, policyID);
    API.write(WRITE_COMMANDS.CREATE_WORKSPACE, params, {optimisticData, successData, failureData});

    return params;
}

/**
 * Creates a draft workspace for various money request flows
 *
 * @param [policyOwnerEmail] the email of the account to make the owner of the policy
 * @param [makeMeAdmin] leave the calling account as an admin on the policy
 * @param [policyName] custom policy name we will use for created workspace
 * @param [policyID] custom policy id we will use for created workspace
 */
function createDraftWorkspace(policyOwnerEmail = '', makeMeAdmin = false, policyName = '', policyID = generatePolicyID()): CreateWorkspaceParams {
    const workspaceName = policyName || generateDefaultWorkspaceName(policyOwnerEmail);

    const {customUnits, customUnitID, customUnitRateID, outputCurrency} = buildOptimisticCustomUnits();

    const {expenseChatData, announceChatReportID, announceCreatedReportActionID, adminsChatReportID, adminsCreatedReportActionID, expenseChatReportID, expenseCreatedReportActionID} =
        ReportUtils.buildOptimisticWorkspaceChats(policyID, workspaceName);

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
                autoReporting: true,
                autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
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
                chatReportIDAdmins: makeMeAdmin ? Number(adminsChatReportID) : undefined,
                pendingFields: {
                    autoReporting: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    approvalMode: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    reimbursementChoice: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_DRAFT}${expenseChatReportID}`,
            value: expenseChatData,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${policyID}`,
            value: CONST.POLICY.DEFAULT_CATEGORIES.reduce<Record<string, PolicyCategory>>((acc, category) => {
                acc[category] = {
                    name: category,
                    enabled: true,
                    errors: null,
                };
                return acc;
            }, {}),
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

    Onyx.update(optimisticData);

    return params;
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

function openPolicyCompanyCardsPage(policyID: string, workspaceAccountID: number) {
    const authToken = NetworkStore.getAuthToken();

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`,
            value: {
                isLoading: true,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`,
            value: {
                isLoading: false,
            },
        },
    ];

    const params: OpenPolicyExpensifyCardsPageParams = {
        policyID,
        authToken,
    };

    API.read(READ_COMMANDS.OPEN_POLICY_COMPANY_CARDS_PAGE, params, {optimisticData, successData, failureData});
}

function openPolicyExpensifyCardsPage(policyID: string, workspaceAccountID: number) {
    const authToken = NetworkStore.getAuthToken();

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`,
            value: {
                isLoading: true,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`,
            value: {
                isLoading: false,
            },
        },
    ];

    const params: OpenPolicyExpensifyCardsPageParams = {
        policyID,
        authToken,
    };

    API.read(READ_COMMANDS.OPEN_POLICY_EXPENSIFY_CARDS_PAGE, params, {optimisticData, successData, failureData});
}

function openPolicyEditCardLimitTypePage(policyID: string, cardID: number) {
    const authToken = NetworkStore.getAuthToken();

    const params: OpenPolicyEditCardLimitTypePageParams = {
        policyID,
        authToken,
        cardID,
    };

    API.read(READ_COMMANDS.OPEN_POLICY_EDIT_CARD_LIMIT_TYPE_PAGE, params);
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
    if (policyID === '-1' || policyID === CONST.POLICY.ID_FAKE) {
        Log.warn('openDraftWorkspaceRequest invalid params', {policyID});
        return;
    }

    const params: OpenDraftWorkspaceRequestParams = {policyID};

    API.read(READ_COMMANDS.OPEN_DRAFT_WORKSPACE_REQUEST, params);
}

function requestExpensifyCardLimitIncrease(settlementBankAccountID?: number) {
    if (!settlementBankAccountID) {
        return;
    }

    const authToken = NetworkStore.getAuthToken();

    const params: RequestExpensifyCardLimitIncreaseParams = {
        authToken,
        settlementBankAccountID,
    };

    API.write(WRITE_COMMANDS.REQUEST_EXPENSIFY_CARD_LIMIT_INCREASE, params);
}

function setWorkspaceInviteMessageDraft(policyID: string, message: string | null) {
    Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MESSAGE_DRAFT}${policyID}`, message);
}

function clearErrors(policyID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {errors: null});
    hideWorkspaceAlertMessage(policyID);
}

/**
 * Dismiss the informative messages about which policy members were added with primary logins when invited with their secondary login.
 */
function dismissAddedWithPrimaryLoginMessages(policyID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {primaryLoginsInvited: null});
}

function buildOptimisticRecentlyUsedCurrencies(currency?: string) {
    if (!currency) {
        return [];
    }

    return lodashUnion([currency], allRecentlyUsedCurrencies).slice(0, CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW);
}

/**
 * This flow is used for bottom up flow converting IOU report to an expense report. When user takes this action,
 * we create a Collect type workspace when the person taking the action becomes an owner and an admin, while we
 * add a new member to the workspace as an employee and convert the IOU report passed as a param into an expense report.
 *
 * @returns policyID of the workspace we have created
 */
function createWorkspaceFromIOUPayment(iouReport: OnyxEntry<Report>): WorkspaceFromIOUCreationData | undefined {
    // This flow only works for IOU reports
    if (!ReportUtils.isIOUReportUsingReport(iouReport)) {
        return;
    }

    // Generate new variables for the policy
    const policyID = generatePolicyID();
    const workspaceName = generateDefaultWorkspaceName(sessionEmail);
    const employeeAccountID = iouReport.ownerAccountID;
    const employeeEmail = iouReport.ownerEmail ?? '';
    const {customUnits, customUnitID, customUnitRateID} = buildOptimisticCustomUnits(iouReport.currency);
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
        autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
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
        pendingFields: {
            autoReporting: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            approvalMode: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            reimbursementChoice: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
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
    ];
    optimisticData.push(...employeeWorkspaceChat.onyxOptimisticData);

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingAction: null,
                pendingFields: {
                    autoReporting: null,
                    approvalMode: null,
                    reimbursementChoice: null,
                },
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
    ];
    successData.push(...employeeWorkspaceChat.onyxSuccessData);

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
    const parentReport = ReportActionsConnection.getAllReportActions()?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.parentReportID}`];
    const parentReportActionID = iouReport.parentReportActionID;
    const reportPreview = iouReport?.parentReportID && parentReportActionID ? parentReport?.[parentReportActionID] : undefined;

    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldChatReportID}`,
        value: {[reportPreview?.reportActionID ?? '-1']: null},
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oldChatReportID}`,
        value: {[reportPreview?.reportActionID ?? '-1']: reportPreview},
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
                            text: ReportUtils.getReportPreviewMessage(expenseReport, null, false, false, newWorkspace),
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
        value: {[reportPreview?.reportActionID ?? '-1']: null},
    });

    // Create the MOVED report action and add it to the DM chat which indicates to the user where the report has been moved
    const movedReportAction = ReportUtils.buildOptimisticMovedReportAction(oldPersonalPolicyID ?? '-1', policyID, memberData.workspaceChatReportID, iouReportID, workspaceName);
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

    // We know that this new workspace has no BankAccount yet, so we can set
    // the reimbursement account to be immediately in the setup state for a new bank account:
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.REIMBURSEMENT_ACCOUNT}`,
        value: {
            isLoading: false,
            achData: {
                currentStep: CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT,
                policyID,
                subStep: '',
            },
        },
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.REIMBURSEMENT_ACCOUNT}`,
        value: CONST.REIMBURSEMENT_ACCOUNT.DEFAULT_DATA,
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

    return {policyID, workspaceChatReportID: memberData.workspaceChatReportID, reportPreviewReportActionID: reportPreview?.reportActionID};
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

    if (enabled && getIsNarrowLayout()) {
        navigateWhenEnableFeature(policyID);
    }
}

/** Save the preferred export method for a policy */
function savePreferredExportMethod(policyID: string, exportMethod: ReportExportType) {
    Onyx.merge(`${ONYXKEYS.LAST_EXPORT_METHOD}`, {[policyID]: exportMethod});
}

function enableExpensifyCard(policyID: string, enabled: boolean) {
    const authToken = NetworkStore.getAuthToken();
    if (!authToken) {
        return;
    }
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areExpensifyCardsEnabled: enabled,
                    pendingFields: {
                        areExpensifyCardsEnabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
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
                        areExpensifyCardsEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areExpensifyCardsEnabled: !enabled,
                    pendingFields: {
                        areExpensifyCardsEnabled: null,
                    },
                },
            },
        ],
    };

    const parameters: EnablePolicyExpensifyCardsParams = {authToken, policyID, enabled};

    API.write(WRITE_COMMANDS.ENABLE_POLICY_EXPENSIFY_CARDS, parameters, onyxData);

    if (enabled && getIsNarrowLayout()) {
        navigateWhenEnableFeature(policyID);
    }
}

function enableCompanyCards(policyID: string, enabled: boolean) {
    const authToken = NetworkStore.getAuthToken();

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areCompanyCardsEnabled: enabled,
                    pendingFields: {
                        areCompanyCardsEnabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
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
                        areCompanyCardsEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areCompanyCardsEnabled: !enabled,
                    pendingFields: {
                        areCompanyCardsEnabled: null,
                    },
                },
            },
        ],
    };

    const parameters: EnablePolicyCompanyCardsParams = {authToken, policyID, enabled};

    API.write(WRITE_COMMANDS.ENABLE_POLICY_COMPANY_CARDS, parameters, onyxData);

    if (enabled && getIsNarrowLayout()) {
        navigateWhenEnableFeature(policyID);
    }
}

function enablePolicyReportFields(policyID: string, enabled: boolean, disableRedirect = false) {
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

    if (enabled && getIsNarrowLayout() && !disableRedirect) {
        navigateWhenEnableFeature(policyID);
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
                            ...Object.keys(defaultTaxRates.taxes).reduce((acc, taxKey) => {
                                acc[taxKey] = {
                                    ...defaultTaxRates.taxes[taxKey],
                                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                                };
                                return acc;
                            }, {} as Record<string, TaxRate & {pendingAction: typeof CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}>),
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
                            ...Object.keys(defaultTaxRates.taxes).reduce((acc, taxKey) => {
                                acc[taxKey] = {pendingAction: null};
                                return acc;
                            }, {} as Record<string, {pendingAction: null}>),
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

    const optimisticData: OnyxUpdate[] = [
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
    ];
    optimisticData.push(...(shouldAddDefaultTaxRatesData ? taxRatesData.optimisticData ?? [] : []));

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {
                    tax: null,
                },
            },
        },
    ];
    successData.push(...(shouldAddDefaultTaxRatesData ? taxRatesData.successData ?? [] : []));

    const failureData: OnyxUpdate[] = [
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
    ];
    failureData.push(...(shouldAddDefaultTaxRatesData ? taxRatesData.failureData ?? [] : []));

    const onyxData: OnyxData = {
        optimisticData,
        successData,
        failureData,
    };

    const parameters: EnablePolicyTaxesParams = {policyID, enabled};
    if (shouldAddDefaultTaxRatesData) {
        parameters.taxFields = JSON.stringify(defaultTaxRates);
    }
    API.write(WRITE_COMMANDS.ENABLE_POLICY_TAXES, parameters, onyxData);

    if (enabled && getIsNarrowLayout()) {
        navigateWhenEnableFeature(policyID);
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
                              approvalMode: policy?.approvalMode,
                              autoReporting: policy?.autoReporting,
                              harvesting: policy?.harvesting,
                              reimbursementChoice: policy?.reimbursementChoice,
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

    if (enabled && getIsNarrowLayout()) {
        navigateWhenEnableFeature(policyID);
    }
}

const DISABLED_MAX_EXPENSE_VALUES: Pick<Policy, 'maxExpenseAmountNoReceipt' | 'maxExpenseAmount' | 'maxExpenseAge'> = {
    maxExpenseAmountNoReceipt: CONST.DISABLED_MAX_EXPENSE_VALUE,
    maxExpenseAmount: CONST.DISABLED_MAX_EXPENSE_VALUE,
    maxExpenseAge: CONST.DISABLED_MAX_EXPENSE_VALUE,
};

function enablePolicyRules(policyID: string, enabled: boolean, disableRedirect = false) {
    const policy = getPolicy(policyID);
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areRulesEnabled: enabled,
                    ...(!enabled ? DISABLED_MAX_EXPENSE_VALUES : {}),
                    pendingFields: {
                        areRulesEnabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
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
                        areRulesEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areRulesEnabled: !enabled,
                    ...(!enabled
                        ? {
                              maxExpenseAmountNoReceipt: policy?.maxExpenseAmountNoReceipt,
                              maxExpenseAmount: policy?.maxExpenseAmount,
                              maxExpenseAge: policy?.maxExpenseAge,
                          }
                        : {}),
                    pendingFields: {
                        areRulesEnabled: null,
                    },
                },
            },
        ],
    };

    const parameters: SetPolicyRulesEnabledParams = {policyID, enabled};
    API.write(WRITE_COMMANDS.SET_POLICY_RULES_ENABLED, parameters, onyxData);

    if (enabled && getIsNarrowLayout() && !disableRedirect) {
        navigateWhenEnableFeature(policyID);
    }
}

function enableDistanceRequestTax(policyID: string, customUnitName: string, customUnitID: string, attributes: Attributes) {
    const policy = getPolicy(policyID);
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    customUnits: {
                        [customUnitID]: {
                            attributes,
                            pendingFields: {
                                taxEnabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
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
                    customUnits: {
                        [customUnitID]: {
                            pendingFields: {
                                taxEnabled: null,
                            },
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
                    customUnits: {
                        [customUnitID]: {
                            attributes: policy?.customUnits ? policy?.customUnits[customUnitID].attributes : null,
                            errorFields: {
                                taxEnabled: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        ],
    };

    const params = {
        policyID,
        customUnit: JSON.stringify({
            customUnitName,
            customUnitID,
            attributes,
        }),
    };
    API.write(WRITE_COMMANDS.ENABLE_DISTANCE_REQUEST_TAX, params, onyxData);
}

function enablePolicyInvoicing(policyID: string, enabled: boolean) {
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areInvoicesEnabled: enabled,
                    pendingFields: {
                        areInvoicesEnabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
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
                        areInvoicesEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areInvoicesEnabled: !enabled,
                    pendingFields: {
                        areInvoicesEnabled: null,
                    },
                },
            },
        ],
    };

    const parameters: EnablePolicyInvoicingParams = {policyID, enabled};

    API.write(WRITE_COMMANDS.ENABLE_POLICY_INVOICING, parameters, onyxData);

    // TODO: Uncomment the following line when the invoices screen is ready - https://github.com/Expensify/App/issues/45175.
    // if (enabled && getIsNarrowLayout()) {
    //     navigateWhenEnableFeature(policyID);
    // }
}

function openPolicyMoreFeaturesPage(policyID: string) {
    const params: OpenPolicyMoreFeaturesPageParams = {policyID};

    API.read(READ_COMMANDS.OPEN_POLICY_MORE_FEATURES_PAGE, params);
}

function openPolicyProfilePage(policyID: string) {
    const params: OpenPolicyProfilePageParams = {policyID};

    API.read(READ_COMMANDS.OPEN_POLICY_PROFILE_PAGE, params);
}

function openPolicyInitialPage(policyID: string) {
    const params: OpenPolicyInitialPageParams = {policyID};

    API.read(READ_COMMANDS.OPEN_POLICY_INITIAL_PAGE, params);
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
                        errorFields: {name: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
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
                        errorFields: {defaultExternalID: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
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
                        errorFields: {foreignTaxDefault: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
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

function upgradeToCorporate(policyID: string, featureName: string) {
    const policy = getPolicy(policyID);
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `policy_${policyID}`,
            value: {
                isPendingUpgrade: true,
                type: CONST.POLICY.TYPE.CORPORATE,
                maxExpenseAge: CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE,
                maxExpenseAmount: CONST.POLICY.DEFAULT_MAX_EXPENSE_AMOUNT,
                maxExpenseAmountNoReceipt: CONST.POLICY.DEFAULT_MAX_AMOUNT_NO_RECEIPT,
                glCodes: true,
                ...(PolicyUtils.isInstantSubmitEnabled(policy) && {
                    autoReporting: true,
                    autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
                }),
                harvesting: {
                    enabled: false,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `policy_${policyID}`,
            value: {
                isPendingUpgrade: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `policy_${policyID}`,
            value: {
                isPendingUpgrade: false,
                type: policy?.type,
                maxExpenseAge: policy?.maxExpenseAge ?? null,
                maxExpenseAmount: policy?.maxExpenseAmount ?? null,
                maxExpenseAmountNoReceipt: policy?.maxExpenseAmountNoReceipt ?? null,
                glCodes: policy?.glCodes ?? null,
                autoReporting: policy?.autoReporting ?? null,
                autoReportingFrequency: policy?.autoReportingFrequency ?? null,
                harvesting: policy?.harvesting ?? null,
            },
        },
    ];

    const parameters: UpgradeToCorporateParams = {policyID, featureName};

    API.write(WRITE_COMMANDS.UPGRADE_TO_CORPORATE, parameters, {optimisticData, successData, failureData});
}

function setWorkspaceDefaultSpendCategory(policyID: string, groupID: string, category: string) {
    const policy = getPolicy(policyID);
    if (!policy) {
        return;
    }

    const {mccGroup} = policy;

    const optimisticData: OnyxUpdate[] = mccGroup
        ? [
              {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `policy_${policyID}`,
                  value: {
                      mccGroup: {
                          ...mccGroup,
                          [groupID]: {
                              category,
                              groupID,
                          },
                      },
                  },
              },
          ]
        : [];

    const failureData: OnyxUpdate[] = mccGroup
        ? [
              {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `policy_${policyID}`,
                  value: {
                      mccGroup,
                  },
              },
          ]
        : [];

    API.write(WRITE_COMMANDS.SET_WORKSPACE_DEFAULT_SPEND_CATEGORY, {policyID, groupID, category}, {optimisticData, successData: [], failureData});
}
/**
 * Call the API to set the receipt required amount for the given policy
 * @param policyID - id of the policy to set the receipt required amount
 * @param maxExpenseAmountNoReceipt - new value of the receipt required amount
 */
function setPolicyMaxExpenseAmountNoReceipt(policyID: string, maxExpenseAmountNoReceipt: string) {
    const policy = getPolicy(policyID);
    const parsedMaxExpenseAmountNoReceipt = maxExpenseAmountNoReceipt === '' ? CONST.DISABLED_MAX_EXPENSE_VALUE : CurrencyUtils.convertToBackendAmount(parseFloat(maxExpenseAmountNoReceipt));
    const originalMaxExpenseAmountNoReceipt = policy?.maxExpenseAmountNoReceipt;

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    maxExpenseAmountNoReceipt: parsedMaxExpenseAmountNoReceipt,
                    pendingFields: {
                        maxExpenseAmountNoReceipt: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    pendingFields: {maxExpenseAmountNoReceipt: null},
                    errorFields: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    maxExpenseAmountNoReceipt: originalMaxExpenseAmountNoReceipt,
                    pendingFields: {maxExpenseAmountNoReceipt: null},
                    errorFields: {maxExpenseAmountNoReceipt: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                },
            },
        ],
    };

    const parameters = {
        policyID,
        maxExpenseAmountNoReceipt: parsedMaxExpenseAmountNoReceipt,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_EXPENSE_MAX_AMOUNT_NO_RECEIPT, parameters, onyxData);
}

/**
 * Call the API to set the max expense amount for the given policy
 * @param policyID - id of the policy to set the max expense amount
 * @param maxExpenseAmount - new value of the max expense amount
 */
function setPolicyMaxExpenseAmount(policyID: string, maxExpenseAmount: string) {
    const policy = getPolicy(policyID);
    const parsedMaxExpenseAmount = maxExpenseAmount === '' ? CONST.DISABLED_MAX_EXPENSE_VALUE : CurrencyUtils.convertToBackendAmount(parseFloat(maxExpenseAmount));
    const originalMaxExpenseAmount = policy?.maxExpenseAmount;

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    maxExpenseAmount: parsedMaxExpenseAmount,
                    pendingFields: {
                        maxExpenseAmount: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    pendingFields: {maxExpenseAmount: null},
                    errorFields: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    maxExpenseAmount: originalMaxExpenseAmount,
                    pendingFields: {maxExpenseAmount: null},
                    errorFields: {maxExpenseAmount: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                },
            },
        ],
    };

    const parameters = {
        policyID,
        maxExpenseAmount: parsedMaxExpenseAmount,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_EXPENSE_MAX_AMOUNT, parameters, onyxData);
}

/**
 * Call the API to set the max expense age for the given policy
 * @param policyID - id of the policy to set the max expense age
 * @param maxExpenseAge - the max expense age value given in days
 */
function setPolicyMaxExpenseAge(policyID: string, maxExpenseAge: string) {
    const policy = getPolicy(policyID);
    const parsedMaxExpenseAge = maxExpenseAge === '' ? CONST.DISABLED_MAX_EXPENSE_VALUE : parseInt(maxExpenseAge, 10);
    const originalMaxExpenseAge = policy?.maxExpenseAge;

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    maxExpenseAge: parsedMaxExpenseAge,
                    pendingFields: {
                        maxExpenseAge: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
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
                        maxExpenseAge: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    maxExpenseAge: originalMaxExpenseAge,
                    pendingFields: {maxExpenseAge: null},
                    errorFields: {maxExpenseAge: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                },
            },
        ],
    };

    const parameters = {
        policyID,
        maxExpenseAge: parsedMaxExpenseAge,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_EXPENSE_MAX_AGE, parameters, onyxData);
}

/**
 * Call the API to enable or disable the billable mode for the given policy
 * @param policyID - id of the policy to enable or disable the bilable mode
 * @param defaultBillable - whether the billable mode is enabled in the given policy
 */
function setPolicyBillableMode(policyID: string, defaultBillable: boolean) {
    const policy = getPolicy(policyID);

    const originalDefaultBillable = policy?.defaultBillable;
    const originalDefaultBillableDisabled = policy?.disabledFields?.defaultBillable;

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    defaultBillable,
                    disabledFields: {
                        defaultBillable: false,
                    },
                    pendingFields: {
                        defaultBillable: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        disabledFields: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
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
                        defaultBillable: null,
                        disabledFields: null,
                    },
                    errorFields: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    disabledFields: {defaultBillable: originalDefaultBillableDisabled},
                    defaultBillable: originalDefaultBillable,
                    pendingFields: {defaultBillable: null, disabledFields: null},
                    errorFields: {defaultBillable: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                },
            },
        ],
    };

    const parameters: SetPolicyBillableModeParams = {
        policyID,
        defaultBillable,
        disabledFields: JSON.stringify({
            defaultBillable: false,
        }),
    };

    API.write(WRITE_COMMANDS.SET_POLICY_BILLABLE_MODE, parameters, onyxData);
}

/**
 * Call the API to disable the billable mode for the given policy
 * @param policyID - id of the policy to enable or disable the bilable mode
 */
function disableWorkspaceBillableExpenses(policyID: string) {
    const policy = getPolicy(policyID);
    const originalDefaultBillableDisabled = policy?.disabledFields?.defaultBillable;

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    disabledFields: {
                        defaultBillable: true,
                    },
                    pendingFields: {
                        disabledFields: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
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
                        disabledFields: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    pendingFields: {disabledFields: null},
                    disabledFields: {defaultBillable: originalDefaultBillableDisabled},
                },
            },
        ],
    };

    const parameters: DisablePolicyBillableModeParams = {
        policyID,
    };

    API.write(WRITE_COMMANDS.DISABLE_POLICY_BILLABLE_MODE, parameters, onyxData);
}

function setWorkspaceEReceiptsEnabled(policyID: string, eReceipts: boolean) {
    const policy = getPolicy(policyID);

    const originalEReceipts = policy?.eReceipts;

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    eReceipts,
                    pendingFields: {
                        eReceipts: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
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
                        eReceipts: null,
                    },
                    errorFields: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    eReceipts: originalEReceipts,
                    pendingFields: {defaultBillable: null},
                    errorFields: {defaultBillable: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                },
            },
        ],
    };

    const parameters = {
        policyID,
        eReceipts,
    };

    API.write(WRITE_COMMANDS.SET_WORKSPACE_ERECEIPTS_ENABLED, parameters, onyxData);
}

function getAdminPoliciesConnectedToSageIntacct(): Policy[] {
    return Object.values(allPolicies ?? {}).filter<Policy>((policy): policy is Policy => !!policy && policy.role === CONST.POLICY.ROLE.ADMIN && !!policy?.connections?.intacct);
}

function getAdminPoliciesConnectedToNetSuite(): Policy[] {
    return Object.values(allPolicies ?? {}).filter<Policy>((policy): policy is Policy => !!policy && policy.role === CONST.POLICY.ROLE.ADMIN && !!policy?.connections?.netsuite);
}

/**
 * Call the API to enable custom report title for the reports in the given policy
 * @param policyID - id of the policy to apply the limit to
 * @param enabled - whether custom report title for the reports is enabled in the given policy
 */
function enablePolicyDefaultReportTitle(policyID: string, enabled: boolean) {
    const policy = getPolicy(policyID);

    if (enabled === policy?.shouldShowCustomReportTitleOption) {
        return;
    }

    const previousReportTitleField = policy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE] ?? {};
    const titleFieldValues = enabled ? {} : {fieldList: {[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]: {...previousReportTitleField, defaultValue: CONST.POLICY.DEFAULT_REPORT_NAME_PATTERN}}};

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                shouldShowCustomReportTitleOption: enabled,
                ...titleFieldValues,
                pendingFields: {
                    shouldShowCustomReportTitleOption: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {
                    shouldShowCustomReportTitleOption: null,
                },
                errorFields: null,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                shouldShowCustomReportTitleOption: !!policy?.shouldShowCustomReportTitleOption,
                fieldList: {
                    [CONST.POLICY.FIELDS.FIELD_LIST_TITLE]: previousReportTitleField,
                },
                pendingFields: {
                    shouldShowCustomReportTitleOption: null,
                },
                errorFields: {
                    shouldShowCustomReportTitleOption: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];

    const parameters: EnablePolicyDefaultReportTitleParams = {
        enable: enabled,
        policyID,
    };

    API.write(WRITE_COMMANDS.ENABLE_POLICY_DEFAULT_REPORT_TITLE, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

/**
 * Call the API to set default report title pattern for the given policy
 * @param policyID - id of the policy to apply the naming pattern to
 * @param customName - name pattern to be used for the reports
 */
function setPolicyDefaultReportTitle(policyID: string, customName: string) {
    const policy = getPolicy(policyID);

    if (customName === policy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]?.defaultValue) {
        return;
    }

    const previousReportTitleField = policy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE] ?? {};

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                fieldList: {
                    [CONST.POLICY.FIELDS.FIELD_LIST_TITLE]: {
                        defaultValue: customName,
                        pendingFields: {defaultValue: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
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
                fieldList: {
                    [CONST.POLICY.FIELDS.FIELD_LIST_TITLE]: {pendingFields: {defaultValue: null}},
                },
                errorFields: null,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                fieldList: {
                    [CONST.POLICY.FIELDS.FIELD_LIST_TITLE]: {...previousReportTitleField, pendingFields: {defaultValue: null}},
                },
                errorFields: {
                    fieldList: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];

    const parameters: SetPolicyDefaultReportTitleParams = {
        value: customName,
        policyID,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_DEFAULT_REPORT_TITLE, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

/**
 * Call the API to enable or disable enforcing the naming pattern for member created reports on a policy
 * @param policyID - id of the policy to apply the naming pattern to
 * @param enforced - flag whether to enforce policy name
 */
function setPolicyPreventMemberCreatedTitle(policyID: string, enforced: boolean) {
    const policy = getPolicy(policyID);

    if (!enforced === policy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE].deletable) {
        return;
    }

    const previousReportTitleField = policy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE] ?? {};

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                fieldList: {
                    [CONST.POLICY.FIELDS.FIELD_LIST_TITLE]: {...previousReportTitleField, deletable: !enforced, pendingFields: {deletable: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}},
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                fieldList: {
                    [CONST.POLICY.FIELDS.FIELD_LIST_TITLE]: {pendingFields: {deletable: null}},
                },
                errorFields: null,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                fieldList: {
                    [CONST.POLICY.FIELDS.FIELD_LIST_TITLE]: {...previousReportTitleField, pendingFields: {deletable: null}},
                },
                errorFields: {
                    fieldList: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];

    const parameters: SetPolicyPreventMemberCreatedTitleParams = {
        enforced,
        policyID,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_PREVENT_MEMBER_CREATED_TITLE, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

/**
 * Call the API to enable or disable self approvals for the reports
 * @param policyID - id of the policy to apply the naming pattern to
 * @param preventSelfApproval - flag whether to prevent workspace members from approving their own expense reports
 */
function setPolicyPreventSelfApproval(policyID: string, preventSelfApproval: boolean) {
    const policy = getPolicy(policyID);

    if (preventSelfApproval === policy?.preventSelfApproval) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                preventSelfApproval,
                pendingFields: {
                    preventSelfApproval: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {
                    preventSelfApproval: null,
                },
                errorFields: null,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                preventSelfApproval: policy?.preventSelfApproval ?? false,
                pendingFields: {
                    preventSelfApproval: null,
                },
                errorFields: {
                    preventSelfApproval: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];

    const parameters: SetPolicyPreventSelfApprovalParams = {
        preventSelfApproval,
        policyID,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_PREVENT_SELF_APPROVAL, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

/**
 * Call the API to apply automatic approval limit for the given policy
 * @param policyID - id of the policy to apply the limit to
 * @param limit - max amount for auto-approval of the reports in the given policy
 */
function setPolicyAutomaticApprovalLimit(policyID: string, limit: string) {
    const policy = getPolicy(policyID);

    const fallbackLimit = limit === '' ? '0' : limit;
    const parsedLimit = CurrencyUtils.convertToBackendAmount(parseFloat(fallbackLimit));

    if (parsedLimit === policy?.autoApproval?.limit ?? CONST.POLICY.AUTO_APPROVE_REPORTS_UNDER_DEFAULT_CENTS) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                autoApproval: {
                    limit: parsedLimit,
                    pendingFields: {limit: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                autoApproval: {
                    pendingFields: {
                        limit: null,
                    },
                },
                errorFields: null,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                autoApproval: {
                    limit: policy?.autoApproval?.limit ?? CONST.POLICY.AUTO_APPROVE_REPORTS_UNDER_DEFAULT_CENTS,
                    pendingFields: {
                        limit: null,
                    },
                },
                errorFields: {
                    autoApproval: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];

    const parameters: SetPolicyAutomaticApprovalLimitParams = {
        limit: parsedLimit,
        policyID,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_AUTOMATIC_APPROVAL_LIMIT, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

/**
 * Call the API to set the audit rate for the given policy
 * @param policyID - id of the policy to apply the limit to
 * @param auditRate - percentage of the reports to be qualified for a random audit
 */
function setPolicyAutomaticApprovalRate(policyID: string, auditRate: string) {
    const policy = getPolicy(policyID);
    const fallbackAuditRate = auditRate === '' ? '0' : auditRate;
    const parsedAuditRate = parseInt(fallbackAuditRate, 10);

    if (parsedAuditRate === policy?.autoApproval?.auditRate ?? CONST.POLICY.RANDOM_AUDIT_DEFAULT_PERCENTAGE) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                autoApproval: {
                    auditRate: parsedAuditRate,
                    pendingFields: {
                        auditRate: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
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
                autoApproval: {
                    pendingFields: {
                        auditRate: null,
                    },
                },
                errorFields: null,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                autoApproval: {
                    auditRate: policy?.autoApproval?.auditRate ?? CONST.POLICY.RANDOM_AUDIT_DEFAULT_PERCENTAGE,
                    pendingFields: {
                        auditRate: null,
                    },
                },
                errorFields: {
                    autoApproval: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];

    const parameters: SetPolicyAutomaticApprovalRateParams = {
        auditRate: parsedAuditRate,
        policyID,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_AUTOMATIC_APPROVAL_RATE, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

/**
 * Call the API to enable auto-approval for the reports in the given policy
 * @param policyID - id of the policy to apply the limit to
 * @param enabled - whether auto-approve for the reports is enabled in the given policy
 */
function enableAutoApprovalOptions(policyID: string, enabled: boolean) {
    const policy = getPolicy(policyID);

    if (enabled === policy?.shouldShowAutoApprovalOptions) {
        return;
    }

    const autoApprovalCleanupValues = !enabled
        ? {
              pendingFields: {
                  limit: null,
                  auditRate: null,
              },
          }
        : {};
    const autoApprovalValues = !enabled ? {auditRate: CONST.POLICY.RANDOM_AUDIT_DEFAULT_PERCENTAGE, limit: CONST.POLICY.AUTO_APPROVE_REPORTS_UNDER_DEFAULT_CENTS} : {};
    const autoApprovalFailureValues = !enabled ? {autoApproval: {limit: policy?.autoApproval?.limit, auditRate: policy?.autoApproval?.auditRate, ...autoApprovalCleanupValues}} : {};

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                autoApproval: {
                    ...autoApprovalValues,
                    pendingFields: {
                        limit: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        auditRate: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
                shouldShowAutoApprovalOptions: enabled,
                pendingFields: {
                    shouldShowAutoApprovalOptions: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                autoApproval: {...autoApprovalCleanupValues},
                pendingFields: {
                    shouldShowAutoApprovalOptions: null,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                ...autoApprovalFailureValues,
                shouldShowAutoApprovalOptions: policy?.shouldShowAutoApprovalOptions,
                pendingFields: {
                    shouldShowAutoApprovalOptions: null,
                },
            },
        },
    ];

    const parameters: EnablePolicyAutoApprovalOptionsParams = {
        enabled,
        policyID,
    };

    API.write(WRITE_COMMANDS.ENABLE_POLICY_AUTO_APPROVAL_OPTIONS, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

/**
 * Call the API to set the limit for auto-payments in the given policy
 * @param policyID - id of the policy to apply the limit to
 * @param limit - max amount for auto-payment for the reports in the given policy
 */
function setPolicyAutoReimbursementLimit(policyID: string, limit: string) {
    const policy = getPolicy(policyID);
    const fallbackLimit = limit === '' ? '0' : limit;
    const parsedLimit = CurrencyUtils.convertToBackendAmount(parseFloat(fallbackLimit));

    if (parsedLimit === policy?.autoReimbursement?.limit ?? CONST.POLICY.AUTO_REIMBURSEMENT_DEFAULT_LIMIT_CENTS) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                autoReimbursement: {
                    limit: parsedLimit,
                    pendingFields: {
                        limit: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
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
                autoReimbursement: {
                    limit: parsedLimit,
                    pendingFields: {
                        limit: null,
                    },
                },
                errorFields: null,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                autoReimbursement: {limit: policy?.autoReimbursement?.limit ?? policy?.autoReimbursementLimit, pendingFields: {limit: null}},
                errorFields: {
                    autoReimbursement: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];

    const parameters: SetPolicyAutoReimbursementLimitParams = {
        autoReimbursement: {limit: parsedLimit},
        policyID,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_AUTO_REIMBURSEMENT_LIMIT, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

/**
 * Call the API to enable auto-payment for the reports in the given policy
 * @param policyID - id of the policy to apply the limit to
 * @param enabled - whether auto-payment for the reports is enabled in the given policy
 */
function enablePolicyAutoReimbursementLimit(policyID: string, enabled: boolean) {
    const policy = getPolicy(policyID);

    if (enabled === policy?.shouldShowAutoReimbursementLimitOption) {
        return;
    }

    const autoReimbursementCleanupValues = !enabled
        ? {
              pendingFields: {
                  limit: null,
              },
          }
        : {};
    const autoReimbursementFailureValues = !enabled ? {autoReimbursement: {limit: policy?.autoReimbursement?.limit, ...autoReimbursementCleanupValues}} : {};
    const autoReimbursementValues = !enabled ? {limit: CONST.POLICY.AUTO_REIMBURSEMENT_DEFAULT_LIMIT_CENTS} : {};

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                autoReimbursement: {
                    ...autoReimbursementValues,
                    pendingFields: {
                        limit: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
                shouldShowAutoReimbursementLimitOption: enabled,
                pendingFields: {
                    shouldShowAutoReimbursementLimitOption: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                autoReimbursement: {...autoReimbursementCleanupValues},
                pendingFields: {
                    shouldShowAutoReimbursementLimitOption: null,
                },
                errorFields: null,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                ...autoReimbursementFailureValues,
                shouldShowAutoReimbursementLimitOption: policy?.shouldShowAutoReimbursementLimitOption,
                pendingFields: {
                    shouldShowAutoReimbursementLimitOption: null,
                },
            },
        },
    ];

    const parameters: EnablePolicyAutoReimbursementLimitParams = {
        enabled,
        policyID,
    };

    API.write(WRITE_COMMANDS.ENABLE_POLICY_AUTO_REIMBURSEMENT_LIMIT, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

function setWorkspaceCompanyCardFeedName(policyID: string, workspaceAccountID: number, bankName: string, userDefinedName: string) {
    const authToken = NetworkStore.getAuthToken();
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`,
                value: {
                    companyCardNicknames: {
                        [bankName]: userDefinedName,
                    },
                },
            },
        ],
    };

    const parameters = {
        authToken,
        policyID,
        bankName,
        userDefinedName,
    };

    API.write(WRITE_COMMANDS.SET_COMPANY_CARD_FEED_NAME, parameters, onyxData);
}

function setWorkspaceCompanyCardTransactionLiability(workspaceAccountID: number, bankName: string, liabilityType: string) {
    const authToken = NetworkStore.getAuthToken();
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`,
                value: {
                    companyCards: {
                        [bankName]: {liabilityType},
                    },
                },
            },
        ],
    };

    const parameters = {
        authToken,
        bankName,
        liabilityType,
    };

    API.write(WRITE_COMMANDS.SET_COMPANY_CARD_TRANSACTION_LIABILITY, parameters, onyxData);
}

function deleteWorkspaceCompanyCardFeed(policyID: string, workspaceAccountID: number, bankName: string) {
    const authToken = NetworkStore.getAuthToken();

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`,
                value: {
                    companyCards: {
                        [bankName]: null,
                    },
                    companyCardNicknames: {
                        [bankName]: null,
                    },
                },
            },
        ],
    };

    const parameters = {
        authToken,
        policyID,
        bankName,
    };

    API.write(WRITE_COMMANDS.DELETE_COMPANY_CARD_FEED, parameters, onyxData);
}

function unassignWorkspaceCompanyCard(workspaceAccountID: number, cardID: string, bankName: string) {
    const authToken = NetworkStore.getAuthToken();

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${bankName}`,
                value: {
                    [cardID]: null,
                },
            },
        ],
    };

    const parameters = {
        authToken,
        cardID,
    };

    API.write(WRITE_COMMANDS.UNASSIGN_COMPANY_CARD, parameters, onyxData);
}

function updateWorkspaceCompanyCard(workspaceAccountID: number, cardID: string, bankName: string) {
    const authToken = NetworkStore.getAuthToken();
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${bankName}`,
            value: {
                [cardID]: {
                    isLoadingLastUpdated: true,
                    pendingFields: {
                        lastUpdated: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                    errorFields: {
                        lastUpdated: null,
                    },
                },
            },
        },
    ];

    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${bankName}`,
            value: {
                [cardID]: {
                    isLoadingLastUpdated: false,
                    pendingFields: {
                        lastUpdated: null,
                    },
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${bankName}`,
            value: {
                [cardID]: {
                    isLoadingLastUpdated: false,
                    pendingFields: {
                        lastUpdated: null,
                    },
                    errorFields: {
                        lastUpdated: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                    },
                },
            },
        },
    ];

    const parameters = {
        authToken,
        cardID,
    };

    API.write(WRITE_COMMANDS.UPDATE_COMPANY_CARD, parameters, {optimisticData, finallyData, failureData});
}

function updateCompanyCardName(workspaceAccountID: number, cardID: string, newCardTitle: string, bankName: string) {
    const authToken = NetworkStore.getAuthToken();

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${bankName}`,
            value: {
                [cardID]: {
                    nameValuePairs: {
                        cardTitle: newCardTitle,
                        pendingFields: {
                            cardTitle: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        },
                        errorFields: {
                            cardTitle: null,
                        },
                    },
                },
            },
        },
    ];

    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${bankName}`,
            value: {
                [cardID]: {
                    nameValuePairs: {
                        pendingFields: {
                            cardTitle: null,
                        },
                    },
                },
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${bankName}`,
            value: {
                [cardID]: {
                    nameValuePairs: {
                        pendingFields: {
                            cardTitle: null,
                        },
                        errorFields: {
                            cardTitle: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateCompanyCardNameParams = {
        authToken,
        cardID: Number(cardID),
        cardName: newCardTitle,
    };

    API.write(WRITE_COMMANDS.UPDATE_COMPANY_CARD_NAME, parameters, {optimisticData, finallyData, failureData});
}

function setCompanyCardExportAccount(workspaceAccountID: number, cardID: string, accountKey: string, newAccount: string, bankName: string) {
    const authToken = NetworkStore.getAuthToken();

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${bankName}`,
            value: {
                [cardID]: {
                    nameValuePairs: {
                        pendingFields: {
                            exportAccountDetails: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        },
                        errorFields: {
                            exportAccountDetails: null,
                        },
                        exportAccountDetails: {
                            [accountKey]: newAccount,
                        },
                    },
                },
            },
        },
    ];

    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${bankName}`,
            value: {
                [cardID]: {
                    nameValuePairs: {
                        pendingFields: {
                            exportAccountDetails: null,
                        },
                    },
                },
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${bankName}`,
            value: {
                [cardID]: {
                    nameValuePairs: {
                        pendingFields: {
                            exportAccountDetails: null,
                        },
                        errorFields: {
                            exportAccountDetails: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                        },
                    },
                },
            },
        },
    ];

    const parameters: SetCompanyCardExportAccountParams = {
        authToken,
        cardID: Number(cardID),
        exportAccountDetails: {[accountKey]: newAccount},
    };

    API.write(WRITE_COMMANDS.SET_CARD_EXPORT_ACCOUNT, parameters, {optimisticData, finallyData, failureData});
}

function clearCompanyCardErrorField(workspaceAccountID: number, cardID: string, bankName: string, fieldName: string, isRootLevel?: boolean) {
    if (isRootLevel) {
        Onyx.merge(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${bankName}`, {
            [cardID]: {
                errorFields: {[fieldName]: null},
            },
        });
        return;
    }
    Onyx.merge(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${bankName}`, {
        [cardID]: {
            nameValuePairs: {
                errorFields: {[fieldName]: null},
            },
        },
    });
}

function clearAllPolicies() {
    if (!allPolicies) {
        return;
    }
    Object.keys(allPolicies).forEach((key) => delete allPolicies[key]);
}

export {
    leaveWorkspace,
    addBillingCardAndRequestPolicyOwnerChange,
    hasActiveChatEnabledPolicies,
    setWorkspaceErrors,
    clearCustomUnitErrors,
    hideWorkspaceAlertMessage,
    deleteWorkspace,
    updateAddress,
    updateWorkspaceCustomUnitAndRate,
    updateLastAccessedWorkspace,
    clearDeleteWorkspaceError,
    openWorkspaceReimburseView,
    setPolicyIDForReimburseView,
    clearOnyxDataForReimburseView,
    setWorkspaceDefaultSpendCategory,
    setRateForReimburseView,
    setUnitForReimburseView,
    generateDefaultWorkspaceName,
    updateGeneralSettings,
    deleteWorkspaceAvatar,
    updateWorkspaceAvatar,
    clearAvatarErrors,
    generatePolicyID,
    createWorkspace,
    openPolicyTaxesPage,
    openWorkspaceInvitePage,
    openWorkspace,
    removeWorkspace,
    createWorkspaceFromIOUPayment,
    clearErrors,
    dismissAddedWithPrimaryLoginMessages,
    openDraftWorkspaceRequest,
    createDraftInitialWorkspace,
    buildOptimisticRecentlyUsedCurrencies,
    setWorkspaceInviteMessageDraft,
    setWorkspaceApprovalMode,
    setWorkspaceAutoReportingFrequency,
    setWorkspaceAutoReportingMonthlyOffset,
    updateWorkspaceDescription,
    setWorkspacePayer,
    setWorkspaceReimbursement,
    openPolicyWorkflowsPage,
    enableCompanyCards,
    enablePolicyConnections,
    enablePolicyReportFields,
    enablePolicyTaxes,
    enablePolicyWorkflows,
    enableDistanceRequestTax,
    enablePolicyInvoicing,
    openPolicyMoreFeaturesPage,
    openPolicyProfilePage,
    openPolicyInitialPage,
    generateCustomUnitID,
    clearQBOErrorField,
    clearXeroErrorField,
    clearSageIntacctErrorField,
    clearNetSuiteErrorField,
    clearNetSuitePendingField,
    clearNetSuiteAutoSyncErrorField,
    removeNetSuiteCustomFieldByIndex,
    clearWorkspaceReimbursementErrors,
    setWorkspaceCurrencyDefault,
    setForeignCurrencyDefault,
    setPolicyCustomTaxName,
    clearPolicyErrorField,
    isCurrencySupportedForDirectReimbursement,
    getPrimaryPolicy,
    getInvoicePrimaryWorkspace,
    createDraftWorkspace,
    savePreferredExportMethod,
    buildPolicyData,
    enableExpensifyCard,
    createPolicyExpenseChats,
    upgradeToCorporate,
    openPolicyExpensifyCardsPage,
    openPolicyEditCardLimitTypePage,
    requestExpensifyCardLimitIncrease,
    getAdminPoliciesConnectedToNetSuite,
    getAdminPoliciesConnectedToSageIntacct,
    hasInvoicingDetails,
    clearAllPolicies,
    enablePolicyRules,
    setPolicyDefaultReportTitle,
    setPolicyPreventMemberCreatedTitle,
    setPolicyPreventSelfApproval,
    setPolicyAutomaticApprovalLimit,
    setPolicyAutomaticApprovalRate,
    setPolicyAutoReimbursementLimit,
    enablePolicyDefaultReportTitle,
    enablePolicyAutoReimbursementLimit,
    enableAutoApprovalOptions,
    setPolicyMaxExpenseAmountNoReceipt,
    setPolicyMaxExpenseAmount,
    setPolicyMaxExpenseAge,
    setPolicyBillableMode,
    disableWorkspaceBillableExpenses,
    setWorkspaceEReceiptsEnabled,
    setWorkspaceCompanyCardFeedName,
    deleteWorkspaceCompanyCardFeed,
    setWorkspaceCompanyCardTransactionLiability,
    openPolicyCompanyCardsPage,
    unassignWorkspaceCompanyCard,
    updateWorkspaceCompanyCard,
    updateCompanyCardName,
    setCompanyCardExportAccount,
    clearCompanyCardErrorField,
};

export type {NewCustomUnit};
