import _ from 'underscore';
import Onyx from 'react-native-onyx';
import {GetPolicySummaryList, GetPolicyList} from '../API';
import ONYXKEYS from '../../ONYXKEYS';

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

export {
    // eslint-disable-next-line import/prefer-default-export
    getPolicySummaries,
    getPolicyList,
};
