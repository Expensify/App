import {useOnyx} from 'react-native-onyx';
import AccountUtils from '@libs/AccountUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';

function useDelegateUserDetails() {
    const currentUserDeatils = useCurrentUserPersonalDetails();
    const [currentUserAccountDetails] = useOnyx(ONYXKEYS.ACCOUNT);
    const isDelegateAccessRestricted = AccountUtils.isDelegateOnlySubmitter(currentUserAccountDetails);

    return {
        isDelegateAccessRestricted,
        currentUserDeatils,
    };
}

export default useDelegateUserDetails;
