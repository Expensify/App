import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';

function useDelegateUserDetails() {
    const currentUserDeatils = useCurrentUserPersonalDetails();
    const [currentUserAccountDetails] = useOnyx(ONYXKEYS.ACCOUNT);
    const delegatorEmail = currentUserDeatils?.login;
    const delegateEmail = currentUserAccountDetails?.delegatedAccess?.delegate ?? '';

    return {
        delegatorEmail,
        delegateEmail,
    };
}

export default useDelegateUserDetails;
