import {vacationDelegateSelector} from '@selectors/Domain';
import {useMemo} from 'react';
import type {ResultMetadata} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {VacationDelegate} from '@src/types/onyx';
import useOnyx from './useOnyx';

type UseVacationDelegateResult = [
    VacationDelegate | undefined,
    ResultMetadata<VacationDelegate>
];

const useVacationDelegate = (domainAccountID: string, accountID: string): UseVacationDelegateResult => {
    const selector = useMemo(() => vacationDelegateSelector(accountID), [accountID]);

    const [vacationDelegate, vacationDelegateMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: selector,
    });

    return [vacationDelegate, vacationDelegateMetadata];
};

export default useVacationDelegate;
