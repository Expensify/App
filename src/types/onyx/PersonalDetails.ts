import type {AvatarSource} from '@libs/UserUtils';
import type TIMEZONES from '@src/TIMEZONES';
import type * as OnyxCommon from './OnyxCommon';

type SelectedTimezone = (typeof TIMEZONES)[number];

type Timezone = {
    /** Value of selected timezone */
    selected?: SelectedTimezone;

    /** Whether timezone is automatically set */
    automatic?: boolean;
};

type Status = {
    /** The emoji code of the status */
    emojiCode: string;

    /** The text of the draft status */
    text?: string;

    /** The timestamp of when the status should be cleared */
    clearAfter: string; // ISO 8601 format;
};

type PersonalDetails = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** ID of the current user from their personal details */
    accountID: number;

    /** First name of the current user from their personal details */
    firstName?: string;

    /** Last name of the current user from their personal details */
    lastName?: string;

    /** Display name of the current user from their personal details */
    displayName?: string;

    /** Is current user validated */
    validated?: boolean;

    /** Phone number of the current user from their personal details   */
    phoneNumber?: string;

    /** Avatar URL of the current user from their personal details */
    avatar?: AvatarSource;

    /** Avatar thumbnail URL of the current user from their personal details */
    avatarThumbnail?: string;

    originalFileName?: string;

    /** Flag to set when Avatar uploading */
    avatarUploading?: boolean;

    /** Login of the current user from their personal details */
    login?: string;

    /** Pronouns of the current user from their personal details */
    pronouns?: string;

    /** Local currency for the user */
    localCurrencyCode?: string;

    /** Timezone of the current user from their personal details */
    timezone?: Timezone;

    /** Flag for checking if data is from optimistic data */
    isOptimisticPersonalDetail?: boolean;

    /** Field-specific server side errors keyed by microtime */
    errorFields?: OnyxCommon.ErrorFields<'avatar'>;

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
    fallbackIcon?: string;

    /** Status of the current user from their personal details */
    status?: Status;
}>;

type PersonalDetailsMetadata = {
    /** Whether we are waiting for the data to load via the API */
    isLoading?: boolean;
};

type PersonalDetailsList = Record<string, PersonalDetails | null>;

export default PersonalDetails;

export type {Timezone, Status, SelectedTimezone, PersonalDetailsList, PersonalDetailsMetadata};
