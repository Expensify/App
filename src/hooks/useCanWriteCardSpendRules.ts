import {canMemberWrite} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import usePolicy from './usePolicy';

function useCanWriteCardSpendRules(policyID: string | undefined): boolean {
    const policy = usePolicy(policyID);
    const {login = ''} = useCurrentUserPersonalDetails();

    return canMemberWrite(policy, login, CONST.POLICY.POLICY_FEATURE.RULES) || canMemberWrite(policy, login, CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD);
}

export default useCanWriteCardSpendRules;
