import * as OnyxCommon from './OnyxCommon';

type PersonalDetailsTimezone = {
    /** Value of selected timezone */
    selected?: string;

    /** Whether timezone is automatically set */
    automatic?: boolean;
};

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

    /** Avatar thumbnail URL of the current user from their personal details */
    avatarThumbnail?: string;

    /** Flag to set when Avatar uploading */
    avatarUploading?: boolean;

    /** Login of the current user from their personal details */
    login?: string;

    /** Pronouns of the current user from their personal details */
    pronouns?: string;

    /** Local currency for the user */
    localCurrencyCode?: string;

    /** Timezone of the current user from their personal details */
    timezone?: PersonalDetailsTimezone;

    /** Whether we are loading the data via the API */
    isLoading?: boolean;

    /** Field-specific server side errors keyed by microtime */
    errorFields?: OnyxCommon.ErrorFields;

    /** Field-specific pending states for offline UI status */
    pendingFields?: OnyxCommon.ErrorFields;

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
    fallbackIcon?: string;
};

export default PersonalDetails;
export type {PersonalDetailsTimezone};
