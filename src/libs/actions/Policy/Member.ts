import type {OnyxCollection, OnyxCollectionInputValue, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import * as API from '@libs/API';
import type {
    AddMembersToWorkspaceParams,
    DeleteMembersFromWorkspaceParams,
    OpenPolicyMemberProfilePageParams,
    OpenWorkspaceMembersPageParams,
    RequestWorkspaceOwnerChangeParams,
    UpdateWorkspaceMembersRoleParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ApiUtils from '@libs/ApiUtils';
import DateUtils from '@libs/DateUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import fileDownload from '@libs/fileDownload';
import Log from '@libs/Log';
import enhanceParameters from '@libs/Network/enhanceParameters';
import Parser from '@libs/Parser';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import * as PhoneNumber from '@libs/PhoneNumber';
import {getDefaultApprover, isUserPolicyAdmin} from '@libs/PolicyUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as FormActions from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ImportedSpreadsheetMemberData, InvitedEmailsToAccountIDs, Policy, PolicyEmployee, PolicyOwnershipChangeChecks, Report, ReportAction, ReportActions} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type {JoinWorkspaceResolution} from '@src/types/onyx/OriginalMessage';
import type {ApprovalRule} from '@src/types/onyx/Policy';
import type {NotificationPreference, Participant} from '@src/types/onyx/Report';
import type {OnyxData} from '@src/types/onyx/Request';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {createPolicyExpenseChats} from './Policy';

type WorkspaceMembersRoleData = {
    email: string;
    role: ValueOf<typeof CONST.POLICY.ROLE>;
};

const allPolicies: OnyxCollection<Policy> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (val, key) => {
        if (!key) {
            return;
        }
        if (val === null || val === undefined) {
            delete allPolicies[key];
            return;
        }

        allPolicies[key] = val;
    },
});

let allReportActions: OnyxCollection<ReportActions>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (actions) => (allReportActions = actions),
});

let policyOwnershipChecks: Record<string, PolicyOwnershipChangeChecks>;
/** We use `connectWithoutView` here since this connection only stores non-reactive data that is needed across different pages */
Onyx.connectWithoutView({
    key: ONYXKEYS.POLICY_OWNERSHIP_CHANGE_CHECKS,
    callback: (value) => {
        policyOwnershipChecks = value ?? {};
    },
});

/** Check if the passed employee is an approver in the policy's employeeList */
function isApprover(policy: OnyxEntry<Policy>, employeeLogin: string) {
    if (policy?.approver === employeeLogin) {
        return true;
    }
    return Object.values(policy?.employeeList ?? {}).some(
        (employee) => employee?.submitsTo === employeeLogin || employee?.forwardsTo === employeeLogin || employee?.overLimitForwardsTo === employeeLogin,
    );
}

/**
 * Returns the policy of the report
 * @deprecated Get the data straight from Onyx - This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
 */
function getPolicy(policyID: string | undefined): OnyxEntry<Policy> {
    if (!allPolicies || !policyID) {
        return undefined;
    }
    return allPolicies[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
}

/**
 * Build optimistic data for adding members to the announcement/admins room
 */
function buildRoomMembersOnyxData(
    roomType: typeof CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE | typeof CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
    policyID: string,
    accountIDs: number[],
): OnyxData<typeof ONYXKEYS.COLLECTION.REPORT_METADATA | typeof ONYXKEYS.COLLECTION.REPORT> {
    const report = ReportUtils.getRoom(roomType, policyID);
    const reportMetadata = ReportUtils.getReportMetadata(report?.reportID);
    const roomMembers: OnyxData<typeof ONYXKEYS.COLLECTION.REPORT_METADATA | typeof ONYXKEYS.COLLECTION.REPORT> = {
        optimisticData: [],
        failureData: [],
        successData: [],
    };

    if (!report || accountIDs.length === 0) {
        return roomMembers;
    }

    const participantAccountIDs = [...Object.keys(report.participants ?? {}).map(Number), ...accountIDs];
    const pendingChatMembers = ReportUtils.getPendingChatMembers(accountIDs, reportMetadata?.pendingChatMembers ?? [], CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

    roomMembers.optimisticData?.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report?.reportID}`,
            value: {
                participants: ReportUtils.buildParticipantsFromAccountIDs(participantAccountIDs),
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.reportID}`,
            value: {
                pendingChatMembers,
            },
        },
    );

    roomMembers.failureData?.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report?.reportID}`,
            value: {
                participants: accountIDs.reduce((acc, curr) => {
                    Object.assign(acc, {[curr]: null});
                    return acc;
                }, {}),
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.reportID}`,
            value: {
                pendingChatMembers: reportMetadata?.pendingChatMembers ?? null,
            },
        },
    );
    roomMembers.successData?.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report?.reportID}`,
            value: {
                participants: accountIDs.reduce((acc, curr) => {
                    if (ReportUtils.isOptimisticPersonalDetail(curr)) {
                        Object.assign(acc, {[curr]: null});
                    }
                    return acc;
                }, {}),
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.reportID}`,
            value: {
                pendingChatMembers: reportMetadata?.pendingChatMembers ?? null,
            },
        },
    );
    return roomMembers;
}
/**
 * Updates the import spreadsheet data according to the result of the import
 */
function updateImportSpreadsheetData(addedMembersLength: number, updatedMembersLength: number): OnyxData<typeof ONYXKEYS.IMPORTED_SPREADSHEET> {
    const onyxData: OnyxData<typeof ONYXKEYS.IMPORTED_SPREADSHEET> = {
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.IMPORTED_SPREADSHEET,
                value: {
                    shouldFinalModalBeOpened: true,
                    importFinalModal: {
                        titleKey: 'spreadsheet.importSuccessfulTitle',
                        promptKey: 'spreadsheet.importMembersSuccessfulDescription',
                        promptKeyParams: {
                            added: addedMembersLength,
                            updated: updatedMembersLength,
                        },
                    },
                },
            },
        ],

        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.IMPORTED_SPREADSHEET,
                value: {
                    shouldFinalModalBeOpened: true,
                    importFinalModal: {
                        titleKey: 'spreadsheet.importFailedTitle',
                        promptKey: 'spreadsheet.importFailedDescription',
                    },
                },
            },
        ],
    };

    return onyxData;
}

/**
 * Build optimistic data for removing users from the announcement/admins room
 */
function removeOptimisticRoomMembers(
    roomType: typeof CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE | typeof CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
    policyID: string | undefined,
    accountIDs: number[],
): OnyxData<typeof ONYXKEYS.COLLECTION.REPORT_METADATA> {
    const roomMembers: OnyxData<typeof ONYXKEYS.COLLECTION.REPORT_METADATA> = {
        optimisticData: [],
        failureData: [],
        successData: [],
    };

    if (!policyID) {
        return roomMembers;
    }

    const report = ReportUtils.getRoom(roomType, policyID);
    const reportMetadata = ReportUtils.getReportMetadata(report?.reportID);

    if (!report) {
        return roomMembers;
    }

    const pendingChatMembers = ReportUtils.getPendingChatMembers(accountIDs, reportMetadata?.pendingChatMembers ?? [], CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

    roomMembers.optimisticData?.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${report.reportID}`,
        value: {
            pendingChatMembers,
        },
    });
    roomMembers.failureData?.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${report.reportID}`,
        value: {
            pendingChatMembers: reportMetadata?.pendingChatMembers ?? null,
        },
    });
    roomMembers.successData?.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${report.reportID}`,
        value: {
            pendingChatMembers: reportMetadata?.pendingChatMembers ?? null,
        },
    });

    return roomMembers;
}
/**
 * This function will reset the preferred exporter to the owner of the workspace
 * if the current preferred exporter is removed from the admin role.
 * @param [policyID] The id of the policy.
 * @param [loginList] The logins of the users whose roles are being updated to non-admin role or are removed from a workspace
 */
function resetAccountingPreferredExporter(policy: OnyxEntry<Policy>, loginList: string[]): OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [];
    if (!policy?.id) {
        return {optimisticData, successData, failureData};
    }
    const owner = policy?.owner ?? ReportUtils.getPersonalDetailsForAccountID(policy?.ownerAccountID).login ?? '';
    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policy.id}` as const;
    const adminLoginList = loginList.filter((login) => isUserPolicyAdmin(policy, login));
    const connections = [CONST.POLICY.CONNECTIONS.NAME.XERO, CONST.POLICY.CONNECTIONS.NAME.QBO, CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, CONST.POLICY.CONNECTIONS.NAME.QBD];

    if (!adminLoginList.length) {
        return {optimisticData, successData, failureData};
    }
    for (const connection of connections) {
        const exporter = policy?.connections?.[connection]?.config?.export?.exporter;
        if (!exporter || !adminLoginList.includes(exporter)) {
            continue;
        }

        const pendingFieldKey = connection === CONST.POLICY.CONNECTIONS.NAME.QBO ? CONST.QUICKBOOKS_CONFIG.EXPORT : CONST.QUICKBOOKS_CONFIG.EXPORTER;
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,
            value: {
                connections: {
                    [connection]: {
                        config: {
                            export: {exporter: owner},
                            pendingFields: {[pendingFieldKey]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                        },
                    },
                },
            },
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,
            value: {
                connections: {[connection]: {config: {pendingFields: {[pendingFieldKey]: null}}}},
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,
            value: {
                connections: {
                    [connection]: {
                        config: {
                            export: {exporter},
                            pendingFields: {[pendingFieldKey]: null},
                        },
                    },
                },
            },
        });
    }

    const exporter = policy?.connections?.netsuite?.options?.config?.exporter;
    if (exporter && adminLoginList.includes(exporter)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,
            value: {
                connections: {netsuite: {options: {config: {exporter: owner, pendingFields: {exporter: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}}}}},
            },
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,
            value: {
                connections: {netsuite: {options: {config: {pendingFields: {exporter: null}}}}},
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,
            value: {connections: {netsuite: {options: {config: {exporter, pendingFields: {exporter: null}}}}}},
        });
    }

    return {optimisticData, successData, failureData};
}

/**
 * Remove the passed members from the policy employeeList
 * Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
 */
function removeMembers(policyID: string, selectedMemberEmails: string[], policyMemberEmailsToAccountIDs: Record<string, number>) {
    if (selectedMemberEmails.length === 0) {
        return;
    }

    const accountIDs = selectedMemberEmails.map((email) => policyMemberEmailsToAccountIDs[email]).filter((id) => id !== undefined);

    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const policy = getPolicy(policyID);

    const workspaceChats = ReportUtils.getWorkspaceChats(policyID, accountIDs);
    // comment out for time this issue would be resolved https://github.com/Expensify/App/issues/35952
    // const optimisticClosedReportActions = workspaceChats.map(() =>
    //     ReportUtils.buildOptimisticClosedReportAction(currentUserEmail, policy?.name ?? '', CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY),
    // );

    const announceRoomMembers = removeOptimisticRoomMembers(CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, policy?.id, accountIDs);
    const adminRoomMembers = removeOptimisticRoomMembers(
        CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
        policy?.id,
        selectedMemberEmails
            .filter((login) => {
                const role = login ? policy?.employeeList?.[login]?.role : '';
                return role === CONST.POLICY.ROLE.ADMIN || role === CONST.POLICY.ROLE.AUDITOR;
            })
            .map((login) => policyMemberEmailsToAccountIDs[login]),
    );
    const preferredExporterOnyxData = resetAccountingPreferredExporter(policy, selectedMemberEmails);

    const optimisticMembersState: OnyxCollectionInputValue<PolicyEmployee> = {};
    const successMembersState: OnyxCollectionInputValue<PolicyEmployee> = {};
    const failureMembersState: OnyxCollectionInputValue<PolicyEmployee> = {};
    // Handles the case when there are multiple logins for the same account.
    // Currently, the only known case where this happens is when a user gets invited
    // with their secondary login.
    // This happens because we only have the secondary login when
    // we're inviting the user, but the backend always returns the primary login,
    // so we end up with both stored in Onyx.
    const selectedMemberEmailsWithDuplicates: string[] = [...selectedMemberEmails];
    for (const employeeEmail of Object.keys(policy?.employeeList ?? {})) {
        const personalDetails = getPersonalDetailByEmail(employeeEmail);
        // If we don't have the personal details, it means it's a secondary login
        if (personalDetails) {
            continue;
        }
        selectedMemberEmailsWithDuplicates.push(employeeEmail);
    }

    for (const email of selectedMemberEmailsWithDuplicates) {
        optimisticMembersState[email] = {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};
        successMembersState[email] = null;
        failureMembersState[email] = {
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.people.error.genericRemove'),
        };
    }

    for (const employeeEmail of Object.keys(policy?.employeeList ?? {})) {
        const employee = policy?.employeeList?.[employeeEmail];
        optimisticMembersState[employeeEmail] = optimisticMembersState[employeeEmail] ?? {};
        failureMembersState[employeeEmail] = failureMembersState[employeeEmail] ?? {};
        if (employee?.submitsTo && selectedMemberEmails.includes(employee?.submitsTo)) {
            optimisticMembersState[employeeEmail] = {
                ...optimisticMembersState[employeeEmail],
                submitsTo: policy?.owner,
            };
            successMembersState[employeeEmail] = successMembersState[employeeEmail] ?? {};
            successMembersState[employeeEmail] = {
                ...successMembersState[employeeEmail],
                submitsTo: policy?.owner,
            };
            failureMembersState[employeeEmail] = {
                ...failureMembersState[employeeEmail],
                submitsTo: employee?.submitsTo,
            };
        }
        if (employee?.forwardsTo && selectedMemberEmails.includes(employee?.forwardsTo)) {
            optimisticMembersState[employeeEmail] = {
                ...optimisticMembersState[employeeEmail],
                forwardsTo: policy?.owner,
            };
            successMembersState[employeeEmail] = successMembersState[employeeEmail] ?? {};
            successMembersState[employeeEmail] = {
                ...successMembersState[employeeEmail],
                forwardsTo: policy?.owner,
            };
            failureMembersState[employeeEmail] = {
                ...failureMembersState[employeeEmail],
                forwardsTo: employee?.forwardsTo,
            };
        }
        if (employee?.overLimitForwardsTo && selectedMemberEmails.includes(employee?.overLimitForwardsTo)) {
            optimisticMembersState[employeeEmail] = {
                ...optimisticMembersState[employeeEmail],
                overLimitForwardsTo: '',
                approvalLimit: null,
            };
            successMembersState[employeeEmail] = successMembersState[employeeEmail] ?? {};
            successMembersState[employeeEmail] = {
                ...successMembersState[employeeEmail],
                overLimitForwardsTo: '',
                approvalLimit: null,
            };
            failureMembersState[employeeEmail] = {
                ...failureMembersState[employeeEmail],
                overLimitForwardsTo: employee?.overLimitForwardsTo,
                approvalLimit: employee?.approvalLimit,
            };
        }
    }

    const approvalRules: ApprovalRule[] = policy?.rules?.approvalRules ?? [];
    const optimisticApprovalRules = approvalRules.filter((rule) => !selectedMemberEmails.includes(rule?.approver ?? ''));

    const optimisticData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_METADATA | typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS>
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,
            value: {
                employeeList: optimisticMembersState,
                approver: selectedMemberEmails.includes(policy?.approver ?? '') ? policy?.owner : policy?.approver,
                rules: {
                    ...(policy?.rules ?? {}),
                    approvalRules: optimisticApprovalRules,
                },
            },
        },
    ];
    optimisticData.push(...(announceRoomMembers.optimisticData ?? []), ...(adminRoomMembers.optimisticData ?? []), ...(preferredExporterOnyxData.optimisticData ?? []));

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,
            value: {employeeList: successMembersState},
        },
    ];
    successData.push(...(announceRoomMembers.successData ?? []), ...(adminRoomMembers.successData ?? []), ...(preferredExporterOnyxData.successData ?? []));

    const failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_METADATA | typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS>
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,
            value: {employeeList: failureMembersState, approver: policy?.approver, rules: policy?.rules},
        },
    ];
    failureData.push(...(announceRoomMembers.failureData ?? []), ...(adminRoomMembers.failureData ?? []), ...(preferredExporterOnyxData.failureData ?? []));

    const pendingChatMembers = ReportUtils.getPendingChatMembers(accountIDs, [], CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

    for (const report of workspaceChats) {
        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${report?.reportID}`,
                value: {
                    statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    oldPolicyName: policy?.name,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.reportID}`,
                value: {
                    pendingChatMembers,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`,
                value: {
                    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                    private_isArchived: true,
                },
            },
        );
        const currentTime = DateUtils.getDBTime();
        const reportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`] ?? {};
        for (const action of Object.values(reportActions)) {
            if (action.actionName !== CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                continue;
            }
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${action.childReportID}`,
                value: {
                    private_isArchived: currentTime,
                },
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${action.childReportID}`,
                value: {
                    private_isArchived: null,
                },
            });
        }
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.reportID}`,
            value: {
                pendingChatMembers: null,
            },
        });
        failureData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.reportID}`,
                value: {
                    pendingChatMembers: null,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`,
                value: {
                    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                    private_isArchived: false,
                },
            },
        );
    }
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
        const employeeListEmails = Object.keys(policy?.employeeList ?? {});
        const remainingLogins = employeeListEmails.filter((email) => !selectedMemberEmails.includes(email));
        const invitedPrimaryToSecondaryLogins: Record<string, string> = {};

        if (policy?.primaryLoginsInvited) {
            for (const key of Object.keys(policy.primaryLoginsInvited)) {
                invitedPrimaryToSecondaryLogins[policy.primaryLoginsInvited?.[key] ?? ''] = key;
            }
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

    for (const {reportID, stateNum, statusNum, oldPolicyName = null} of filteredWorkspaceChats) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                stateNum,
                statusNum,
                oldPolicyName,
            },
        });
    }
    // comment out for time this issue would be resolved https://github.com/Expensify/App/issues/35952
    // for (const [index, reportAction] of optimisticClosedReportActions.entries()) {
    //     failureData.push({
    //         onyxMethod: Onyx.METHOD.MERGE,
    //         key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${workspaceChats?.at(index)?.reportID}`,
    //         value: {[reportAction.reportActionID]: null},
    //     });
    // }

    const params: DeleteMembersFromWorkspaceParams = {
        emailList: selectedMemberEmails.join(','),
        policyID,
    };

    API.write(WRITE_COMMANDS.DELETE_MEMBERS_FROM_WORKSPACE, params, {optimisticData, successData, failureData});
}

function buildUpdateWorkspaceMembersRoleOnyxData(policyID: string, selectedMemberEmails: string[], selectedMemberAccountIDs: number[], newRole: ValueOf<typeof CONST.POLICY.ROLE>) {
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    const previousEmployeeList = {...policy?.employeeList};
    const memberRoles: WorkspaceMembersRoleData[] = selectedMemberEmails.map((login: string) => {
        return {
            email: login,
            role: newRole,
        };
    });

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.REPORT>> = [
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

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
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

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.REPORT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                employeeList: previousEmployeeList,
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.editor.genericFailureMessage'),
            },
        },
    ];

    if (newRole !== CONST.POLICY.ROLE.ADMIN) {
        const preferredExporterOnyxData = resetAccountingPreferredExporter(
            policy,
            memberRoles.map((member) => member.email),
        );
        optimisticData.push(...(preferredExporterOnyxData.optimisticData ?? []));
        successData.push(...(preferredExporterOnyxData.successData ?? []));
        failureData.push(...(preferredExporterOnyxData.failureData ?? []));
    }

    const adminRoom = ReportUtils.getAllPolicyReports(policyID).find(ReportUtils.isAdminRoom);
    if (adminRoom) {
        const failureDataParticipants: Record<number, Participant | null> = {...adminRoom.participants};
        const optimisticParticipants: Record<number, Participant | null> = {};
        if (newRole === CONST.POLICY.ROLE.ADMIN || newRole === CONST.POLICY.ROLE.AUDITOR) {
            for (const accountID of selectedMemberAccountIDs) {
                if (adminRoom?.participants?.[accountID]) {
                    continue;
                }
                optimisticParticipants[accountID] = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS};
                failureDataParticipants[accountID] = null;
            }
        } else {
            for (const accountID of selectedMemberAccountIDs) {
                if (!adminRoom?.participants?.[accountID]) {
                    continue;
                }
                optimisticParticipants[accountID] = null;
            }
        }
        if (!isEmptyObject(optimisticParticipants)) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${adminRoom.reportID}`,
                value: {
                    participants: optimisticParticipants,
                },
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${adminRoom.reportID}`,
                value: {
                    participants: failureDataParticipants,
                },
            });
        }
    }

    return {optimisticData, successData, failureData, memberRoles};
}

function updateWorkspaceMembersRole(policyID: string, selectedMemberEmails: string[], selectedMemberAccountIDs: number[], newRole: ValueOf<typeof CONST.POLICY.ROLE>) {
    const {optimisticData, successData, failureData, memberRoles} = buildUpdateWorkspaceMembersRoleOnyxData(policyID, selectedMemberEmails, selectedMemberAccountIDs, newRole);

    const params: UpdateWorkspaceMembersRoleParams = {
        policyID,
        employees: JSON.stringify(memberRoles.map((item) => ({email: item.email, role: item.role}))),
    };

    API.write(WRITE_COMMANDS.UPDATE_WORKSPACE_MEMBERS_ROLE, params, {optimisticData, successData, failureData});
}

function requestWorkspaceOwnerChange(policyID: string | undefined, currentUserAccountID: number, currentUserAccountLogin: string) {
    if (!policyID) {
        return;
    }

    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const policy = getPolicy(policyID);
    const ownershipChecks = {...policyOwnershipChecks?.[policyID]};

    const changeOwnerErrors = Object.keys(policy?.errorFields?.changeOwner ?? {});

    if (changeOwnerErrors && changeOwnerErrors.length > 0) {
        const currentError = changeOwnerErrors.at(0);
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

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
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

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                isLoading: false,
                isChangeOwnerSuccessful: true,
                isChangeOwnerFailed: false,
                owner: currentUserAccountLogin,
                ownerAccountID: currentUserAccountID,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
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

function clearWorkspaceOwnerChangeFlow(policyID: string | undefined) {
    if (!policyID) {
        return;
    }

    Onyx.merge(ONYXKEYS.POLICY_OWNERSHIP_CHANGE_CHECKS, null);
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        errorFields: null,
        isLoading: false,
        isChangeOwnerSuccessful: false,
        isChangeOwnerFailed: false,
    });
}

function buildAddMembersToWorkspaceOnyxData(
    invitedEmailsToAccountIDs: InvitedEmailsToAccountIDs,
    policy: Policy,
    policyMemberAccountIDs: number[],
    role: string,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    policyExpenseChatNotificationPreference?: NotificationPreference,
) {
    const policyID = policy.id;
    const logins = Object.keys(invitedEmailsToAccountIDs).map((memberLogin) => PhoneNumber.addSMSDomainIfPhoneNumber(memberLogin));
    const accountIDs = Object.values(invitedEmailsToAccountIDs);

    const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const;

    const {newAccountIDs, newLogins} = PersonalDetailsUtils.getNewAccountIDsAndLogins(logins, accountIDs);
    const newPersonalDetailsOnyxData = PersonalDetailsUtils.getPersonalDetailsOnyxDataForOptimisticUsers(newLogins, newAccountIDs, formatPhoneNumber);

    const announceRoomMembers = buildRoomMembersOnyxData(CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, policyID, accountIDs);
    const adminRoomMembers = buildRoomMembersOnyxData(
        CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
        policyID,
        role === CONST.POLICY.ROLE.ADMIN || role === CONST.POLICY.ROLE.AUDITOR ? accountIDs : [],
    );
    const optimisticAnnounceChat = ReportUtils.buildOptimisticAnnounceChat(policyID, [...policyMemberAccountIDs, ...accountIDs]);
    const announceRoomChat = optimisticAnnounceChat.announceChatData;

    // create onyx data for policy expense chats for each new member
    const membersChats = createPolicyExpenseChats(policyID, invitedEmailsToAccountIDs, undefined, policyExpenseChatNotificationPreference);

    const optimisticMembersState: OnyxCollectionInputValue<PolicyEmployee> = {};
    const successMembersState: OnyxCollectionInputValue<PolicyEmployee> = {};
    const failureMembersState: OnyxCollectionInputValue<PolicyEmployee> = {};
    for (const email of logins) {
        optimisticMembersState[email] = {
            email,
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            role,
            submitsTo: getDefaultApprover(policy),
        };
        successMembersState[email] = {pendingAction: null};
        failureMembersState[email] = {
            pendingAction: null,
            errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.people.error.genericAdd'),
        };
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,

            // Convert to object with each key containing {pendingAction: 'add'}
            value: {
                employeeList: optimisticMembersState,
            },
        },
    ];
    optimisticData.push(
        ...(newPersonalDetailsOnyxData.optimisticData ?? []),
        ...membersChats.onyxOptimisticData,
        ...announceRoomChat.onyxOptimisticData,
        ...(announceRoomMembers.optimisticData ?? []),
        ...(adminRoomMembers.optimisticData ?? []),
    );

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,
            value: {
                employeeList: successMembersState,
            },
        },
    ];
    successData.push(
        ...(newPersonalDetailsOnyxData.finallyData ?? []),
        ...membersChats.onyxSuccessData,
        ...announceRoomChat.onyxSuccessData,
        ...(announceRoomMembers.successData ?? []),
        ...(adminRoomMembers.successData ?? []),
    );

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,

            // Convert to object with each key containing the error. We don't
            // need to remove the members since that is handled by onClose of OfflineWithFeedback.
            value: {
                employeeList: failureMembersState,
            },
        },
    ];
    failureData.push(...membersChats.onyxFailureData, ...announceRoomChat.onyxFailureData, ...(announceRoomMembers.failureData ?? []), ...(adminRoomMembers.failureData ?? []));

    return {optimisticData, successData, failureData, optimisticAnnounceChat, membersChats, logins};
}

/**
 * Adds members to the specified workspace/policyID
 * Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
 */
function addMembersToWorkspace(
    invitedEmailsToAccountIDs: InvitedEmailsToAccountIDs,
    welcomeNote: string,
    policy: OnyxEntry<Policy>,
    policyMemberAccountIDs: number[],
    role: string,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
) {
    if (!policy?.id) {
        Log.warn('addMembersToWorkspace: Policy ID is undefined');
        return;
    }
    const {optimisticData, successData, failureData, optimisticAnnounceChat, membersChats, logins} = buildAddMembersToWorkspaceOnyxData(
        invitedEmailsToAccountIDs,
        policy,
        policyMemberAccountIDs,
        role,
        formatPhoneNumber,
    );

    const params: AddMembersToWorkspaceParams = {
        employees: JSON.stringify(logins.map((login) => ({email: login, role}))),
        ...(optimisticAnnounceChat.announceChatReportID ? {announceChatReportID: optimisticAnnounceChat.announceChatReportID} : {}),
        ...(optimisticAnnounceChat.announceChatReportActionID ? {announceCreatedReportActionID: optimisticAnnounceChat.announceChatReportActionID} : {}),
        welcomeNote: Parser.replace(welcomeNote, {
            shouldEscapeText: false,
        }),
        policyID: policy.id,
    };
    if (!isEmptyObject(membersChats.reportCreationData)) {
        params.reportCreationData = JSON.stringify(membersChats.reportCreationData);
    }
    API.write(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE, params, {optimisticData, successData, failureData});
}

type PolicyMember = {
    email: string;
    role: string;
    submitsTo?: string;
    forwardsTo?: string;
};

function importPolicyMembers(policyID: string, members: PolicyMember[]) {
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const policy = getPolicy(policyID);
    const {added, updated} = members.reduce(
        (acc, curr) => {
            const employee = policy?.employeeList?.[curr.email];
            if (employee) {
                if (curr.role !== employee.role || (curr.submitsTo ?? '') !== (employee.submitsTo ?? '') || (curr.forwardsTo ?? '') !== (employee.forwardsTo ?? '')) {
                    acc.updated++;
                }
            } else {
                acc.added++;
            }
            return acc;
        },
        {added: 0, updated: 0},
    );
    const onyxData = updateImportSpreadsheetData(added, updated);

    const parameters = {
        policyID,
        employees: JSON.stringify(members.map((member) => ({email: member.email, role: member.role, submitsTo: member.submitsTo, forwardsTo: member.forwardsTo}))),
    };

    API.write(WRITE_COMMANDS.IMPORT_MEMBERS_SPREADSHEET, parameters, onyxData);
}

/**
 * Invite member to the specified policyID
 * Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
 */
function inviteMemberToWorkspace(policyID: string, inviterEmail?: string) {
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
            value: {...failureMembersState, errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage')},
        },
    ];

    const params = {policyID, inviterEmail};

    API.write(WRITE_COMMANDS.JOIN_POLICY_VIA_INVITE_LINK, params, {optimisticData, failureData});
}

/**
 * Add member to the selected private domain workspace based on policyID
 */
function joinAccessiblePolicy(policyID: string) {
    const memberJoinKey = `${ONYXKEYS.COLLECTION.POLICY_JOIN_MEMBER}${policyID}` as const;

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: memberJoinKey,
            value: {policyID},
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: memberJoinKey,
            value: {policyID, errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.people.error.genericAdd')},
        },
    ];

    API.write(WRITE_COMMANDS.JOIN_ACCESSIBLE_POLICY, {policyID}, {optimisticData, failureData});
}

/**
 * Ask the policy admin to add member to the selected private domain workspace based on policyID
 */
function askToJoinPolicy(policyID: string) {
    const memberJoinKey = `${ONYXKEYS.COLLECTION.POLICY_JOIN_MEMBER}${policyID}` as const;

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: memberJoinKey,
            value: {policyID},
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: memberJoinKey,
            value: {policyID, errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.people.error.genericAdd')},
        },
    ];

    API.write(WRITE_COMMANDS.ASK_TO_JOIN_POLICY, {policyID}, {optimisticData, failureData});
}

/**
 * Removes an error after trying to delete a member
 */
function clearDeleteMemberError(policyID: string, login: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        employeeList: {
            [login]: {
                pendingAction: null,
                errors: null,
            },
        },
    });
}

/**
 * Removes an error after trying to add a member
 */
function clearAddMemberError(policyID: string, login: string, accountID: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        employeeList: {
            [login]: null,
        },
    });
    Onyx.merge(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`, {
        [accountID]: null,
    });
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

function openPolicyMemberProfilePage(policyID: string, accountID: number) {
    const params: OpenPolicyMemberProfilePageParams = {
        policyID,
        accountID,
    };

    API.read(READ_COMMANDS.OPEN_POLICY_MEMBER_PROFILE_PAGE, params);
}

function setWorkspaceInviteMembersDraft(policyID: string, invitedEmailsToAccountIDs: InvitedEmailsToAccountIDs) {
    Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policyID}`, invitedEmailsToAccountIDs);
}

function setWorkspaceInviteRoleDraft(policyID: string, role: ValueOf<typeof CONST.POLICY.ROLE>) {
    Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_ROLE_DRAFT}${policyID}`, role);
}

function clearWorkspaceInviteRoleDraft(policyID: string) {
    Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_ROLE_DRAFT}${policyID}`, null);
}

/**
 * Accept user join request to a workspace
 */
function acceptJoinRequest(reportID: string | undefined, reportAction: OnyxEntry<ReportAction>) {
    if (!reportAction || !reportID) {
        Log.warn('acceptJoinRequest missing reportID or reportAction', {reportAction, reportID});
        return;
    }
    const choice = CONST.REPORT.ACTIONABLE_MENTION_JOIN_WORKSPACE_RESOLUTION.ACCEPT;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportAction.reportActionID]: {
                    originalMessage: {choice: '' as JoinWorkspaceResolution},
                    pendingAction: null,
                },
            },
        },
    ];
    const accountIDToApprove = ReportActionsUtils.isActionableJoinRequest(reportAction)
        ? (ReportActionsUtils.getOriginalMessage(reportAction)?.accountID ?? reportAction?.actorAccountID)
        : CONST.DEFAULT_NUMBER_ID;
    const parameters = {
        requests: JSON.stringify({
            [ReportActionsUtils.isActionableJoinRequest(reportAction) ? (ReportActionsUtils.getOriginalMessage(reportAction)?.policyID ?? CONST.DEFAULT_NUMBER_ID) : CONST.DEFAULT_NUMBER_ID]:
                {
                    requests: [{accountID: accountIDToApprove, adminsRoomMessageReportActionID: reportAction.reportActionID}],
                },
        }),
    };

    API.write(WRITE_COMMANDS.ACCEPT_JOIN_REQUEST, parameters, {optimisticData, failureData, successData});
}

/**
 * Decline user join request to a workspace
 */
function declineJoinRequest(reportID: string | undefined, reportAction: OnyxEntry<ReportAction>) {
    if (!reportAction || !reportID) {
        Log.warn('declineJoinRequest missing reportID or reportAction', {reportAction, reportID});
        return;
    }
    const choice = CONST.REPORT.ACTIONABLE_MENTION_JOIN_WORKSPACE_RESOLUTION.DECLINE;
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportAction.reportActionID]: {
                    originalMessage: {choice: '' as JoinWorkspaceResolution},
                    pendingAction: null,
                },
            },
        },
    ];
    const accountIDToApprove = ReportActionsUtils.isActionableJoinRequest(reportAction)
        ? (ReportActionsUtils.getOriginalMessage(reportAction)?.accountID ?? reportAction?.actorAccountID)
        : CONST.DEFAULT_NUMBER_ID;
    const parameters = {
        requests: JSON.stringify({
            [ReportActionsUtils.isActionableJoinRequest(reportAction) ? (ReportActionsUtils.getOriginalMessage(reportAction)?.policyID ?? CONST.DEFAULT_NUMBER_ID) : CONST.DEFAULT_NUMBER_ID]:
                {
                    requests: [{accountID: accountIDToApprove, adminsRoomMessageReportActionID: reportAction.reportActionID}],
                },
        }),
    };

    API.write(WRITE_COMMANDS.DECLINE_JOIN_REQUEST, parameters, {optimisticData, failureData, successData});
}

function downloadMembersCSV(policyID: string, onDownloadFailed: () => void, translate: LocalizedTranslate) {
    const finalParameters = enhanceParameters(WRITE_COMMANDS.EXPORT_MEMBERS_CSV, {
        policyID,
    });

    const fileName = 'Members.csv';

    const formData = new FormData();
    for (const [key, value] of Object.entries(finalParameters)) {
        formData.append(key, String(value));
    }

    fileDownload(translate, ApiUtils.getCommandURL({command: WRITE_COMMANDS.EXPORT_MEMBERS_CSV}), fileName, '', false, formData, CONST.NETWORK.METHOD.POST, onDownloadFailed);
}

function clearInviteDraft(policyID: string) {
    setWorkspaceInviteMembersDraft(policyID, {});
    FormActions.clearDraftValues(ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM);
}

function setImportedSpreadsheetMemberData(memberData: ImportedSpreadsheetMemberData[]) {
    Onyx.set(ONYXKEYS.IMPORTED_SPREADSHEET_MEMBER_DATA, memberData);
}

function clearImportedSpreadsheetMemberData() {
    Onyx.set(ONYXKEYS.IMPORTED_SPREADSHEET_MEMBER_DATA, null);
}

export {
    removeMembers,
    buildUpdateWorkspaceMembersRoleOnyxData,
    updateWorkspaceMembersRole,
    requestWorkspaceOwnerChange,
    clearWorkspaceOwnerChangeFlow,
    buildAddMembersToWorkspaceOnyxData,
    addMembersToWorkspace,
    clearDeleteMemberError,
    clearAddMemberError,
    openWorkspaceMembersPage,
    setWorkspaceInviteMembersDraft,
    inviteMemberToWorkspace,
    joinAccessiblePolicy,
    askToJoinPolicy,
    acceptJoinRequest,
    declineJoinRequest,
    isApprover,
    importPolicyMembers,
    downloadMembersCSV,
    clearInviteDraft,
    buildRoomMembersOnyxData,
    openPolicyMemberProfilePage,
    setWorkspaceInviteRoleDraft,
    clearWorkspaceInviteRoleDraft,
    setImportedSpreadsheetMemberData,
    clearImportedSpreadsheetMemberData,
};
