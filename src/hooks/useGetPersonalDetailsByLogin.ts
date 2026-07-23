import ONYXKEYS from '@src/ONYXKEYS';
import {accountIDSelector} from '@src/selectors/LoginToAccountIDMap';
import {personalDetailsSelector} from '@src/selectors/PersonalDetails';

import useOnyx from './useOnyx';

function useGetPersonalDetailsByLogin(login: string | undefined) {
    const [accountID] = useOnyx(ONYXKEYS.DERIVED.LOGIN_TO_ACCOUNT_ID_MAP, {selector: accountIDSelector(login)});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsSelector(accountID)});
    return personalDetails;
}

export default useGetPersonalDetailsByLogin;
