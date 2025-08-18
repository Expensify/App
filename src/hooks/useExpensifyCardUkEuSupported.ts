import {isCurrencySupportECards} from '@libs/CardUtils';
import CONST from '@src/CONST';
import usePermissions from './usePermissions';
import usePolicy from './usePolicy';

export default function useExpensifyCardUkEu(policyID?: string) {
    const {isBetaEnabled} = usePermissions();
    const policy = usePolicy(policyID);

    return isCurrencySupportECards(policy?.outputCurrency) && isBetaEnabled(CONST.BETAS.EXPENSIFY_CARD_EU_UK);
}
