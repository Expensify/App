import _ from 'underscore';
import Onyx from 'react-native-onyx';
import {GetPolicySummaryList} from '../API';
import ONYXKEYS from '../../ONYXKEYS';

function getSimplifiedPolicyObject(fullPolicy) {
    return {
        name: fullPolicy.name,
    };
}

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

export {
    // eslint-disable-next-line import/prefer-default-export
    getPolicySummaries,
};
