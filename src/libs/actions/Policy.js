import _ from 'underscore';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import {PUBLIC_DOMAINS} from 'expensify-common/lib/CONST';
import Str from 'expensify-common/lib/str';
import * as DeprecatedAPI from '../deprecatedAPI';
import * as API from '../API';
import ONYXKEYS from '../../ONYXKEYS';
import * as PersonalDetails from './PersonalDetails';
import Growl from '../Growl';
import CONFIG from '../../CONFIG';
import CONST from '../../CONST';
import * as Localize from '../Localize';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';
import * as OptionsListUtils from '../OptionsListUtils';
import * as Report from './Report';
import * as Pusher from '../Pusher/pusher';
import DateUtils from '../DateUtils';
import * as ReportUtils from '../ReportUtils';

const allPolicies = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (val, key) => {
        if (!val || !key) {
            return;
        }

        allPolicies[key] = val;
    },
});
let sessionEmail = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        sessionEmail = lodashGet(val, 'email', '');
    },
});

/**
 * Simplifies the employeeList response into an object mapping employee email to a default employee list entry
 *
 * @param {Object} employeeList
 * @returns {Object}
 */
function getSimplifiedEmployeeList(employeeList) {
    return _.chain(employeeList)
        .pluck('email')
        .flatten()
        .unique()
        .reduce((map, email) => ({...map, [email]: {}}), {})
        .value();
}

/**
 * Takes a full policy that is returned from the policyList and simplifies it so we are only storing
 * the pieces of data that we need to in Onyx
 *
 * @param {Object} fullPolicyOrPolicySummary
 * @param {String} fullPolicyOrPolicySummary.id
 * @param {String} fullPolicyOrPolicySummary.name
 * @param {String} fullPolicyOrPolicySummary.role
 * @param {String} fullPolicyOrPolicySummary.type
 * @param {String} fullPolicyOrPolicySummary.outputCurrency
 * @param {String} [fullPolicyOrPolicySummary.avatar]
 * @param {String} [fullPolicyOrPolicySummary.value.avatar]
 * @param {Object} [fullPolicyOrPolicySummary.value.employeeList]
 * @param {Object} [fullPolicyOrPolicySummary.value.customUnits]
 * @param {Boolean} isFromFullPolicy,
 * @returns {Object}
 */
function getSimplifiedPolicyObject(fullPolicyOrPolicySummary, isFromFullPolicy) {
    return {
        isFromFullPolicy,
        id: fullPolicyOrPolicySummary.id,
        name: fullPolicyOrPolicySummary.name,
        role: fullPolicyOrPolicySummary.role,
        type: fullPolicyOrPolicySummary.type,
        owner: fullPolicyOrPolicySummary.owner,
        outputCurrency: fullPolicyOrPolicySummary.outputCurrency,

        // "GetFullPolicy" and "GetPolicySummaryList" returns different policy objects. If policy is retrieved by "GetFullPolicy",
        // avatar will be nested within the key "value"
        avatar: fullPolicyOrPolicySummary.avatar
            || lodashGet(fullPolicyOrPolicySummary, 'value.avatar', ''),
        customUnits: lodashGet(fullPolicyOrPolicySummary, 'value.customUnits', {}),
    };
}

/**
 * Used to update ALL of the policies at once. If a policy is present locally, but not in the policies object passed here it will be removed.
 * @param {Object} policyCollection - object of policy key and partial policy object
 */
function updateAllPolicies(policyCollection) {
    // Clear out locally cached policies that have been deleted (i.e. they exist locally but not in our new policy collection object)
    _.each(allPolicies, (policy, key) => {
        if (policyCollection[key]) {
            return;
        }

        Onyx.set(key, null);
    });

    // Set all the policies
    _.each(policyCollection, (policyData, key) => {
        Onyx.merge(key, {...policyData, alertMessage: '', errors: null});
    });
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
            },
        })),
    ];

    // Restore the old report stateNum and statusNum
    const failureData = [
        ..._.map(reports, ({reportID, stateNum, statusNum}) => ({
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                stateNum,
                statusNum,
            },
        })),
    ];

    // We don't need success data since the push notification will update
    // the onyxData for all connected clients.
    const successData = [];
    API.write('DeleteWorkspace', {policyID}, {optimisticData, successData, failureData});
}

/**
 * Fetches policy list from the API and saves a simplified version in Onyx, optionally creating a new policy first.
 *
 * More specifically, this action will:
 * 1. Optionally create a new policy.
 * 2. Fetch policy summaries.
 * 3. Optionally navigate to the new policy.
 * 4. Then fetch full policies.
 *
 * This way, we ensure that there's no race condition between creating the new policy and fetching existing ones,
 * and we also don't have to wait for full policies to load before navigating to the new policy.
 */
function getPolicyList() {
    Onyx.set(ONYXKEYS.IS_LOADING_POLICY_DATA, true);
    DeprecatedAPI.GetPolicySummaryList()
        .then((data) => {
            if (data.jsonCode !== 200) {
                Onyx.set(ONYXKEYS.IS_LOADING_POLICY_DATA, false);
                return;
            }

            const policyCollection = _.reduce(data.policySummaryList, (memo, policy) => ({
                ...memo,
                [`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: getSimplifiedPolicyObject(policy, false),
            }), {});

            if (!_.isEmpty(policyCollection)) {
                updateAllPolicies(policyCollection);
            }

            Onyx.set(ONYXKEYS.IS_LOADING_POLICY_DATA, false);
        });
}

/**
 * @param {String} policyID
 */
function loadFullPolicy(policyID) {
    DeprecatedAPI.GetFullPolicy(policyID)
        .then((data) => {
            if (data.jsonCode !== 200) {
                return;
            }

            const policy = lodashGet(data, 'policyList[0]', {});
            if (!policy.id) {
                return;
            }

            Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, getSimplifiedPolicyObject(policy, true));
            Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_MEMBER_LIST}${policy.id}`, getSimplifiedEmployeeList(lodashGet(policy, 'value.employeeList', {})));
        });
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

    const employeeListUpdate = {};
    _.each(members, login => employeeListUpdate[login] = null);
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_MEMBER_LIST}${policyID}`, employeeListUpdate);

    // Make the API call to remove a login from the policy
    DeprecatedAPI.Policy_Employees_Remove({
        emailList: members.join(','),
        policyID,
    })
        .then((data) => {
            if (data.jsonCode === 200) {
                return;
            }

            // Rollback removal on failure
            _.each(members, login => employeeListUpdate[login] = {});
            Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_MEMBER_LIST}${policyID}`, employeeListUpdate);

            // Show the user feedback that the removal failed
            const errorMessage = data.jsonCode === 666 ? data.message : Localize.translateLocal('workspace.people.genericFailureMessage');
            Growl.show(errorMessage, CONST.GROWL.ERROR, 5000);
        });
}

/**
 * Merges the passed in login into the specified policy
 *
 * @param {Array<String>} logins
 * @param {String} welcomeNote
 * @param {String} policyID
 */
function invite(logins, welcomeNote, policyID) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        alertMessage: '',
    });

    // Optimistically add the user to the policy
    const newEmployeeLogins = _.map(logins, login => OptionsListUtils.addSMSDomainIfPhoneNumber(login));
    const employeeUpdate = {};
    _.each(newEmployeeLogins, login => employeeUpdate[login] = {});
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_MEMBER_LIST}${policyID}`, employeeUpdate);

    // Make the API call to merge the login into the policy
    DeprecatedAPI.Policy_Employees_Merge({
        employees: JSON.stringify(_.map(logins, login => ({email: login}))),
        welcomeNote,
        policyID,
    })
        .then((data) => {
            // Save the personalDetails for the invited user in Onyx and fetch the latest policyExpenseChats
            if (data.jsonCode === 200) {
                Onyx.merge(ONYXKEYS.PERSONAL_DETAILS, PersonalDetails.formatPersonalDetails(data.personalDetails));
                Navigation.goBack();
                if (!_.isEmpty(data.policyExpenseChatIDs)) {
                    Report.fetchChatReportsByIDs(data.policyExpenseChatIDs);
                }
                return;
            }

            // If the operation failed, undo the optimistic addition
            _.each(newEmployeeLogins, login => employeeUpdate[login] = null);
            Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_MEMBER_LIST}${policyID}`, employeeUpdate);

            // Show the user feedback that the addition failed
            let alertMessage = Localize.translateLocal('workspace.invite.genericFailureMessage');
            if (data.jsonCode === 402) {
                alertMessage += ` ${Localize.translateLocal('workspace.invite.pleaseEnterValidLogin')}`;
            }
            Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {alertMessage});
        });
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
 */
function updateWorkspaceCustomUnit(policyID, currentCustomUnit, newCustomUnit) {
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
        customUnit: JSON.stringify(newCustomUnit),
    }, {optimisticData, successData, failureData});
}

/**
 * @param {String} policyID
 * @param {Object} currentCustomUnitRate
 * @param {String} customUnitID
 * @param {Object} newCustomUnitRate
 */
function updateCustomUnitRate(policyID, currentCustomUnitRate, customUnitID, newCustomUnitRate) {
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
        customUnitRate: JSON.stringify(newCustomUnitRate),
    }, {optimisticData, successData, failureData});
}

/**
 * Stores in Onyx the policy ID of the last workspace that was accessed by the user
 * @param {String} policyID
 */
function updateLastAccessedWorkspace(policyID) {
    Onyx.set(ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID, policyID);
}

/**
 * Subscribe to public-policyEditor-[policyID] events.
 */
function subscribeToPolicyEvents() {
    _.each(allPolicies, (policy) => {
        const pusherChannelName = `public-policyEditor-${policy.id}${CONFIG.PUSHER.SUFFIX}`;
        Pusher.subscribe(pusherChannelName, 'policyEmployeeRemoved', ({removedEmails, policyExpenseChatIDs, defaultRoomChatIDs}) => {
            // Refetch the policy expense chats to update their state and their actions to get the archive reason
            if (!_.isEmpty(policyExpenseChatIDs)) {
                Report.fetchChatReportsByIDs(policyExpenseChatIDs);
                _.each(policyExpenseChatIDs, (reportID) => {
                    Report.reconnect(reportID);
                });
            }

            // Remove the default chats if we are one of the users getting removed
            if (removedEmails.includes(sessionEmail) && !_.isEmpty(defaultRoomChatIDs)) {
                _.each(defaultRoomChatIDs, (chatID) => {
                    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatID}`, null);
                });
            }
        });
    });
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
 * Generate a policy name based on an email and policy list.
 * @returns {String}
 */
function generateDefaultWorkspaceName() {
    const emailParts = sessionEmail.split('@');
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

    // Check if this name already exists in the policies
    let suffix = 0;
    _.forEach(allPolicies, (policy) => {
        // Get the name of the policy
        const {name} = policy;

        if (name.toLowerCase().includes(defaultWorkspaceName.toLowerCase())) {
            suffix += 1;
        }
    });

    return suffix > 0 ? `${defaultWorkspaceName} ${suffix}` : defaultWorkspaceName;
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
 */
function createWorkspace() {
    const policyID = generatePolicyID();
    const workspaceName = generateDefaultWorkspaceName();

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
            value: announceChatData,
        },
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${announceChatReportID}`,
            value: announceReportActionData,
        },
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${adminsChatReportID}`,
            value: adminsChatData,
        },
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminsChatReportID}`,
            value: adminsReportActionData,
        },
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseChatReportID}`,
            value: expenseChatData,
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
            value: {pendingAction: null},
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
            value: {pendingAction: null},
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
            value: {pendingAction: null},
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
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: null,
        },
        {
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
            Navigation.dismissModal(); // Dismiss /transition route for OldDot to NewDot transitions
            Navigation.navigate(ROUTES.getWorkspaceInitialRoute(policyID));
        });
}

function openWorkspaceReimburseView(policyID) {
    API.read('OpenWorkspaceReimburseView', {policyID});
}

function openWorkspaceMembersPage(policyID, clientMemberEmails) {
    API.read('OpenWorkspaceMembersPage', {
        policyID,
        clientMemberEmails: JSON.stringify(clientMemberEmails),
    });
}

function openWorkspaceInvitePage(policyID, clientMemberEmails) {
    API.read('OpenWorkspaceInvitePage', {
        policyID,
        clientMemberEmails: JSON.stringify(clientMemberEmails),
    });
}

export {
    getPolicyList,
    loadFullPolicy,
    removeMembers,
    invite,
    isAdminOfFreePolicy,
    setWorkspaceErrors,
    clearCustomUnitErrors,
    hideWorkspaceAlertMessage,
    deleteWorkspace,
    updateWorkspaceCustomUnit,
    updateCustomUnitRate,
    updateLastAccessedWorkspace,
    subscribeToPolicyEvents,
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
};
