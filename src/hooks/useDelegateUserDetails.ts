import {useOnyx} from 'react-native-onyx';
import AccountUtils from '@libs/AccountUtils';
import delegateRestrictedAccessPromptText from '@libs/DelegateRestrictedAccessPromptText';
import ONYXKEYS from '@src/ONYXKEYS';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';

function useDelegateUserDetails() {
    const {translate} = useLocalize();
    const currentUserDeatils = useCurrentUserPersonalDetails();
    const [currentUserAccountDetails] = useOnyx(ONYXKEYS.ACCOUNT);
    const isDelegateAccessRestricted = AccountUtils.isDelegateOnlySubmitter(currentUserAccountDetails);
    const delegateNoAccessPrompt = delegateRestrictedAccessPromptText(currentUserDeatils?.login ?? '');

    return {
        isDelegateAccessRestricted,
        currentUserDeatils,
        delegateNoAccessPrompt,
    };
}

export default useDelegateUserDetails;
