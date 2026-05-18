import {isCurrencySupportedForECards} from '@libs/CardUtils';
import CONST from '@src/CONST';
import usePermissions from './usePermissions';
import usePolicy from './usePolicy';

export default function useExpensifyCardUkEuSupported(policyID?: string) {
    const {isBetaEnabled} = usePermissions();
    const policy = usePolicy(policyID);

    return isCurrencySupportedForECards(policy?.outputCurrency) && isBetaEnabled(CONST.BETAS.EXPENSIFY_CARD_EU_UK);
}
