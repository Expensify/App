import _ from 'underscore';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import * as API from '../API';
import ONYXKEYS from '../../ONYXKEYS';
import {formatPersonalDetails} from './PersonalDetails';
import Growl from '../Growl';
import CONST from '../../CONST';
import {translateLocal} from '../translate';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';
import {addSMSDomainIfPhoneNumber} from '../OptionsListUtils';

const allPolicies = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (val, key) => {
        if (val && key) {
            allPolicies[key] = {...allPolicies[key], ...val};
        }
    },
});

/**
 * Takes a full policy summary that is returned from the policySummaryList and simplifies it so we are only storing
 * the pieces of data that we need to in Onyx
 *
 * @param {Object} fullPolicy
 * @param {String} fullPolicy.id
 * @param {String} fullPolicy.name
 * @param {String} fullPolicy.role
 * @param {String} fullPolicy.type
 * @returns {Object}
 */
function getSimplifiedPolicyObject(fullPolicy) {
    return {
        id: fullPolicy.id,
        name: fullPolicy.name,
        role: fullPolicy.role,
        type: fullPolicy.type,
    };
}

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
 * Fetches the policySummaryList from the API and saves a simplified version in Onyx
 */
function getPolicySummaries() {
    API.GetPolicySummaryList()
        .then((data) => {
            if (data.jsonCode === 200) {
                const policyDataToStore = _.reduce(data.policySummaryList, (memo, policy) => ({
                    ...memo,
                    [`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: getSimplifiedPolicyObject(policy),
                }), {});
                Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, policyDataToStore);
            }
        });
}

/**
 * Fetches the policyList from the API and saves a simplified version in Onyx
 */
function getPolicyList() {
    API.GetPolicyList()
        .then((data) => {
            if (data.jsonCode === 200) {
                const policyDataToStore = _.reduce(data.policyList, (memo, policy) => ({
                    ...memo,
                    [`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: {
                        employeeList: getSimplifiedEmployeeList(policy.value.employeeList),
                        avatarURL: lodashGet(policy, 'value.avatarURL', ''),
                    },
                }), {});

                Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, {
                    // Erase all policies in Onyx
                    ...(_.reduce(_.keys(allPolicies), (memo, key) => ({...memo, [key]: null}), {})),

                    // And overwrite them with only the ones returned by the API call
                    ...policyDataToStore});
            }
        });
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
            Growl.show(translateLocal('workspace.people.genericFailureMessage'), CONST.GROWL.ERROR, 5000);
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
    const newEmployeeList = _.map(logins, login => addSMSDomainIfPhoneNumber(login));

    // Make a shallow copy to preserve original data, and concat the login
    const policy = _.clone(allPolicies[key]);
    policy.employeeList = [...policy.employeeList, ...newEmployeeList];

    // Optimistically add the user to the policy
    Onyx.set(key, policy);

    // Make the API call to merge the login into the policy
    API.Policy_Employees_Merge({
        employees: JSON.stringify(_.map(logins, login => ({email: login}))),
        welcomeNote,
        policyID,
    })
        .then((data) => {
            // Save the personalDetails for the invited user in Onyx
            if (data.jsonCode === 200) {
                Onyx.merge(ONYXKEYS.PERSONAL_DETAILS, formatPersonalDetails(data.personalDetails));
                return;
            }

            // If the operation failed, undo the optimistic addition
            const policyDataWithoutLogin = _.clone(allPolicies[key]);
            policyDataWithoutLogin.employeeList = _.without(allPolicies[key].employeeList, ...newEmployeeList);
            Onyx.set(key, policyDataWithoutLogin);

            // Show the user feedback that the addition failed
            let errorMessage = translateLocal('workspace.invite.genericFailureMessage');
            if (data.jsonCode === 402) {
                errorMessage += ` ${translateLocal('workspace.invite.pleaseEnterValidLogin')}`;
            }

            Growl.error(errorMessage, 5000);
        });
}

/**
 * Merges the passed in login into the specified policy
 *
 * @param {String} [name]
 */
function create(name = '') {
    API.Policy_Create({type: CONST.POLICY.TYPE.FREE, policyName: name})
        .then((response) => {
            if (response.jsonCode !== 200) {
                // Show the user feedback
                const errorMessage = translateLocal('workspace.new.genericFailureMessage');
                Growl.error(errorMessage, 5000);
                return;
            }

            Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${response.policyID}`, {
                employeeList: getSimplifiedEmployeeList(response.policy.employeeList),
                id: response.policyID,
                type: response.policy.type,
                name: response.policy.name,
                role: CONST.POLICY.ROLE.ADMIN,
            });
            Navigation.dismissModal();
            Navigation.navigate(ROUTES.getWorkspaceCardRoute(response.policyID));
            Growl.success(translateLocal('workspace.new.successMessage'));
        });
}

/**
 * @param {Object} file
 * @returns {Promise}
 */
function uploadAvatar(file) {
    return API.User_UploadAvatar({file})
        .then((response) => {
            if (response.jsonCode !== 200) {
                // Show the user feedback
                const errorMessage = translateLocal('workspace.editor.avatarUploadFailureMessage');
                Growl.error(errorMessage, 5000);
                return;
            }

            return response.s3url;
        });
}

/**
 * Sets the name of the policy
 *
 * @param {String} policyID
 * @param {Object} values
 */
function update(policyID, values) {
    API.UpdatePolicy({policyID, value: JSON.stringify(values), lastModified: null})
        .then((policyResponse) => {
            if (policyResponse.jsonCode !== 200) {
                // Show the user feedback
                const errorMessage = translateLocal('workspace.editor.genericFailureMessage');
                Growl.error(errorMessage, 5000);
                return;
            }

            Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, values);
            Navigation.dismissModal();
        });
}

export {
    getPolicySummaries,
    getPolicyList,
    removeMembers,
    invite,
    create,
    uploadAvatar,
    update,
};
