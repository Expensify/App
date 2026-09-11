import {isCurrencySupportedForECards} from '@libs/CardUtils';

import usePolicy from './usePolicy';

export default function useExpensifyCardUkEuSupported(policyID?: string) {
    const policy = usePolicy(policyID);

    return isCurrencySupportedForECards(policy?.outputCurrency);
}
