type Login = {
    /** Phone/Email associated with user */
    partnerUserID?: string;

    /** Value of partner name */
    partnerName?: string;

    /** Date login was validated, used to show info indicator status */
    validatedDate?: string;

    /** Field-specific server side errors keyed by microtime */
    errorFields?: Record<string, Record<string, unknown>>;

    /** Field-specific pending states for offline UI status */
    pendingFields?: Record<string, Record<string, unknown>>;
};

export default Login;
