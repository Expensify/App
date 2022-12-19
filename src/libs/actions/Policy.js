import _ from 'underscore';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import {PUBLIC_DOMAINS} from 'expensify-common/lib/CONST';
import Str from 'expensify-common/lib/str';
import {escapeRegExp} from 'lodash';
import * as API from '../API';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import Localize from '../Localize';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';
import * as OptionsListUtils from '../OptionsListUtils';
import DateUtils from '../DateUtils';
import * as ReportUtils from '../ReportUtils';
import Log from '../Log';

const allPolicies = {};
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

let lastAccessedWorkspacePolicyID = null;
Onyx.connect({
    key: ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID,
    callback: value => lastAccessedWorkspacePolicyID = value,
});

let sessionEmail = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        sessionEmail = lodashGet(val, 'email', '');
    },
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
 */
function deleteWorkspace(policyID, reports) {
    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                errors: null,
            },
        },
        ..._.map(reports, ({reportID}) => ({
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS.CLOSED,
                hasDraft: false,
                oldPolicyName: allPolicies[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`].name,
            },
        })),
    ];

    // Restore the old report stateNum and statusNum
    const failureData = [
        ..._.map(reports, ({
            reportID, stateNum, statusNum, hasDraft, oldPolicyName,
        }) => ({
            onyxMethod: CONST.ONYX.METHOD.MERGE,
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
    return _.some(policies, policy => policy
        && policy.type === CONST.POLICY.TYPE.FREE
        && policy.role === CONST.POLICY.ROLE.ADMIN);
}

/**
* Check if the user has any active free policies (aka workspaces)
*
* @param {Array} policies
* @returns {Boolean}
*/
function hasActiveFreePolicy(policies) {
    const adminFreePolicies = _.filter(policies, policy => policy
        && policy.type === CONST.POLICY.TYPE.FREE
        && policy.role === CONST.POLICY.ROLE.ADMIN);

    if (adminFreePolicies.length === 0) {
        return false;
    }

    if (_.some(adminFreePolicies, policy => !policy.pendingAction)) {
        return true;
    }

    if (_.some(adminFreePolicies, policy => policy.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD)) {
        return true;
    }

    if (_.some(adminFreePolicies, policy => policy.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)) {
        return false;
    }

    // If there are no add or delete pending actions the only option left is an update
    // pendingAction, in which case we should return true.
    return true;
}

/**
 * Remove the passed members from the policy employeeList
 *
 * @param {Array} members
 * @param {String} policyID
 */
function removeMembers(members, policyID) {
    // In case user selects only themselves (admin), their email will be filtered out and the members
    // array passed will be empty, prevent the funtion from proceeding in that case as there is noone to remove
    if (members.length === 0) {
        return;
    }
    const membersListKey = `${ONYXKEYS.COLLECTION.POLICY_MEMBER_LIST}${policyID}`;
    const optimisticData = [{
        onyxMethod: CONST.ONYX.METHOD.MERGE,
        key: membersListKey,
        value: _.object(members, Array(members.length).fill({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE})),
    }];
    const failureData = [{
        onyxMethod: CONST.ONYX.METHOD.MERGE,
        key: membersListKey,
        value: _.object(members, Array(members.length).fill({errors: {[DateUtils.getMicroseconds()]: Localize.translateLocal('workspace.people.error.genericRemove')}})),
    }];
    API.write('DeleteMembersFromWorkspace', {
        emailList: members.join(','),
        policyID,
    }, {optimisticData, failureData});
}

/**
 * Adds members to the specified workspace/policyID
 *
 * @param {Array<String>} memberLogins
 * @param {String} welcomeNote
 * @param {String} policyID
 */
function addMembersToWorkspace(memberLogins, welcomeNote, policyID) {
    const membersListKey = `${ONYXKEYS.COLLECTION.POLICY_MEMBER_LIST}${policyID}`;
    const logins = _.map(memberLogins, memberLogin => OptionsListUtils.addSMSDomainIfPhoneNumber(memberLogin));

    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: membersListKey,

            // Convert to object with each key containing {pendingAction: ‘add’}
            value: _.object(logins, Array(logins.length).fill({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD})),
        },
    ];

    const successData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: membersListKey,

            // Convert to object with each key clearing pendingAction. We don’t
            // need to remove the members since that will be handled by onClose of OfflineWithFeedback.
            value: _.object(logins, Array(logins.length).fill({pendingAction: null, errors: null})),
        },
    ];

    const failureData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: membersListKey,

            // Convert to object with each key containing the error. We don’t
            // need to remove the members since that is handled by onClose of OfflineWithFeedback.
            value: _.object(logins, Array(logins.length).fill({
                errors: {
                    [DateUtils.getMicroseconds()]: Localize.translateLocal('workspace.people.error.genericAdd'),
                },
            })),
        },
    ];

    API.write('AddMembersToWorkspace', {
        employees: JSON.stringify(_.map(logins, login => ({email: login}))),
        welcomeNote,
        policyID,
    }, {optimisticData, successData, failureData});
}

/**
 * Updates a workspace avatar image
 *
 * @param {String} policyID
 * @param {File|Object} file
 */
function updateWorkspaceAvatar(policyID, file) {
    const optimisticData = [{
        onyxMethod: CONST.ONYX.METHOD.MERGE,
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
    }];
    const successData = [{
        onyxMethod: CONST.ONYX.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
        value: {
            pendingFields: {
                avatar: null,
            },
        },
    }];
    const failureData = [{
        onyxMethod: CONST.ONYX.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
        value: {
            avatar: allPolicies[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`].avatar,
            pendingFields: {
                avatar: null,
            },
        },
    }];

    API.write('UpdateWorkspaceAvatar', {policyID, file}, {optimisticData, successData, failureData});
}

/**
 * Deletes the avatar image for the workspace
 * @param {String} policyID
 */
function deleteWorkspaceAvatar(policyID) {
    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
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
            onyxMethod: CONST.ONYX.METHOD.MERGE,
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
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {
                    avatar: null,
                },
                errorFields: {
                    avatar: {
                        [DateUtils.getMicroseconds()]: Localize.translateLocal('avatarWithImagePicker.deleteWorkspaceError'),
                    },
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
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
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
            onyxMethod: CONST.ONYX.METHOD.MERGE,
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
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {
                    generalSettings: null,
                },
                errorFields: {
                    generalSettings: {
                        [DateUtils.getMicroseconds()]: Localize.translateLocal('workspace.editor.genericFailureMessage'),
                    },
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
function updateWorkspaceCustomUnit(policyID, currentCustomUnit, newCustomUnit, lastModified) {
    const optimisticData = [
        {
            onyxMethod: 'merge',
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [newCustomUnit.customUnitID]: {
                        ...newCustomUnit,
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        },
    ];

    const successData = [
        {
            onyxMethod: 'merge',
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [newCustomUnit.customUnitID]: {
                        pendingAction: null,
                        errors: null,
                    },
                },
            },
        },
    ];

    const failureData = [
        {
            onyxMethod: 'merge',
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [currentCustomUnit.customUnitID]: {
                        customUnitID: currentCustomUnit.customUnitID,
                        name: currentCustomUnit.name,
                        attributes: currentCustomUnit.attributes,
                        errors: {
                            [DateUtils.getMicroseconds()]: Localize.translateLocal('workspace.reimburse.updateCustomUnitError'),
                        },
                    },
                },
            },
        },
    ];

    API.write('UpdateWorkspaceCustomUnit', {
        policyID,
        lastModified,
        customUnit: JSON.stringify(newCustomUnit),
    }, {optimisticData, successData, failureData});
}

/**
 * @param {String} policyID
 * @param {Object} currentCustomUnitRate
 * @param {String} customUnitID
 * @param {Object} newCustomUnitRate
 * @param {Number} lastModified
 */
function updateCustomUnitRate(policyID, currentCustomUnitRate, customUnitID, newCustomUnitRate, lastModified) {
    const optimisticData = [
        {
            onyxMethod: 'merge',
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnitID]: {
                        rates: {
                            [newCustomUnitRate.customUnitRateID]: {
                                ...newCustomUnitRate,
                                errors: null,
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData = [
        {
            onyxMethod: 'merge',
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnitID]: {
                        rates: {
                            [newCustomUnitRate.customUnitRateID]: {
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
            onyxMethod: 'merge',
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnitID]: {
                        rates: {
                            [currentCustomUnitRate.customUnitRateID]: {
                                ...currentCustomUnitRate,
                                errors: {
                                    [DateUtils.getMicroseconds()]: Localize.translateLocal('workspace.reimburse.updateCustomUnitError'),
                                },
                            },
                        },
                    },
                },
            },
        },
    ];

    API.write('UpdateWorkspaceCustomUnitRate', {
        policyID,
        customUnitID,
        lastModified,
        customUnitRate: JSON.stringify(newCustomUnitRate),
    }, {optimisticData, successData, failureData});
}

/**
 * Removes an error after trying to delete a member
 *
 * @param {String} policyID
 * @param {String} memberEmail
 */
function clearDeleteMemberError(policyID, memberEmail) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_MEMBER_LIST}${policyID}`, {
        [memberEmail]: {
            pendingAction: null,
            errors: null,
        },
    });
}

/**
 * Removes an error after trying to add a member
 *
 * @param {String} policyID
 * @param {String} memberEmail
 */
function clearAddMemberError(policyID, memberEmail) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_MEMBER_LIST}${policyID}`, {
        [memberEmail]: null,
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
        .filter(policy => policy.name && numberRegEx.test(policy.name))
        .map(policy => parseInt(numberRegEx.exec(policy.name)[1] || 1, 10)) // parse the number at the end
        .max()
        .value();
    return lastWorkspaceNumber !== -Infinity ? `${defaultWorkspaceName} ${lastWorkspaceNumber + 1}` : defaultWorkspaceName;
}

/**
 * Returns a client generated 16 character hexadecimal value for the policyID
 * @returns {String}
 */
function generatePolicyID() {
    return _.times(16, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
}

/**
 * Optimistically creates a new workspace and default workspace chats
 *
 * @param {String} [ownerEmail] Optional, the email of the account to make the owner of the policy
 * @param {Boolean} [makeMeAdmin] Optional, leave the calling account as an admin on the policy
 * @param {String} [policyName] Optional, custom policy name we will use for created workspace
 * @param {Boolean} [transitionFromOldDot] Optional, if the user is transitioning from old dot
 */
function createWorkspace(ownerEmail = '', makeMeAdmin = false, policyName = '', transitionFromOldDot = false) {
    const policyID = generatePolicyID();
    const workspaceName = policyName || generateDefaultWorkspaceName(ownerEmail);

    const {
        announceChatReportID,
        announceChatData,
        announceReportActionData,
        adminsChatReportID,
        adminsChatData,
        adminsReportActionData,
        expenseChatReportID,
        expenseChatData,
        expenseReportActionData,
    } = ReportUtils.buildOptimisticWorkspaceChats(policyID, workspaceName);

    API.write('CreateWorkspace', {
        policyID,
        announceChatReportID,
        adminsChatReportID,
        expenseChatReportID,
        ownerEmail,
        makeMeAdmin,
        policyName: workspaceName,
        type: CONST.POLICY.TYPE.FREE,
    },
    {
        optimisticData: [{
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                id: policyID,
                type: CONST.POLICY.TYPE.FREE,
                name: workspaceName,
                role: CONST.POLICY.ROLE.ADMIN,
                owner: sessionEmail,
                outputCurrency: 'USD',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        },
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_MEMBER_LIST}${policyID}`,
            value: {
                [sessionEmail]: {
                    role: CONST.POLICY.ROLE.ADMIN,
                    errors: {},
                },
            },
        },
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${announceChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                ...announceChatData,
            },
        },
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${announceChatReportID}`,
            value: announceReportActionData,
        },
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${adminsChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                ...adminsChatData,
            },
        },
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminsChatReportID}`,
            value: adminsReportActionData,
        },
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                ...expenseChatData,
            },
        },
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseChatReportID}`,
            value: expenseReportActionData,
        }],
        successData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {pendingAction: null},
        },
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${announceChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
                pendingAction: null,
            },
        },
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${announceChatReportID}`,
            value: {
                0: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${adminsChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
                pendingAction: null,
            },
        },
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminsChatReportID}`,
            value: {
                0: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseChatReportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
                pendingAction: null,
            },
        },
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseChatReportID}`,
            value: {
                0: {
                    pendingAction: null,
                },
            },
        }],
        failureData: [{
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_MEMBER_LIST}${policyID}`,
            value: null,
        },
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${announceChatReportID}`,
            value: null,
        },
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${announceChatReportID}`,
            value: null,
        },
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${adminsChatReportID}`,
            value: null,
        },
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminsChatReportID}`,
            value: null,
        },
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseChatReportID}`,
            value: null,
        },
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseChatReportID}`,
            value: null,
        }],
    });

    Navigation.isNavigationReady()
        .then(() => {
            if (transitionFromOldDot) {
                Navigation.dismissModal(); // Dismiss /transition route for OldDot to NewDot transitions
            }
            Navigation.navigate(ROUTES.getWorkspaceInitialRoute(policyID));
        });
}

/**
 *
 * @param {string} policyID
 * @param {string} subStep The sub step in first step of adding withdrawal bank account
 * @param {*} localCurrentStep The locally stored current step of adding a withdrawal bank account
 */
function openWorkspaceReimburseView(policyID, subStep, localCurrentStep) {
    if (!policyID) {
        Log.warn('openWorkspaceReimburseView invalid params', {policyID});
        return;
    }
    const onyxData = {
        successData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {
                    isLoading: false,
                },
            },
        ],
    };

    API.read('OpenWorkspaceReimburseView', {policyID, subStep, localCurrentStep}, onyxData);
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

export {
    removeMembers,
    addMembersToWorkspace,
    isAdminOfFreePolicy,
    hasActiveFreePolicy,
    setWorkspaceErrors,
    clearCustomUnitErrors,
    hideWorkspaceAlertMessage,
    deleteWorkspace,
    updateWorkspaceCustomUnit,
    updateCustomUnitRate,
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
};
