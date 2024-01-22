import type * as OnyxCommon from './OnyxCommon';

type Login = {
    /** Phone/Email associated with user */
    partnerUserID?: string;

    /** Value of partner name */
    partnerName?: string;

    /** Date login was validated, used to show info indicator status */
    validatedDate?: string;

    /** Whether the user validation code was sent */
    validateCodeSent?: boolean;

    /** Field-specific server side errors keyed by microtime */
    errorFields?: OnyxCommon.ErrorFields;
};

type LoginWithOfflineFeedback = OnyxCommon.OnyxItemWithOfflineFeedback<Login, keyof Login | 'defaultLogin' | 'validateLogin' | 'addedLogin' | 'deletedLogin'>;

type LoginList = Record<string, LoginWithOfflineFeedback>;

export default LoginWithOfflineFeedback;
export type {LoginList};
