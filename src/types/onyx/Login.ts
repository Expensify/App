import * as OnyxCommon from './OnyxCommon';

type Login = {
    /** Phone/Email associated with user */
    partnerUserID?: string;

    /** Value of partner name */
    partnerName?: string;

    /** Date login was validated, used to show info indicator status */
    validatedDate?: string;

    /** Field-specific server side errors keyed by microtime */
    errorFields?: OnyxCommon.ErrorFields;

    /** Field-specific pending states for offline UI status */
    pendingFields?: OnyxCommon.ErrorFields;
};

export default Login;
