type UserType = {
    /** Whether or not the user is subscribed to news updates */
    isSubscribedToNewsletter: boolean;

    /** Whether we should use the staging version of the secure API server */
    shouldUseStagingServer: boolean;

    /** Is the user account validated? */
    validated: boolean;

    /** Whether or not the user is on a public domain email account or not */
    isFromPublicDomain: boolean;
};

export default UserType;
