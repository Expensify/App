import Str from 'expensify-common/lib/str';
import Onyx, {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import * as LocalePhoneNumber from '@libs/LocalePhoneNumber';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as UserUtils from '@libs/UserUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {DateOfBirthForm, PersonalDetails, PrivatePersonalDetails} from '@src/types/onyx';
import {SelectedTimezone, Timezone} from '@src/types/onyx/PersonalDetails';

type FirstAndLastName = {
    firstName: string;
    lastName: string;
};

let currentUserEmail = '';
let currentUserAccountID = -1;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserEmail = val?.email ?? '';
        currentUserAccountID = val?.accountID ?? -1;
    },
});

let allPersonalDetails: OnyxEntry<Record<string, PersonalDetails>> = null;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (val) => (allPersonalDetails = val),
});

let privatePersonalDetails: OnyxEntry<PrivatePersonalDetails> = null;
Onyx.connect({
    key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    callback: (val) => (privatePersonalDetails = val),
});

/**
 * Returns the displayName for a user
 */
function getDisplayName(login: string, personalDetail: Pick<PersonalDetails, 'firstName' | 'lastName'> | null): string {
    // If we have a number like +15857527441@expensify.sms then let's remove @expensify.sms and format it
    // so that the option looks cleaner in our UI.
    const userLogin = LocalePhoneNumber.formatPhoneNumber(login);
    const userDetails = personalDetail ?? allPersonalDetails?.[login];

    if (!userDetails) {
        return userLogin;
    }

    const firstName = userDetails.firstName ?? '';
    const lastName = userDetails.lastName ?? '';
    const fullName = `${firstName} ${lastName}`.trim();

    // It's possible for fullName to be empty string, so we must use "||" to fallback to userLogin.
    return fullName || userLogin;
}

/**
 * @param [defaultDisplayName] display name to use if user details don't exist in Onyx or if
 *                                      found details don't include the user's displayName or login
 */
function getDisplayNameForTypingIndicator(userAccountIDOrLogin: string, defaultDisplayName = ''): string {
    // Try to convert to a number, which means we have an accountID
    const accountID = Number(userAccountIDOrLogin);

    // If the user is typing on OldDot, userAccountIDOrLogin will be a string (the user's login),
    // so Number(string) is NaN. Search for personalDetails by login to get the display name.
    if (Number.isNaN(accountID)) {
        const detailsByLogin = Object.entries(allPersonalDetails ?? {}).find(([, value]) => value?.login === userAccountIDOrLogin)?.[1];

        // It's possible for displayName to be empty string, so we must use "||" to fallback to userAccountIDOrLogin.
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return detailsByLogin?.displayName || userAccountIDOrLogin;
    }

    const detailsByAccountID = allPersonalDetails?.[accountID];

    // It's possible for displayName to be empty string, so we must use "||" to fallback to login or defaultDisplayName.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return detailsByAccountID?.displayName || detailsByAccountID?.login || defaultDisplayName;
}

/**
 * Gets the first and last name from the user's personal details.
 * If the login is the same as the displayName, then they don't exist,
 * so we return empty strings instead.
 */
function extractFirstAndLastNameFromAvailableDetails({login, displayName, firstName, lastName}: PersonalDetails): FirstAndLastName {
    // It's possible for firstName to be empty string, so we must use "||" to consider lastName instead.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (firstName || lastName) {
        return {firstName: firstName ?? '', lastName: lastName ?? ''};
    }
    if (login && Str.removeSMSDomain(login) === displayName) {
        return {firstName: '', lastName: ''};
    }

    if (displayName) {
        const firstSpaceIndex = displayName.indexOf(' ');
        const lastSpaceIndex = displayName.lastIndexOf(' ');
        if (firstSpaceIndex === -1) {
            return {firstName: displayName, lastName: ''};
        }

        return {
            firstName: displayName.substring(0, firstSpaceIndex).trim(),
            lastName: displayName.substring(lastSpaceIndex).trim(),
        };
    }

    return {firstName: '', lastName: ''};
}

/**
 * Convert country names obtained from the backend to their respective ISO codes
 * This is for backward compatibility of stored data before E/App#15507
 */
function getCountryISO(countryName: string): string {
    if (!countryName || countryName.length === 2) {
        return countryName;
    }

    return Object.entries(CONST.ALL_COUNTRIES).find(([, value]) => value === countryName)?.[0] ?? '';
}

function updatePronouns(pronouns: string) {
    if (currentUserAccountID) {
        type UpdatePronounsParams = {
            pronouns: string;
        };

        const parameters: UpdatePronounsParams = {pronouns};

        API.write('UpdatePronouns', parameters, {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                    value: {
                        [currentUserAccountID]: {
                            pronouns,
                        },
                    },
                },
            ],
        });
    }

    Navigation.goBack(ROUTES.SETTINGS_PROFILE);
}

function updateDisplayName(firstName: string, lastName: string) {
    if (currentUserAccountID) {
        type UpdateDisplayNameParams = {
            firstName: string;
            lastName: string;
        };

        const parameters: UpdateDisplayNameParams = {firstName, lastName};

        API.write('UpdateDisplayName', parameters, {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                    value: {
                        [currentUserAccountID]: {
                            firstName,
                            lastName,
                            displayName: getDisplayName(currentUserEmail ?? '', {
                                firstName,
                                lastName,
                            }),
                        },
                    },
                },
            ],
        });
    }

    Navigation.goBack(ROUTES.SETTINGS_PROFILE);
}

function updateLegalName(legalFirstName: string, legalLastName: string) {
    type UpdateLegalNameParams = {
        legalFirstName: string;
        legalLastName: string;
    };

    const parameters: UpdateLegalNameParams = {legalFirstName, legalLastName};

    API.write('UpdateLegalName', parameters, {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
                value: {
                    legalFirstName,
                    legalLastName,
                },
            },
        ],
    });

    Navigation.goBack(ROUTES.SETTINGS_PERSONAL_DETAILS);
}

/**
 * @param dob - date of birth
 */
function updateDateOfBirth({dob}: DateOfBirthForm) {
    type UpdateDateOfBirthParams = {
        dob?: string;
    };

    const parameters: UpdateDateOfBirthParams = {dob};

    API.write('UpdateDateOfBirth', parameters, {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
                value: {
                    dob,
                },
            },
        ],
    });

    Navigation.goBack(ROUTES.SETTINGS_PERSONAL_DETAILS);
}

function updateAddress(street: string, street2: string, city: string, state: string, zip: string, country: string) {
    type UpdateHomeAddressParams = {
        homeAddressStreet: string;
        addressStreet2: string;
        homeAddressCity: string;
        addressState: string;
        addressZipCode: string;
        addressCountry: string;
        addressStateLong?: string;
    };

    const parameters: UpdateHomeAddressParams = {
        homeAddressStreet: street,
        addressStreet2: street2,
        homeAddressCity: city,
        addressState: state,
        addressZipCode: zip,
        addressCountry: country,
    };

    // State names for the United States are in the form of two-letter ISO codes
    // State names for other countries except US have full names, so we provide two different params to be handled by server
    if (country !== CONST.COUNTRY.US) {
        parameters.addressStateLong = state;
    }

    API.write('UpdateHomeAddress', parameters, {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
                value: {
                    address: {
                        street: PersonalDetailsUtils.getFormattedStreet(street, street2),
                        city,
                        state,
                        zip,
                        country,
                    },
                },
            },
        ],
    });

    Navigation.goBack(ROUTES.SETTINGS_PERSONAL_DETAILS);
}

/**
 * Updates timezone's 'automatic' setting, and updates
 * selected timezone if set to automatically update.
 */
function updateAutomaticTimezone(timezone: Timezone) {
    if (!currentUserAccountID) {
        return;
    }

    type UpdateAutomaticTimezoneParams = {
        timezone: string;
    };

    const parameters: UpdateAutomaticTimezoneParams = {
        timezone: JSON.stringify(timezone),
    };

    API.write('UpdateAutomaticTimezone', parameters, {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                value: {
                    [currentUserAccountID]: {
                        timezone,
                    },
                },
            },
        ],
    });
}

/**
 * Updates user's 'selected' timezone, then navigates to the
 * initial Timezone page.
 */
function updateSelectedTimezone(selectedTimezone: SelectedTimezone) {
    const timezone: Timezone = {
        selected: selectedTimezone,
    };

    type UpdateSelectedTimezoneParams = {
        timezone: string;
    };

    const parameters: UpdateSelectedTimezoneParams = {
        timezone: JSON.stringify(timezone),
    };

    if (currentUserAccountID) {
        API.write('UpdateSelectedTimezone', parameters, {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                    value: {
                        [currentUserAccountID]: {
                            timezone,
                        },
                    },
                },
            ],
        });
    }

    Navigation.goBack(ROUTES.SETTINGS_TIMEZONE);
}

/**
 * Fetches additional personal data like legal name, date of birth, address
 */
function openPersonalDetailsPage() {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
            value: {
                isLoading: true,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
            value: {
                isLoading: false,
            },
        },
    ];

    type OpenPersonalDetailsPageParams = Record<string, never>;

    const parameters: OpenPersonalDetailsPageParams = {};

    API.read('OpenPersonalDetailsPage', parameters, {optimisticData, successData, failureData});
}

/**
 * Fetches public profile info about a given user.
 * The API will only return the accountID, displayName, and avatar for the user
 * but the profile page will use other info (e.g. contact methods and pronouns) if they are already available in Onyx
 */
function openPublicProfilePage(accountID: number) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [accountID]: {
                    isLoading: true,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [accountID]: {
                    isLoading: false,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [accountID]: {
                    isLoading: false,
                },
            },
        },
    ];

    type OpenPublicProfilePageParams = {
        accountID: number;
    };

    const parameters: OpenPublicProfilePageParams = {accountID};

    API.read('OpenPublicProfilePage', parameters, {optimisticData, successData, failureData});
}

/**
 * Updates the user's avatar image
 */
function updateAvatar(file: File | CustomRNImageManipulatorResult) {
    if (!currentUserAccountID) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [currentUserAccountID]: {
                    avatar: file.uri,
                    avatarThumbnail: file.uri,
                    originalFileName: file.name,
                    errorFields: {
                        avatar: null,
                    },
                    pendingFields: {
                        avatar: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        originalFileName: null,
                    },
                    fallbackIcon: file.uri,
                },
            },
        },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [currentUserAccountID]: {
                    pendingFields: {
                        avatar: null,
                    },
                },
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [currentUserAccountID]: {
                    avatar: allPersonalDetails?.[currentUserAccountID]?.avatar,
                    avatarThumbnail: allPersonalDetails?.[currentUserAccountID]?.avatarThumbnail ?? allPersonalDetails?.[currentUserAccountID]?.avatar,
                    pendingFields: {
                        avatar: null,
                    },
                } as OnyxEntry<Partial<PersonalDetails>>,
            },
        },
    ];

    type UpdateUserAvatarParams = {
        file: File | CustomRNImageManipulatorResult;
    };

    const parameters: UpdateUserAvatarParams = {file};

    API.write('UpdateUserAvatar', parameters, {optimisticData, successData, failureData});
}

/**
 * Replaces the user's avatar image with a default avatar
 */
function deleteAvatar() {
    if (!currentUserAccountID) {
        return;
    }

    // We want to use the old dot avatar here as this affects both platforms.
    const defaultAvatar = UserUtils.getDefaultAvatarURL(currentUserAccountID);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [currentUserAccountID]: {
                    avatar: defaultAvatar,
                    fallbackIcon: null,
                },
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [currentUserAccountID]: {
                    avatar: allPersonalDetails?.[currentUserAccountID]?.avatar,
                    fallbackIcon: allPersonalDetails?.[currentUserAccountID]?.fallbackIcon,
                },
            },
        },
    ];

    type DeleteUserAvatarParams = Record<string, never>;

    const parameters: DeleteUserAvatarParams = {};

    API.write('DeleteUserAvatar', parameters, {optimisticData, failureData});
}

/**
 * Clear error and pending fields for the current user's avatar
 */
function clearAvatarErrors() {
    if (!currentUserAccountID) {
        return;
    }

    Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        [currentUserAccountID]: {
            errorFields: {
                avatar: null,
            },
            pendingFields: {
                avatar: null,
            },
        },
    });
}

/**
 * Get private personal details value
 */
function getPrivatePersonalDetails(): OnyxEntry<PrivatePersonalDetails> {
    return privatePersonalDetails;
}

export {
    clearAvatarErrors,
    deleteAvatar,
    extractFirstAndLastNameFromAvailableDetails,
    getCountryISO,
    getDisplayName,
    getDisplayNameForTypingIndicator,
    getPrivatePersonalDetails,
    openPersonalDetailsPage,
    openPublicProfilePage,
    updateAddress,
    updateAutomaticTimezone,
    updateAvatar,
    updateDateOfBirth,
    updateDisplayName,
    updateLegalName,
    updatePronouns,
    updateSelectedTimezone,
};
