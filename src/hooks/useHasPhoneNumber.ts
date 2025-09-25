import {Str} from 'expensify-common';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

const useHasPhoneNumber = () => {
    const [loginList, loginListResult] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const [session, sessionResult] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});

    const primaryEmailIsPhone = Str.endsWith(session?.email ?? '', CONST.SMS.DOMAIN);

    const validPhoneInLoginList = Object.keys(loginList ?? {})
        .map((login) => Str.removeSMSDomain(login))
        .find((login) => Str.isValidE164Phone(login));

    const smsLoginExists = Object.keys(loginList ?? {}).some((login) => Str.isSMSLogin(login));

    const hasPhoneNumber = primaryEmailIsPhone || !!validPhoneInLoginList || smsLoginExists;

    const isLoaded = loginListResult.status !== 'loading' && sessionResult.status !== 'loading';

    return {hasPhoneNumber, isLoaded};
};

export default useHasPhoneNumber;
