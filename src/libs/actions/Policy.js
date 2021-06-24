import _ from 'underscore';
import Onyx from 'react-native-onyx';
import {
    GetPolicySummaryList, GetPolicyList, Policy_Employees_Merge, Policy_Create, Policy_Employees_Remove,
} from '../API';
import ONYXKEYS from '../../ONYXKEYS';
import {formatPersonalDetails} from './PersonalDetails';
import Growl from '../Growl';
import CONST from '../../CONST';
import {translateLocal} from '../translate';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';

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
 * Simplifies the policyList response into an object containing an array of emails
 *
 * @param {Object} fullPolicy
 * @returns {Object}
 */
function getSimplifiedEmployeeListObject(fullPolicy) {
    const employeeListEmails = _.chain(fullPolicy.value.employeeList)
        .pluck('email')
        .flatten()
        .unique()
        .value();

    return {
        employeeList: employeeListEmails,
    };
}

/**
 * Fetches the policySummaryList from the API and saves a simplified version in Onyx
 */
function getPolicySummaries() {
    GetPolicySummaryList()
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
    GetPolicyList()
        .then((data) => {
            if (data.jsonCode === 200) {
                const policyDataToStore = _.reduce(data.policyList, (memo, policy) => ({
                    ...memo,
                    [`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: getSimplifiedEmployeeListObject(policy),
                }), {});
                Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, policyDataToStore);
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
    const key = `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;

    // Make a shallow copy to preserve original data and remove the members
    const policy = _.clone(allPolicies[key]);
    policy.employeeList = policy.employeeList.filter(email => !members.includes(email));

    // Optimistically remove the members from the policy
    Onyx.set(key, policy);

    // Make the API call to merge the login into the policy
    Policy_Employees_Remove({
        emailList: members,
        policyID,
    })
        .then((data) => {
            if (data.jsonCode === 200) {
                return;
            }
            
            // If the operation failed, undo the optimistic removal
            const policyDataWithMembersRemoved = _.clone(allPolicies[key]);
            policyDataWithMembersRemoved.employeeList = [...policyDataWithMembersRemoved.employeeList, ...members];
            Onyx.set(key, policyDataWithMembersRemoved);

            // Show the user feedback that the removal failed
            let errorMessage = translateLocal('workspace.people.genericFailureMessage');
            if (data.jsonCode === 401) {
                errorMessage += ` ${translateLocal('workspace.people.onlyAdminCanRemove')}`;
            }
            if (data.jsonCode === 402) {
                errorMessage += ` ${translateLocal('workspace.people.cannotRemovePolicyOwner')}`;
            }

            Growl.show(errorMessage, CONST.GROWL.ERROR, 5000);
        });
}

/**
 * Merges the passed in login into the specified policy
 *
 * @param {String} login
 * @param {String} welcomeNote
 * @param {String} policyID
 */
function invite(login, welcomeNote, policyID) {
    const key = `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;

    // Make a shallow copy to preserve original data, and concat the login
    const policy = _.clone(allPolicies[key]);
    policy.employeeList = [...policy.employeeList, login];

    // Optimistically add the user to the policy
    Onyx.set(key, policy);

    // Make the API call to merge the login into the policy
    Policy_Employees_Merge({
        employees: JSON.stringify([{email: login}]),
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
            policyDataWithoutLogin.employeeList = _.without(allPolicies[key].employeeList, login);
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
 * @param {String} name
 */
function create(name) {
    Policy_Create({type: CONST.POLICY.TYPE.FREE, policyName: name})
        .then((response) => {
            if (response.jsonCode !== 200) {
                // Show the user feedback
                const errorMessage = translateLocal('workspace.new.genericFailureMessage');
                Growl.error(errorMessage, 5000);
                return;
            }

            Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${response.policyID}`, {
                id: response.policyID,
                type: response.policy.type,
                name: response.policy.name,
            });
            Navigation.navigate(ROUTES.getWorkspaceRoute(response.policyID));
        });
}

export {
    getPolicySummaries,
    getPolicyList,
    removeMembers,
    invite,
    create,
};
