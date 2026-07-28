import {expensifyLoginsSelector} from '@libs/UserUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {Str} from 'expensify-common';

import useOnyx from './useOnyx';

const useHasPhoneNumberLogin = () => {
    const [loginList, loginListResult] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const [session, sessionResult] = useOnyx(ONYXKEYS.SESSION);

    const isPrimaryEmailPhone = Str.endsWith(session?.email ?? '', CONST.SMS.DOMAIN);

    const smsLoginExists = Object.keys(loginList ?? {}).some((login) => Str.isSMSLogin(login));

    const hasPhoneNumberLogin = isPrimaryEmailPhone || smsLoginExists;

    const isPhoneNumberLoaded = loginListResult.status !== 'loading' && sessionResult.status !== 'loading';

    return {hasPhoneNumberLogin, isPhoneNumberLoaded};
};

export default useHasPhoneNumberLogin;
