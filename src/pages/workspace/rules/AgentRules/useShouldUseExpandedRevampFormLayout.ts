import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import usePermissions from '@hooks/usePermissions';

import CONST from '@src/CONST';

function useShouldUseExpandedRevampFormLayout(): boolean {
    const isInLandscapeMode = useIsInLandscapeMode();
    const {isBetaEnabled} = usePermissions();

    return isBetaEnabled(CONST.BETAS.RULES_REVAMP) && !isInLandscapeMode;
}

export default useShouldUseExpandedRevampFormLayout;
