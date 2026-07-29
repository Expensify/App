import {canMemberWrite} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AccountData, Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

function shouldOpenBankAccountByPolicy(accountData: AccountData | undefined, policies: OnyxCollection<Policy> | null, currentUserLogin: string | undefined): boolean {
    const policyID = accountData?.additionalData?.policyID;
    if (!policyID || !currentUserLogin) {
        return false;
    }

    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    return canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_PAYMENTS);
}

export default shouldOpenBankAccountByPolicy;
