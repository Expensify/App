import _ from 'underscore';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import {PUBLIC_DOMAINS} from 'expensify-common/lib/CONST';
import Str from 'expensify-common/lib/str';
import {escapeRegExp} from 'lodash';
import * as API from '../API';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import * as NumberUtils from '../NumberUtils';
import * as OptionsListUtils from '../OptionsListUtils';
import * as ErrorUtils from '../ErrorUtils';
import * as ReportUtils from '../ReportUtils';
import * as PersonalDetailsUtils from '../PersonalDetailsUtils';
import Log from '../Log';
import Permissions from '../Permissions';

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
            });
            Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, cleanUpMergeQueries);
            Onyx.multiSet(cleanUpSetQueries);
            delete allPolicies[key];
            return;
        }

        allPolicies[key] = val;
    },
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

let loginList;
Onyx.connect({
    key: ONYXKEYS.LOGIN_LIST,
    callback: (val) => (loginList = val),
});

/**
 * Stores in Onyx the policy ID of the last workspace that was accessed by the user
 * @param {String|null} policyID
 */
function updateLastAccessedWorkspace(policyID) {
    Onyx.set(ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID, policyID);
}

/**
 * Delete the workspace
 *
 * @param {String} policyID
 * @param {Array<Object>} reports
 * @param {String} policyName
 */
function deleteWorkspace(policyID, reports, policyName) {
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

        // Add closed actions to all chat reports linked to this policy
        ..._.map(reports, ({reportID, ownerAccountID}) => {
            // Announce & admin chats have FAKE owners, but workspace chats w/ users do have owners.
            let reportOwnerEmail = CONST.POLICY.OWNER_EMAIL_FAKE;
            if (ownerAccountID !== CONST.POLICY.OWNER_ACCOUNT_ID_FAKE) {
                reportOwnerEmail = lodashGet(allPersonalDetails, [ownerAccountID, 'login'], '');
            }
            const optimisticClosedReportAction = ReportUtils.buildOptimisticClosedReportAction(reportOwnerEmail, policyName, CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED);
            const optimisticReportActions = {};
            optimisticReportActions[optimisticClosedReportAction.reportActionID] = optimisticClosedReportAction;
            return {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
                value: optimisticReportActions,
            };
        }),
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
 * @param {Array} policies
 * @returns {Boolean}
 */
function isAdminOfFreePolicy(policies) {
    return _.some(policies, (policy) => policy && policy.type === CONST.POLICY.TYPE.FREE && policy.role === CONST.POLICY.ROLE.ADMIN);
}

/**
 * Is the user the owner of the given policy?
 *
 * @param {Object} policy
 * @returns {Boolean}
 */
function isPolicyOwner(policy) {
    return _.keys(loginList).includes(policy.owner);
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
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: membersListKey,
            value: _.object(accountIDs, Array(accountIDs.length).fill({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE})),
        },
    ];
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
 * @param {Array} betas
 * @returns {Object} - object with onyxSuccessData, onyxOptimisticData, and optimisticReportIDs (map login to reportID)
 */
function createPolicyExpenseChats(policyID, invitedEmailsToAccountIDs, betas) {
    const workspaceMembersChats = {
        onyxSuccessData: [],
        onyxOptimisticData: [],
        onyxFailureData: [],
        reportCreationData: {},
    };

    // If the user is not in the beta, we don't want to create any chats
    if (!Permissions.canUsePolicyExpenseChat(betas)) {
        return workspaceMembersChats;
    }

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
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticReport.reportID}`,
            value: {
                isLoadingReportActions: false,
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
 * @param {Array<String>} betas
 */
function addMembersToWorkspace(invitedEmailsToAccountIDs, welcomeNote, policyID, betas) {
    const membersListKey = `${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`;
    const logins = _.map(_.keys(invitedEmailsToAccountIDs), (memberLogin) => OptionsListUtils.addSMSDomainIfPhoneNumber(memberLogin));
    const accountIDs = _.values(invitedEmailsToAccountIDs);
    const newPersonalDetailsOnyxData = PersonalDetailsUtils.getNewPersonalDetailsOnyxData(logins, accountIDs);

    // create onyx data for policy expense chats for each new member
    const membersChats = createPolicyExpenseChats(policyID, invitedEmailsToAccountIDs, betas);

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: membersListKey,

            // Convert to object with each key containing {pendingAction: ‘add’}
            value: _.object(accountIDs, Array(accountIDs.length).fill({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD})),
        },
        ...newPersonalDetailsOnyxData.optimisticData,
        ...membersChats.onyxOptimisticData,
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
            },
        },
    ];

    API.write('UpdateWorkspaceGeneralSettings', {policyID, workspaceName: name, currency}, {optimisticData, successData, failureData});
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

    API.write(
        'UpdateWorkspaceCustomUnitAndRate',
        {
            policyID,
            lastModified,
            customUnit: JSON.stringify(newCustomUnit),
            customUnitRate: JSON.stringify(newCustomUnit.rates),
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
 * @param {Object} invitedEmailsToAccountIDs
 */
function setWorkspaceInviteMembersDraft(policyID, invitedEmailsToAccountIDs) {
    Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policyID}`, invitedEmailsToAccountIDs);
}

/**
 * @param {String} policyID
 */
function clearErrors(policyID) {
    setWorkspaceErrors(policyID, {});
    hideWorkspaceAlertMessage(policyID);
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
    setWorkspaceInviteMembersDraft,
    isPolicyOwner,
    clearErrors,
};
