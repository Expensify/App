import { vacationDelegateSelector } from '@selectors/Domain';
import { useMemo } from 'react';
import ONYXKEYS from '@src/ONYXKEYS';
import type { BaseVacationDelegate } from '@src/types/onyx/VacationDelegate';
import useOnyx from './useOnyx';


const useVacationDelegate = (domainAccountID: number, accountID: number): BaseVacationDelegate | undefined => {
    const selector = useMemo(() => vacationDelegateSelector(accountID), [accountID]);

    const [vacationDelegate] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector,
    });

    return vacationDelegate;
};

export default useVacationDelegate;
