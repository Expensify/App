import CONST from '@src/CONST';

import useExpensifyCardUkEuSupported from './useExpensifyCardUkEuSupported';
import usePolicy from './usePolicy';

/**
 * Whether the workspace currency allows enrollment in a new Expensify Card program.
 * Linking an existing card feed is not restricted by currency.
 *
 * Also returns `isUkEuCurrencySupported` so that callers which need both values do not have to call
 * `useExpensifyCardUkEuSupported` a second time.
 */
export default function useCanEnrollNewExpensifyCardProgram(policyID?: string) {
    const policy = usePolicy(policyID);
    const isUkEuCurrencySupported = useExpensifyCardUkEuSupported(policyID);

    return {
        canEnrollNewCardProgram: policy?.outputCurrency === CONST.CURRENCY.USD || isUkEuCurrencySupported,
        isUkEuCurrencySupported,
    };
}
