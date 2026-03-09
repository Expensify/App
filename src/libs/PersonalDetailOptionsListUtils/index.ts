import {Str} from 'expensify-common';
import deburr from 'lodash/deburr';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {appendCountryCode, getPhoneNumberWithoutSpecialChars} from '@libs/LoginUtils';
import {optionsOrderBy, personalDetailsComparator, processSearchString} from '@libs/OptionsListUtils';
import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from '@libs/PhoneNumber';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import {generateAccountID} from '@libs/UserUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {LoginList, OnyxInputOrEntry, PersonalDetails, PersonalDetailsList, Report, ReportAttributesDerivedValue} from '@src/types/onyx';
import type {ReportAttributes} from '@src/types/onyx/DerivedValues';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {GetOptionsConfig, GetUserToInviteConfig, OptionData, Options, PreviewConfig, PrivateIsArchivedMap} from './types';

/**
 * Creates a personal details list option
 */
function createOption(
    personalDetail: PersonalDetails,
    report: OnyxInputOrEntry<Report>,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    config?: PreviewConfig,
    reportAttributesDerived?: ReportAttributes,
    isReportArchived?: string,
): OptionData {
    const {selected = false, isSelected = false, isDisabled = false, shouldStoreReportErrors = false, shouldShowBrickRoadIndicator = false} = config ?? {};
    const result: OptionData = {
        text: '',
        alternateText: undefined,
        allReportErrors: undefined,
        brickRoadIndicator: null,
        icons: undefined,
        tooltipText: null,
        accountID: 0,
        login: undefined,
        reportID: undefined,
        phoneNumber: undefined,
        keyForList: '',
        isOptimisticPersonalDetail: false,
        private_isArchived: undefined,
        lastVisibleActionCreated: undefined,
        selected,
        isSelected,
        isDisabled,
    };

    result.isOptimisticPersonalDetail = personalDetail.isOptimisticPersonalDetail ?? false;
    if (report) {
        result.private_isArchived = isReportArchived;
        result.allReportErrors = shouldStoreReportErrors ? (reportAttributesDerived?.reportErrors ?? {}) : undefined;
        result.brickRoadIndicator = shouldShowBrickRoadIndicator ? (reportAttributesDerived?.brickRoadStatus ?? '') : null;
        result.reportID = report.reportID;

        result.tooltipText = String(personalDetail.accountID);
        result.lastVisibleActionCreated = report.lastVisibleActionCreated;
    }

    result.login = personalDetail.login;
    result.accountID = personalDetail.accountID;
    result.phoneNumber = personalDetail.phoneNumber;

    result.keyForList = String(personalDetail.accountID);
    result.alternateText = formatPhoneNumber(personalDetail.login ?? '');

    result.text = getDisplayNameForParticipant({accountID: personalDetail.accountID, formatPhoneNumber}) || formatPhoneNumber(personalDetail.login ?? '');
    result.icons = [
        {
            id: personalDetail.accountID,
            source: personalDetail.avatar ?? FallbackAvatar,
            type: CONST.ICON_TYPE_AVATAR,
            name: result.text,
            fallbackIcon: personalDetail.fallbackIcon,
        },
    ];

    return result;
}

/**
 * We create a new user option if the following conditions are satisfied:
 * - There's no matching recent report and personal detail option
 * - The searchValue is a valid email or phone number
 * - If prop shouldAcceptName = true, the searchValue can be also a normal string
 * - The searchValue isn't the current personal detail login
 */
function getUserToInviteOption({searchValue, countryCode, formatPhoneNumber, loginList = {}, loginsToExclude = {}, shouldAcceptName = false}: GetUserToInviteConfig): OptionData | null {
    if (!searchValue) {
        return null;
    }

    const parsedPhoneNumber = parsePhoneNumber(appendCountryCode(Str.removeSMSDomain(searchValue), countryCode));
    const userDetailsLogin = addSMSDomainIfPhoneNumber(searchValue).toLowerCase();
    // Check if userDetails login exists in loginList
    const isCurrentUserLogin = Object.keys(loginList ?? {}).some((login) => login.toLowerCase() === userDetailsLogin);
    const isValidEmail = Str.isValidEmail(searchValue) && !Str.isDomainEmail(searchValue) && !Str.endsWith(searchValue, CONST.SMS.DOMAIN);
    const isValidPhoneNumber = parsedPhoneNumber.possible && Str.isValidE164Phone(getPhoneNumberWithoutSpecialChars(parsedPhoneNumber.number?.input ?? ''));
    const isInOptionToExclude = loginsToExclude[userDetailsLogin];

    // Angle brackets are not valid characters for user names
    const hasInvalidCharacters = shouldAcceptName && (searchValue.includes('<') || searchValue.includes('>'));

    if ((!isValidEmail && !isValidPhoneNumber && !shouldAcceptName) || isInOptionToExclude || isCurrentUserLogin || hasInvalidCharacters) {
        return null;
    }

    const inviteLogin = isValidPhoneNumber && parsedPhoneNumber.number?.e164 ? parsedPhoneNumber.number.e164 : searchValue.toLowerCase();

    // Generates an optimistic account ID for new users not yet saved in Onyx
    const optimisticAccountID = generateAccountID(inviteLogin);
    return createOption(
        {
            accountID: optimisticAccountID,
            login: inviteLogin,
            isOptimisticPersonalDetail: true,
        },
        undefined,
        formatPhoneNumber,
    );
}

/**
 * Sort reports by archived status and last visible action
 */
const recentReportComparator = (option: OptionData) => {
    return `${option.private_isArchived ? 0 : 1}_${option.lastVisibleActionCreated ?? ''}`;
};

function canCreateOptimisticPersonalDetailOption({
    recentOptions,
    selectedOptions,
    personalDetailsOptions,
    currentUserLogin,
    searchValue,
    countryCode,
}: {
    recentOptions: OptionData[];
    selectedOptions: OptionData[];
    personalDetailsOptions: OptionData[];
    currentUserLogin: string;
    searchValue: string;
    countryCode: number;
}) {
    if (recentOptions.length + selectedOptions.length + personalDetailsOptions.length > 0) {
        return false;
    }
    return currentUserLogin !== addSMSDomainIfPhoneNumber(appendCountryCode(searchValue, countryCode)).toLowerCase() && currentUserLogin !== searchValue.toLowerCase();
}

function filterUserToInvite(options: Omit<Options, 'userToInvite'>, currentUserLogin: string, config: GetUserToInviteConfig): OptionData | null {
    const {searchValue, countryCode, canInviteUser = true, loginsToExclude = {}} = config ?? {};
    if (!canInviteUser) {
        return null;
    }

    const canCreateOptimisticDetail = canCreateOptimisticPersonalDetailOption({
        recentOptions: options.recentOptions,
        selectedOptions: options.selectedOptions,
        personalDetailsOptions: options.personalDetails,
        currentUserLogin,
        searchValue,
        countryCode,
    });

    if (!canCreateOptimisticDetail) {
        return null;
    }

    const excludeLogins: Record<string, boolean> = {
        [CONST.EMAIL.NOTIFICATIONS]: true,
        ...loginsToExclude,
    };
    return getUserToInviteOption({
        loginsToExclude: excludeLogins,
        ...config,
    });
}

function matchesSearchTerms(option: OptionData, searchTerms: string[], extraSearchTerms?: string[]): boolean {
    let searchText = deburr(`${option.text} ${option.login ?? ''}`.toLocaleLowerCase());
    if (extraSearchTerms?.length) {
        searchText += ` ${deburr(extraSearchTerms.join(' ').toLocaleLowerCase())}`;
    }
    return searchTerms.every((term) => searchText.includes(term));
}

function filterOption(option: OptionData | undefined, searchValue: string | undefined, extraSearchTerms?: string[]) {
    if (!option) {
        return null;
    }

    const searchTerms = processSearchString(searchValue);
    const isMatchingSearch = matchesSearchTerms(option, searchTerms, extraSearchTerms);

    if (isMatchingSearch) {
        return option;
    }

    return null;
}

/**
 * Options are reports and personal details. This function filters out the options that are not valid to be displayed.
 */
function getValidOptions(
    options: OptionData[],
    currentUserLogin: string,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    countryCode: number,
    loginList?: OnyxEntry<LoginList>,
    {
        excludeLogins = {},
        includeSelectedOptions = false,
        includeRecentReports = true,
        recentAttendees,
        searchString,
        maxElements,
        recentMaxElements = CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        includeUserToInvite = false,
        includeCurrentUser = false,
        includeDomainEmail = false,
        extraOptions = [],
        shouldAcceptName = false,
    }: GetOptionsConfig = {},
) {
    // Gather shared configs:
    const loginsToExclude: Record<string, boolean> = {
        [CONST.EMAIL.NOTIFICATIONS]: true,
        ...excludeLogins,
        [currentUserLogin]: !includeCurrentUser,
    };

    let extendedOptions = options;
    if (extraOptions.length > 0) {
        const existingLogins = new Set(extendedOptions.map((option) => option.login));
        const filteredExtraOptions = extraOptions.filter((option) => option.login && !existingLogins.has(option.login));
        extendedOptions = [...options, ...filteredExtraOptions];
    }

    const searchTerms = processSearchString(searchString);
    const selectedFilteringFunction = (personalDetail: OptionData) => {
        if (
            !personalDetail.isSelected ||
            !personalDetail.login ||
            !personalDetail.accountID ||
            (!includeDomainEmail && Str.isDomainEmail(personalDetail.login)) ||
            // Exclude the setup specialist from the list of personal details as it's a fallback if guide is not assigned
            personalDetail.login === CONST.SETUP_SPECIALIST_LOGIN
        ) {
            return false;
        }
        if (loginsToExclude[personalDetail.login]) {
            return false;
        }

        return matchesSearchTerms(personalDetail, searchTerms);
    };

    const selectedOptions = optionsOrderBy(extendedOptions, personalDetailsComparator, maxElements, selectedFilteringFunction, true);
    // If we're including selected options from the search results, we only want to exclude them if the search input is empty
    // This is because on certain pages, we show the selected options at the top when the search input is empty
    // This prevents the issue of seeing the selected option twice if you have them as a recent chat and select them
    if (!includeSelectedOptions) {
        for (const option of selectedOptions) {
            if (!option.login) {
                continue;
            }
            loginsToExclude[option.login] = true;
        }
    }

    // Get valid recent reports:
    let recentOptions: OptionData[] = [];

    if (recentAttendees && recentAttendees?.length > 0) {
        const recentAttendeesSet = new Set(recentAttendees.filter((login) => !loginsToExclude[login]));
        const potentialRecentOptions: Record<string, OptionData> = {};
        for (const option of options) {
            if (!option.login) {
                continue;
            }
            const searchTermsFound = matchesSearchTerms(option, searchTerms);
            if (searchTermsFound && recentAttendeesSet.has(option.login ?? '')) {
                potentialRecentOptions[option.login] = option;
            }
        }
        for (const login of recentAttendees) {
            if (potentialRecentOptions[login]) {
                recentOptions.push(potentialRecentOptions[login]);
            } else {
                // If we don't have the personal detail for the recent attendee, we create an optimistic option
                const newOption = filterOption(
                    getUserToInviteOption({searchValue: login, formatPhoneNumber, countryCode, loginList, loginsToExclude, shouldAcceptName: true}) ?? undefined,
                    searchString,
                );

                if (newOption) {
                    recentOptions.push(newOption);
                }
            }
        }
    } else if (includeRecentReports) {
        // if maxElements is passed, filter the recent reports by searchString and return only most recent reports (@see recentReportsComparator)
        const filteringFunction = (option: OptionData) => {
            const searchTermsFound = matchesSearchTerms(option, searchTerms);

            if (!searchTermsFound || !option.reportID) {
                return false;
            }

            if (!!option.login && loginsToExclude[option.login]) {
                return false;
            }

            return true;
        };

        recentOptions = optionsOrderBy(options, recentReportComparator, recentMaxElements, filteringFunction);
    }

    // Get valid personal details and check if we can find the current user:
    let personalDetailsOptions: OptionData[] = [];

    const recentOptionsByAccountID = new Set(recentOptions.map((option) => option.accountID).filter(Boolean));

    const filteringFunction = (personalDetail: OptionData) => {
        if (
            !personalDetail.login ||
            !personalDetail.accountID ||
            !!personalDetail.isOptimisticPersonalDetail ||
            (!includeDomainEmail && Str.isDomainEmail(personalDetail.login)) ||
            // Exclude the setup specialist from the list of personal details as it's a fallback if guide is not assigned
            personalDetail.login === CONST.SETUP_SPECIALIST_LOGIN ||
            // Exclude any recent options from the personal details
            recentOptionsByAccountID.has(personalDetail.accountID)
        ) {
            return false;
        }
        if (loginsToExclude[personalDetail.login]) {
            return false;
        }

        return matchesSearchTerms(personalDetail, searchTerms);
    };

    personalDetailsOptions = optionsOrderBy(options, personalDetailsComparator, maxElements, filteringFunction, true);

    let userToInvite: OptionData | null = null;
    if (includeUserToInvite) {
        userToInvite = filterUserToInvite({recentOptions, selectedOptions, personalDetails: personalDetailsOptions}, currentUserLogin, {
            searchValue: searchString ?? '',
            countryCode,
            formatPhoneNumber,
            loginList,
            loginsToExclude,
            shouldAcceptName,
        });
    }

    return {
        selectedOptions,
        personalDetails: personalDetailsOptions,
        recentOptions,
        userToInvite,
    };
}

function createOptionList(
    currentUserAccountID: number,
    personalDetails: OnyxEntry<PersonalDetailsList>,
    accountIDToReportIDMap: Record<number, string>,
    reports: OnyxCollection<Report>,
    reportAttributesDerived: ReportAttributesDerivedValue['reports'] | undefined,
    privateIsArchivedMap: PrivateIsArchivedMap,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    config?: PreviewConfig,
) {
    if (isEmptyObject(personalDetails)) {
        return {
            currentUserOption: undefined,
            options: [],
        };
    }
    const currentUserRef = {
        current: undefined as OptionData | undefined,
    };
    const allPersonalDetailsOptions = [] as OptionData[];

    for (const personalDetail of Object.values(personalDetails)) {
        if (!personalDetail || !personalDetail.accountID) {
            continue;
        }
        const reportID = accountIDToReportIDMap[personalDetail.accountID];
        const report = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
        const reportAttributes = report?.reportID ? reportAttributesDerived?.[report.reportID] : undefined;
        const isReportArchived = privateIsArchivedMap[reportID];
        const option = createOption(personalDetail, report, formatPhoneNumber, config, reportAttributes, isReportArchived);
        allPersonalDetailsOptions.push(option);
        if (option.accountID === currentUserAccountID) {
            currentUserRef.current = option;
        }
    }

    return {
        currentUserOption: currentUserRef.current,
        options: allPersonalDetailsOptions,
    };
}

/**
 * Helper method that returns the text to be used for the header's message and title (if any)
 */
function getHeaderMessage(translate: LocaleContextProps['translate'], searchValue: string, countryCode: number, hasMatchedParticipant = false): string {
    // Without a search value, it would be very confusing to see a search validation message.
    // Therefore, this skips the validation when there is no search value.
    if (!searchValue) {
        return '';
    }
    const isValidPhone = parsePhoneNumber(appendCountryCode(searchValue, countryCode)).possible;

    const isValidEmail = Str.isValidEmail(searchValue);

    if (CONST.REGEX.DIGITS_AND_PLUS.test(searchValue) && !isValidPhone) {
        return translate('messages.errorMessageInvalidPhone');
    }
    if (/@/.test(searchValue) && !isValidEmail) {
        return translate('messages.errorMessageInvalidEmail');
    }
    if (hasMatchedParticipant && (isValidEmail || isValidPhone)) {
        return '';
    }
    return translate('common.noResultsFound');
}

export {createOption, getUserToInviteOption, canCreateOptimisticPersonalDetailOption, filterOption, matchesSearchTerms, getValidOptions, createOptionList, getHeaderMessage};

export type {OptionData, Options};
