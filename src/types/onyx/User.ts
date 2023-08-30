type User = {
    /** Whether or not the user is subscribed to news updates */
    isSubscribedToNewsletter: boolean;

    /** Whether we should use the staging version of the secure API server */
    shouldUseStagingServer?: boolean;

    /** Is the user account validated? */
    validated: boolean;

    /** Whether or not the user is on a public domain email account or not */
    isFromPublicDomain: boolean;

    /** Whether or not the user use expensify card */
    isUsingExpensifyCard: boolean;

    /** Whever Expensify Card approval flow is ongoing - checking loginList for private domains */
    isCheckingDomain?: boolean;

    /** Whether or not the user has lounge access */
    hasLoungeAccess?: boolean;

    /** error associated with adding a secondary login */
    error?: string;

    /** Whether the form is being submitted */
    loading?: boolean;
};

export default User;
