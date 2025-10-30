import {Str} from 'expensify-common';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

const useHasPhoneNumberLogin = () => {
    const [loginList, loginListResult] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const [session, sessionResult] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});

    const isPrimaryEmailPhone = Str.endsWith(session?.email ?? '', CONST.SMS.DOMAIN);

    const smsLoginExists = Object.keys(loginList ?? {}).some((login) => Str.isSMSLogin(login));

    const hasPhoneNumberLogin = isPrimaryEmailPhone || smsLoginExists;

    const isPhoneNumberLoaded = loginListResult.status !== 'loading' && sessionResult.status !== 'loading';

    return {hasPhoneNumberLogin, isPhoneNumberLoaded};
};

export default useHasPhoneNumberLogin;
