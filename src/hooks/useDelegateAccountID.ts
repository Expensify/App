import {delegateEmailSelector} from '@selectors/Account';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';
import usePersonalDetailsByLogin from './usePersonalDetailsByLogin';

function useDelegateAccountID(): number | undefined {
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const personalDetailsByLogin = usePersonalDetailsByLogin();

    return delegateEmail ? personalDetailsByLogin[delegateEmail.toLowerCase()]?.accountID : undefined;
}

export default useDelegateAccountID;
