import _ from 'underscore';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as OptionsListUtils from '../OptionsListUtils';

let persistedRequests;
Onyx.connect({
    key: ONYXKEYS.NETWORK_REQUEST_QUEUE,
    callback: (val) => {
        if (!val) {
            return;
        }
        persistedRequests = val;
    },
});

/**
 * Modifies the persisted request of Policy_Employees_Merge API
 * If removing a user after inviting them in offline mode, this function will modify the Request_Policy_Employees_Merge
 * request to exclude the removed email(s)
 *
 * @param {String} policyID
 * @param {Array<String>} logins emails to be exluded
 */
function modifyPersistedRequest_Policy_Employees_Merge(policyID, logins) {
    const commandName = 'Policy_Employees_Merge';
    let isModified = false;

    // Iterate through all persistedRequests of NETWORK_REQUEST_QUEUE
    const updatedPersistedRequest = _.compact(_.map(
        persistedRequests,
        (req) => {
            if (req.command !== commandName || req.data.policyID !== policyID) {
                return req;
            }

            // Invited employees of Policy_Employees_Merge persisted request
            const reqEmployees = _.pluck(JSON.parse(req.data.employees), 'email');

            // Employees to be excluded
            const removedLogins = _.intersection(reqEmployees, logins);
            if (_.isEmpty(removedLogins)) {
                return req;
            }

            // Flag to tell wheter NETWORK_REQUEST_QUEUE has been modifed
            isModified = true;

            // Remaining invited employees after exlusion
            const filteredLogins = _.without(reqEmployees, ...removedLogins);
            if (_.isEmpty(filteredLogins)) {
                // Remaining invited employees is empty, remove the request
                return null;
            }

            // Modified request object without logins
            const removedLoginsRequest = _.clone(req);
            removedLoginsRequest.data.employees = JSON.stringify(
                _.map(filteredLogins, login => ({email: OptionsListUtils.addSMSDomainIfPhoneNumber(login)})),
            );

            return removedLoginsRequest;
        },
    ));

    // NETWORK_REQUEST_QUEUE has been modifed, need to save it to Onyx
    if (isModified) {
        Onyx.set(ONYXKEYS.NETWORK_REQUEST_QUEUE, updatedPersistedRequest);
    }
}

export default {
    modifyPersistedRequest_Policy_Employees_Merge,
};
