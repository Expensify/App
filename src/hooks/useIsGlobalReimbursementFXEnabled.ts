import CONST from '@src/CONST';

import usePermissions from './usePermissions';

/**
 * Whether the currency conversion cost settings are available. They sit on top of global reimbursements, so both betas
 * have to be on before any of them is shown or reachable.
 */
function useIsGlobalReimbursementFXEnabled(): boolean {
    const {isBetaEnabled} = usePermissions();

    return isBetaEnabled(CONST.BETAS.GLOBAL_REIMBURSEMENTS) && isBetaEnabled(CONST.BETAS.GLOBAL_REIMBURSEMENT_FX);
}

export default useIsGlobalReimbursementFXEnabled;
