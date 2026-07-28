import type * as OnyxCommon from './OnyxCommon';

/** Model of user login data */
type Login = OnyxCommon.OnyxValueWithOfflineFeedback<
    {
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
    },
    'defaultLogin' | 'validateLogin' | 'addedLogin' | 'deletedLogin'
>;

/** Record of user login data, indexed by partnerUserID */
type LoginList = Record<string, Login>;

export default Login;
export type {LoginList};
