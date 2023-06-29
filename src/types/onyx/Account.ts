import {ValueOf} from 'react-native-gesture-handler/lib/typescript/typeUtils';
import CONST from '../../CONST';
import * as OnyxCommon from './OnyxCommon';

type Account = OnyxCommon.BaseState & {
    /** URL to the assigned guide's appointment booking calendar */
    guideCalendarLink?: string;

    /** User recovery codes for setting up 2-FA */
    recoveryCodes?: string;

    /** Secret key to enable 2FA within the authenticator app */
    twoFactorAuthSecretKey?: string;

    /** Whether this account has 2FA enabled or not */
    requiresTwoFactorAuth?: boolean;

    /** Whether the account is validated */
    validated?: boolean;

    /** The primaryLogin associated with the account */
    primaryLogin?: string;

    /** The message to be displayed when code requested */
    message?: string;

    /** Accounts that are on a domain with an Approved Accountant */
    doesDomainHaveApprovedAccountant?: boolean;

    /** Form that is being loaded */
    loadingForm?: ValueOf<typeof CONST.FORMS>;

    /** Whether the user forgot their password */
    forgotPassword?: boolean;
};

export default Account;
