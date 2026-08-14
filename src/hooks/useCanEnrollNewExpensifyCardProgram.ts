import CONST from '@src/CONST';

import useExpensifyCardUkEuSupported from './useExpensifyCardUkEuSupported';
import usePolicy from './usePolicy';

/**
 * Whether the workspace currency allows enrollment in a new Expensify Card program.
 * Linking an existing card feed is not restricted by currency.
 */
export default function useCanEnrollNewExpensifyCardProgram(policyID?: string) {
    const policy = usePolicy(policyID);
    const isUkEuCurrencySupported = useExpensifyCardUkEuSupported(policyID);

    return policy?.outputCurrency === CONST.CURRENCY.USD || isUkEuCurrencySupported;
}
