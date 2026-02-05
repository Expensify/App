import {vacationDelegateSelector} from '@selectors/Domain';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BaseVacationDelegate} from '@src/types/onyx/VacationDelegate';

const useVacationDelegate = (domainAccountID: number, accountID: number): BaseVacationDelegate | undefined => {
    const [vacationDelegate] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: vacationDelegateSelector(accountID),
    });

    return vacationDelegate;
};

export default useVacationDelegate;
