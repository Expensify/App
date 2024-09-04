import {useOnyx} from 'react-native-onyx';
import AccountUtils from '@libs/AccountUtils';
import DelegateRestrictedAccessPromptText from '@libs/DelegateRestrictedAccessPromptText';
import ONYXKEYS from '@src/ONYXKEYS';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';

function useDelegateUserDetails() {
    const currentUserDeatils = useCurrentUserPersonalDetails();
    const [currentUserAccountDetails] = useOnyx(ONYXKEYS.ACCOUNT);
    const isDelegateAccessRestricted = AccountUtils.isDelegateOnlySubmitter(currentUserAccountDetails);
    const delegateNoAccessPrompt = DelegateRestrictedAccessPromptText(currentUserDeatils?.login ?? '');

    return {
        isDelegateAccessRestricted,
        delegateNoAccessPrompt,
    };
}

export default useDelegateUserDetails;
