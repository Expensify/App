import {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function useIsEligibleForRefund() {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

    return useMemo(() => {
        if (!account) {
            return false;
        }

        return account.isEligibleForRefund;
    }, [account]);
}

export default useIsEligibleForRefund;
