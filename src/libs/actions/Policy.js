import {PUBLIC_DOMAINS} from 'expensify-common/lib/CONST';
import Str from 'expensify-common/lib/str';
import {escapeRegExp} from 'lodash';
import filter from 'lodash/filter';
import lodashGet from 'lodash/get';
import lodashUnion from 'lodash/union';
import Onyx from 'react-native-onyx';
import _ from 'underscore';
import * as API from '@libs/API';
import DateUtils from '@libs/DateUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import Log from '@libs/Log';
import * as NumberUtils from '@libs/NumberUtils';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const allPolicies = {};
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
            const cleanUpMergeQueries = {};
            const cleanUpSetQueries = {};
            _.each(policyReports, ({reportID}) => {
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

let allPolicyMembers;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY_MEMBERS,
    waitForCollectionCallback: true,
    callback: (val) => (allPolicyMembers = val),
});

let lastAccessedWorkspacePolicyID = null;
Onyx.connect({
    key: ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID,
    callback: (value) => (lastAccessedWorkspacePolicyID = value),
});

let sessionEmail = '';
let sessionAccountID = 0;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        sessionEmail = lodashGet(val, 'email', '');
        sessionAccountID = lodashGet(val, 'accountID', 0);
    },
});

let allPersonalDetails;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (val) => (allPersonalDetails = val),
});

let reimbursementAccount;
Onyx.connect({
    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    callback: (val) => (reimbursementAccount = val),
});

let allRecentlyUsedCategories = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES,
    waitForCollectionCallback: true,
    callback: (val) => (allRecentlyUsedCategories = val),
});

let networkStatus = {};
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    waitForCollectionCallback: true,
    callback: (val) => (networkStatus = val),
});

/**
 * Stores in Onyx the policy ID of the last workspace that was accessed by the user
 * @param {String|null} policyID
 */
function updateLastAccessedWorkspace(policyID) {
    Onyx.set(ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID, policyID);
}

/**
 * Check if the user has any active free policies (aka workspaces)
 *
 * @param {Array} policies
 * @returns {Boolean}
 */
function hasActiveFreePolicy(policies) {
    const adminFreePolicies = _.filter(policies, (policy) => policy && policy.type === CONST.POLICY.TYPE.FREE && policy.role === CONST.POLICY.ROLE.ADMIN);

    if (adminFreePolicies.length === 0) {
        return false;
    }

    if (_.some(adminFreePolicies, (policy) => !policy.pendingAction)) {
        return true;
    }

    if (_.some(adminFreePolicies, (policy) => policy.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD)) {
        return true;
    }

    if (_.some(adminFreePolicies, (policy) => policy.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)) {
        return false;
    }

    // If there are no add or delete pending actions the only option left is an update
    // pendingAction, in which case we should return true.
    return true;
}

/**
 * Delete the workspace
 *
 * @param {String} policyID
 * @param {Array<Object>} reports
 * @param {String} policyName
 */
function deleteWorkspace(policyID, reports, policyName) {
    const filteredPolicies = filter(allPolicies, (policy) => policy.id !== policyID);
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                errors: null,
            },
        },
        ..._.map(reports, ({reportID}) => ({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS.CLOSED,
                hasDraft: false,
                oldPolicyName: allPolicies[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`].name,
            },
        })),

        ..._.map(reports, ({reportID}) => ({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${reportID}`,
            value: null,
        })),

        // Add closed actions to all chat reports linked to this policy
        ..._.map(reports, ({reportID, ownerAccountID}) => {
            // Announce & admin chats have FAKE owners, but workspace chats w/ users do have owners.
            let emailClosingReport = CONST.POLICY.OWNER_EMAIL_FAKE;
            if (ownerAccountID !== CONST.POLICY.OWNER_ACCOUNT_ID_FAKE) {
                emailClosingReport = lodashGet(allPersonalDetails, [ownerAccountID, 'login'], '');
            }
            const optimisticClosedReportAction = ReportUtils.buildOptimisticClosedReportAction(emailClosingReport, policyName, CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED);
            const optimisticReportActions = {};
            optimisticReportActions[optimisticClosedReportAction.reportActionID] = optimisticClosedReportAction;
            return {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
                value: optimisticReportActions,
            };
        }),

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

    // Restore the old report stateNum and statusNum
    const failureData = [
        ..._.map(reports, ({reportID, stateNum, statusNum, hasDraft, oldPolicyName}) => ({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                stateNum,
                statusNum,
                hasDraft,
                oldPolicyName,
            },
        })),
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
            value: {
                errors: lodashGet(reimbursementAccount, 'errors', null),
            },
        },
    ];

    // We don't need success data since the push notification will update
    // the onyxData for all connected clients.
    const successData = [];
    API.write('DeleteWorkspace', {policyID}, {optimisticData, successData, failureData});

    // Reset the lastAccessedWorkspacePolicyID
    if (policyID === lastAccessedWorkspacePolicyID) {
        updateLastAccessedWorkspace(null);
    }
}

/**
 * Is the user an admin of a free policy (aka workspace)?
 *
 * @param {Record<string, Policy>} [policies]
 * @returns {Boolean}
 */
function isAdminOfFreePolicy(policies) {
    return _.some(policies, (policy) => policy && policy.type === CONST.POLICY.TYPE.FREE && policy.role === CONST.POLICY.ROLE.ADMIN);
}

/**
 * Build optimistic data for adding members to the announce room
 * @param {String} policyID
 * @param {Array} accountIDs
 * @returns {Object}
 */
function buildAnnounceRoomMembersOnyxData(policyID, accountIDs) {
    const announceReport = ReportUtils.getRoom(CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, policyID);
    const announceRoomMembers = {
        onyxOptimisticData: [],
        onyxFailureData: [],
    };

    announceRoomMembers.onyxOptimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${announceReport.reportID}`,
        value: {
            participantAccountIDs: [...announceReport.participantAccountIDs, ...accountIDs],
        },
    });

    announceRoomMembers.onyxFailureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${announceReport.reportID}`,
        value: {
            participantAccountIDs: announceReport.participantAccountIDs,
        },
    });
    return announceRoomMembers;
}

/**
 * Build optimistic data for removing users from the announce room
 * @param {String} policyID
 * @param {Array} accountIDs
 * @returns {Object}
 */
function removeOptimisticAnnounceRoomMembers(policyID, accountIDs) {
    const announceReport = ReportUtils.getRoom(CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, policyID);
    const announceRoomMembers = {
        onyxOptimisticData: [],
        onyxFailureData: [],
    };

    const remainUsers = _.difference(announceReport.participantAccountIDs, accountIDs);
    announceRoomMembers.onyxOptimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${announceReport.reportID}`,
        value: {
            participantAccountIDs: [...remainUsers],
        },
    });

    announceRoomMembers.onyxFailureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${announceReport.reportID}`,
        value: {
            participantAccountIDs: announceReport.participantAccountIDs,
        },
    });
    return announceRoomMembers;
}

/**
 * Remove the passed members from the policy employeeList
 *
 * @param {Array} accountIDs
 * @param {String} policyID
 */
function removeMembers(accountIDs, policyID) {
    // In case user selects only themselves (admin), their email will be filtered out and the members
    // array passed will be empty, prevent the function from proceeding in that case as there is no one to remove
    if (accountIDs.length === 0) {
        return;
    }

    const membersListKey = `${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`;
    const policy = ReportUtils.getPolicy(policyID);
    const workspaceChats = ReportUtils.getWorkspaceChats(policyID, accountIDs);
    const optimisticClosedReportActions = _.map(workspaceChats, () =>
        ReportUtils.buildOptimisticClosedReportAction(sessionEmail, policy.name, CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY),
    );

    const announceRoomMembers = removeOptimisticAnnounceRoomMembers(policyID, accountIDs);

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: membersListKey,
            value: _.object(accountIDs, Array(accountIDs.length).fill({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE})),
        },
        ..._.map(workspaceChats, (report) => ({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
            value: {
                statusNum: CONST.REPORT.STATUS.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                oldPolicyName: policy.name,
                hasDraft: false,
            },
        })),
        ..._.map(optimisticClosedReportActions, (reportAction, index) => ({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${workspaceChats[index].reportID}`,
            value: {[reportAction.reportActionID]: reportAction},
        })),
        ...announceRoomMembers.onyxOptimisticData,
    ];

    // If the policy has primaryLoginsInvited, then it displays informative messages on the members page about which primary logins were added by secondary logins.
    // If we delete all these logins then we should clear the informative messages since they are no longer relevant.
    if (!_.isEmpty(policy.primaryLoginsInvited)) {
        // Take the current policy members and remove them optimistically
        const policyMemberAccountIDs = _.map(allPolicyMembers[`${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`], (value, key) => Number(key));
        const remainingMemberAccountIDs = _.difference(policyMemberAccountIDs, accountIDs);
        const remainingLogins = PersonalDetailsUtils.getLoginsByAccountIDs(remainingMemberAccountIDs);
        const invitedPrimaryToSecondaryLogins = _.invert(policy.primaryLoginsInvited);

        // Then, if no remaining members exist that were invited by a secondary login, clear the informative messages
        if (!_.some(remainingLogins, (remainingLogin) => Boolean(invitedPrimaryToSecondaryLogins[remainingLogin]))) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    primaryLoginsInvited: null,
                },
            });
        }
    }

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: membersListKey,
            value: _.object(accountIDs, Array(accountIDs.length).fill(null)),
        },
    ];
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: membersListKey,
            value: _.object(accountIDs, Array(accountIDs.length).fill({errors: ErrorUtils.getMicroSecondOnyxError('workspace.people.error.genericRemove')})),
        },
        ..._.map(workspaceChats, ({reportID, stateNum, statusNum, hasDraft, oldPolicyName = null}) => ({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                stateNum,
                statusNum,
                hasDraft,
                oldPolicyName,
            },
        })),
        ..._.map(optimisticClosedReportActions, (reportAction, index) => ({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${workspaceChats[index].reportID}`,
            value: {[reportAction.reportActionID]: null},
        })),
        ...announceRoomMembers.onyxFailureData,
    ];
    API.write(
        'DeleteMembersFromWorkspace',
        {
            emailList: _.map(accountIDs, (accountID) => allPersonalDetails[accountID].login).join(','),
            policyID,
        },
        {optimisticData, successData, failureData},
    );
}

/**
 * Optimistically create a chat for each member of the workspace, creates both optimistic and success data for onyx.
 *
 * @param {String} policyID
 * @param {Object} invitedEmailsToAccountIDs
 * @param {Boolean} hasOutstandingChildRequest
 * @returns {Object} - object with onyxSuccessData, onyxOptimisticData, and optimisticReportIDs (map login to reportID)
 */
function createPolicyExpenseChats(policyID, invitedEmailsToAccountIDs, hasOutstandingChildRequest = false) {
    const workspaceMembersChats = {
        onyxSuccessData: [],
        onyxOptimisticData: [],
        onyxFailureData: [],
        reportCreationData: {},
    };

    _.each(invitedEmailsToAccountIDs, (accountID, email) => {
        const cleanAccountID = Number(accountID);
        const login = OptionsListUtils.addSMSDomainIfPhoneNumber(email);

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
                    statusNum: CONST.REPORT.STATUS.OPEN,
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
 *
 * @param {Object} invitedEmailsToAccountIDs
 * @param {String} welcomeNote
 * @param {String} policyID
 */
function addMembersToWorkspace(invitedEmailsToAccountIDs, welcomeNote, policyID) {
    const membersListKey = `${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`;
    const logins = _.map(_.keys(invitedEmailsToAccountIDs), (memberLogin) => OptionsListUtils.addSMSDomainIfPhoneNumber(memberLogin));
    const accountIDs = _.values(invitedEmailsToAccountIDs);
    const newPersonalDetailsOnyxData = PersonalDetailsUtils.getNewPersonalDetailsOnyxData(logins, accountIDs);

    const announceRoomMembers = buildAnnounceRoomMembersOnyxData(policyID, accountIDs);

    // create onyx data for policy expense chats for each new member
    const membersChats = createPolicyExpenseChats(policyID, invitedEmailsToAccountIDs);

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: membersListKey,

            // Convert to object with each key containing {pendingAction: ‘add’}
            value: _.object(accountIDs, Array(accountIDs.length).fill({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD})),
        },
        ...newPersonalDetailsOnyxData.optimisticData,
        ...membersChats.onyxOptimisticData,
        ...announceRoomMembers.onyxOptimisticData,
    ];

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: membersListKey,

            // Convert to object with each key clearing pendingAction, when it is an existing account.
            // Remove the object, when it is a newly created account.
            value: _.reduce(
                accountIDs,
                (accountIDsWithClearedPendingAction, accountID) => {
                    let value = null;
                    const accountAlreadyExists = !_.isEmpty(allPersonalDetails[accountID]);

                    if (accountAlreadyExists) {
                        value = {pendingAction: null, errors: null};
                    }

                    // eslint-disable-next-line no-param-reassign
                    accountIDsWithClearedPendingAction[accountID] = value;

                    return accountIDsWithClearedPendingAction;
                },
                {},
            ),
        },
        ...newPersonalDetailsOnyxData.successData,
        ...membersChats.onyxSuccessData,
    ];

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: membersListKey,

            // Convert to object with each key containing the error. We don’t
            // need to remove the members since that is handled by onClose of OfflineWithFeedback.
            value: _.object(
                accountIDs,
                Array(accountIDs.length).fill({
                    errors: ErrorUtils.getMicroSecondOnyxError('workspace.people.error.genericAdd'),
                }),
            ),
        },
        ...newPersonalDetailsOnyxData.failureData,
        ...membersChats.onyxFailureData,
        ...announceRoomMembers.onyxFailureData,
    ];

    const params = {
        employees: JSON.stringify(_.map(logins, (login) => ({email: login}))),

        // Do not escape HTML special chars for welcomeNote as this will be handled in the backend.
        // See https://github.com/Expensify/App/issues/20081 for more details.
        welcomeNote,
        policyID,
    };
    if (!_.isEmpty(membersChats.reportCreationData)) {
        params.reportCreationData = JSON.stringify(membersChats.reportCreationData);
    }
    API.write('AddMembersToWorkspace', params, {optimisticData, successData, failureData});
}

/**
 * Updates a workspace avatar image
 *
 * @param {String} policyID
 * @param {File|Object} file
 */
function updateWorkspaceAvatar(policyID, file) {
    const optimisticData = [
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
    const successData = [
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
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                avatar: allPolicies[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`].avatar,
                pendingFields: {
                    avatar: null,
                },
            },
        },
    ];

    API.write('UpdateWorkspaceAvatar', {policyID, file}, {optimisticData, successData, failureData});
}

/**
 * Deletes the avatar image for the workspace
 * @param {String} policyID
 */
function deleteWorkspaceAvatar(policyID) {
    const optimisticData = [
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
    const successData = [
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
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {
                    avatar: null,
                },
                errorFields: {
                    avatar: ErrorUtils.getMicroSecondOnyxError('avatarWithImagePicker.deleteWorkspaceError'),
                },
            },
        },
    ];
    API.write('DeleteWorkspaceAvatar', {policyID}, {optimisticData, successData, failureData});
}

/**
 * Clear error and pending fields for the workspace avatar
 * @param {String} policyID
 */
function clearAvatarErrors(policyID) {
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
 *
 * @param {String} policyID
 * @param {String} name
 * @param {String} currency
 */
function updateGeneralSettings(policyID, name, currency) {
    const policy = allPolicies[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    const distanceUnit = _.find(_.values(policy.customUnits), (unit) => unit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
    const distanceRate = _.find(_.values(distanceUnit ? distanceUnit.rates : {}), (rate) => rate.name === CONST.CUSTOM_UNITS.DEFAULT_RATE);
    const optimisticData = [
        {
            // We use SET because it's faster than merge and avoids a race condition when setting the currency and navigating the user to the Bank account page in confirmCurrencyChangeAndHideModal
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                ...allPolicies[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`],

                pendingFields: {
                    generalSettings: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },

                // Clear errorFields in case the user didn't dismiss the general settings error
                errorFields: {
                    generalSettings: null,
                },
                name,
                outputCurrency: currency,
                ...(distanceUnit
                    ? {
                          customUnits: {
                              [distanceUnit.customUnitID]: {
                                  ...distanceUnit,
                                  rates: {
                                      [distanceRate.customUnitRateID]: {
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
    const successData = [
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
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {
                    generalSettings: null,
                },
                errorFields: {
                    generalSettings: ErrorUtils.getMicroSecondOnyxError('workspace.editor.genericFailureMessage'),
                },
                ...(distanceUnit
                    ? {
                          customUnits: {
                              [distanceUnit.customUnitID]: distanceUnit,
                          },
                      }
                    : {}),
            },
        },
    ];

    API.write(
        'UpdateWorkspaceGeneralSettings',
        {policyID, workspaceName: name, currency},
        {
            optimisticData,
            successData,
            failureData,
        },
    );
}

/**
 * @param {String} policyID The id of the workspace / policy
 */
function clearWorkspaceGeneralSettingsErrors(policyID) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        errorFields: {
            generalSettings: null,
        },
    });
}

/**
 * @param {String} policyID
 * @param {Object} errors
 */
function setWorkspaceErrors(policyID, errors) {
    if (!allPolicies[policyID]) {
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {errors: null});
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {errors});
}

/**
 * @param {String} policyID
 * @param {String} customUnitID
 * @param {String} customUnitRateID
 */
function clearCustomUnitErrors(policyID, customUnitID, customUnitRateID) {
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

/**
 * @param {String} policyID
 */
function hideWorkspaceAlertMessage(policyID) {
    if (!allPolicies[policyID]) {
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {alertMessage: ''});
}

/**
 * @param {String} policyID
 * @param {Object} currentCustomUnit
 * @param {Object} newCustomUnit
 * @param {Number} lastModified
 */
function updateWorkspaceCustomUnitAndRate(policyID, currentCustomUnit, newCustomUnit, lastModified) {
    const optimisticData = [
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

    const successData = [
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

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [currentCustomUnit.customUnitID]: {
                        customUnitID: currentCustomUnit.customUnitID,
                        rates: {
                            [currentCustomUnit.rates.customUnitRateID]: {
                                ...currentCustomUnit.rates,
                                errors: ErrorUtils.getMicroSecondOnyxError('workspace.reimburse.updateCustomUnitError'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const newCustomUnitParam = _.clone(newCustomUnit);
    newCustomUnitParam.rates = _.omit(newCustomUnitParam.rates, ['pendingAction', 'errors']);
    API.write(
        'UpdateWorkspaceCustomUnitAndRate',
        {
            policyID,
            ...(!networkStatus.isOffline && {lastModified}),
            customUnit: JSON.stringify(newCustomUnitParam),
            customUnitRate: JSON.stringify(newCustomUnitParam.rates),
        },
        {optimisticData, successData, failureData},
    );
}

/**
 * Removes an error after trying to delete a member
 *
 * @param {String} policyID
 * @param {Number} accountID
 */
function clearDeleteMemberError(policyID, accountID) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`, {
        [accountID]: {
            pendingAction: null,
            errors: null,
        },
    });
}

/**
 * Removes an error after trying to add a member
 *
 * @param {String} policyID
 * @param {Number} accountID
 */
function clearAddMemberError(policyID, accountID) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`, {
        [accountID]: null,
    });
    Onyx.merge(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`, {
        [accountID]: null,
    });
}

/**
 * Removes an error after trying to delete a workspace
 *
 * @param {String} policyID
 */
function clearDeleteWorkspaceError(policyID) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        pendingAction: null,
        errors: null,
    });
}

/**
 * Removes the workspace after failure to create.
 *
 * @param {String} policyID
 */
function removeWorkspace(policyID) {
    Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, null);
}

/**
 * Generate a policy name based on an email and policy list.
 * @param {String} [email] the email to base the workspace name on. If not passed, will use the logged in user's email instead
 * @returns {String}
 */
function generateDefaultWorkspaceName(email = '') {
    const emailParts = email ? email.split('@') : sessionEmail.split('@');
    let defaultWorkspaceName = '';
    if (!emailParts || emailParts.length !== 2) {
        return defaultWorkspaceName;
    }
    const username = emailParts[0];
    const domain = emailParts[1];

    if (_.includes(PUBLIC_DOMAINS, domain.toLowerCase())) {
        defaultWorkspaceName = `${Str.UCFirst(username)}'s Workspace`;
    } else {
        defaultWorkspaceName = `${Str.UCFirst(domain.split('.')[0])}'s Workspace`;
    }

    if (`@${domain.toLowerCase()}` === CONST.SMS.DOMAIN) {
        defaultWorkspaceName = 'My Group Workspace';
    }

    if (allPolicies.length === 0) {
        return defaultWorkspaceName;
    }

    // find default named workspaces and increment the last number
    const numberRegEx = new RegExp(`${escapeRegExp(defaultWorkspaceName)} ?(\\d*)`, 'i');
    const lastWorkspaceNumber = _.chain(allPolicies)
        .filter((policy) => policy.name && numberRegEx.test(policy.name))
        .map((policy) => parseInt(numberRegEx.exec(policy.name)[1] || 1, 10)) // parse the number at the end
        .max()
        .value();
    return lastWorkspaceNumber !== -Infinity ? `${defaultWorkspaceName} ${lastWorkspaceNumber + 1}` : defaultWorkspaceName;
}

/**
 * Returns a client generated 16 character hexadecimal value for the policyID
 * @returns {String}
 */
function generatePolicyID() {
    return NumberUtils.generateHexadecimalValue(16);
}

/**
 * Returns a client generated 13 character hexadecimal value for a custom unit ID
 * @returns {String}
 */
function generateCustomUnitID() {
    return NumberUtils.generateHexadecimalValue(13);
}

/**
 * @returns {Object}
 */
function buildOptimisticCustomUnits() {
    const customUnitID = generateCustomUnitID();
    const customUnitRateID = generateCustomUnitID();
    const customUnits = {
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
                },
            },
        },
    };

    return {
        customUnits,
        customUnitID,
        customUnitRateID,
    };
}

/**
 * Optimistically creates a Policy Draft for a new workspace
 *
 * @param {String} [policyOwnerEmail] Optional, the email of the account to make the owner of the policy
 * @param {String} [policyName] Optional, custom policy name we will use for created workspace
 * @param {String} [policyID] Optional, custom policy id we will use for created workspace
 * @param {Boolean} [makeMeAdmin] Optional, leave the calling account as an admin on the policy
 */
function createDraftInitialWorkspace(policyOwnerEmail = '', policyName = '', policyID = generatePolicyID(), makeMeAdmin = false) {
    const workspaceName = policyName || generateDefaultWorkspaceName(policyOwnerEmail);
    const {customUnits} = buildOptimisticCustomUnits();

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`,
            value: {
                id: policyID,
                type: CONST.POLICY.TYPE.FREE,
                name: workspaceName,
                role: CONST.POLICY.ROLE.ADMIN,
                owner: sessionEmail,
                isPolicyExpenseChatEnabled: true,
                outputCurrency: lodashGet(allPersonalDetails, [sessionAccountID, 'localCurrencyCode'], CONST.CURRENCY.USD),
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
 * @param {String} [policyOwnerEmail] Optional, the email of the account to make the owner of the policy
 * @param {Boolean} [makeMeAdmin] Optional, leave the calling account as an admin on the policy
 * @param {String} [policyName] Optional, custom policy name we will use for created workspace
 * @param {String} [policyID] Optional, custom policy id we will use for created workspace
 * @returns {String}
 */
function createWorkspace(policyOwnerEmail = '', makeMeAdmin = false, policyName = '', policyID = generatePolicyID()) {
    const workspaceName = policyName || generateDefaultWorkspaceName(policyOwnerEmail);

    const {customUnits, customUnitID, customUnitRateID} = buildOptimisticCustomUnits();

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

    API.write(
        'CreateWorkspace',
        {
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
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    value: {
                        id: policyID,
                        type: CONST.POLICY.TYPE.FREE,
                        name: workspaceName,
                        role: CONST.POLICY.ROLE.ADMIN,
                        owner: sessionEmail,
                        isPolicyExpenseChatEnabled: true,
                        outputCurrency: lodashGet(allPersonalDetails, [sessionAccountID, 'localCurrencyCode'], CONST.CURRENCY.USD),
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                        customUnits,
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
            ],
            successData: [
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
                        [_.keys(announceChatData)[0]]: {
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
                        [_.keys(adminsChatData)[0]]: {
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
                        [_.keys(expenseChatData)[0]]: {
                            pendingAction: null,
                        },
                    },
                },
            ],
            failureData: [
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
            ],
        },
    );

    return adminsChatReportID;
}

/**
 *
 * @param {string} policyID
 */
function openWorkspaceReimburseView(policyID) {
    if (!policyID) {
        Log.warn('openWorkspaceReimburseView invalid params', {policyID});
        return;
    }
    const onyxData = {
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                },
            },
        ],
    };

    API.read('OpenWorkspaceReimburseView', {policyID}, onyxData);
}

function openWorkspaceMembersPage(policyID, clientMemberEmails) {
    if (!policyID || !clientMemberEmails) {
        Log.warn('openWorkspaceMembersPage invalid params', {policyID, clientMemberEmails});
        return;
    }

    API.read('OpenWorkspaceMembersPage', {
        policyID,
        clientMemberEmails: JSON.stringify(clientMemberEmails),
    });
}

function openWorkspaceInvitePage(policyID, clientMemberEmails) {
    if (!policyID || !clientMemberEmails) {
        Log.warn('openWorkspaceInvitePage invalid params', {policyID, clientMemberEmails});
        return;
    }

    API.read('OpenWorkspaceInvitePage', {
        policyID,
        clientMemberEmails: JSON.stringify(clientMemberEmails),
    });
}

/**
 * @param {String} policyID
 */
function openDraftWorkspaceRequest(policyID) {
    API.read('OpenDraftWorkspaceRequest', {policyID});
}

/**
 * @param {String} policyID
 * @param {Object} invitedEmailsToAccountIDs
 */
function setWorkspaceInviteMembersDraft(policyID, invitedEmailsToAccountIDs) {
    Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policyID}`, invitedEmailsToAccountIDs);
}

/**
 * @param {String} policyID
 * @param {String} message
 */
function setWorkspaceInviteMessageDraft(policyID, message) {
    Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MESSAGE_DRAFT}${policyID}`, message);
}

/**
 * @param {String} policyID
 */
function clearErrors(policyID) {
    setWorkspaceErrors(policyID, {});
    hideWorkspaceAlertMessage(policyID);
}

/**
 * Dismiss the informative messages about which policy members were added with primary logins when invited with their secondary login.
 *
 * @param {String} policyID
 */
function dismissAddedWithPrimaryLoginMessages(policyID) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {primaryLoginsInvited: null});
}

/**
 * @param {String} policyID
 * @param {String} category
 * @returns {Object}
 */
function buildOptimisticPolicyRecentlyUsedCategories(policyID, category) {
    if (!policyID || !category) {
        return [];
    }

    const policyRecentlyUsedCategories = lodashGet(allRecentlyUsedCategories, `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${policyID}`, []);

    return lodashUnion([category], policyRecentlyUsedCategories);
}

/**
 * This flow is used for bottom up flow converting IOU report to an expense report. When user takes this action,
 * we create a Collect type workspace when the person taking the action becomes an owner and an admin, while we
 * add a new member to the workspace as an employee and convert the IOU report passed as a param into an expense report.
 *
 * @param {Object} iouReport
 * @returns {String} policyID of the workspace we have created
 */
function createWorkspaceFromIOUPayment(iouReport) {
    // This flow only works for IOU reports
    if (!ReportUtils.isIOUReport(iouReport)) {
        return;
    }

    // Generate new variables for the policy
    const policyID = generatePolicyID();
    const workspaceName = generateDefaultWorkspaceName(sessionEmail);
    const employeeAccountID = iouReport.ownerAccountID;
    const employeeEmail = iouReport.ownerEmail;
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

    // Create the workspace chat for the employee whose IOU is being paid
    const employeeWorkspaceChat = createPolicyExpenseChats(policyID, {[employeeEmail]: employeeAccountID}, true);
    const newWorkspace = {
        id: policyID,

        // We are creating a collect policy in this case
        type: CONST.POLICY.TYPE.TEAM,
        name: workspaceName,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: sessionEmail,
        isPolicyExpenseChatEnabled: true,

        // Setting the currency to USD as we can only add the VBBA for this policy currency right now
        outputCurrency: CONST.CURRENCY.USD,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        customUnits,
    };

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: newWorkspace,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
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
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${announceChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                ...announceChatData,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${announceChatReportID}`,
            value: announceReportActionData,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${adminsChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                ...adminsChatData,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminsChatReportID}`,
            value: adminsReportActionData,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${workspaceChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                ...workspaceChatData,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${workspaceChatReportID}`,
            value: workspaceChatReportActionData,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_MEMBERS_DRAFTS}${policyID}`,
            value: null,
        },
        ...employeeWorkspaceChat.onyxOptimisticData,
    ];

    const successData = [
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
                [_.keys(announceChatData)[0]]: {
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
                [_.keys(adminsChatData)[0]]: {
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
                [_.keys(workspaceChatData)[0]]: {
                    pendingAction: null,
                },
            },
        },
        ...employeeWorkspaceChat.onyxSuccessData,
    ];

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${announceChatReportID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${announceChatReportID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${adminsChatReportID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminsChatReportID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${workspaceChatReportID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${workspaceChatReportID}`,
            value: null,
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
        total: -iouReport.total,
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
    const transactionsOptimisticData = {};
    const transactionFailureData = {};
    _.each(reportTransactions, (transaction) => {
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

    // Update the created timestamp of the report preview action to be after the workspace chat created timestamp.
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${memberData.workspaceChatReportID}`,
        value: {
            [reportPreview.reportActionID]: {
                ...reportPreview,
                message: ReportUtils.getReportPreviewMessage(expenseReport, {}, false, false, newWorkspace),
                created: DateUtils.getDBTime(),
            },
        },
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${memberData.workspaceChatReportID}`,
        value: {[reportPreview.reportActionID]: null},
    });

    // Create the MOVED report action and add it to the DM chat which indicates to the user where the report has been moved
    const movedReportAction = ReportUtils.buildOptimisticMovedReportAction(oldPersonalPolicyID, policyID, memberData.workspaceChatReportID, iouReportID, workspaceName);
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

    API.write(
        'CreateWorkspaceFromIOUPayment',
        {
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
        },
        {optimisticData, successData, failureData},
    );

    return policyID;
}

export {
    removeMembers,
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
    removeWorkspace,
    createWorkspaceFromIOUPayment,
    setWorkspaceInviteMembersDraft,
    clearErrors,
    dismissAddedWithPrimaryLoginMessages,
    openDraftWorkspaceRequest,
    buildOptimisticPolicyRecentlyUsedCategories,
    createDraftInitialWorkspace,
    setWorkspaceInviteMessageDraft,
};
