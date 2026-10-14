import CONST from '@src/CONST';

import usePermissions from './usePermissions';

/** Whether the unified Connections page replaces the separate Accounting, HR, Recruiting, Receipt partners and MCP pages */
function useIsUnifiedConnectionsBetaEnabled(): boolean {
    const {isBetaEnabled} = usePermissions();
    return isBetaEnabled(CONST.BETAS.UNIFIED_CONNECTIONS);
}

export default useIsUnifiedConnectionsBetaEnabled;
