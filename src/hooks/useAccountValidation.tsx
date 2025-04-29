import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

// TODO: Remove/Update this hook once we remove the user data and migrate to account data in https://github.com/Expensify/App/issues/59277
function useAccountValidation() {
    // Some places are using the current value to compare, so we shouldn't cast to boolean
    const [isAccountValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.validated, canBeMissing: true});
    const [isUserValidated] = useOnyx(ONYXKEYS.USER, {selector: (user) => user?.validated, canBeMissing: true});

    return isAccountValidated ?? isUserValidated;
}

export default useAccountValidation;
