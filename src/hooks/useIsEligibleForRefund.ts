import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function useIsEligibleForRefund(): boolean | undefined {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

    if (!account) {
        return false;
    }

    return account.isEligibleForRefund;
}

export default useIsEligibleForRefund;
