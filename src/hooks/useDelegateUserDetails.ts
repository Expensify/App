import {useOnyx} from 'react-native-onyx';
import AccountUtils from '@libs/AccountUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';

function useDelegateUserDetails() {
    const currentUserDetails = useCurrentUserPersonalDetails();
    const [currentUserAccountDetails] = useOnyx(ONYXKEYS.ACCOUNT);
    const isDelegateAccessRestricted = AccountUtils.isDelegateOnlySubmitter(currentUserAccountDetails);
    const delegatorEmail = currentUserDetails?.login;

    return {
        isDelegateAccessRestricted,
        delegatorEmail,
    };
}

export default useDelegateUserDetails;
