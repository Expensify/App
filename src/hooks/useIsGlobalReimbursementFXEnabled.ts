import CONST from '@src/CONST';

import usePermissions from './usePermissions';

/**
 * Whether the currency conversion cost settings are available.
 */
function useIsGlobalReimbursementFXEnabled(): boolean {
    const {isBetaEnabled} = usePermissions();

    return isBetaEnabled(CONST.BETAS.GLOBAL_REIMBURSEMENT_FX);
}

export default useIsGlobalReimbursementFXEnabled;
