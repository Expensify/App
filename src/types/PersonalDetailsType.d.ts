type PersonalDetailsType = {
    // First name of the current user from their personal details
    firstName: string;

    // Last name of the current user from their personal details
    lastName: string;

    // Display name of the current user from their personal details
    displayName: string;

    // Avatar URL of the current user from their personal details
    avatar: string;

    // Flag to set when Avatar uploading
    avatarUploading: boolean;

    // login of the current user from their personal details
    login: string;

    // pronouns of the current user from their personal details
    pronouns: string;

    // local currency for the user
    localCurrencyCode: string;

    // timezone of the current user from their personal details
    timezone: {
        // Value of selected timezone
        selected: string;

        // Whether timezone is automatically set
        // TODO: remove string type after backend fix
        // Some personal details return 'true' (string) for this value instead of true (boolean)
        automatic: boolean | string;
    };
};

export default PersonalDetailsType;
