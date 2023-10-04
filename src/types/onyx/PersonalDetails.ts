type PersonalDetails = {
    /** ID of the current user from their personal details */
    accountID: number;

    /** First name of the current user from their personal details */
    firstName?: string;

    /** Last name of the current user from their personal details */
    lastName?: string;

    /** Display name of the current user from their personal details */
    displayName: string;

    /** Is current user validated */
    validated?: boolean;

    /** Phone number of the current user from their personal details   */
    phoneNumber?: string;

    /** Avatar URL of the current user from their personal details */
    avatar: string;

    /** Flag to set when Avatar uploading */
    avatarUploading?: boolean;

    /** Login of the current user from their personal details */
    login?: string;

    /** Pronouns of the current user from their personal details */
    pronouns?: string;

    /** Local currency for the user */
    localCurrencyCode?: string;

    /** Timezone of the current user from their personal details */
    timezone?: {
        /** Value of selected timezone */
        selected?: string;

        /** Whether timezone is automatically set */
        automatic?: boolean;
    };
};

export default PersonalDetails;
