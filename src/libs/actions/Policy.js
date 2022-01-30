import _ from 'underscore';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import * as API from '../API';
import ONYXKEYS from '../../ONYXKEYS';
import * as PersonalDetails from './PersonalDetails';
import Growl from '../Growl';
import CONST from '../../CONST';
import * as Localize from '../Localize';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';
import * as OptionsListUtils from '../OptionsListUtils';
import * as Report from './Report';

const allPolicies = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (val, key) => {
        if (!val || !key) {
            return;
        }

        allPolicies[key] = {...allPolicies[key], ...val};
    },
});

/**
 * Simplifies the employeeList response into an object containing an array of emails
 *
 * @param {Object} employeeList
 * @returns {Array}
 */
function getSimplifiedEmployeeList(employeeList) {
    const employeeListEmails = _.chain(employeeList)
        .pluck('email')
        .flatten()
        .unique()
        .value();

    return employeeListEmails;
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
 * @param {String} [fullPolicyOrPolicySummary.avatarURL]
 * @param {String} [fullPolicyOrPolicySummary.value.avatarURL]
 * @param {Object} [fullPolicyOrPolicySummary.value.employeeList]
 * @param {Object} [fullPolicyOrPolicySummary.value.customUnits]
 * @param {Boolean} isFromFullPolicy,
 * @returns {Object}
 */
function getSimplifiedPolicyObject(fullPolicyOrPolicySummary, isFromFullPolicy) {
    const customUnit = lodashGet(fullPolicyOrPolicySummary, 'value.customUnits[0]', undefined);
    const customUnitValue = lodashGet(customUnit, 'attributes.unit', 'mi');
    const customUnitRate = lodashGet(customUnit, 'rates[0]', {});
    const customUnitSimplified = customUnit && {
        id: customUnit.customUnitID,
        name: customUnit.name,
        value: customUnitValue,
        rate: {
            id: customUnitRate.customUnitRateID,
            name: customUnitRate.name,
            currency: customUnitRate.currency,
            value: Number(customUnitRate.rate),
        },
    };
    return {
        isFromFullPolicy,
        id: fullPolicyOrPolicySummary.id,
        name: fullPolicyOrPolicySummary.name,
        role: fullPolicyOrPolicySummary.role,
        type: fullPolicyOrPolicySummary.type,
        owner: fullPolicyOrPolicySummary.owner,
        outputCurrency: fullPolicyOrPolicySummary.outputCurrency,

        // "GetFullPolicy" and "GetPolicySummaryList" returns different policy objects. If policy is retrieved by "GetFullPolicy",
        // avatarUrl will be nested within the key "value"
        avatarURL: fullPolicyOrPolicySummary.avatarURL || lodashGet(fullPolicyOrPolicySummary, 'value.avatarURL', ''),
        employeeList: getSimplifiedEmployeeList(lodashGet(fullPolicyOrPolicySummary, 'value.employeeList')),
        customUnit: customUnitSimplified,
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
 * Merges the passed in login into the specified policy
 *
 * @param {String} [name]
 * @param {Boolean} [shouldAutomaticallyReroute]
 * @returns {Promise}
 */
function create(name = '') {
    Onyx.set(ONYXKEYS.IS_CREATING_WORKSPACE, true);
    let res = null;
    return API.Policy_Create({type: CONST.POLICY.TYPE.FREE, policyName: name})
        .then((response) => {
            Onyx.set(ONYXKEYS.IS_CREATING_WORKSPACE, false);
            if (response.jsonCode !== 200) {
                // Show the user feedback
                const errorMessage = Localize.translateLocal('workspace.new.genericFailureMessage');
                Growl.error(errorMessage, 5000);
                return;
            }
            res = response;

            // Fetch the default reports on the policy
            Report.fetchChatReportsByIDs([response.policy.chatReportIDAdmins, response.policy.chatReportIDAnnounce]);

            // We are awaiting this merge so that we can guarantee our policy is available to any React components connected to the policies collection before we navigate to a new route.
            return Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${response.policyID}`, {
                employeeList: getSimplifiedEmployeeList(response.policy.employeeList),
                id: response.policyID,
                type: response.policy.type,
                name: response.policy.name,
                role: CONST.POLICY.ROLE.ADMIN,
                outputCurrency: response.policy.outputCurrency,
            });
        })
        .then(() => Promise.resolve(lodashGet(res, 'policyID')));
}

/**
 * @param {String} policyID
 */
function navigateToPolicy(policyID) {
    Navigation.navigate(policyID ? ROUTES.getWorkspaceInitialRoute(policyID) : ROUTES.HOME);
}

/**
 * @param {String} [name]
 */
function createAndNavigate(name = '') {
    create(name).then(navigateToPolicy);
}

/**
 * Delete the policy
 *
 * @param {String} [policyID]
 * @returns {Promise}
 */
function deletePolicy(policyID) {
    return API.Policy_Delete({policyID})
        .then((response) => {
            if (response.jsonCode !== 200) {
                // Show the user feedback
                const errorMessage = Localize.translateLocal('workspace.common.growlMessageOnDeleteError');
                Growl.error(errorMessage, 5000);
                return;
            }

            Growl.show(Localize.translateLocal('workspace.common.growlMessageOnDelete'), CONST.GROWL.SUCCESS, 3000);

            // Removing the workspace data from Onyx as well
            return Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, null);
        })
        .then(() => Report.fetchAllReports(false, true))
        .then(() => {
            Navigation.dismissModal();
            Navigation.navigate(ROUTES.HOME);
            return Promise.resolve();
        });
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
    API.GetPolicySummaryList()
        .then((data) => {
            if (data.jsonCode !== 200) {
                return;
            }

            const policyCollection = _.reduce(data.policySummaryList, (memo, policy) => ({
                ...memo,
                [`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: getSimplifiedPolicyObject(policy, false),
            }), {});

            if (!_.isEmpty(policyCollection)) {
                updateAllPolicies(policyCollection);
            }
        });
}

function createAndGetPolicyList() {
    let newPolicyID;
    create()
        .then((policyID) => {
            newPolicyID = policyID;
            return getPolicyList();
        })
        .then(() => {
            Navigation.dismissModal();
            navigateToPolicy(newPolicyID);
        });
}

/**
 * @param {String} policyID
 */
function loadFullPolicy(policyID) {
    API.GetFullPolicy(policyID)
        .then((data) => {
            if (data.jsonCode !== 200) {
                return;
            }

            const policy = lodashGet(data, 'policyList[0]', {});
            if (!policy.id) {
                return;
            }

            Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, getSimplifiedPolicyObject(policy, true));
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

    const key = `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;

    // Make a shallow copy to preserve original data and remove the members
    const policy = _.clone(allPolicies[key]);
    policy.employeeList = _.without(policy.employeeList, ...members);

    // Optimistically remove the members from the policy
    Onyx.set(key, policy);

    // Make the API call to remove a login from the policy
    API.Policy_Employees_Remove({
        emailList: members.join(','),
        policyID,
    })
        .then((data) => {
            if (data.jsonCode === 200) {
                return;
            }
            const policyDataWithMembersRemoved = _.clone(allPolicies[key]);
            policyDataWithMembersRemoved.employeeList = [...policyDataWithMembersRemoved.employeeList, ...members];
            Onyx.set(key, policyDataWithMembersRemoved);

            // Show the user feedback that the removal failed
            console.error(data.message);
            Growl.show(Localize.translateLocal('workspace.people.genericFailureMessage'), CONST.GROWL.ERROR, 5000);
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
    const key = `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;
    const newEmployeeList = _.map(logins, login => OptionsListUtils.addSMSDomainIfPhoneNumber(login));

    // Make a shallow copy to preserve original data, and concat the login
    const policy = _.clone(allPolicies[key]);
    policy.employeeList = [...policy.employeeList, ...newEmployeeList];
    policy.alertMessage = '';

    // Optimistically add the user to the policy
    Onyx.merge(key, policy);

    // Make the API call to merge the login into the policy
    API.Policy_Employees_Merge({
        employees: JSON.stringify(_.map(logins, login => ({email: login}))),
        welcomeNote,
        policyID,
    })
        .then((data) => {
            // Save the personalDetails for the invited user in Onyx
            if (data.jsonCode === 200) {
                Onyx.merge(ONYXKEYS.PERSONAL_DETAILS, PersonalDetails.formatPersonalDetails(data.personalDetails));
                Navigation.goBack();
                return;
            }

            // If the operation failed, undo the optimistic addition
            const policyDataWithoutLogin = _.clone(allPolicies[key]);
            policyDataWithoutLogin.employeeList = _.without(allPolicies[key].employeeList, ...newEmployeeList);

            // Show the user feedback that the addition failed
            policyDataWithoutLogin.alertMessage = Localize.translateLocal('workspace.invite.genericFailureMessage');
            if (data.jsonCode === 402) {
                policyDataWithoutLogin.alertMessage += ` ${Localize.translateLocal('workspace.invite.pleaseEnterValidLogin')}`;
            }

            Onyx.set(key, policyDataWithoutLogin);
        });
}

/**
 * Sets local values for the policy
 * @param {String} policyID
 * @param {Object} values
 */
function updateLocalPolicyValues(policyID, values) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, values);
}

/**
 * Sets the name of the policy
 *
 * @param {String} policyID
 * @param {Object} values
 * @param {Boolean} [shouldGrowl]
 */
function update(policyID, values, shouldGrowl = false) {
    updateLocalPolicyValues(policyID, {isPolicyUpdating: true});
    API.UpdatePolicy({policyID, value: JSON.stringify(values), lastModified: null})
        .then((policyResponse) => {
            if (policyResponse.jsonCode !== 200) {
                throw new Error();
            }

            updateLocalPolicyValues(policyID, {...values, isPolicyUpdating: false});
            if (shouldGrowl) {
                Growl.show(Localize.translateLocal('workspace.common.growlMessageOnSave'), CONST.GROWL.SUCCESS, 3000);
            }
        }).catch(() => {
            updateLocalPolicyValues(policyID, {isPolicyUpdating: false});

            // Show the user feedback
            const errorMessage = Localize.translateLocal('workspace.editor.genericFailureMessage');
            Growl.error(errorMessage, 5000);
        });
}

/**
 * Uploads the avatar image to S3 bucket and updates the policy with new avatarURL
 *
 * @param {String} policyID
 * @param {Object} file
 */
function uploadAvatar(policyID, file) {
    updateLocalPolicyValues(policyID, {isAvatarUploading: true});
    API.User_UploadAvatar({file})
        .then((response) => {
            if (response.jsonCode === 200) {
                // Update the policy with the new avatarURL as soon as we get it
                Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {avatarURL: response.s3url, isAvatarUploading: false});
                update(policyID, {avatarURL: response.s3url}, true);
                return;
            }

            Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {isAvatarUploading: false});
            const errorMessage = Localize.translateLocal('workspace.editor.avatarUploadFailureMessage');
            Growl.error(errorMessage, 5000);
        });
}

/**
 * @param {String} policyID
 * @param {Object} errors
 */
function setWorkspaceErrors(policyID, errors) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {errors: null});
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {errors});
}

/**
 * @param {String} policyID
 */
function hideWorkspaceAlertMessage(policyID) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {alertMessage: ''});
}

/**
 * @param {String} policyID
 * @param {Object} values
 */
function setCustomUnit(policyID, values) {
    API.Policy_CustomUnit_Update({
        policyID: policyID.toString(),
        customUnit: JSON.stringify(values),
        lastModified: null,
    })
        .then((response) => {
            if (response.jsonCode !== 200) {
                throw new Error();
            }

            updateLocalPolicyValues(policyID, {
                customUnit: {
                    id: values.customUnitID,
                    name: values.name,
                    value: values.attributes.unit,
                },
            });
        }).catch(() => {
            // Show the user feedback
            Growl.error(Localize.translateLocal('workspace.editor.genericFailureMessage'), 5000);
        });
}

/**
 * @param {String} policyID
 * @param {String} customUnitID
 * @param {Object} values
 */
function setCustomUnitRate(policyID, customUnitID, values) {
    API.Policy_CustomUnitRate_Update({
        policyID: policyID.toString(),
        customUnitID: customUnitID.toString(),
        customUnitRate: JSON.stringify(values),
        lastModified: null,
    })
        .then((response) => {
            if (response.jsonCode !== 200) {
                throw new Error();
            }

            updateLocalPolicyValues(policyID, {
                customUnit: {
                    rate: {
                        id: values.customUnitRateID,
                        name: values.name,
                        value: Number(values.rate),
                    },
                },
            });
        }).catch(() => {
            // Show the user feedback
            Growl.error(Localize.translateLocal('workspace.editor.genericFailureMessage'), 5000);
        });
}

/**
 * Stores in Onyx the policy ID of the last workspace that was accessed by the user
 * @param {String} policyID
 */
function updateLastAccessedWorkspace(policyID) {
    Onyx.set(ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID, policyID);
}

export {
    getPolicyList,
    loadFullPolicy,
    removeMembers,
    invite,
    isAdminOfFreePolicy,
    create,
    uploadAvatar,
    update,
    setWorkspaceErrors,
    hideWorkspaceAlertMessage,
    deletePolicy,
    createAndNavigate,
    createAndGetPolicyList,
    setCustomUnit,
    setCustomUnitRate,
    updateLastAccessedWorkspace,
};
