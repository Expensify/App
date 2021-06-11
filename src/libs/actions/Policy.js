import _ from 'underscore';
import Onyx from 'react-native-onyx';
import {GetPolicySummaryList, GetPolicyList, Policy_Employees_Merge} from '../API';
import ONYXKEYS from '../../ONYXKEYS';

const allPolicies = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (val, key) => {
        if (val && key) {
            allPolicies[key] = val;
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
function getSimplifiedMemberList(fullPolicy) {
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
                    [`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: getSimplifiedMemberList(policy),
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
    // Optimistically add the user to the policy
    const key = `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;
    const dataToStore = {};
    dataToStore[key] = {
        employeeList: allPolicies[key].employeeList.concat([login]),
    };

    Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, dataToStore)
        .then(() => {
            const policyDataWithoutLogin = {};
            policyDataWithoutLogin[key] = {
                employeeList: _.without(allPolicies[key].employeeList, login),
            };
            Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, policyDataWithoutLogin)
                .then(() => {
                   console.debug('done');
                });
        });

    // Policy_Employees_Merge({
    //     employees: JSON.stringify([{email: login}]),
    //     welcomeNote,
    //     policyID,
    // })
    //     .then((data) => {
    //         // Save data.personalDetails
    //         if (data.jsonCode !== 200) {
    //             // TODO: need to match personalDetails to data in PersonalDetails.formatPersonalDetails
    //             Onyx.merge(ONYXKEYS.PERSONAL_DETAILS, {[login]: data.personalDetails[login]});
    //             return;
    //         }
    //
    //         // If the operation failed, undo the optimistic addition
    //         const policyDataWithoutLogin = {};
    //         policyDataWithoutLogin[key] = {
    //             employeeList: _.without(allPolicies[key].employeeList, login),
    //         };
    //         Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, policyDataWithoutLogin);
    //     });
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getPolicySummaries,
    getPolicyList,
    invite,
};
