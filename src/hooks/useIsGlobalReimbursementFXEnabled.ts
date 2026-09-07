import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import usePermissions from './usePermissions';

/**
 * Whether the currency conversion cost settings are available for a workspace. They sit on top of global
 * reimbursements, and the cost only arises when the workspace reimburses through Expensify.
 */
function useIsGlobalReimbursementFXEnabled(policy: OnyxEntry<Policy>): boolean {
    const {isBetaEnabled} = usePermissions();

    return (
        isBetaEnabled(CONST.BETAS.GLOBAL_REIMBURSEMENTS) &&
        isBetaEnabled(CONST.BETAS.GLOBAL_REIMBURSEMENT_FX) &&
        policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES
    );
}

export default useIsGlobalReimbursementFXEnabled;
