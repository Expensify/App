import {useOnyx} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function usePolicy(policyID?: string) {
    const getPolicyID = () => {
        if (!policyID || policyID === CONST.POLICY.OWNER_EMAIL_FAKE || policyID === '-1') {
            return '-1';
        }
        return policyID;
    };

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getPolicyID()}`);
    return policy;
}

export default usePolicy;
