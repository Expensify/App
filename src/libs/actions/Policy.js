import _ from 'underscore';
import Onyx from 'react-native-onyx';
import {GetPolicySummaryList, GetPolicyList, Policy_Employees_Merge} from '../API';
import ONYXKEYS from '../../ONYXKEYS';
import {formatPersonalDetails} from './PersonalDetails';
import Growl from '../Growl';
import CONST from '../../CONST';
import {translate} from '../translate';

const allPolicies = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (val, key) => {
        if (val && key) {
            allPolicies[key] = {...allPolicies[key], ...val};
        }
    },
});

let translateLocal = (phrase, variables) => translate(CONST.DEFAULT_LOCALE, phrase, variables);
Onyx.connect({
    key: ONYXKEYS.PREFERRED_LOCALE,
    callback: (preferredLocale) => {
        if (preferredLocale) {
            translateLocal = (phrase, variables) => translate(preferredLocale, phrase, variables);
        }
    },
});

/**
 * Takes a full policy summary that is returned from the policySummaryList and simplifies it so we are only storing
 * the pieces of data that we need to in Onyx
 *
 * @param {Object} fullPolicy
 * @param {String} fullPolicy.name
 * @returns {Object}
 */
function getSimplifiedPolicyObject(fullPolicy) {
    return {
        name: fullPolicy.name,
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
    policy.employeeList.push(login);

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

            Growl.show(errorMessage, CONST.GROWL.ERROR, 5000);
        });
}

export {
    getPolicySummaries,
    getPolicyList,
    invite,
};
